import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <MobileNav />
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <DashboardWrapper>
            {children}
          </DashboardWrapper>
        </main>
      </div>
    </div>
  )
}
