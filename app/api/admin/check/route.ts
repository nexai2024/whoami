// app/api/admin/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack/server';
import { isSuperAdmin } from '@/lib/utils/adminUtils';

// GET /api/admin/check - Check if current user is super admin
export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user?.id) {
      return NextResponse.json({ isSuperAdmin: false }, { status: 401 });
    }

    const admin = await isSuperAdmin(user.id);
    console.log('Admin check result:', { isSuperAdmin: admin });
    return NextResponse.json({ isSuperAdmin: admin });
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return NextResponse.json({ isSuperAdmin: false }, { status: 500 });
  }
}

