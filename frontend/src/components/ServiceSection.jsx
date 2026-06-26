import React, { useState } from 'react'

const SERVICES = [
  {
    id: 'full-house',
    name: 'Full House Cleaning',
    desc: 'Complete top-to-bottom cleaning of every room in your home',
    img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=240&fit=crop',
    tag: 'Most Popular',
    tagColor: '#0F766E',
  },
  {
    id: 'bathroom',
    name: 'Bathroom Cleaning',
    desc: 'Deep sanitisation of tiles, toilet, fixtures, mirror & floor',
    img: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=240&fit=crop',
    tag: 'Top Rated',
    tagColor: '#7C3AED',
  },
  {
    id: 'kitchen',
    name: 'Kitchen Deep Cleaning',
    desc: 'Stove, chimney, counters, sink, tiles & cabinet cleaning',
    img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=240&fit=crop',
    tag: null,
    tagColor: null,
  },
  {
    id: 'bedroom',
    name: 'Bedroom Cleaning',
    desc: 'Vacuuming, dusting, bed making, wardrobe & floor cleaning',
    img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=240&fit=crop',
    tag: null,
    tagColor: null,
  },
  {
    id: 'dusting',
    name: 'Dusting & Mopping',
    desc: 'Ceiling fans, shelves, furniture dusting with wet & dry mopping',
    img: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=240&fit=crop',
    tag: null,
    tagColor: null,
  },
  {
    id: 'cloth-folding',
    name: 'Cloth Folding & Ironing',
    desc: 'Washing, drying, folding, ironing & wardrobe organisation',
    img: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=240&fit=crop',
    tag: null,
    tagColor: null,
  },
  {
    id: 'sofa',
    name: 'Sofa & Carpet Cleaning',
    desc: 'Steam cleaning for sofas, rugs, carpets & mattresses',
    img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=240&fit=crop',
    tag: 'New',
    tagColor: '#EA580C',
  },
  {
    id: 'floor',
    name: 'Floor Scrubbing',
    desc: 'Machine scrubbing of marble, tiles, granite & vitrified floors',
    img: 'https://images.unsplash.com/photo-1527515637462-cff94edd56f9?w=400&h=240&fit=crop',
    tag: null,
    tagColor: null,
  },
  {
    id: 'window',
    name: 'Window & Glass Cleaning',
    desc: 'Streak-free cleaning of all windows, glass doors & grills',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=240&fit=crop',
    tag: null,
    tagColor: null,
  },
  {
    id: 'balcony',
    name: 'Balcony Cleaning',
    desc: 'Sweeping, scrubbing & washing of balcony floor & railings',
    img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=240&fit=crop',
    tag: null,
    tagColor: null,
  },
  {
    id: 'post-construction',
    name: 'Post-Construction Clean',
    desc: 'Removal of dust, debris & construction marks after renovation',
    img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=240&fit=crop',
    tag: 'Heavy Duty',
    tagColor: '#B45309',
  },
  {
    id: 'office',
    name: 'Office Cleaning',
    desc: 'Desks, cabins, pantry, washrooms & common area cleaning',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=240&fit=crop',
    tag: null,
    tagColor: null,
  },
]

export default function ServiceSection({ onBookNow }) {
  const [hovered, setHovered] = useState(null)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', letterSpacing: '-.4px', marginBottom: 4 }}>
            All Cleaning Services
          </h2>
          <p style={{ fontSize: 14, color: '#64748B' }}>
            {SERVICES.length} professional cleaning services · Starting at ₹150/hr
          </p>
        </div>
        <button
          onClick={onBookNow}
          style={{
            padding: '10px 22px', borderRadius: 9, fontWeight: 700, fontSize: 13,
            background: 'linear-gradient(135deg, #0F766E, #0D9488)',
            color: '#fff', border: 'none', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(15,118,110,.3)', whiteSpace: 'nowrap',
          }}
        >Book Now →</button>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
        gap: 16,
      }}>
        {SERVICES.map(s => (
          <div
            key={s.id}
            onMouseEnter={() => setHovered(s.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={onBookNow}
            style={{
              borderRadius: 14, overflow: 'hidden',
              border: `1.5px solid ${hovered === s.id ? '#0F766E' : '#E2E8F0'}`,
              background: '#FFFFFF', cursor: 'pointer',
              transition: 'all .2s ease',
              boxShadow: hovered === s.id
                ? '0 8px 24px rgba(15,118,110,.15)'
                : '0 1px 4px rgba(0,0,0,.05)',
              transform: hovered === s.id ? 'translateY(-3px)' : 'none',
            }}
          >
            {/* Image */}
            <div style={{ position: 'relative', height: 150, background: '#F1F5F9', overflow: 'hidden' }}>
              <img
                src={s.img}
                alt={s.name}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  transition: 'transform .35s ease',
                  transform: hovered === s.id ? 'scale(1.07)' : 'scale(1)',
                  display: 'block',
                }}
                onError={e => {
                  e.target.parentNode.style.background = '#F0FDFA'
                  e.target.style.display = 'none'
                }}
              />
              {/* Gradient */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(15,23,42,.55) 0%, transparent 55%)',
              }} />
              {/* Tag */}
              {s.tag && (
                <span style={{
                  position: 'absolute', top: 9, left: 9,
                  background: s.tagColor, color: '#fff',
                  fontSize: 10, fontWeight: 700, letterSpacing: 0.4,
                  padding: '3px 9px', borderRadius: 20,
                  boxShadow: '0 2px 6px rgba(0,0,0,.25)',
                }}>{s.tag}</span>
              )}
              {/* Price on image */}
              <span style={{
                position: 'absolute', bottom: 9, right: 9,
                background: 'rgba(255,255,255,.92)', color: '#0F766E',
                fontSize: 12, fontWeight: 800,
                padding: '3px 9px', borderRadius: 7,
                backdropFilter: 'blur(4px)',
              }}>₹150/hr</span>
            </div>

            {/* Content */}
            <div style={{ padding: '13px 14px 14px' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 4, lineHeight: 1.3 }}>
                {s.name}
              </h3>
              <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.55, marginBottom: 10 }}>
                {s.desc}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 1 }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: '#F59E0B', fontSize: 11 }}>★</span>
                  ))}
                  <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 4 }}>4.8</span>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: hovered === s.id ? '#0F766E' : '#94A3B8',
                  transition: 'color .15s',
                }}>Book →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
