import { useState } from 'react'
import { Link } from 'react-router'
import type { AddressInput } from '../../api/account'
import { useAddresses, useCreateAddress, useDeleteAddress, useUpdateAddress } from '../../api/hooks'
import type { Address } from '../../api/types'
import { AuthLayout, Field, FormError, toApiError } from '../../components/auth/AuthForm'
import { RequireLogin } from '../../components/auth/RequireLogin'
import { Button } from '../../components/ui/Button'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

// One form open at a time: a new address, or the id of the one being edited.
type Editing = 'new' | number | null

// The same lines the rider reads on the order slip.
function addressLines(address: Address) {
  const house = [address.house_number, address.house_name].filter(Boolean).join(', ')
  return [house, `${address.block}, ${address.colony}`, address.landmark].filter(Boolean)
}

function AddressForm({ address, onDone }: { address?: Address; onDone: () => void }) {
  const createMutation = useCreateAddress()
  const updateMutation = useUpdateAddress()
  const mutation = address ? updateMutation : createMutation
  const error = toApiError(mutation.error)
  const text = (form: FormData, name: string) => String(form.get(name) ?? '')

  return (
    <form
      className="grid gap-5 rounded-card border border-secondary bg-card p-5"
      onSubmit={(e) => {
        e.preventDefault()
        const form = new FormData(e.currentTarget)
        const input: AddressInput = {
          full_name: text(form, 'full_name'),
          phone: text(form, 'phone'),
          house_number: text(form, 'house_number'),
          block: text(form, 'block'),
          colony: text(form, 'colony'),
          house_name: text(form, 'house_name'),
          landmark: text(form, 'landmark'),
          is_default: form.get('is_default') === 'on',
        }
        if (address) updateMutation.mutate({ id: address.id, input }, { onSuccess: onDone })
        else createMutation.mutate(input, { onSuccess: onDone })
      }}
    >
      <h2 className="text-xl font-semibold">{address ? 'Edit address' : 'New address'}</h2>
      <FormError error={error} />
      <Field
        name="full_name"
        label="Name"
        autoComplete="name"
        required
        defaultValue={address?.full_name}
        errors={error?.fields?.full_name}
      />
      <Field
        name="phone"
        label="Phone"
        type="tel"
        autoComplete="tel"
        placeholder="03001234567"
        required
        defaultValue={address?.phone}
        errors={error?.fields?.phone}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          name="house_number"
          label="House number"
          placeholder="House#999"
          required
          defaultValue={address?.house_number}
          errors={error?.fields?.house_number}
        />
        <Field
          name="block"
          label="Block"
          placeholder="CAT-V"
          required
          defaultValue={address?.block}
          errors={error?.fields?.block}
        />
      </div>
      <Field
        name="colony"
        label="Colony"
        required
        defaultValue={address?.colony}
        errors={error?.fields?.colony}
      />
      <Field
        name="house_name"
        label="House name (optional)"
        hint="The name written outside, if there is one."
        defaultValue={address?.house_name}
        errors={error?.fields?.house_name}
      />
      <Field
        name="landmark"
        label="Landmark (optional)"
        hint="Something near the house, to help the rider find it."
        defaultValue={address?.landmark}
        errors={error?.fields?.landmark}
      />
      {!address?.is_default && (
        <label className="flex items-center gap-3 font-semibold">
          <input name="is_default" type="checkbox" className="size-5 accent-primary-900" />
          Use as my default address
        </label>
      )}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Save address'}
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function AddressCard({ address, onEdit }: { address: Address; onEdit: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const updateMutation = useUpdateAddress()
  const deleteMutation = useDeleteAddress()
  const error = toApiError(updateMutation.error ?? deleteMutation.error)

  return (
    <li className="grid gap-3 rounded-card border border-secondary bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold">{address.full_name}</p>
        {address.is_default && (
          <span className="rounded-full bg-primary-50 px-3 text-sm font-semibold text-primary-900">
            Default
          </span>
        )}
      </div>
      <div className="text-muted">
        {addressLines(address).map((line) => (
          <p key={line}>{line}</p>
        ))}
        <p>{address.phone}</p>
      </div>
      <FormError error={error} />
      {confirming ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-semibold">Delete this address?</p>
          <Button
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(address.id)}
          >
            Yes, delete
          </Button>
          <Button variant="ghost" onClick={() => setConfirming(false)}>
            Keep it
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          <Button onClick={onEdit}>Edit</Button>
          {!address.is_default && (
            <Button
              disabled={updateMutation.isPending}
              onClick={() => updateMutation.mutate({ id: address.id, input: { is_default: true } })}
            >
              Make default
            </Button>
          )}
          <Button variant="ghost" onClick={() => setConfirming(true)}>
            Delete
          </Button>
        </div>
      )}
    </li>
  )
}

function AddressBook() {
  const { data: addresses, isPending, error } = useAddresses()
  const [editing, setEditing] = useState<Editing>(null)
  const close = () => setEditing(null)

  if (isPending) return <p className="text-muted">Loading your addresses…</p>
  if (error) return <FormError error={toApiError(error)} />

  return (
    <div className="grid gap-6">
      {addresses.length === 0 && editing !== 'new' && (
        <p className="text-muted">No saved addresses yet. Add one to order faster.</p>
      )}
      {addresses.length > 0 && (
        <ul className="grid gap-4" aria-label="Your addresses">
          {addresses.map((address) =>
            editing === address.id ? (
              <li key={address.id}>
                <AddressForm address={address} onDone={close} />
              </li>
            ) : (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={() => setEditing(address.id)}
              />
            ),
          )}
        </ul>
      )}
      {editing === 'new' ? (
        <AddressForm onDone={close} />
      ) : (
        <Button variant="primary" className="w-fit" onClick={() => setEditing('new')}>
          Add an address
        </Button>
      )}
      <Link to="/account/" className="link-grow w-fit font-semibold text-primary-900">
        Back to your account
      </Link>
    </div>
  )
}

export default function AddressesPage() {
  useDocumentTitle('Saved addresses')
  return (
    <AuthLayout
      heading="Saved addresses"
      text="Save the places we deliver to, so checkout fills them in for you."
      wide
    >
      <RequireLogin>{() => <AddressBook />}</RequireLogin>
    </AuthLayout>
  )
}
