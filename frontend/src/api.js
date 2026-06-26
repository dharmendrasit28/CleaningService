const BASE = 'http://localhost:8000'

export const fetchCleaners = () =>
  fetch(`${BASE}/cleaners`).then(r => r.json())

export const fetchSlots = (cleanerId, date, duration) =>
  fetch(`${BASE}/cleaners/${cleanerId}/slots?date=${date}&duration=${duration}`)
    .then(r => r.json())

export const fetchSuggestions = (date, duration, excludeId) =>
  fetch(`${BASE}/suggestions?date=${date}&duration=${duration}&exclude_cleaner_id=${excludeId}`)
    .then(r => r.json())

export const createBooking = (data) =>
  fetch(`${BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(async r => {
    const json = await r.json()
    if (!r.ok) throw new Error(json.detail || 'Booking failed')
    return json
  })

export const fetchBookings = () =>
  fetch(`${BASE}/bookings`).then(r => r.json())

export const cancelBooking = (id) =>
  fetch(`${BASE}/bookings/${id}`, { method: 'DELETE' }).then(r => r.json())
