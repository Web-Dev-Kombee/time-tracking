import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { UserRole } from "@/types";

/**
 * Validates if the current session user has one of the required roles
 *
 * @param requiredRoles - Array of roles allowed to access the resource
 * @returns Object with session (if valid) or response with error
 *
 * @example
 * // In an API route:
 * export async function GET(request: Request) {
 *   const { session, response } = await validateUserRole([UserRole.ADMIN, UserRole.ACCOUNTS]);
 *   if (!session) return response;
 *
 *   // Continue with the API logic for authorized users
 *   // ...
 * }
 */
export async function validateUserRole(requiredRoles: UserRole[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      session: null,
      response: NextResponse.json({ error: "Unauthorized: Not authenticated" }, { status: 401 }),
    };
  }

  const userRole = session.user.role as UserRole;

  if (!requiredRoles.includes(userRole)) {
    return {
      session: null,
      response: NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      ),
    };
  }

  return { session, response: null };
}

/**
 * Check if the current user can modify a resource created by the given user ID
 * Only allows SUPER_ADMIN, ADMIN or the original creator
 */
// export function canModifyResource(session: any, resourceCreatorId: string): boolean {
//  if (!session?.user) return false;

//  const userRole = session.user.role as UserRole;

//  // Super admins and admins can modify any resource
//  if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN) {
//   return true;
//  }

//  // Otherwise, only the creator can modify their own resources
//  return session.user.id === resourceCreatorId;
// }
