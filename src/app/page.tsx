import Storefront from "@/components/storefront";
import { getActiveCoupons, getAvailableProducts, getStoreSettings } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, settings, coupons] = await Promise.all([getAvailableProducts(), getStoreSettings(), getActiveCoupons()]);
  return <Storefront products={products} settings={settings} coupons={coupons} />;
}
