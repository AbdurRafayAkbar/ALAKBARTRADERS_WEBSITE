import { Link, useNavigate } from 'react-router'
import { useLogout, useUpdateProfile } from '../../api/hooks'
import type { User } from '../../api/types'
import { AuthLayout, Field, FormError, toApiError } from '../../components/auth/AuthForm'
import { RequireLogin } from '../../components/auth/RequireLogin'
import { Button } from '../../components/ui/Button'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

function ProfileForm({ me }: { me: User }) {
  const updateMutation = useUpdateProfile()
  const logoutMutation = useLogout()
  const navigate = useNavigate()
  const error = toApiError(updateMutation.error)

  return (
    <>
      <p className="text-muted">
        Logged in as <span className="font-semibold text-ink">{me.email}</span>
      </p>
      <form
        className="mt-6 grid gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          const form = new FormData(e.currentTarget)
          updateMutation.mutate({
            first_name: String(form.get('first_name')),
            last_name: String(form.get('last_name')),
            phone: String(form.get('phone')),
          })
        }}
      >
        <FormError error={error} />
        <Field
          name="first_name"
          label="First name"
          autoComplete="given-name"
          defaultValue={me.first_name}
          errors={error?.fields?.first_name}
        />
        <Field
          name="last_name"
          label="Last name"
          autoComplete="family-name"
          defaultValue={me.last_name}
          errors={error?.fields?.last_name}
        />
        <Field
          name="phone"
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          placeholder="03001234567"
          defaultValue={me.phone}
          errors={error?.fields?.phone}
        />
        <Button type="submit" variant="primary" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Saving…' : 'Save changes'}
        </Button>
        {updateMutation.isSuccess && (
          <p role="status" className="text-primary-900">
            Changes saved.
          </p>
        )}
      </form>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-secondary/60 pt-6">
        <Link to="/account/addresses/" className="link-grow font-semibold text-primary-900">
          Saved addresses
        </Link>
        <Button
          disabled={logoutMutation.isPending}
          onClick={() => {
            // Leave first: once the user is cleared, this page would send the
            // customer to the login page instead of home.
            navigate('/')
            logoutMutation.mutate()
          }}
        >
          Log out
        </Button>
      </div>
    </>
  )
}

export default function ProfilePage() {
  useDocumentTitle('Your account')
  return (
    <AuthLayout heading="Your account">
      <RequireLogin>{(me) => <ProfileForm me={me} />}</RequireLogin>
    </AuthLayout>
  )
}
