import { lazy } from 'react'
import type { RouteObject } from 'react-router'
import type { RouteHandle } from '../config/palettes'
import { Layout } from '../components/layout/Layout'
import HomePage from '../pages/home/HomePage'

// Home loads with the first bundle; other pages load when visited.
const ShopPage = lazy(() => import('../pages/ShopPage'))
const ProductPage = lazy(() => import('../pages/ProductPage'))
const CartPage = lazy(() => import('../pages/CartPage'))
const DeliveryAreasPage = lazy(() => import('../pages/DeliveryAreasPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

// Each page has its own palette while the owner picks one (design.md).
const palette = (id: RouteHandle['palette']): RouteHandle => ({ palette: id })

// URLs end with a slash to match Django (urls.md).
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage />, handle: palette('emerald') },
      { path: '/shop/', element: <ShopPage mode="all" />, handle: palette('sage') },
      { path: '/c/:slug/', element: <ShopPage mode="category" />, handle: palette('sage') },
      { path: '/search/', element: <ShopPage mode="search" />, handle: palette('sage') },
      { path: '/p/:slug/', element: <ProductPage />, handle: palette('saffron') },
      { path: '/cart/', element: <CartPage />, handle: palette('pistachio') },
      { path: '/delivery-areas/', element: <DeliveryAreasPage />, handle: palette('indus') },
      { path: '*', element: <NotFoundPage />, handle: palette('date') },
    ],
  },
]
