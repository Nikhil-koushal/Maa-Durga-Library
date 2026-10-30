
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  formatDate,
  formatSeat,
  getMemberStatus,
  statusColor
} from '../utils/library'

export default function MemberTable({ members, onEdit, onDelete }) {
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoTitle, setPhotoTitle] = useState('')
  const [loadingKey, setLoadingKey] = useState('')
  const [photoError, setPhotoError] = useState('')

  const viewPhoto = async (storagePath, title, key) => {
    if (!storagePath) return

    setLoadingKey(key)
    setPhotoError('')
    setPhotoUrl('')
    setPhotoTitle(title)

    try {
      const { data, error } = await supabase.storage
        .from('student-documents')
        .createSignedUrl(storagePath, 300)

      if (error) throw error

      setPhotoUrl(data.signedUrl)
    } catch (error) {
      console.error('Photo loading error:', error)
      setPhotoError(error.message || 'Unable to load photo.')
    } finally {
      setLoadingKey('')
    }
  }

  const closePhoto = () => {
    setPhotoUrl('')
    setPhotoTitle('')
    setPhotoError('')
  }

  if (members.length === 0) {
    return <p className="empty-state">No members match your search.</p>
  }

  return (
    <>
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
              <th>Photos</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {members.map((m) => {
              const status = getMemberStatus(m)

              return (
                <tr key={m.id}>
                  <td>{formatSeat(m.seat_no)}</td>

                  <td>
                    {m.first_name} {m.last_name}
                  </td>

                  <td>{m.phone_number}</td>

                  <td>{formatDate(m.admission_date)}</td>

                  <td>{formatDate(m.expiry_date)}</td>

                  <td>
                    <span
                      className="badge"
                      style={{
                        '--badge-color': statusColor(status.code)
                      }}
                    >
                      {status.code === 'EXPIRED'
                        ? `Expired (${status.overdueDays}d overdue)`
                        : status.label}
                    </span>
                  </td>

                  <td className={m.due_payment > 0 ? 'due-amount' : ''}>
                    {m.due_payment > 0 ? m.due_payment : '—'}
                  </td>

                  <td className="row-actions">
                    {m.profile_photo && (
                      <button
                        className="link-btn"
                        disabled={loadingKey === `${m.id}-profile`}
                        onClick={() =>
                          viewPhoto(
                            m.profile_photo,
                            'Profile Photo',
                            `${m.id}-profile`
                          )
                        }
                      >
                        {loadingKey === `${m.id}-profile`
                          ? 'Loading...'
                          : 'Profile'}
                      </button>
                    )}

                    {m.aadhaar_photo && (
                      <button
                        className="link-btn"
                        disabled={loadingKey === `${m.id}-aadhaar`}
                        onClick={() =>
                          viewPhoto(
                            m.aadhaar_photo,
                            'Aadhaar Photo',
                            `${m.id}-aadhaar`
                          )
                        }
                      >
                        {loadingKey === `${m.id}-aadhaar`
                          ? 'Loading...'
                          : 'Aadhaar'}
                      </button>
                    )}

                    {!m.profile_photo && !m.aadhaar_photo && '—'}
                  </td>

                  <td className="row-actions">
                    <button
                      className="link-btn"
                      onClick={() => onEdit(m)}
                    >
                      Edit
                    </button>

                    <button
                      className="link-btn danger"
                      onClick={() => onDelete(m)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Photo Viewer Modal */}
      {(photoUrl || photoError) && (
        <div
          onClick={closePhoto}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--card-bg, #ffffff)',
              color: 'var(--text-color, #111827)',
              borderRadius: '12px',
              padding: '20px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}
            >
              <h3>{photoTitle}</h3>

              <button
                className="link-btn danger"
                onClick={closePhoto}
              >
                Close ✕
              </button>
            </div>

            {photoError ? (
              <p style={{ color: 'red' }}>{photoError}</p>
            ) : (
              <img
                src={photoUrl}
                alt={photoTitle}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}
