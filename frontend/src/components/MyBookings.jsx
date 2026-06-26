import React, { useState, useEffect } from 'react'
import { fetchBookings, cancelBooking } from '../api'

const STATUS = {
  confirmed: { bg: '#DCFCE7', color: '#15803D', border: '#86EFAC', label: 'Confirmed' },
  cancelled: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', label: 'Cancelled' },
}

function Avatar({ photo, name }) {
  const [err, setErr] = useState(false)
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2)
  return err ? (
    <div style={{
      width: 48, height: 48, borderRadius: '50%',
      background: '#F0FDFA', border: '2px solid #5EEAD4',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 16, fontWeight: 700, color: '#0F766E', flexShrink: 0,
    }}>{initials}</div>
  ) : (
    <img
      src={photo}
      alt={name}
      onError={() => setErr(true)}
      style={{
        width: 48, height: 48, borderRadius: '50%',
        objectFit: 'cover', border: '2px solid #5EEAD4', flexShrink: 0,
      }}
    />
  )
}

export default function MyBookings({ refresh }) {
  const [bookings, setBookings]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [cancelling, setCancelling]   = useState(null)

  const load = () => {
    setLoading(true)
    fetchBookings().then(setBookings).finally(() => setLoading(false))
  }
  useEffect(load, [refresh])

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    setCancelling(id)
    await cancelBooking(id)
    load()
    setCancelling(null)
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '64px 0', color: '#94A3B8', fontSize: 14 }}>
      Loading your bookings…
    </div>
  )

  if (bookings.length === 0) return (
    <div style={{ textAlign: 'center', padding: '64px 0' }}>
      <div style={{
        width: 68, height: 68, borderRadius: '50%', background: '#F0FDFA',
        border: '2px solid #CCFBF1',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0F766E" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#334155', marginBottom: 6 }}>No Bookings Yet</h3>
      <p style={{ fontSize: 14, color: '#94A3B8' }}>Your confirmed bookings will appear here.</p>
    </div>
  )

  const confirmed = bookings.filter(b => b.status === 'confirmed').length
  const cancelled = bookings.filter(b => b.status === 'cancelled').length

  return (
    <div>
      {/* Header + stats */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>My Bookings</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>
            {confirmed} Active
          </span>
          {cancelled > 0 && (
            <span style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>
              {cancelled} Cancelled
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {bookings.map(b => {
          const sc = STATUS[b.status] || STATUS.confirmed
          return (
            <div key={b.id} style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: 14,
              padding: '18px 22px',
              boxShadow: '0 1px 4px rgba(0,0,0,.05)',
              borderLeft: `4px solid ${b.status === 'confirmed' ? '#0F766E' : '#DC2626'}`,
            }}>
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Avatar photo={b.cleaner_photo} name={b.cleaner_name} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{b.cleaner_name}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>Booking #{b.id}</div>
                </div>
                <span style={{
                  background: sc.bg, color: sc.color,
                  border: `1px solid ${sc.border}`,
                  borderRadius: 7, padding: '4px 12px',
                  fontSize: 12, fontWeight: 700, letterSpacing: 0.2,
                }}>{sc.label}</span>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: '#F1F5F9', marginBottom: 14 }} />

              {/* Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                {[
                  ['Date',     b.date],
                  ['Time',     `${b.start_display} – ${b.end_display}`],
                  ['Duration', `${b.duration} hr${b.duration !== 1 ? 's' : ''}`],
                  ['Total',    `₹${b.total_price}`],
                  ['Customer', b.customer_name],
                  ['Address',  b.address],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, marginBottom: 3, letterSpacing: 0.5, textTransform: 'uppercase' }}>{k}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: k === 'Total' ? '#0F766E' : '#0F172A' }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Cancel */}
              {b.status === 'confirmed' && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleCancel(b.id)}
                    disabled={cancelling === b.id}
                    style={{
                      padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                      border: '1.5px solid #FECACA', background: '#FFF5F5', color: '#DC2626',
                      cursor: 'pointer', opacity: cancelling === b.id ? .5 : 1,
                    }}
                  >{cancelling === b.id ? 'Cancelling…' : 'Cancel Booking'}</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
