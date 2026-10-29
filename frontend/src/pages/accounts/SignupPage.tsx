import { Link, useNavigate } from 'react-router'
import { useSignup } from '../../api/hooks'
import { AuthLayout, Field, FormError, toApiError } from '../../components/auth/AuthForm'
import { Button } from '../../components/ui/Button'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

const PASSWORD_HINT = 'At least 8 characters, and not only numbers.'

export default function SignupPage() {
  useDocumentTitle('Create an account')
  const navigate = useNavigate()
  const signupMutation = useSignup()
  const error = toApiError(signupMutation.error)

  return (
    <AuthLayout
      heading="Create an account"
      text="An account is optional. You can still order as a guest."
    >
      <form
        className="grid gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          const form = new FormData(e.currentTarget)
          signupMutation.mutate(
            {
              email: String(form.get('email')),
              password: String(form.get('password')),
              first_name: String(form.get('first_name')).trim(),
              phone: String(form.get('phone')).trim(),
            },
            { onSuccess: () => navigate('/') },
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
          autoComplete="new-password"
          hint={PASSWORD_HINT}
          required
          errors={error?.fields?.password}
        />
        <Field
          name="first_name"
          label="Name (optional)"
          autoComplete="given-name"
          errors={error?.fields?.first_name}
        />
        <Field
          name="phone"
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          placeholder="03001234567"
          errors={error?.fields?.phone}
        />
        <Button type="submit" variant="primary" disabled={signupMutation.isPending}>
          {signupMutation.isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <p className="mt-6 text-muted">
        Have an account?{' '}
        <Link to="/accounts/login/" className="link-grow font-semibold text-primary-900">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}
