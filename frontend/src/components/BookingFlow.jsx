import React, { useState, useEffect } from 'react'
import CleanerCard from './CleanerCard'
import { fetchCleaners, fetchSlots, fetchSuggestions, createBooking } from '../api'

const DURATIONS = [
  { value: 1.0, label: '1 Hour',    desc: 'Quick clean' },
  { value: 1.5, label: '1.5 Hours', desc: 'Standard' },
  { value: 2.0, label: '2 Hours',   desc: 'Deep clean' },
  { value: 3.0, label: '3 Hours',   desc: 'Full home' },
]

const today = () => new Date().toISOString().split('T')[0]

// If current hour is >= 17 (5 PM), last slot (6 PM end) can't start — use tomorrow as min date
const minBookingDate = () => {
  const now = new Date()
  // Last possible slot starts at 5 PM (17:00) for a 1-hr session ending at 6 PM
  // Add 30-min buffer → if it's past 16:30, no slots left today
  if (now.getHours() > 16 || (now.getHours() === 16 && now.getMinutes() >= 30)) {
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }
  return today()
}

/* ─── phone validation: 10-digit Indian number (with optional +91/0 prefix) */
const phoneRegex = /^(\+91[\-\s]?|0)?[6-9]\d{9}$/

/* ─── Shared styles ──────────────────────────────────────────────────────── */
const inputBase = {
  width: '100%', padding: '11px 14px', borderRadius: 9,
  border: '1.5px solid #CBD5E1', fontSize: 15, color: '#0F172A',
  background: '#FFFFFF', outline: 'none', transition: 'border-color .15s',
}
const inputError = { ...inputBase, border: '1.5px solid #EF4444', background: '#FFF8F8' }

const primaryBtn = (disabled) => ({
  padding: '11px 28px', borderRadius: 9, fontWeight: 700, fontSize: 14,
  border: 'none',
  background: disabled ? '#99F6E4' : 'linear-gradient(135deg, #0F766E 0%, #0D9488 100%)',
  color: disabled ? '#5EEAD4' : '#FFFFFF',
  cursor: disabled ? 'not-allowed' : 'pointer',
  letterSpacing: 0.2,
  boxShadow: disabled ? 'none' : '0 2px 8px rgba(15,118,110,.3)',
  transition: 'all .15s',
})
const ghostBtn = {
  padding: '11px 26px', borderRadius: 9, fontWeight: 500, fontSize: 14,
  border: '1.5px solid #E2E8F0', background: '#FFFFFF', color: '#475569', cursor: 'pointer',
}

const STEPS = ['Choose Pro', 'Date & Duration', 'Select Slot', 'Your Details']

/* ─── Reusable components ────────────────────────────────────────────────── */
function StepBar({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
      {STEPS.map((label, i) => {
        const n = i + 1
        const done = current > n, active = current === n
        return (
          <React.Fragment key={n}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: done ? '#15803D' : active ? '#0F766E' : '#F1F5F9',
                border: `2px solid ${done ? '#15803D' : active ? '#0F766E' : '#CBD5E1'}`,
                color: done || active ? '#fff' : '#94A3B8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13, marginBottom: 5, transition: 'all .2s',
              }}>{done ? '✓' : n}</div>
              <span style={{
                fontSize: 11, fontWeight: active ? 600 : 400,
                color: active ? '#0F766E' : done ? '#15803D' : '#94A3B8', textAlign: 'center',
              }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ height: 2, flex: 2, background: done ? '#15803D' : '#E2E8F0', marginBottom: 20, transition: 'background .3s' }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

function SectionHead({ title, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>{title}</h2>
      <p style={{ fontSize: 14, color: '#64748B' }}>{sub}</p>
    </div>
  )
}

function FieldError({ msg }) {
  if (!msg) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, color: '#DC2626', fontSize: 12, fontWeight: 500 }}>
      <span>⚠</span> {msg}
    </div>
  )
}

function AlertBox({ type, children }) {
  const styles = {
    error:   { bg: '#FEF2F2', border: '#FECACA', color: '#DC2626', icon: '✕' },
    warning: { bg: '#FFFBEB', border: '#FDE68A', color: '#D97706', icon: '⚠' },
    info:    { bg: '#F0FDFA', border: '#5EEAD4', color: '#0F766E', icon: 'ℹ' },
  }
  const s = styles[type] || styles.info
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10,
      padding: '12px 16px', marginBottom: 18,
      display: 'flex', gap: 10, alignItems: 'flex-start',
    }}>
      <span style={{ color: s.color, fontWeight: 700, flexShrink: 0 }}>{s.icon}</span>
      <div style={{ color: s.color, fontSize: 14 }}>{children}</div>
    </div>
  )
}

/* ─── Suggestion card strip ──────────────────────────────────────────────── */
function SuggestionStrip({ suggestions, onPick }) {
  if (!suggestions || suggestions.length === 0) return null
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
        Available professionals for your selected date & duration:
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {suggestions.map(s => (
          <div
            key={s.id}
            onClick={() => onPick(s)}
            style={{
              background: '#F8FAFC', border: '1.5px solid #E2E8F0',
              borderRadius: 10, padding: '12px 16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12,
              transition: 'border-color .15s, box-shadow .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#0F766E'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,118,110,.10)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <img
              src={s.photo}
              alt={s.name}
              onError={e => { e.target.style.display='none' }}
              style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '2px solid #5EEAD4', flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{s.name}</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 1 }}>
                ★ {s.rating} · {s.experience} · ₹{s.price_per_hour}/hr
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{
                background: '#DCFCE7', color: '#16A34A', border: '1px solid #BBF7D0',
                borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 600, marginBottom: 4,
              }}>
                {s.available_slots} slot{s.available_slots !== 1 ? 's' : ''} free
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>First: {s.next_slot}</div>
            </div>
            <div style={{ color: '#2563EB', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>→</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function BookingFlow({ onBooked }) {
  const [step, setStep]             = useState(1)
  const [cleaners, setCleaners]     = useState([])
  const [selected, setSelected]     = useState(null)
  const [date, setDate]             = useState(minBookingDate())
  const [duration, setDuration]     = useState(1.0)
  const [slots, setSlots]           = useState([])
  const [slotsLoading, setLoading]  = useState(false)
  const [chosenSlot, setSlot]       = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [form, setForm]             = useState({ customer_name: '', phone: '', address: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed]   = useState(null)
  const [globalError, setGlobalError] = useState('')

  useEffect(() => { fetchCleaners().then(setCleaners) }, [])

  useEffect(() => {
    if (!selected || !date || !duration) return
    setLoading(true)
    setSlot(null)
    setSuggestions([])
    fetchSlots(selected.id, date, duration)
      .then(async d => {
        const s = d.slots || []
        setSlots(s)
        if (s.length === 0) {
          const alts = await fetchSuggestions(date, duration, selected.id)
          setSuggestions(alts)
        }
      })
      .finally(() => setLoading(false))
  }, [selected, date, duration])

  const totalPrice = selected ? selected.price_per_hour * duration : 0
  const durationLabel = DURATIONS.find(d => d.value === duration)?.label ?? ''

  /* ── Switch to a suggested cleaner ── */
  const pickSuggestion = (alt) => {
    const full = cleaners.find(c => c.id === alt.id) || { ...alt, specialties: [] }
    setSelected(full)
    setSlot(null)
    setSuggestions([])
  }

  /* ── Step 2 validation ── */
  const validateStep2 = () => {
    if (!date) return 'Please select a service date.'
    if (date < minBookingDate()) return 'No slots available for this date. Please select a future date.'
    return ''
  }

  /* ── Step 4 form validation ── */
  const validateForm = () => {
    const errs = {}
    if (!form.customer_name.trim()) {
      errs.customer_name = 'Full name is required.'
    } else if (form.customer_name.trim().length < 2) {
      errs.customer_name = 'Name must be at least 2 characters.'
    }
    if (!form.phone.trim()) {
      errs.phone = 'Phone number is required.'
    } else if (!phoneRegex.test(form.phone.replace(/\s/g, ''))) {
      errs.phone = 'Enter a valid 10-digit Indian mobile number.'
    }
    if (!form.address.trim()) {
      errs.address = 'Service address is required.'
    } else if (form.address.trim().length < 10) {
      errs.address = 'Please enter a complete address (at least 10 characters).'
    }
    return errs
  }

  const handleSubmit = async () => {
    const errs = validateForm()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setFieldErrors({})
    setGlobalError('')
    setSubmitting(true)
    try {
      const booking = await createBooking({
        cleaner_id: selected.id,
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        date,
        start_time: chosenSlot.start,
        duration,
      })
      setConfirmed(booking)
      setStep(5)
      onBooked()
    } catch (e) {
      setGlobalError(e.message)
      if (e.message.toLowerCase().includes('no longer available')) {
        const alts = await fetchSuggestions(date, duration, selected.id)
        setSuggestions(alts)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setStep(1); setSelected(null); setDate(minBookingDate()); setDuration(1.0)
    setSlots([]); setSlot(null); setSuggestions([])
    setForm({ customer_name: '', phone: '', address: '' })
    setFieldErrors({}); setConfirmed(null); setGlobalError('')
  }

  /* ── Step 1 ─────────────────────────────────────────────────────────────── */
  if (step === 1) return (
    <div>
      <StepBar current={1} />
      <SectionHead title="Choose a Cleaning Professional" sub="Select a verified professional for your home" />
      {cleaners.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8', fontSize: 14 }}>
          Loading professionals…
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        {cleaners.map(c => (
          <CleanerCard key={c.id} cleaner={c} selected={selected?.id === c.id} onSelect={setSelected} />
        ))}
      </div>
      {!selected && (
        <AlertBox type="info">Please select a professional to continue.</AlertBox>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button style={primaryBtn(!selected)} disabled={!selected} onClick={() => setStep(2)}>
          Continue →
        </button>
      </div>
    </div>
  )

  /* ── Step 2 ─────────────────────────────────────────────────────────────── */
  if (step === 2) {
    const dateErr = date < minBookingDate() ? 'No slots available for this date. Please select a future date.' : ''
    return (
      <div>
        <StepBar current={2} />
        <SectionHead title="Pick Date & Duration" sub="Choose when you need the service" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>
              Service Date
            </label>
            <input
              type="date"
              value={date}
              min={minBookingDate()}
              onChange={e => setDate(e.target.value)}
              style={dateErr ? inputError : inputBase}
            />
            <FieldError msg={dateErr} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>
              Duration
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {DURATIONS.map(d => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  style={{
                    padding: '10px 8px', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                    border: `1.5px solid ${duration === d.value ? '#0F766E' : '#E2E8F0'}`,
                    background: duration === d.value ? '#F0FDFA' : '#FFFFFF', transition: 'all .15s',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: duration === d.value ? '#0F766E' : '#0F172A' }}>
                    {d.label}
                  </div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{d.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{
          background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10,
          padding: '14px 18px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 28,
        }}>
          <div>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 2 }}>Estimated Total</div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>
              ₹{selected?.price_per_hour}/hr × {duration} hr{duration > 1 ? 's' : ''}
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#0F766E' }}>₹{totalPrice}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button style={ghostBtn} onClick={() => setStep(1)}>← Back</button>
          <button
            style={primaryBtn(!!dateErr)}
            disabled={!!dateErr}
            onClick={() => { const e = validateStep2(); if (!e) setStep(3) }}
          >Continue →</button>
        </div>
      </div>
    )
  }

  /* ── Step 3 ─────────────────────────────────────────────────────────────── */
  if (step === 3) return (
    <div>
      <StepBar current={3} />
      <SectionHead
        title="Select a Time Slot"
        sub={`Available for ${selected.name} on ${date} · ${durationLabel}`}
      />
      {slotsLoading ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 10, padding: '48px 0', color: '#94A3B8', fontSize: 14,
        }}>
          <div style={{
            width: 18, height: 18, border: '2px solid #BFDBFE', borderTopColor: '#2563EB',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          }} />
          Checking availability…
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : slots.length === 0 ? (
        <div>
          <AlertBox type="warning">
            <strong>{selected.name}</strong> has no available slots on <strong>{date}</strong> for{' '}
            <strong>{durationLabel}</strong>.
          </AlertBox>
          <SuggestionStrip
            suggestions={suggestions}
            onPick={(alt) => { pickSuggestion(alt); setStep(2) }}
          />
          {suggestions.length === 0 && (
            <AlertBox type="info">
              No professionals are available for the selected date and duration. Please try a different date.
            </AlertBox>
          )}
        </div>
      ) : (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 14, fontSize: 13, color: '#64748B',
          }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#2563EB', display: 'inline-block' }} />
            Selected slot
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#FFFFFF', border: '1.5px solid #E2E8F0', display: 'inline-block', marginLeft: 8 }} />
            Available
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 10, marginBottom: 28,
          }}>
            {slots.map(s => {
              const active = chosenSlot?.start === s.start
              return (
                <button
                  key={s.start}
                  onClick={() => setSlot(s)}
                  style={{
                    padding: '12px 8px', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                    border: `1.5px solid ${active ? '#0F766E' : '#E2E8F0'}`,
                    background: active ? '#0F766E' : '#FFFFFF', transition: 'all .15s',
                    boxShadow: active ? '0 0 0 3px rgba(15,118,110,.14)' : 'none',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: active ? '#FFFFFF' : '#0F172A' }}>
                    {s.start_display}
                  </div>
                  <div style={{ fontSize: 11, color: active ? '#99F6E4' : '#94A3B8', marginTop: 2 }}>
                    to {s.end_display}
                  </div>
                </button>
              )
            })}
          </div>
          {!chosenSlot && (
            <AlertBox type="info">Please select a time slot to continue.</AlertBox>
          )}
        </>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button style={ghostBtn} onClick={() => setStep(2)}>← Back</button>
        <button
          style={primaryBtn(!chosenSlot || slots.length === 0)}
          disabled={!chosenSlot || slots.length === 0}
          onClick={() => setStep(4)}
        >Continue →</button>
      </div>
    </div>
  )

  /* ── Step 4 ─────────────────────────────────────────────────────────────── */
  if (step === 4) return (
    <div>
      <StepBar current={4} />
      <SectionHead title="Your Details" sub="Fill in your contact info to confirm the booking" />

      {/* Booking summary card */}
      <div style={{
        background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10,
        padding: '16px 20px', marginBottom: 24,
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
      }}>
        {[
          ['PROFESSIONAL', `${selected.emoji} ${selected.name}`],
          ['DATE', date],
          ['TIME', `${chosenSlot?.start_display} – ${chosenSlot?.end_display}`],
          ['TOTAL', `₹${totalPrice}`],
        ].map(([k, v]) => (
          <div key={k}>
            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, marginBottom: 2, letterSpacing: 0.4 }}>{k}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: k === 'TOTAL' ? '#0F766E' : '#0F172A' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Form fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 }}>
        {[
          { key: 'customer_name', label: 'Full Name',       type: 'text', placeholder: 'Enter your full name' },
          { key: 'phone',         label: 'Phone Number',    type: 'tel',  placeholder: '+91 98765 43210' },
          { key: 'address',       label: 'Service Address', type: 'text', placeholder: 'Flat No, Building, Street, City' },
        ].map(f => (
          <div key={f.key}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>
              {f.label} <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type={f.type}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={e => {
                setForm(p => ({ ...p, [f.key]: e.target.value }))
                if (fieldErrors[f.key]) setFieldErrors(p => ({ ...p, [f.key]: '' }))
              }}
              style={fieldErrors[f.key] ? inputError : inputBase}
            />
            <FieldError msg={fieldErrors[f.key]} />
          </div>
        ))}
      </div>

      {globalError && (
        <div style={{ marginBottom: 16 }}>
          <AlertBox type="error">{globalError}</AlertBox>
          <SuggestionStrip
            suggestions={suggestions}
            onPick={(alt) => { pickSuggestion(alt); setStep(2) }}
          />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button style={ghostBtn} onClick={() => setStep(3)}>← Back</button>
        <button style={primaryBtn(submitting)} disabled={submitting} onClick={handleSubmit}>
          {submitting ? 'Confirming…' : '✓ Confirm Booking'}
        </button>
      </div>
    </div>
  )

  /* ── Step 5 – Confirmed ──────────────────────────────────────────────────── */
  if (step === 5 && confirmed) return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%', background: '#DCFCE7',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36, margin: '0 auto 16px',
      }}>✅</div>
      <h2 style={{ color: '#16A34A', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
        Booking Confirmed!
      </h2>
      <p style={{ color: '#64748B', fontSize: 15, marginBottom: 28 }}>
        Your cleaning professional has been successfully booked.
      </p>
      <div style={{
        background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12,
        padding: '20px 24px', maxWidth: 380, margin: '0 auto 28px', textAlign: 'left',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #E2E8F0',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>Booking Receipt</span>
          <span style={{
            background: '#DCFCE7', color: '#16A34A', fontSize: 11, fontWeight: 700,
            borderRadius: 6, padding: '3px 10px', letterSpacing: 0.3,
          }}>#{confirmed.id}</span>
        </div>
        {[
          ['Professional', confirmed.cleaner_name],
          ['Date',         confirmed.date],
          ['Time',         `${confirmed.start_display} – ${confirmed.end_display}`],
          ['Duration',     `${confirmed.duration} hr${confirmed.duration > 1 ? 's' : ''}`],
          ['Phone',        confirmed.phone],
          ['Address',      confirmed.address],
          ['Amount Paid',  `₹${confirmed.total_price}`],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, gap: 12 }}>
            <span style={{ color: '#64748B', flexShrink: 0 }}>{k}</span>
            <span style={{ fontWeight: 600, color: k === 'Amount Paid' ? '#0F766E' : '#0F172A', textAlign: 'right' }}>{v}</span>
          </div>
        ))}
      </div>
      <button style={primaryBtn(false)} onClick={reset}>Book Another Service</button>
    </div>
  )

  return null
}
