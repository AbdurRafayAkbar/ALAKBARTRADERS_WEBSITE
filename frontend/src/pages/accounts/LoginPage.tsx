import { Link, useNavigate, useSearchParams } from 'react-router'
import { useLogin } from '../../api/hooks'
import { AuthLayout, Field, FormError, toApiError } from '../../components/auth/AuthForm'
import { Button } from '../../components/ui/Button'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

// Only paths on this site, so a crafted link cannot send the customer elsewhere.
function safeNext(next: string | null) {
  return next?.startsWith('/') && !next.startsWith('//') ? next : '/'
}

export default function LoginPage() {
  useDocumentTitle('Log in')
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const loginMutation = useLogin()
  const error = toApiError(loginMutation.error)

  return (
    <AuthLayout heading="Log in" text="No account? You can still order as a guest.">
      <form
        className="grid gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          const form = new FormData(e.currentTarget)
          loginMutation.mutate(
            { email: String(form.get('email')), password: String(form.get('password')) },
            { onSuccess: () => navigate(next) },
          )
        }}
      >
        <FormError error={error} />
        <Field
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          errors={error?.fields?.email}
        />
        <Field
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          errors={error?.fields?.password}
        />
        <Button type="submit" variant="primary" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
      <div className="mt-6 grid gap-2 text-muted">
        <Link
          to="/accounts/password-reset/"
          className="link-grow w-fit font-semibold text-primary-900"
        >
          Forgot your password?
        </Link>
        <p>
          New here?{' '}
          <Link to="/accounts/signup/" className="link-grow font-semibold text-primary-900">
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
