import { Link, useParams } from 'react-router'
import { usePasswordResetConfirm } from '../../api/hooks'
import { AuthLayout, Field, FormError, toApiError } from '../../components/auth/AuthForm'
import { Button, ButtonLink } from '../../components/ui/Button'
import { MessageBlock } from '../../components/ui/StatusMessage'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

export default function PasswordResetConfirmPage() {
  useDocumentTitle('Choose a new password')
  const { uid = '', token = '' } = useParams()
  const confirm = usePasswordResetConfirm()
  const error = toApiError(confirm.error)
  // A wrong or used link comes back without field errors. The fix is a new link.
  const linkBad = error?.code === 'validation_error' && !error.fields?.password

  return (
    <AuthLayout heading="Choose a new password">
      {confirm.isSuccess ? (
        <div role="status">
          <MessageBlock title="Password changed">
            Log in with your new password.
            <ButtonLink to="/accounts/login/" variant="primary" className="mt-4 w-fit">
              Log in
            </ButtonLink>
          </MessageBlock>
        </div>
      ) : (
        <form
          className="grid gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            const password = String(new FormData(e.currentTarget).get('password'))
            confirm.mutate({ uid, token, password })
          }}
        >
          <FormError error={error} />
          {linkBad && (
            <Link
              to="/accounts/password-reset/"
              className="link-grow w-fit font-semibold text-primary-900"
            >
              Ask for a new link
            </Link>
          )}
          <Field
            name="password"
            label="New password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters, and not only numbers."
            required
            errors={error?.fields?.password}
          />
          <Button type="submit" variant="primary" disabled={confirm.isPending}>
            {confirm.isPending ? 'Saving…' : 'Save new password'}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
