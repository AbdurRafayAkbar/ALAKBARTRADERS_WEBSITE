import { lazy } from 'react'
import type { RouteObject } from 'react-router'
import { Layout } from '../components/layout/Layout'
import HomePage from '../pages/home/HomePage'

// Home loads with the first bundle; other pages load when visited.
const ShopPage = lazy(() => import('../pages/ShopPage'))
const ProductPage = lazy(() => import('../pages/ProductPage'))
const CartPage = lazy(() => import('../pages/CartPage'))
const DeliveryAreasPage = lazy(() => import('../pages/DeliveryAreasPage'))
const LoginPage = lazy(() => import('../pages/accounts/LoginPage'))
const SignupPage = lazy(() => import('../pages/accounts/SignupPage'))
const PasswordResetPage = lazy(() => import('../pages/accounts/PasswordResetPage'))
const PasswordResetConfirmPage = lazy(() => import('../pages/accounts/PasswordResetConfirmPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

// URLs end with a slash to match Django (urls.md).
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/shop/', element: <ShopPage mode="all" /> },
      { path: '/c/:slug/', element: <ShopPage mode="category" /> },
      { path: '/search/', element: <ShopPage mode="search" /> },
      { path: '/p/:slug/', element: <ProductPage /> },
      { path: '/cart/', element: <CartPage /> },
      { path: '/delivery-areas/', element: <DeliveryAreasPage /> },
      { path: '/accounts/login/', element: <LoginPage /> },
      { path: '/accounts/signup/', element: <SignupPage /> },
      {
        path: '/accounts/password-reset/',
        element: <PasswordResetPage />,
      },
      {
        path: '/accounts/password-reset/:uid/:token/',
        element: <PasswordResetConfirmPage />,
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
