import { NextResponse } from "next/server";
import subdomains from "./subdomains.json";
import { stackServerApp } from "@/stack/server";

export const config = {
  matcher: [
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
    "/api/:path*"
  ],
};

type SubdomainEntry = string | { subdomain: string };

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
  
  // Existing subdomain routing logic
  const hostname = req.headers.get("host") || "";

  // Define list of allowed domains
  // (including localhost and your deployed domain)
  const allowedDomains = ["localhost:3000", "whoami.click"];

  // Check if the current hostname is in the list of allowed domains
  const isAllowedDomain = allowedDomains.some(domain => hostname.includes(domain));

  // Extract the potential subdomain from the URL
  const subdomain = hostname.split(".")[0];

  // If user is on an allowed domain and it's not a subdomain, allow the request
  if (
    isAllowedDomain &&
    !subdomains.subdomains.some((d: SubdomainEntry) =>
      typeof d === "string" ? d === subdomain : d.subdomain === subdomain
    )
  ) {
    return NextResponse.next();
  }

  const subdomainData = subdomains.subdomains.find((d: SubdomainEntry) =>
    typeof d === "string" ? d === subdomain : d.subdomain === subdomain
  );

  if (subdomainData) {
    // Attach the subdomain data to the request
    console.log("Subdomain matched:", subdomainData);
    console.log("Rewriting URL to include subdomain:", `/${subdomain}${url.pathname}`, new URL(`/${subdomain}${url.pathname}`, req.url));
    // Rewrite the URL to a dynamic path based on the subdomain
    return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, req.url));
  }

  return new Response(null, { status: 404 });
}