import { AdminConsole, AdminLogin } from "@/components/admin-console";
import { defaultSettings } from "@/lib/catalog";
import { isAdminAuthenticated, isValidAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ session?: string }> }) {
  const { session } = await searchParams;
  const accessToken = typeof session === "string" && isValidAdminSession(session) ? session : undefined;
  if (!accessToken && !(await isAdminAuthenticated())) return <AdminLogin />;

  const settings = { ...defaultSettings, id: 1, initialized: false, updatedAt: new Date() };
  return <AdminConsole initialProducts={[]} initialInquiries={[]} initialOrders={[]} initialCoupons={[]} settings={settings} accessToken={accessToken} />;
}
