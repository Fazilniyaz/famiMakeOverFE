// Typed API calls grouped by resource.
import { api, apiGet, apiPost, apiPatch, apiDelete } from "./api"
import type {
  Product,
  ProductType,
  Service,
  BeautyClass,
  GalleryItem,
  User,
  CartState,
  Order,
  ListMeta,
  Appointment,
  Enrollment,
  AvailabilityDay,
} from "./types"

type ListResp<T> = { success: boolean; data: T[]; meta?: ListMeta }
type ItemResp<T> = { success: boolean; data: T }

function toQs(query: Record<string, string | number | boolean | undefined | null> = {}) {
  const entries = Object.entries(query).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  ) as [string, string][]
  return new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()
}

// ---- Catalog (public) ----
export const CatalogAPI = {
  productTypes: () => apiGet<ListResp<ProductType>>("/product-types", false).then((r) => r.data),

  products: (query: Record<string, string | number | undefined> = {}) => {
    const qs = toQs(query)
    return apiGet<ListResp<Product>>(`/products${qs ? `?${qs}` : ""}`, false)
  },
  product: (idOrSlug: string) =>
    apiGet<ItemResp<Product>>(`/products/${idOrSlug}`, false).then((r) => r.data),

  services: (query: Record<string, string | number | undefined> = {}) => {
    const qs = toQs(query)
    return apiGet<ListResp<Service>>(`/services${qs ? `?${qs}` : ""}`, false)
  },
  service: (idOrSlug: string) =>
    apiGet<ItemResp<Service>>(`/services/${idOrSlug}`, false).then((r) => r.data),

  classes: (query: Record<string, string | number | undefined> = {}) => {
    const qs = toQs(query)
    return apiGet<ListResp<BeautyClass>>(`/classes${qs ? `?${qs}` : ""}`, false)
  },
  beautyClass: (idOrSlug: string) =>
    apiGet<ItemResp<BeautyClass>>(`/classes/${idOrSlug}`, false).then((r) => r.data),

  gallery: (category?: string) =>
    apiGet<ListResp<GalleryItem>>(
      `/gallery${category && category !== "all" ? `?category=${category}` : ""}`,
      false,
    ).then((r) => r.data),
}

// ---- Auth ----
export const AuthAPI = {
  requestOtp: (email: string, phone: string) =>
    apiPost<{
      success: boolean
      message: string
      email: string
      phone: string
      ttlMinutes: number
      devCode?: string
    }>("/auth/otp/request", { email, phone }, false),
  verifyOtp: (email: string, phone: string, code: string) =>
    apiPost<{ success: boolean; token: string; user: User; needsProfile: boolean }>(
      "/auth/otp/verify",
      { email, phone, code },
      false,
    ),
  me: () => apiGet<{ success: boolean; user: User }>("/auth/me").then((r) => r.user),
  updateMe: (updates: Partial<User>) =>
    apiPatch<{ success: boolean; user: User }>("/auth/me", updates).then((r) => r.user),
}

// ---- Cart (auth) ----
export const CartAPI = {
  get: () => apiGet<{ success: boolean; cart: CartState }>("/cart").then((r) => r.cart),
  add: (productId: string, quantity = 1, size?: string) =>
    apiPost<{ success: boolean; cart: CartState }>("/cart", { productId, quantity, size }).then(
      (r) => r.cart,
    ),
  update: (productId: string, quantity: number, size?: string) =>
    apiPatch<{ success: boolean; cart: CartState }>("/cart", { productId, quantity, size }).then(
      (r) => r.cart,
    ),
  remove: (productId: string, size?: string) =>
    apiDelete<{ success: boolean; cart: CartState }>(
      `/cart/${productId}${size ? `?size=${encodeURIComponent(size)}` : ""}`,
    ).then((r) => r.cart),
  clear: () => apiDelete<{ success: boolean; cart: CartState }>("/cart").then((r) => r.cart),
  merge: (items: { productId: string; quantity: number; size?: string }[]) =>
    apiPost<{ success: boolean; cart: CartState }>("/cart/merge", { items }).then((r) => r.cart),
}

// ---- Wishlist (auth) ----
export const WishlistAPI = {
  get: () => apiGet<{ success: boolean; data: Product[] }>("/wishlist").then((r) => r.data),
  add: (productId: string) =>
    apiPost<{ success: boolean; data: Product[] }>("/wishlist", { productId }).then((r) => r.data),
  remove: (productId: string) =>
    apiDelete<{ success: boolean; data: Product[] }>(`/wishlist/${productId}`).then((r) => r.data),
  merge: (productIds: string[]) =>
    apiPost<{ success: boolean; data: Product[] }>("/wishlist/merge", { productIds }).then(
      (r) => r.data,
    ),
}

// ---- Orders (auth) ----
export const OrderAPI = {
  place: (payload: {
    items?: { productId: string; quantity: number; size?: string }[]
    contact: { name: string; phone?: string; email?: string }
    shippingAddress?: Record<string, string>
    note?: string
  }) => apiPost<{ success: boolean; data: Order }>("/orders", payload).then((r) => r.data),
  mine: () => apiGet<ListResp<Order>>("/orders/mine"),
  get: (id: string) => apiGet<ItemResp<Order>>(`/orders/${id}`).then((r) => r.data),
}

// ---- Appointments ----
export const AppointmentAPI = {
  daySlots: (date: string) =>
    apiGet<{ success: boolean; data: { date: string; isClosed: boolean; slots: string[] } }>(
      `/appointments/availability/${date}`,
      false,
    ).then((r) => r.data),
  range: (from: string, to: string) =>
    apiGet<{
      success: boolean
      data: {
        days: Record<string, AvailabilityDay>
        bookings: { date: string; time: string; status: string }[]
        defaultSlots: string[]
      }
    }>(`/appointments/availability?from=${from}&to=${to}`, false).then((r) => r.data),
  enquire: (payload: {
    serviceId: string
    date: string
    time: string
    note?: string
    contact: { name: string; phone: string; email?: string }
  }) =>
    apiPost<{ success: boolean; data: Appointment }>("/appointments", payload).then((r) => r.data),
  mine: () => apiGet<ListResp<Appointment>>("/appointments/mine").then((r) => r.data),
}

// ---- Enrollments ----
export const EnrollmentAPI = {
  enquire: (payload: {
    classId: string
    note?: string
    contact: { name: string; phone: string; email?: string }
  }) =>
    apiPost<{ success: boolean; data: Enrollment; message?: string }>("/enrollments", payload),
  mine: () => apiGet<ListResp<Enrollment>>("/enrollments/mine").then((r) => r.data),
}

// ---- Newsletter ----
export const NewsletterAPI = {
  subscribe: (email: string) =>
    apiPost<{ success: boolean; message: string }>("/newsletter", { email }, false),
}

// ---- Admin ----
type MutResp<T> = { success: boolean; data: T }

export const AdminAPI = {
  login: (email: string, password: string) =>
    apiPost<{ success: boolean; token: string; user: User }>(
      "/auth/admin/login",
      { email, password },
      false,
    ),

  overview: () =>
    apiGet<{
      success: boolean
      data: {
        revenue: number
        orders: number
        pendingOrders: number
        customers: number
        products: number
        services: number
        classes: number
      }
    }>("/admin/analytics/overview").then((r) => r.data),
  revenueSeries: (months = 6) =>
    apiGet<{ success: boolean; data: { label: string; revenue: number; orders: number }[] }>(
      `/admin/analytics/revenue?months=${months}`,
    ).then((r) => r.data),
  topProducts: () =>
    apiGet<{
      success: boolean
      data: { _id: string; name: string; unitsSold: number; revenue: number }[]
    }>("/admin/analytics/top-products").then((r) => r.data),

  imagekitAuth: () =>
    apiGet<{
      success: boolean
      token: string
      expire: number
      signature: string
      publicKey: string
      urlEndpoint: string
    }>("/admin/uploads/imagekit-auth"),

  productTypes: {
    list: () => apiGet<ListResp<ProductType>>("/product-types?all=1").then((r) => r.data),
    create: (body: unknown) =>
      apiPost<MutResp<ProductType>>("/product-types", body).then((r) => r.data),
    update: (id: string, body: unknown) =>
      apiPatch<MutResp<ProductType>>(`/product-types/${id}`, body).then((r) => r.data),
    remove: (id: string) => apiDelete(`/product-types/${id}`),
  },

  products: {
    list: (query: Record<string, string | number | undefined> = {}) => {
      const qs = toQs({ all: "1", ...query })
      return apiGet<ListResp<Product>>(`/products?${qs}`)
    },
    create: (body: unknown) => apiPost<MutResp<Product>>("/products", body).then((r) => r.data),
    update: (id: string, body: unknown) =>
      apiPatch<MutResp<Product>>(`/products/${id}`, body).then((r) => r.data),
    remove: (id: string) => apiDelete(`/products/${id}`),
  },

  services: {
    list: (query: Record<string, string | number | undefined> = {}) => {
      const qs = toQs({ all: "1", ...query })
      return apiGet<ListResp<Service>>(`/services?${qs}`)
    },
    create: (body: unknown) => apiPost<MutResp<Service>>("/services", body).then((r) => r.data),
    update: (id: string, body: unknown) =>
      apiPatch<MutResp<Service>>(`/services/${id}`, body).then((r) => r.data),
    remove: (id: string) => apiDelete(`/services/${id}`),
  },

  classes: {
    list: (query: Record<string, string | number | undefined> = {}) => {
      const qs = toQs({ all: "1", ...query })
      return apiGet<ListResp<BeautyClass>>(`/classes?${qs}`)
    },
    create: (body: unknown) =>
      apiPost<MutResp<BeautyClass>>("/classes", body).then((r) => r.data),
    update: (id: string, body: unknown) =>
      apiPatch<MutResp<BeautyClass>>(`/classes/${id}`, body).then((r) => r.data),
    remove: (id: string) => apiDelete(`/classes/${id}`),
  },

  gallery: {
    list: (query: Record<string, string | number | undefined> = {}) => {
      const qs = toQs({ all: "1", ...query })
      return apiGet<ListResp<GalleryItem>>(`/gallery?${qs}`)
    },
    create: (body: unknown) =>
      apiPost<MutResp<GalleryItem>>("/gallery", body).then((r) => r.data),
    update: (id: string, body: unknown) =>
      apiPatch<MutResp<GalleryItem>>(`/gallery/${id}`, body).then((r) => r.data),
    remove: (id: string) => apiDelete(`/gallery/${id}`),
  },

  users: {
    list: (query: Record<string, string | number | undefined> = {}) => {
      const qs = toQs(query)
      return apiGet<ListResp<User & { orderCount: number; totalSpent: number }>>(
        `/admin/users${qs ? `?${qs}` : ""}`,
      )
    },
    get: (id: string) =>
      apiGet<{
        success: boolean
        data: { user: User; orders: Order[]; stats: { orderCount: number; totalSpent: number } }
      }>(`/admin/users/${id}`).then((r) => r.data),
    setBlocked: (id: string, isBlocked: boolean) =>
      apiPatch<MutResp<User>>(`/admin/users/${id}/block`, { isBlocked }).then((r) => r.data),
  },

  orders: {
    list: (query: Record<string, string | number | undefined> = {}) => {
      const qs = toQs(query)
      return apiGet<ListResp<Order>>(`/admin/orders${qs ? `?${qs}` : ""}`)
    },
    get: (id: string) => apiGet<MutResp<Order>>(`/orders/${id}`).then((r) => r.data),
    updateStatus: (id: string, status: string, paymentStatus?: string) =>
      apiPatch<MutResp<Order>>(`/admin/orders/${id}/status`, { status, paymentStatus }).then(
        (r) => r.data,
      ),
  },

  appointments: {
    list: (query: Record<string, string | number | undefined> = {}) => {
      const qs = toQs(query)
      return apiGet<ListResp<Appointment>>(`/admin/appointments${qs ? `?${qs}` : ""}`)
    },
    updateStatus: (id: string, status: string) =>
      apiPatch<MutResp<Appointment>>(`/admin/appointments/${id}/status`, { status }).then(
        (r) => r.data,
      ),
  },

  availability: {
    list: (from: string, to: string) =>
      apiGet<{ success: boolean; data: AvailabilityDay[]; defaultSlots: string[] }>(
        `/admin/availability?from=${from}&to=${to}`,
      ),
    set: (body: {
      date: string
      isClosed?: boolean
      slots?: { time: string; isBooked?: boolean }[]
      note?: string
    }) =>
      api<{ success: boolean; data: AvailabilityDay }>("/admin/availability", {
        method: "PUT",
        body,
      }).then((r) => r.data),
  },

  enrollments: {
    list: (query: Record<string, string | number | undefined> = {}) => {
      const qs = toQs(query)
      return apiGet<ListResp<Enrollment>>(`/admin/enrollments${qs ? `?${qs}` : ""}`)
    },
    updateStatus: (id: string, status: string) =>
      apiPatch<MutResp<Enrollment>>(`/admin/enrollments/${id}/status`, { status }).then(
        (r) => r.data,
      ),
  },
}
