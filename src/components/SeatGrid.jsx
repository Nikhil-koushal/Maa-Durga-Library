
import { TOTAL_SEATS, formatSeat, getMemberStatus, statusColor } from '../utils/library'


/**
 * Renders seats 1–89. A seat is "free" when it has no row in
 * library_management at all (matches the public.remaining_seats view).
 * An occupied seat is further tinted by the occupant's derived status so an
 * expired-but-not-yet-checked-out seat is visually distinguishable from a
 * genuinely active one, even though both still "occupy" the seat.
 */
export default function SeatGrid({ members, onSeatClick }) {
  const bySeat = new Map(members.map((m) => [m.seat_no, m]))

  return (
    <div className="seat-grid">
      {Array.from({ length: TOTAL_SEATS }, (_, i) => i + 1).map((seatNo) => {
        const member = bySeat.get(seatNo)
        const status = member ? getMemberStatus(member) : null
       const color = !member
  ? '#16a34a'
  : status.code === 'EXPIRING_SOON'
    ? statusColor(status.code)
    : status.code === 'EXPIRED'
      ? statusColor(status.code)
      : '#374151'
        return (
          <button
            key={seatNo}
            type="button"
            className="seat"
            style={{ '--seat-color': color }}
            onClick={() => onSeatClick(seatNo, member)}
            title={
              member
                ? `${member.first_name} ${member.last_name} — ${status.label}`
                : 'Available — click to add a member'
            }
            aria-label={member ? `Seat ${seatNo}, booked by ${member.first_name} ${member.last_name}` : `Seat ${seatNo}, available`}
          >
            {formatSeat(seatNo)}
          </button>
        )
      })}
    </div>
  )
}
