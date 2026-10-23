import { useState } from 'react'
import { todayISO } from '../utils/library'

const emptyForm = {
  seat_no: '',
  first_name: '',
  last_name: '',
  phone_number: '',
  admission_date: todayISO(),
  pay_amount: '',
  subscription_duration: 1,
  due_payment: 0,
}

/**
 * Add/Edit form. `member` is null for "add", or an existing row for "edit".
 * `availableSeats` is the list of free seat numbers (plus the member's own
 * current seat, when editing, so it still appears as a choice).
 */
export default function MemberFormModal({ member, availableSeats, initialSeatNo, onSave, onCancel }) {
  const isEdit = Boolean(member)
  const [form, setForm] = useState(() =>
    member
      ? {
          seat_no: member.seat_no,
          first_name: member.first_name,
          last_name: member.last_name,
          phone_number: member.phone_number,
          admission_date: member.admission_date,
          pay_amount: member.pay_amount,
          subscription_duration: member.subscription_duration,
          due_payment: member.due_payment,
        }
      : { ...emptyForm, seat_no: initialSeatNo ? String(initialSeatNo) : '' }
  )
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    
    if (!form.first_name.trim()) return setError('First name is required.')
    if (!form.last_name.trim()) return setError('Last name is required.')
    if (!form.phone_number.trim()) return setError('Phone number is required.')
    if (!form.pay_amount || Number(form.pay_amount) <= 0)
      return setError('Pay amount must be greater than 0.')
    if (!form.subscription_duration || Number(form.subscription_duration) <= 0)
      return setError('Subscription duration must be greater than 0.')

    setBusy(true)
    const payload = {
      seat_no: form.seat_no === '' ? null : Number(form.seat_no),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      phone_number: form.phone_number.trim(),
      admission_date: form.admission_date,
      pay_amount: Number(form.pay_amount),
      subscription_duration: Number(form.subscription_duration),
      due_payment: Number(form.due_payment) || 0,
      // expiry_date is a generated column on the server — never sent.
    }
    const result = await onSave(payload, isEdit ? member.seat_no : null, isEdit ? member.id : null)
    setBusy(false)
    if (result?.error) setError(result.error)
  }

  const seatChoices = member
    ? [member.seat_no, ...availableSeats.filter((s) => s !== member.seat_no)]
    : availableSeats

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{isEdit ? `Edit member — seat ${member.seat_no}` : 'Add new member'}</h2>

        <div className="form-grid">
          <label>
            Seat
            <select
              value={form.seat_no}
              onChange={(e) => update('seat_no', e.target.value)}
              disabled={isEdit}
            >
              <option value="">Choose a seat…</option>
              {seatChoices
                .slice()
                .sort((a, b) => a - b)
                .map((s) => (
                  <option key={s} value={s}>
                    Seat {String(s).padStart(2, '0')}
                  </option>
                ))}
            </select>
          </label>

          <label>
            First name
            <input
              value={form.first_name}
              onChange={(e) => update('first_name', e.target.value)}
              required
            />
          </label>

          <label>
            Last name
            <input
              value={form.last_name || ''}
              onChange={(e) => update('last_name', e.target.value)}
              required
            />
          </label>

          <label>
            Phone number
            <input
              value={form.phone_number}
              onChange={(e) => update('phone_number', e.target.value)}
              required
            />
          </label>

          <label>
            Admission date
            <input
              type="date"
              value={form.admission_date}
              onChange={(e) => update('admission_date', e.target.value)}
              required
            />
          </label>

          <label>
            Subscription (months)
            <input
              type="number"
              min="1"
              value={form.subscription_duration}
              onChange={(e) => update('subscription_duration', e.target.value)}
              required
            />
          </label>

          <label>
            Pay amount (₹)
            <input
              type="number"
              min="1"
              value={form.pay_amount}
              onChange={(e) => update('pay_amount', e.target.value)}
              required
            />
          </label>

          <label>
            Due payment (₹)
            <input
              type="number"
              min="0"
              value={form.due_payment}
              onChange={(e) => update('due_payment', e.target.value)}
            />
          </label>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" disabled={busy}>
            {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Add member'}
          </button>
        </div>
      </form>
    </div>
  )
}
