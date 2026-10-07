export function formatPrice(price: number | null) {
  if (price === null || price < 1) return "Ask for price";
  return `PKR ${new Intl.NumberFormat("en-PK").format(price)}`;
}
