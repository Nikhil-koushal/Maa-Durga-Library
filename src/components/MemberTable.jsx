import { formatDate, formatSeat, getMemberStatus, statusColor } from '../utils/library'

export default function MemberTable({ members, onEdit, onDelete }) {
  if (members.length === 0) {
    return <p className="empty-state">No members match your search.</p>
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Seat</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Admitted</th>
            <th>Expires</th>
            <th>Status</th>
            <th>Due (₹)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => {
            const status = getMemberStatus(m)
            return (
              <tr key={m.seat_no}>
                <td>{formatSeat(m.seat_no)}</td>
                <td>
                  {m.first_name} {m.last_name}
                </td>
                <td>{m.phone_number}</td>
                <td>{formatDate(m.admission_date)}</td>
                <td>{formatDate(m.expiry_date)}</td>
                <td>
                  <span className="badge" style={{ '--badge-color': statusColor(status.code) }}>
                    {status.code === 'EXPIRED'
                      ? `Expired (${status.overdueDays}d overdue)`
                      : status.label}
                  </span>
                </td>
                <td className={m.due_payment > 0 ? 'due-amount' : ''}>
                  {m.due_payment > 0 ? m.due_payment : '—'}
                </td>
                <td className="row-actions">
                  <button className="link-btn" onClick={() => onEdit(m)}>
                    Edit
                  </button>
                  <button className="link-btn danger" onClick={() => onDelete(m)}>
                    Delete
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
