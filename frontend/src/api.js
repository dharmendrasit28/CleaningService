// All API calls are handled locally in the browser (localStorage).
// No backend server required — works on GitHub Pages.
export {
  fetchCleaners,
  fetchSlots,
  fetchSuggestions,
  createBooking,
  fetchBookings,
  cancelBooking,
} from './localApi'
