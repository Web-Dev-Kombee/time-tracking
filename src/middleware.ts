import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { UserRole } from "./types";

// Routes configuration with required roles
const routeRoleMap: Record<string, UserRole[]> = {
 // Admin-only routes
 "/dashboard/admin": [UserRole.SUPER_ADMIN, UserRole.ADMIN],

 // Financial routes (admin and accounts)
 "/dashboard/reports/revenue": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTS],
 "/dashboard/reports/financial": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTS],
 "/dashboard/invoices": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTS, UserRole.SALES],

 // Reports routes
 "/dashboard/reports": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTS],
};

// This function can be marked `async` if using `await` inside
export default withAuth(
 function middleware(req) {
  const token = req.nextauth.token;

  // No token means not authenticated
  if (!token) {
   return NextResponse.redirect(new URL("/login", req.url));
  }

  // Check if the current path matches any of our protected routes
  const path = req.nextUrl.pathname;

  // Loop through the route map to find matches using startsWith
  for (const [route, roles] of Object.entries(routeRoleMap)) {
   if (path.startsWith(route)) {
    // If user doesn't have required role for this route
    if (!roles.includes(token.role as UserRole)) {
     // Redirect to dashboard
     return NextResponse.redirect(new URL("/dashboard", req.url));
    }
   }
  }

  return NextResponse.next();
 },
 {
  callbacks: {
   // Only run middleware on matching paths
   authorized: ({ token }) => !!token,
  },
 }
);

// Configure which paths should be protected by this middleware
export const config = {
 matcher: [
  "/dashboard/:path*",
  "/api/((?!setup).*)", // Protect all API routes except /api/setup
 ],
};
