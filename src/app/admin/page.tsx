import { desc } from "drizzle-orm";
import { AdminConsole, AdminLogin } from "@/components/admin-console";
import { getDb } from "@/db";
import { inquiries } from "@/db/schema";
import { isAdminAuthenticated, isValidAdminSession } from "@/lib/admin-auth";
import { getAdminCoupons, getAdminOrders, getAdminProducts, getStoreSettings } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ session?: string }> }) {
  const { session } = await searchParams;
  const accessToken = typeof session === "string" && isValidAdminSession(session) ? session : undefined;
  if (!(await isAdminAuthenticated()) && !accessToken) return <AdminLogin />;

  const db = getDb();
  const [products, inbox, websiteOrders, coupons, settings] = await Promise.all([
    getAdminProducts(),
    db.select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(100),
    getAdminOrders(),
    getAdminCoupons(),
    getStoreSettings(),
  ]);

  return <AdminConsole initialProducts={products} initialInquiries={inbox} initialOrders={websiteOrders} initialCoupons={coupons} settings={settings} accessToken={accessToken} />;
}
