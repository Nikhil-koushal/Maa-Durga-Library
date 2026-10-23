import { useEffect, useMemo, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import SeatGrid from './SeatGrid'
import MemberTable from './MemberTable'
import MemberFormModal from './MemberFormModal'
import StatCards from './StatCards'
import { TOTAL_SEATS, getMemberStatus } from '../utils/library'

const TABS = [
  { key: 'all', label: 'All members' },
  { key: 'seats', label: 'Seat availability' },
  { key: 'expiring', label: 'Expiring soon' },
  { key: 'expired', label: 'Expired' },
  { key: 'due', label: 'Payment due' },
]

export default function Dashboard() {
  const { signOut } = useAuth()
  const [members, setMembers] = useState([])
  const [remainingSeats, setRemainingSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [modalState, setModalState] = useState(null) // null | { mode: 'add' } | { mode: 'edit', member }

  const loadData = useCallback(async () => {
    setLoading(true)
    setErrorMsg('')
    const [membersRes, seatsRes] = await Promise.all([
      supabase.from('library_management').select('*').order('seat_no'),
      supabase.from('remaining_seats').select('seat_no'),
    ])
    if (membersRes.error) setErrorMsg(membersRes.error.message)
    else setMembers(membersRes.data)
    if (seatsRes.error) setErrorMsg((current) => current ? `${current} | Remaining seats: ${seatsRes.error.message}` : `Remaining seats: ${seatsRes.error.message}`)
    else setRemainingSeats(seatsRes.data.map((r) => r.seat_no))
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = members
    if (q) {
      list = list.filter((m) => {
        const haystack = `${m.first_name} ${m.last_name} ${m.phone_number} ${m.seat_no}`.toLowerCase()
        return haystack.includes(q)
      })
    }
    if (tab === 'expiring') {
      list = list.filter((m) => getMemberStatus(m).code === 'EXPIRING_SOON')
    } else if (tab === 'expired') {
      list = list.filter((m) => getMemberStatus(m).code === 'EXPIRED')
    } else if (tab === 'due') {
      list = list.filter((m) => m.due_payment > 0)
    }
    return list
  }, [members, search, tab])

  const stats = useMemo(() => {
    let expiringSoon = 0
    let expired = 0
    let paymentDueCount = 0
    for (const m of members) {
      const status = getMemberStatus(m)
      if (status.code === 'EXPIRING_SOON') expiringSoon++
      if (status.code === 'EXPIRED') expired++
      if (m.due_payment > 0) paymentDueCount++
    }
    return {
      totalSeats: TOTAL_SEATS,
      occupied: members.filter((m) => m.seat_no != null).length,
      available: remainingSeats.length,
      expiringSoon,
      expired,
      paymentDueCount,
    }
  }, [members, remainingSeats])


async function handleSave(payload, previousSeatNo, memberId) {
  let result

  if (memberId != null) {
    result = await supabase
      .from('library_management')
      .update(payload)
      .eq('id', memberId)
  } else {
    result = await supabase
      .from('library_management')
      .insert(payload)
  }

  if (result.error) return { error: result.error.message }

  setModalState(null)
  await loadData()
  return {}
}

async function handleDelete(member) {
  const ok = window.confirm(
    `Remove ${member.first_name} ${member.last_name}${member.seat_no != null ? ` from seat ${member.seat_no}` : ''}? This cannot be undone.`
  )

  if (!ok) return

  const { error } = await supabase
    .from('library_management')
    .delete()
    .eq('id', member.id)

  if (error) {
    setErrorMsg(error.message)
    return
  }

  await loadData()
}


  function handleSeatClick(seatNo, member) {
    if (member) {
      setModalState({ mode: 'edit', member })
    } else {
      setModalState({ mode: 'add', seatNo })
    }
  }

  return (
    <div className="dashboard">
      <header className="topbar">
        <h1>Maa Durga Library</h1>
        <button className="secondary" onClick={signOut}>
          Sign out
        </button>
      </header>

      <StatCards stats={stats} />

      {errorMsg && <p className="error-text">{errorMsg}</p>}

      <div className="toolbar">
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="toolbar-actions">
          {tab !== 'seats' && (
            <input
              className="search-input"
              placeholder="Search name, phone or seat…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
          <button onClick={() => setModalState({ mode: 'add' })}>+ Add member</button>
        </div>
      </div>

      {loading ? (
        <p className="empty-state">Loading…</p>
      ) : tab === 'seats' ? (
        <SeatGrid members={members} onSeatClick={handleSeatClick} />
      ) : (
        <MemberTable
          members={filteredMembers}
          onEdit={(m) => setModalState({ mode: 'edit', member: m })}
          onDelete={handleDelete}
        />
      )}

      {modalState && (
        <MemberFormModal
          member={modalState.mode === 'edit' ? modalState.member : null}
          initialSeatNo={modalState.mode === 'add' ? modalState.seatNo : undefined}
          availableSeats={
            modalState.mode === 'add' && modalState.seatNo
              ? [modalState.seatNo]
              : remainingSeats
          }
          onSave={handleSave}
          onCancel={() => setModalState(null)}
        />
      )}
    </div>
  )
}
