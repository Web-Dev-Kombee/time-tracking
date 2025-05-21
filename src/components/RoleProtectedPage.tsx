import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@/types";

interface RoleProtectedPageProps {
 allowedRoles: UserRole[];
 children: ReactNode;
 redirectTo?: string;
}

/**
 * Server-side component to protect entire pages based on user roles
 * Redirects users without proper permissions
 *
 * @example
 * // In a page.tsx file:
 * export default async function AdminPage() {
 *   return (
 *     <RoleProtectedPage allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
 *       <AdminDashboard />
 *     </RoleProtectedPage>
 *   );
 * }
 */
export default async function RoleProtectedPage({
 allowedRoles,
 children,
 redirectTo = "/dashboard",
}: RoleProtectedPageProps) {
 const session = await getServerSession(authOptions);

 if (!session?.user) {
  redirect("/login");
 }

 const userRole = session?.user.role as UserRole;

 if (!allowedRoles.includes(userRole)) {
  redirect(redirectTo);
 }

 return <>{children}</>;
}
