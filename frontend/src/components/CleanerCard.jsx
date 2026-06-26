import React, { useState } from 'react'

export default function CleanerCard({ cleaner, selected, onSelect }) {
  const [imgError, setImgError] = useState(false)

  const initials = cleaner.name.split(' ').map(w => w[0]).join('').slice(0, 2)

  return (
    <div
      onClick={() => onSelect(cleaner)}
      style={{
        background: selected ? '#F0FDFA' : '#FFFFFF',
        border: `2px solid ${selected ? '#0F766E' : '#E2E8F0'}`,
        borderRadius: 14,
        padding: '20px 14px 16px',
        cursor: 'pointer',
        transition: 'all .18s ease',
        boxShadow: selected
          ? '0 0 0 4px rgba(15,118,110,.12), 0 4px 16px rgba(0,0,0,.08)'
          : '0 1px 4px rgba(0,0,0,.06)',
        position: 'relative',
        textAlign: 'center',
      }}
    >
      {/* Selected badge */}
      {selected && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          width: 24, height: 24, borderRadius: '50%',
          background: '#0F766E', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, boxShadow: '0 2px 6px rgba(15,118,110,.4)',
        }}>✓</div>
      )}

      {/* Photo */}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
        {!imgError ? (
          <img
            src={cleaner.photo}
            alt={cleaner.name}
            onError={() => setImgError(true)}
            style={{
              width: 72, height: 72, borderRadius: '50%',
              objectFit: 'cover',
              border: `3px solid ${selected ? '#0F766E' : '#E2E8F0'}`,
              display: 'block',
              boxShadow: '0 2px 8px rgba(0,0,0,.12)',
            }}
          />
        ) : (
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: selected ? '#0F766E' : '#E2E8F0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700,
            color: selected ? '#fff' : '#64748B',
            border: `3px solid ${selected ? '#0F766E' : '#E2E8F0'}`,
          }}>{initials}</div>
        )}
        {/* Online dot */}
        <span style={{
          position: 'absolute', bottom: 3, right: 3,
          width: 14, height: 14, borderRadius: '50%',
          background: '#22C55E', border: '2px solid #FFFFFF',
        }} />
      </div>

      {/* Name */}
      <h3 style={{
        fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 3,
      }}>{cleaner.name}</h3>

      {/* Rating */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
        <span style={{ color: '#F59E0B', fontSize: 13, letterSpacing: 1 }}>
          {'★'.repeat(Math.floor(cleaner.rating))}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{cleaner.rating}</span>
        <span style={{ fontSize: 12, color: '#94A3B8' }}>({cleaner.reviews})</span>
      </div>

      {/* Experience pill */}
      <div style={{
        display: 'inline-block',
        background: selected ? '#CCFBF1' : '#F8FAFC',
        color: selected ? '#0F766E' : '#475569',
        border: `1px solid ${selected ? '#99F6E4' : '#E2E8F0'}`,
        borderRadius: 20, padding: '2px 10px',
        fontSize: 11, fontWeight: 600, marginBottom: 10,
      }}>{cleaner.experience} exp.</div>

      {/* Specialties */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginBottom: 14 }}>
        {cleaner.specialties.slice(0, 2).map(s => (
          <span key={s} style={{
            background: selected ? '#F0FDFA' : '#F1F5F9',
            color: selected ? '#0F766E' : '#64748B',
            border: `1px solid ${selected ? '#5EEAD4' : '#E2E8F0'}`,
            borderRadius: 20, padding: '2px 8px', fontSize: 11,
          }}>{s}</span>
        ))}
      </div>

      {/* Price */}
      <div style={{
        background: selected ? '#0F766E' : '#F8FAFC',
        border: `1px solid ${selected ? '#0F766E' : '#E2E8F0'}`,
        borderRadius: 8, padding: '7px',
        fontWeight: 700, fontSize: 15,
        color: selected ? '#FFFFFF' : '#0F172A',
      }}>
        ₹{cleaner.price_per_hour}
        <span style={{ fontSize: 12, fontWeight: 500, color: selected ? '#99F6E4' : '#64748B', marginLeft: 2 }}>/hr</span>
      </div>
    </div>
  )
}
