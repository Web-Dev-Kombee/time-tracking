import PasswordUpdateForm from "@/components/profile/PasswordUpdateForm";
import ProfileForm from "@/components/profile/ProfileForm";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Profile | TimeTrack",
  description: "Manage your profile settings",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <ProfileForm user={session?.user} />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Password</h2>
            <PasswordUpdateForm />
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-blue-100">
                {session?.user.image ? (
                  <Image
                    src={session?.user.image}
                    alt={`${session?.user.name}'s profile`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-blue-50 text-blue-500 text-xl font-bold">
                    {session?.user.name?.charAt(0) || session?.user.email.charAt(0)}
                  </div>
                )}
              </div>

              <div className="text-center">
                <h3 className="font-medium text-gray-800">{session?.user.name}</h3>
                <p className="text-gray-500 text-sm">{session?.user.email}</p>
                <p className="mt-1 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full inline-block">
                  {session?.user.role.toLowerCase().replace("_", " ")}
                </p>
              </div>

              <button
                className="mt-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
                disabled
              >
                Update Picture (Coming soon)
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Subscription</p>
                <p>{session?.user.subscription}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Member Since</p>
                <p>N/A</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p>{session?.user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
