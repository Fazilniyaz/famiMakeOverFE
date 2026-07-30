// Shared types mirroring the backend API responses.

export interface ImageRef {
  url: string
  fileId?: string
}

export interface ProductType {
  _id: string
  name: string
  slug: string
  description?: string
  image?: ImageRef
  isActive: boolean
  sortOrder: number
}

export interface Product {
  _id: string
  name: string
  slug: string
  productType: ProductType | string
  description?: string
  shortDescription?: string
  price: number
  offerPrice?: number | null
  effectivePrice?: number
  images: ImageRef[]
  badge?: "Bestseller" | "New" | "Sale" | null
  sizes?: string[]
  tagline?: string
  howToUse?: string
  ingredients?: string
  ratingAverage?: number
  ratingCount?: number
  stock?: number
  isActive: boolean
  isFeatured: boolean
}

export interface Service {
  _id: string
  name: string
  slug: string
  description?: string
  shortDescription?: string
  price: number
  offerPrice?: number | null
  effectivePrice?: number
  durationMinutes?: number | null
  images: ImageRef[]
  isActive: boolean
  isFeatured: boolean
}

export interface BeautyClass {
  _id: string
  name: string
  slug: string
  description?: string
  shortDescription?: string
  price: number
  offerPrice?: number | null
  effectivePrice?: number
  durationLabel?: string
  level?: "beginner" | "intermediate" | "advanced" | "all"
  images: ImageRef[]
  isActive: boolean
  isFeatured: boolean
}

export interface GalleryItem {
  _id: string
  title?: string
  category: "bridal" | "mehandi" | "makeup" | "hair" | "skincare" | "other"
  image: ImageRef
  isActive: boolean
  sortOrder: number
}

export interface Address {
  label?: string
  line1?: string
  line2?: string
  city?: string
  state?: string
  pincode?: string
}

export interface User {
  _id: string
  role: "customer" | "admin"
  phone?: string
  phoneVerified?: boolean
  name?: string
  email?: string
  emailVerified?: boolean
  avatar?: ImageRef
  gender?: "female" | "male" | "other" | "unspecified"
  dob?: string
  addresses?: Address[]
  isBlocked?: boolean
}

export interface CartLine {
  product: Product
  quantity: number
  size?: string
  lineTotal: number
}

export interface CartState {
  items: CartLine[]
  subtotal: number
  count: number
}

export interface OrderItem {
  product?: string
  name: string
  image?: string
  size?: string
  price: number
  quantity: number
}

export interface Order {
  _id: string
  orderNumber: string
  user: string | User
  items: OrderItem[]
  itemsTotal: number
  shipping: number
  total: number
  contact: { name?: string; phone?: string; email?: string }
  shippingAddress?: Address
  note?: string
  status: "pending" | "confirmed" | "processing" | "delivered" | "completed" | "cancelled"
  paymentStatus: "unpaid" | "paid"
  createdAt: string
}

export interface ListMeta {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface Appointment {
  _id: string
  user: string | User
  service: string | Service
  date: string
  time: string
  status: "enquiry" | "booked" | "cancelled" | "completed"
  contact: { name?: string; phone?: string; email?: string }
  note?: string
  serviceName?: string
  servicePrice?: number
  createdAt: string
}

export interface Enrollment {
  _id: string
  user: string | User
  classRef: string | BeautyClass
  status: "enquiry" | "success" | "failure" | "cancelled"
  contact: { name?: string; phone?: string; email?: string }
  note?: string
  className?: string
  classPrice?: number
  createdAt: string
}

export interface AvailabilityDay {
  _id?: string
  date: string
  isClosed: boolean
  slots: { time: string; isBooked: boolean }[]
  note?: string
}
