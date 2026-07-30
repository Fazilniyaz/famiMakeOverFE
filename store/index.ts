import { configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { adminApi } from "./adminApi"

export const makeAdminStore = () =>
  configureStore({
    reducer: {
      [adminApi.reducerPath]: adminApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(adminApi.middleware),
  })

export type AdminStore = ReturnType<typeof makeAdminStore>
export type RootState = ReturnType<AdminStore["getState"]>
export type AppDispatch = AdminStore["dispatch"]

/** Call once after creating the store (client-only). */
export function enableAdminStoreListeners(store: AdminStore) {
  setupListeners(store.dispatch)
}
