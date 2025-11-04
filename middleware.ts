import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import prisma from "@/lib/prisma";

export const config = {
  matcher: [
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
    "/api/:path*"
  ],
};

export default async function middleware(req: Request) {
  const url = new URL(req.url);
  
  // Handle API routes with authentication
  if (url.pathname.startsWith('/api/')) {
    try {
      // Get authenticated user from Stack
      const user = await stackServerApp.getUser();
      
      // Check if user exists and has id
      if (!user || !user.id) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { 
            status: 401, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Clone request and add x-user-id header
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', user.id);
      
      // Continue to API route with modified headers
      return NextResponse.next({
        request: {
          headers: requestHeaders
        }
      });
    } catch (error) {
      // Log error for debugging
      console.error("Auth error in middleware:", error);
      
      // Return 500 for auth errors
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  }
  
  // Domain and subdomain routing logic
  const hostname = req.headers.get("host") || "";
  const hostnameLower = hostname.toLowerCase();

  // Define list of allowed base domains (your main domain)
  const allowedDomains = ["localhost:3000", "whoami.click", "whoami.bio"];
  const isAllowedDomain = allowedDomains.some(domain => hostnameLower.includes(domain.toLowerCase()));

  try {
    // Check for custom domain first
    const customDomainPage = await prisma.page.findFirst({
      where: {
        customDomain: hostnameLower.split(':')[0], // Remove port if present
        customDomainStatus: 'VERIFIED',
        isActive: true,
      },
      select: {
        id: true,
        slug: true,
      },
    });

    if (customDomainPage) {
      // Rewrite to the page slug route
      return NextResponse.rewrite(new URL(`/p/${customDomainPage.slug}${url.pathname}`, req.url));
    }

    // Check for subdomain
    if (isAllowedDomain) {
      const parts = hostnameLower.split('.');
      
      // If it's the base domain (no subdomain), allow normal routing
      if (parts.length <= 2 || (parts.length === 3 && parts[0] === 'www')) {
        return NextResponse.next();
      }

      // Extract subdomain (first part before base domain)
      const subdomain = parts[0];

      // Skip www subdomain
      if (subdomain === 'www') {
        return NextResponse.next();
      }

      // Check if subdomain exists in database
      const subdomainPage = await prisma.page.findFirst({
        where: {
          subdomain: subdomain,
          isActive: true,
        },
        select: {
          id: true,
          slug: true,
        },
      });

      if (subdomainPage) {
        // Rewrite to the page slug route
        return NextResponse.rewrite(new URL(`/p/${subdomainPage.slug}${url.pathname}`, req.url));
      }

      // Subdomain not found, return 404
      return new Response(null, { status: 404 });
    }

    // Not an allowed domain and no custom domain match, allow normal routing
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware routing error:", error);
    // On error, allow request to continue (fail open)
    return NextResponse.next();
  }
}