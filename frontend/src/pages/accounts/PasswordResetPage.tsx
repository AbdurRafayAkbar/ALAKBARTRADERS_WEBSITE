import { usePasswordReset } from '../../api/hooks'
import { AuthLayout, Field, FormError, toApiError } from '../../components/auth/AuthForm'
import { Button } from '../../components/ui/Button'
import { MessageBlock } from '../../components/ui/StatusMessage'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

export default function PasswordResetPage() {
  useDocumentTitle('Reset your password')
  const reset = usePasswordReset()
  const error = toApiError(reset.error)

  return (
    <AuthLayout
      heading="Reset your password"
      text="Enter the email you signed up with. We will email you a link to choose a new password."
    >
      {reset.isSuccess ? (
        // Django answers the same for every email, so this must not say an account exists.
        <div role="status">
          <MessageBlock title="Check your email">
            If {reset.variables} has an account, a reset link is on its way. Look in your spam
            folder if it does not arrive in a few minutes.
          </MessageBlock>
        </div>
      ) : (
        <form
          className="grid gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            reset.mutate(String(new FormData(e.currentTarget).get('email')))
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
          <Button type="submit" variant="primary" disabled={reset.isPending}>
            {reset.isPending ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
