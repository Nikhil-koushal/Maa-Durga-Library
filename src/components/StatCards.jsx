export default function StatCards({ stats }) {
  const items = [
    { label: 'Total seats', value: stats.totalSeats },
    { label: 'Occupied', value: stats.occupied },
    { label: 'Available', value: stats.available },
    { label: 'Expiring soon', value: stats.expiringSoon, tone: 'amber' },
    { label: 'Expired', value: stats.expired, tone: 'red' },
    { label: 'Payment due', value: stats.paymentDueCount, tone: 'red' },
  ]
  return (
    <div className="stat-cards">
      {items.map((item) => (
        <div key={item.label} className={`stat-card ${item.tone || ''}`}>
          <span className="stat-value">{item.value}</span>
          <span className="stat-label">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
