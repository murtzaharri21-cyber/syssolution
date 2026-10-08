import Storefront from "@/components/storefront";
import {
  defaultProducts,
  defaultSettings,
  getActiveCoupons,
  getAvailableProducts,
  getStoreSettings,
  type ProductRecord,
  type SiteSettingsRecord,
} from "@/lib/catalog";
import type { CouponRecord } from "@/db/schema";

export const dynamic = "force-dynamic";

const previewProducts: ProductRecord[] = defaultProducts
  .map((product, index) => ({
    ...product,
    id: index + 1,
    graphics: product.graphics ?? "Integrated graphics",
    conditionLabel: product.conditionLabel ?? "Quality checked",
    badge: product.badge ?? "Verified stock",
    promotionLabel: product.promotionLabel ?? "",
    imageUrl: product.imageUrl ?? "",
    description: product.description ?? "",
    price: product.price ?? null,
    isFeatured: product.isFeatured ?? false,
    isNewArrival: product.isNewArrival ?? false,
    isTrending: product.isTrending ?? false,
    isAvailable: product.isAvailable ?? true,
    sortOrder: product.sortOrder ?? 100,
    createdAt: new Date(0),
  }))
  .sort((first, second) => first.sortOrder - second.sortOrder);

const previewCoupon: CouponRecord = {
  id: 1,
  code: "WELCOME5",
  label: "5% welcome discount",
  description: "Save 5% on your first website order.",
  discountType: "percent",
  discountValue: 5,
  minimumOrder: 50000,
  maximumDiscount: 15000,
  isActive: true,
  startsAt: null,
  expiresAt: null,
  usageLimit: null,
  timesUsed: 0,
  createdAt: new Date(0),
};

const previewSettings: SiteSettingsRecord = {
  id: defaultSettings.id ?? 1,
  initialized: defaultSettings.initialized ?? false,
  announcement: defaultSettings.announcement,
  headline: defaultSettings.headline,
  subheadline: defaultSettings.subheadline,
  phone: defaultSettings.phone,
  email: defaultSettings.email,
  address: defaultSettings.address,
  updatedAt: new Date(0),
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  if (process.env.NODE_ENV === "development" && preview === "1") {
    console.info("Rendering the local storefront preview with sample catalog data.");
    return (
      <>
        <div className="local-preview-banner" role="status">
          Local preview — sample products only. Ordering requires a working database connection.
        </div>
        <Storefront
          products={previewProducts}
          settings={previewSettings}
          coupons={[previewCoupon]}
        />
      </>
    );
  }

  const products = await getAvailableProducts();
  const settings = await getStoreSettings();
  const coupons = await getActiveCoupons();
  return <Storefront products={products} settings={settings} coupons={coupons} />;
}
