import { redirect } from "next/navigation";
import { authService } from "@/services/auth/auth.service";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await authService.getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const user = {
    email: session.user.email,
    fullName: session.profile?.fullName ?? null,
    avatarUrl: session.profile?.avatarUrl ?? null,
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile Top Header */}
        <TopHeader user={user} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-20 md:pb-8">
          <div className="mx-auto max-w-6xl">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
