// All business logic runs in the browser — no backend needed
// Bookings are saved to localStorage so they persist across refreshes

// ── Cleaners data ─────────────────────────────────────────────────────────
export const CLEANERS = [
  {
    id: '1', name: 'Priya Sharma', rating: 4.8, reviews: 120,
    experience: '3 years',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
    specialties: ['Deep Cleaning', 'Kitchen', 'Bathroom'],
    price_per_hour: 150,
  },
  {
    id: '2', name: 'Rahul Verma', rating: 4.6, reviews: 85,
    experience: '2 years',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    specialties: ['General Cleaning', 'Living Room'],
    price_per_hour: 150,
  },
  {
    id: '3', name: 'Sunita Patel', rating: 4.9, reviews: 200,
    experience: '5 years',
    photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=face',
    specialties: ['Deep Cleaning', 'Post-Construction'],
    price_per_hour: 150,
  },
  {
    id: '4', name: 'Amit Singh', rating: 4.7, reviews: 95,
    experience: '4 years',
    photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=face',
    specialties: ['General Cleaning', 'Office Cleaning'],
    price_per_hour: 150,
  },
  {
    id: '5', name: 'Kavita Rao', rating: 4.5, reviews: 60,
    experience: '1 year',
    photo: 'https://images.unsplash.com/photo-1546961342-ea5f73d193dc?w=200&h=200&fit=crop&crop=face',
    specialties: ['General Cleaning', 'Bedroom'],
    price_per_hour: 150,
  },
]

const VALID_DURATIONS = [1.0, 1.5, 2.0, 3.0]
const WORK_START = 9.0
const WORK_END   = 18.0

// ── localStorage helpers ───────────────────────────────────────────────────
const STORAGE_KEY = 'gleam_bookings'

const loadBookings = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}
const saveBookings = (b) => localStorage.setItem(STORAGE_KEY, JSON.stringify(b))

// ── Helpers ────────────────────────────────────────────────────────────────
const floatToDisplay = (t) => {
  const h = Math.floor(t)
  const m = Math.round((t % 1) * 60)
  const suffix = h < 12 ? 'AM' : 'PM'
  const dh = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${dh}:${String(m).padStart(2, '0')} ${suffix}`
}

const todayStr = () => new Date().toISOString().split('T')[0]

const hasConflict = (bookings, cleanerId, date, start, end, excludeId = null) => {
  return bookings.some(b => {
    if (b.id === excludeId || b.status === 'cancelled') return false
    if (b.cleaner_id !== cleanerId || b.date !== date) return false
    return !(end <= b.start_time || start >= b.end_time)
  })
}

const getSlots = (cleanerId, date, duration) => {
  const bookings = loadBookings()
  const now = new Date()
  const isToday = date === todayStr()
  const currentFloat = now.getHours() + now.getMinutes() / 60 + 0.5 // 30-min buffer

  const slots = []
  let t = WORK_START
  while (t + duration <= WORK_END) {
    if (isToday && t < currentFloat) { t += 0.5; continue }
    const end = t + duration
    if (!hasConflict(bookings, cleanerId, date, t, end)) {
      slots.push({
        start: t, end,
        start_display: floatToDisplay(t),
        end_display: floatToDisplay(end),
      })
    }
    t += 0.5
  }
  return slots
}

const randomId = () => Math.random().toString(36).substring(2, 10).toUpperCase()

// ── Public API (mirrors the FastAPI backend) ───────────────────────────────
export const fetchCleaners = () =>
  Promise.resolve([...CLEANERS])

export const fetchSlots = (cleanerId, date, duration) =>
  Promise.resolve({ slots: getSlots(cleanerId, date, parseFloat(duration)) })

export const fetchSuggestions = (date, duration, excludeId) => {
  const dur = parseFloat(duration)
  const result = CLEANERS
    .filter(c => c.id !== excludeId)
    .map(c => {
      const slots = getSlots(c.id, date, dur)
      return slots.length ? {
        id: c.id, name: c.name, photo: c.photo,
        rating: c.rating, price_per_hour: c.price_per_hour,
        experience: c.experience,
        available_slots: slots.length,
        next_slot: slots[0].start_display,
      } : null
    })
    .filter(Boolean)
    .sort((a, b) => b.rating - a.rating)
  return Promise.resolve(result)
}

export const createBooking = ({ cleaner_id, customer_name, phone, address, date, start_time, duration }) => {
  const cleaner = CLEANERS.find(c => c.id === cleaner_id)
  if (!cleaner) return Promise.reject(new Error('Cleaner not found'))
  if (!VALID_DURATIONS.includes(duration)) return Promise.reject(new Error('Invalid duration'))

  const today = todayStr()
  if (date < today) return Promise.reject(new Error('Cannot book a service in the past'))
  if (date === today) {
    const now = new Date()
    const cur = now.getHours() + now.getMinutes() / 60
    if (start_time <= cur) return Promise.reject(new Error('This time slot has already passed'))
  }

  const end_time = start_time + duration
  const bookings = loadBookings()
  if (hasConflict(bookings, cleaner_id, date, start_time, end_time)) {
    return Promise.reject(new Error('This time slot is no longer available'))
  }

  const booking = {
    id: randomId(),
    cleaner_id, cleaner_name: cleaner.name, cleaner_photo: cleaner.photo,
    customer_name, phone, address, date,
    start_time, end_time,
    start_display: floatToDisplay(start_time),
    end_display: floatToDisplay(end_time),
    duration, total_price: cleaner.price_per_hour * duration,
    status: 'confirmed',
  }
  saveBookings([...bookings, booking])
  return Promise.resolve(booking)
}

export const fetchBookings = () =>
  Promise.resolve(loadBookings().sort((a, b) => a.date < b.date ? -1 : 1))

export const cancelBooking = (id) => {
  const bookings = loadBookings()
  const idx = bookings.findIndex(b => b.id === id)
  if (idx === -1) return Promise.reject(new Error('Booking not found'))
  bookings[idx].status = 'cancelled'
  saveBookings(bookings)
  return Promise.resolve({ message: 'Booking cancelled' })
}
