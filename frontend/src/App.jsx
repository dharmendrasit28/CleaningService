import React, { useState } from 'react'
import BookingFlow from './components/BookingFlow'
import MyBookings from './components/MyBookings'
import ServiceSection from './components/ServiceSection'

const navBtn = (active) => ({
  padding: '8px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14,
  border: active ? '1.5px solid #5EEAD4' : '1.5px solid transparent',
  background: active ? '#F0FDFA' : 'transparent',
  color: active ? '#0F766E' : '#475569',
  cursor: 'pointer', transition: 'all .15s', letterSpacing: 0.1,
})

export default function App() {
  const [tab, setTab]           = useState('home')
  const [bookingsKey, setBookingsKey] = useState(0)

  const goBook = () => setTab('book')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <header style={{
        background: '#FFFFFF', borderBottom: '1px solid #E2E8F0',
        padding: '0 32px', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 4px rgba(0,0,0,.06)',
      }}>
        <div style={{ maxWidth: 980, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 66 }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer' }} onClick={() => setTab('home')}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(15,118,110,.35)',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 22l4-4m0 0l9-9m-9 9l9-9m0 0l2-2a2 2 0 0 1 2.83 2.83l-2 2m-9-9L9 7l2-2"/>
                <circle cx="18" cy="6" r="2"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20, color: '#0F172A', letterSpacing: '-.5px', lineHeight: 1.1 }}>Gleam</div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 400 }}>Home Cleaning Services</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', gap: 4 }}>
            {[
              { key: 'home',     label: '🏠 Home' },
              { key: 'book',     label: '+ Book Service' },
              { key: 'bookings', label: 'My Bookings' },
            ].map(n => (
              <button key={n.key} style={navBtn(tab === n.key)} onClick={() => setTab(n.key)}>
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      {(tab === 'home' || tab === 'book') && (
        <div style={{
          background: 'linear-gradient(135deg, #0D5C56 0%, #0F766E 50%, #0D9488 100%)',
          padding: tab === 'home' ? '52px 24px 72px' : '40px 24px 60px',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position:'absolute', top:-60, right:-60, width:220, height:220, borderRadius:'50%', background:'rgba(255,255,255,.04)' }} />
          <div style={{ position:'absolute', bottom:-80, left:-40, width:260, height:260, borderRadius:'50%', background:'rgba(255,255,255,.04)' }} />

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.22)',
            borderRadius: 20, padding: '5px 16px', fontSize: 12, color: '#99F6E4',
            fontWeight: 600, marginBottom: 16, letterSpacing: .4,
          }}>✦ Trusted · Verified · Insured</div>

          <h1 style={{ color: '#FFFFFF', fontSize: 34, fontWeight: 800, marginBottom: 10, letterSpacing: '-.6px' }}>
            Spotless Homes, Happy Families
          </h1>
          <p style={{ color: '#99F6E4', fontSize: 16, maxWidth: 460, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Professional Indian cleaning experts at your doorstep — available 9 AM to 6 PM at just ₹150/hr.
          </p>

          {tab === 'home' && (
            <>
              <button
                onClick={goBook}
                style={{
                  padding: '13px 36px', borderRadius: 10, fontWeight: 800, fontSize: 16,
                  background: '#FFFFFF', color: '#0F766E', border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0,0,0,.2)', letterSpacing: 0.2, marginBottom: 32,
                }}
              >Book a Cleaner →</button>

              {/* Stats */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
                {[['5,000+','Happy Customers'],['100%','Verified Pros'],['4.8★','Avg Rating'],['₹150','Per Hour']].map(([v, l]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF' }}>{v}</div>
                    <div style={{ fontSize: 12, color: '#5EEAD4', marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Main content ────────────────────────────────────── */}
      <main style={{ maxWidth: 980, margin: (tab === 'home' || tab === 'book') ? '-28px auto 52px' : '36px auto 52px', padding: '0 20px' }}>

        {tab === 'home' && (
          <>
            {/* Services section */}
            <div style={{
              background: '#FFFFFF', borderRadius: 18,
              boxShadow: '0 4px 32px rgba(0,0,0,.09)',
              padding: '32px 36px', marginBottom: 20,
              border: '1px solid #F1F5F9',
            }}>
              <ServiceSection onBookNow={goBook} />
            </div>

            {/* Why Gleam */}
            <div style={{
              background: '#FFFFFF', borderRadius: 18,
              boxShadow: '0 4px 32px rgba(0,0,0,.09)',
              padding: '32px 36px', border: '1px solid #F1F5F9',
            }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 20, letterSpacing: '-.3px' }}>
                Why Choose Gleam?
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {[
                  { icon: '🛡️', title: 'Background Verified', desc: 'Every professional is police-verified and ID-checked before onboarding.' },
                  { icon: '⏰', title: 'On-Time Guarantee', desc: 'Our pros arrive within the booked slot — or we reschedule free of cost.' },
                  { icon: '💰', title: 'Transparent Pricing', desc: 'Flat ₹150/hr with no hidden charges. Pay only for the time used.' },
                  { icon: '⭐', title: '4.8★ Rated Service', desc: 'Consistently top-rated by thousands of happy customers across India.' },
                ].map(w => (
                  <div key={w.title} style={{
                    background: '#F8FAFC', border: '1px solid #E2E8F0',
                    borderRadius: 12, padding: '18px 16px',
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>{w.icon}</div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 5 }}>{w.title}</h3>
                    <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>{w.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'book' && (
          <div style={{
            background: '#FFFFFF', borderRadius: 18,
            boxShadow: '0 4px 32px rgba(0,0,0,.09)',
            padding: '36px 40px', border: '1px solid #F1F5F9',
          }}>
            <BookingFlow onBooked={() => { setBookingsKey(k => k + 1) }} />
          </div>
        )}

        {tab === 'bookings' && (
          <div style={{
            background: '#FFFFFF', borderRadius: 18,
            boxShadow: '0 4px 32px rgba(0,0,0,.09)',
            padding: '36px 40px', border: '1px solid #F1F5F9',
          }}>
            <MyBookings refresh={bookingsKey} />
          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer style={{
        textAlign: 'center', padding: '22px 24px',
        color: '#64748B', fontSize: 13,
        borderTop: '1px solid #E2E8F0', background: '#FFFFFF',
      }}>
        © 2026 Gleam Home Services · All bookings subject to professional availability · 9 AM – 6 PM Daily
      </footer>
    </div>
  )
}
