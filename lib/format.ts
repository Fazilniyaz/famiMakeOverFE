// Indian Rupee formatting for the whole storefront.

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value ?? 0)
}

/** The price actually charged (offer price when it's lower). */
export function effectivePrice(item: { price: number; offerPrice?: number | null }): number {
  return item.offerPrice != null && item.offerPrice < item.price ? item.offerPrice : item.price
}

export function discountPercent(item: { price: number; offerPrice?: number | null }): number | null {
  if (item.offerPrice == null || item.offerPrice >= item.price) return null
  return Math.round(((item.price - item.offerPrice) / item.price) * 100)
}
