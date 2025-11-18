import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { z } from "zod";
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { logger } from '@/lib/utils/logger';
import { PrismaClient } from '@prisma/client';

const SelectedTeamSchema = z.object({
  created_at_millis: z.number().optional(),
  id: z.string(),
  display_name: z.string(),
  profile_image_url: z.string().nullish(),
}).passthrough();

const UserIDSchema = z.string().describe("The unique identifier of this user");

// Updated schema to match actual Stack Auth payload structure
const UserCreatedEventPayloadSchema = z.object({
  id: UserIDSchema,
  primary_email_verified: z.boolean().optional(),
  signed_up_at_millis: z.number().optional(),
  has_password: z.boolean().optional(),
  primary_email: z.string().nullish(),
  display_name: z.string().nullish(),
  selected_team: SelectedTeamSchema.nullish(),
  selected_team_id: z.string().nullish(),
  profile_image_url: z.string().nullish(),
  client_metadata: z.record(z.string(), z.any()).nullish(),
  server_metadata: z.record(z.string(), z.any()).nullish(),
  // Additional fields that may be present in Stack Auth payloads
  auth_with_email: z.boolean().optional(),
  client_read_only_metadata: z.record(z.string(), z.any()).nullish(),
  is_anonymous: z.boolean().optional(),
  last_active_at_millis: z.number().optional(),
  oauth_providers: z.array(z.any()).optional(),
  otp_auth_enabled: z.boolean().optional(),
  passkey_auth_enabled: z.boolean().optional(),
  primary_email_auth_enabled: z.boolean().optional(),
  requires_totp_mfa: z.boolean().optional(),
}).passthrough(); // Allow additional fields we don't know about

const UserUpdatedEventPayloadSchema = UserCreatedEventPayloadSchema;

const UserDeletedEventPayloadSchema = z.object({
  id: UserIDSchema,
}).passthrough();

const StackAuthEventPayloadSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("user.created"),
    data: UserCreatedEventPayloadSchema,
  }),
  z.object({
    type: z.literal("user.updated"),
    data: UserUpdatedEventPayloadSchema,
  }),
  z.object({
    type: z.literal("user.deleted"),
    data: UserDeletedEventPayloadSchema,
  }),
]);

const SVIX_WEBHOOK_SIGNING_SECRET = process.env.SVIX_WEBHOOK_SIGNING_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Verify webhook signature
  if (!SVIX_WEBHOOK_SIGNING_SECRET) {
    logger.error('SVIX_WEBHOOK_SIGNING_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 },
    );
  }

  const wh = new Webhook(SVIX_WEBHOOK_SIGNING_SECRET);

  let payload: any = {};

  try {
    payload = wh.verify(body, headers);
    logger.info('Webhook signature verified', { type: payload.type });
  } catch (e) {
    logger.error('Webhook signature verification failed', { error: (e as Error).message });
    return NextResponse.json(
      { error: `Unable to verify webhook: ${(e as Error).message}` },
      { status: 401 },
    );
  }

  // Parse and validate payload
  let parsedPayload;
  try {
    parsedPayload = StackAuthEventPayloadSchema.parse(payload);
    logger.info('Webhook payload parsed successfully', { type: parsedPayload.type, userId: parsedPayload.data.id });
  } catch (e) {
    logger.error('Webhook payload validation failed', { 
      error: (e as Error).message,
      payload: JSON.stringify(payload, null, 2)
    });
    return NextResponse.json(
      { error: `Invalid webhook payload: ${(e as Error).message}` },
      { status: 400 },
    );
  }

  try {
    if (parsedPayload.type === "user.created") {
      const data = parsedPayload.data;

      // Generate a unique username from email or display name
      const generateUsername = (email?: string | null, displayName?: string | null, userId?: string) => {
        if (displayName) {
          const cleaned = displayName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
          if (cleaned.length > 0) return cleaned;
        }
        if (email) {
          const cleaned = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
          if (cleaned.length > 0) return cleaned;
        }
        // Fallback to user ID prefix
        return `user_${userId?.substring(0, 8) || crypto.randomBytes(4).toString('hex')}`;
      };

      const baseUsername = generateUsername(data.primary_email, data.display_name, data.id);
      const email = data.primary_email || `stack-user-${data.id}@noemail.local`;
      const displayName = data.display_name || baseUsername;

      // Generate a random password for Prisma User (not used for auth)
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 12);

      // Use transaction to ensure both User and Profile are created atomically
      const result = await prisma.$transaction(async (tx: PrismaClient) => {
        // Check if user already exists
        const existingUser = await tx.user.findUnique({
          where: { id: data.id }
        });

        // Check if profile already exists
        const existingProfile = await tx.profile.findUnique({
          where: { userId: data.id }
        });

        let user;
        let profile;

        // Create or update User
        if (existingUser) {
          logger.info('User already exists, updating', { userId: data.id });
          user = await tx.user.update({
            where: { id: data.id },
            data: {
              email: email, // Update email in case it changed
            },
          });
        } else {
          logger.info('Creating new user', { userId: data.id, email });
          user = await tx.user.create({
            data: {
              id: data.id,
              email: email,
              password: hashedPassword,
            },
          });
        }

        // Create or update Profile
        if (existingProfile) {
          logger.info('Profile already exists, updating', { userId: data.id });
          profile = await tx.profile.update({
            where: { userId: data.id },
            data: {
              displayName: displayName,
              avatar: data.profile_image_url || null,
            },
          });
        } else {
          // Find unique username by appending suffix if needed
          let uniqueUsername = baseUsername;
          let counter = 1;
          while (await tx.profile.findUnique({ where: { username: uniqueUsername } })) {
            uniqueUsername = `${baseUsername}${counter}`;
            counter++;
            // Safety check to prevent infinite loop
            if (counter > 1000) {
              uniqueUsername = `user_${data.id.substring(0, 8)}_${Date.now()}`;
              break;
            }
          }

          logger.info('Creating new profile', { userId: data.id, username: uniqueUsername });
          profile = await tx.profile.create({
            data: {
              userId: data.id,
              username: uniqueUsername,
              displayName: displayName,
              avatar: data.profile_image_url || null,
              plan: 'FREE',
            },
          });
        }

        return { user, profile };
      });

      logger.info('User and profile synced successfully', {
        userId: result.user.id,
        email: result.user.email,
        username: result.profile.username,
        displayName: result.profile.displayName
      });

      return NextResponse.json({ 
        message: "User created successfully",
        userId: result.user.id,
        profileId: result.profile.id
      });

    } else if (parsedPayload.type === "user.updated") {
      const data = parsedPayload.data;

      logger.info('Processing user.updated event', { userId: data.id });

      // Update User record if it exists
      const existingUser = await prisma.user.findUnique({
        where: { id: data.id }
      });

      if (existingUser && data.primary_email) {
        await prisma.user.update({
          where: { id: data.id },
          data: {
            email: data.primary_email,
          },
        });
        logger.info('User email updated', { userId: data.id });
      }

      // Update Profile if it exists
      const existingProfile = await prisma.profile.findUnique({
        where: { userId: data.id }
      });

      if (existingProfile) {
        await prisma.profile.update({
          where: { userId: data.id },
          data: {
            displayName: data.display_name || existingProfile.displayName,
            avatar: data.profile_image_url || existingProfile.avatar,
          },
        });
        logger.info('Profile updated', { userId: data.id });
      } else {
        logger.warn('Profile not found for user update', { userId: data.id });
      }

      return NextResponse.json({ message: "User updated successfully" });

    } else if (parsedPayload.type === "user.deleted") {
      const data = parsedPayload.data;
      
      logger.info('Processing user.deleted event', { userId: data.id });

      // Delete User (cascade will handle Profile deletion)
      try {
        await prisma.user.delete({
          where: { id: data.id },
        });
        logger.info('User deleted successfully', { userId: data.id });
      } catch (error: any) {
        // User may not exist, log but don't fail
        logger.warn('User deletion failed (may not exist)', { 
          userId: data.id, 
          error: error.message 
        });
      }

      return NextResponse.json({ message: "User deleted successfully" });
    }

    return NextResponse.json({ message: "Webhook received" });
  } catch (error: any) {
    logger.error('Error processing webhook', {
      error: error.message,
      stack: error.stack,
      type: parsedPayload.type,
      userId: parsedPayload.data.id
    });
    
    return NextResponse.json(
      { error: `Failed to process webhook: ${error.message}` },
      { status: 500 },
    );
  }
}