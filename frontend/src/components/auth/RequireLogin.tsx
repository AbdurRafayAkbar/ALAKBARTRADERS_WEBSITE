import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useMe } from '../../api/hooks'
import type { User } from '../../api/types'

// Account pages need a login. A guest goes to the login page and comes back
// here afterwards. Django still checks every request; this only saves a trip.
export function RequireLogin({ children }: { children: (me: User) => ReactNode }) {
  const { data: me, isPending } = useMe()
  const location = useLocation()

  if (isPending) return null
  if (!me) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate replace to={`/accounts/login/?next=${next}`} />
  }
  return children(me)
}
