import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { API_URL, getToken } from "@/lib/api"
import type {
  Product,
  ProductType,
  Service,
  BeautyClass,
  GalleryItem,
  User,
  Order,
  Appointment,
  Enrollment,
  AvailabilityDay,
  ListMeta,
} from "@/lib/types"

type ListResp<T> = { success: boolean; data: T[]; meta?: ListMeta }
type ItemResp<T> = { success: boolean; data: T }

function toQs(query: Record<string, string | number | undefined | null> = {}) {
  const entries = Object.entries(query).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  ) as [string, string][]
  return new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()
}

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      const token = getToken()
      if (token) headers.set("Authorization", `Bearer ${token}`)
      return headers
    },
  }),
  // Keep admin lists warm while navigating between modules
  keepUnusedDataFor: 120,
  tagTypes: [
    "Dashboard",
    "Orders",
    "Products",
    "ProductTypes",
    "Services",
    "Classes",
    "Gallery",
    "Users",
    "Appointments",
    "Enrollments",
    "Availability",
  ],
  endpoints: (builder) => ({
    // ---- Dashboard ----
    getOverview: builder.query<
      {
        revenue: number
        orders: number
        pendingOrders: number
        customers: number
        products: number
        services: number
        classes: number
      },
      void
    >({
      query: () => "/admin/analytics/overview",
      transformResponse: (r: { success: boolean; data: any }) => r.data,
      providesTags: ["Dashboard"],
    }),
    getRevenueSeries: builder.query<{ label: string; revenue: number; orders: number }[], number | void>({
      query: (months = 6) => `/admin/analytics/revenue?months=${months || 6}`,
      transformResponse: (r: { success: boolean; data: any }) => r.data,
      providesTags: ["Dashboard"],
    }),
    getTopProducts: builder.query<
      { _id: string; name: string; unitsSold: number; revenue: number }[],
      void
    >({
      query: () => "/admin/analytics/top-products",
      transformResponse: (r: { success: boolean; data: any }) => r.data,
      providesTags: ["Dashboard"],
    }),

    // ---- Orders ----
    getOrders: builder.query<ListResp<Order>, Record<string, string | number | undefined>>({
      query: (params) => {
        const qs = toQs(params)
        return `/admin/orders${qs ? `?${qs}` : ""}`
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Orders" as const, id: _id })),
              { type: "Orders", id: "LIST" },
            ]
          : [{ type: "Orders", id: "LIST" }],
    }),
    getOrder: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      transformResponse: (r: ItemResp<Order>) => r.data,
      providesTags: (_r, _e, id) => [{ type: "Orders", id }],
    }),
    updateOrderStatus: builder.mutation<
      Order,
      { id: string; status: string; paymentStatus?: string }
    >({
      query: ({ id, status, paymentStatus }) => ({
        url: `/admin/orders/${id}/status`,
        method: "PATCH",
        body: { status, paymentStatus },
      }),
      transformResponse: (r: ItemResp<Order>) => r.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Orders", id },
        { type: "Orders", id: "LIST" },
        "Dashboard",
      ],
    }),

    // ---- Product types ----
    getProductTypes: builder.query<ProductType[], void>({
      query: () => "/product-types?all=1",
      transformResponse: (r: ListResp<ProductType>) => r.data,
      providesTags: [{ type: "ProductTypes", id: "LIST" }],
    }),
    createProductType: builder.mutation<ProductType, unknown>({
      query: (body) => ({ url: "/product-types", method: "POST", body }),
      transformResponse: (r: ItemResp<ProductType>) => r.data,
      invalidatesTags: [{ type: "ProductTypes", id: "LIST" }],
    }),
    updateProductType: builder.mutation<ProductType, { id: string; body: unknown }>({
      query: ({ id, body }) => ({ url: `/product-types/${id}`, method: "PATCH", body }),
      transformResponse: (r: ItemResp<ProductType>) => r.data,
      invalidatesTags: [{ type: "ProductTypes", id: "LIST" }],
    }),
    deleteProductType: builder.mutation<void, string>({
      query: (id) => ({ url: `/product-types/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "ProductTypes", id: "LIST" }],
    }),

    // ---- Products ----
    getProducts: builder.query<ListResp<Product>, Record<string, string | number | undefined>>({
      query: (params) => {
        const qs = toQs({ all: "1", ...params })
        return `/products?${qs}`
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Products" as const, id: _id })),
              { type: "Products", id: "LIST" },
            ]
          : [{ type: "Products", id: "LIST" }],
    }),
    createProduct: builder.mutation<Product, unknown>({
      query: (body) => ({ url: "/products", method: "POST", body }),
      transformResponse: (r: ItemResp<Product>) => r.data,
      invalidatesTags: [{ type: "Products", id: "LIST" }, "Dashboard"],
    }),
    updateProduct: builder.mutation<Product, { id: string; body: unknown }>({
      query: ({ id, body }) => ({ url: `/products/${id}`, method: "PATCH", body }),
      transformResponse: (r: ItemResp<Product>) => r.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Products", id },
        { type: "Products", id: "LIST" },
        "Dashboard",
      ],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Products", id: "LIST" }, "Dashboard"],
    }),

    // ---- Services ----
    getServices: builder.query<ListResp<Service>, Record<string, string | number | undefined>>({
      query: (params) => {
        const qs = toQs({ all: "1", ...params })
        return `/services?${qs}`
      },
      providesTags: [{ type: "Services", id: "LIST" }],
    }),
    createService: builder.mutation<Service, unknown>({
      query: (body) => ({ url: "/services", method: "POST", body }),
      transformResponse: (r: ItemResp<Service>) => r.data,
      invalidatesTags: [{ type: "Services", id: "LIST" }, "Dashboard"],
    }),
    updateService: builder.mutation<Service, { id: string; body: unknown }>({
      query: ({ id, body }) => ({ url: `/services/${id}`, method: "PATCH", body }),
      transformResponse: (r: ItemResp<Service>) => r.data,
      invalidatesTags: [{ type: "Services", id: "LIST" }, "Dashboard"],
    }),
    deleteService: builder.mutation<void, string>({
      query: (id) => ({ url: `/services/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Services", id: "LIST" }, "Dashboard"],
    }),

    // ---- Classes ----
    getClasses: builder.query<ListResp<BeautyClass>, Record<string, string | number | undefined>>({
      query: (params) => {
        const qs = toQs({ all: "1", ...params })
        return `/classes?${qs}`
      },
      providesTags: [{ type: "Classes", id: "LIST" }],
    }),
    createClass: builder.mutation<BeautyClass, unknown>({
      query: (body) => ({ url: "/classes", method: "POST", body }),
      transformResponse: (r: ItemResp<BeautyClass>) => r.data,
      invalidatesTags: [{ type: "Classes", id: "LIST" }, "Dashboard"],
    }),
    updateClass: builder.mutation<BeautyClass, { id: string; body: unknown }>({
      query: ({ id, body }) => ({ url: `/classes/${id}`, method: "PATCH", body }),
      transformResponse: (r: ItemResp<BeautyClass>) => r.data,
      invalidatesTags: [{ type: "Classes", id: "LIST" }, "Dashboard"],
    }),
    deleteClass: builder.mutation<void, string>({
      query: (id) => ({ url: `/classes/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Classes", id: "LIST" }, "Dashboard"],
    }),

    // ---- Gallery ----
    getGallery: builder.query<ListResp<GalleryItem>, Record<string, string | number | undefined>>({
      query: (params = {}) => {
        const qs = toQs({ all: "1", ...params })
        return `/gallery?${qs}`
      },
      providesTags: [{ type: "Gallery", id: "LIST" }],
    }),
    createGalleryItem: builder.mutation<GalleryItem, unknown>({
      query: (body) => ({ url: "/gallery", method: "POST", body }),
      transformResponse: (r: ItemResp<GalleryItem>) => r.data,
      invalidatesTags: [{ type: "Gallery", id: "LIST" }],
    }),
    updateGalleryItem: builder.mutation<GalleryItem, { id: string; body: unknown }>({
      query: ({ id, body }) => ({ url: `/gallery/${id}`, method: "PATCH", body }),
      transformResponse: (r: ItemResp<GalleryItem>) => r.data,
      invalidatesTags: [{ type: "Gallery", id: "LIST" }],
    }),
    deleteGalleryItem: builder.mutation<void, string>({
      query: (id) => ({ url: `/gallery/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Gallery", id: "LIST" }],
    }),

    // ---- Users ----
    getUsers: builder.query<
      ListResp<User & { orderCount: number; totalSpent: number }>,
      Record<string, string | number | undefined>
    >({
      query: (params) => {
        const qs = toQs(params)
        return `/admin/users${qs ? `?${qs}` : ""}`
      },
      providesTags: [{ type: "Users", id: "LIST" }],
    }),
    getUser: builder.query<
      { user: User; orders: Order[]; stats: { orderCount: number; totalSpent: number } },
      string
    >({
      query: (id) => `/admin/users/${id}`,
      transformResponse: (r: { success: boolean; data: any }) => r.data,
      providesTags: (_r, _e, id) => [{ type: "Users", id }],
    }),
    setUserBlocked: builder.mutation<User, { id: string; isBlocked: boolean }>({
      query: ({ id, isBlocked }) => ({
        url: `/admin/users/${id}/block`,
        method: "PATCH",
        body: { isBlocked },
      }),
      transformResponse: (r: ItemResp<User>) => r.data,
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    // ---- Appointments ----
    getAppointments: builder.query<
      ListResp<Appointment>,
      Record<string, string | number | undefined>
    >({
      query: (params) => {
        const qs = toQs(params)
        return `/admin/appointments${qs ? `?${qs}` : ""}`
      },
      providesTags: [{ type: "Appointments", id: "LIST" }],
    }),
    updateAppointmentStatus: builder.mutation<Appointment, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/appointments/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (r: ItemResp<Appointment>) => r.data,
      invalidatesTags: [{ type: "Appointments", id: "LIST" }, "Availability"],
    }),
    getAvailability: builder.query<
      { data: AvailabilityDay[]; defaultSlots: string[] },
      { from: string; to: string }
    >({
      query: ({ from, to }) => `/admin/availability?from=${from}&to=${to}`,
      transformResponse: (r: { success: boolean; data: AvailabilityDay[]; defaultSlots: string[] }) => ({
        data: r.data,
        defaultSlots: r.defaultSlots,
      }),
      providesTags: ["Availability"],
    }),
    setAvailability: builder.mutation<
      AvailabilityDay,
      {
        date: string
        isClosed?: boolean
        slots?: { time: string; isBooked?: boolean }[]
        note?: string
      }
    >({
      query: (body) => ({ url: "/admin/availability", method: "PUT", body }),
      transformResponse: (r: ItemResp<AvailabilityDay>) => r.data,
      invalidatesTags: ["Availability", { type: "Appointments", id: "LIST" }],
    }),

    // ---- Enrollments ----
    getEnrollments: builder.query<
      ListResp<Enrollment>,
      Record<string, string | number | undefined>
    >({
      query: (params) => {
        const qs = toQs(params)
        return `/admin/enrollments${qs ? `?${qs}` : ""}`
      },
      providesTags: [{ type: "Enrollments", id: "LIST" }],
    }),
    updateEnrollmentStatus: builder.mutation<Enrollment, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/enrollments/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (r: ItemResp<Enrollment>) => r.data,
      invalidatesTags: [{ type: "Enrollments", id: "LIST" }],
    }),
  }),
})

export const {
  useGetOverviewQuery,
  useGetRevenueSeriesQuery,
  useGetTopProductsQuery,
  useGetOrdersQuery,
  useGetOrderQuery,
  useLazyGetOrderQuery,
  useUpdateOrderStatusMutation,
  useGetProductTypesQuery,
  useCreateProductTypeMutation,
  useUpdateProductTypeMutation,
  useDeleteProductTypeMutation,
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetClassesQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useGetGalleryQuery,
  useCreateGalleryItemMutation,
  useUpdateGalleryItemMutation,
  useDeleteGalleryItemMutation,
  useGetUsersQuery,
  useLazyGetUserQuery,
  useSetUserBlockedMutation,
  useGetAppointmentsQuery,
  useUpdateAppointmentStatusMutation,
  useGetAvailabilityQuery,
  useSetAvailabilityMutation,
  useGetEnrollmentsQuery,
  useUpdateEnrollmentStatusMutation,
  usePrefetch,
} = adminApi
