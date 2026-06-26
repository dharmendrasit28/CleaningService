# Gleam — Home Cleaning Services

A full-stack cleaning service booking app built with **React + FastAPI**.

## Features
- Book verified cleaning professionals (9 AM – 6 PM daily)
- 12 cleaning service types — house, bathroom, kitchen, dusting, cloth folding & more
- 4-step booking flow with time slot availability
- Suggests alternative professionals if selected one is fully booked
- My Bookings dashboard with cancel option
- ₹150/hr flat pricing

## Tech Stack
| Layer    | Technology          |
|----------|---------------------|
| Frontend | React 18 + Vite     |
| Backend  | FastAPI + Uvicorn   |
| Data     | In-memory (Python)  |
| Styling  | Plain CSS + Inline  |

## Project Structure
```
cleaning-service/
├── backend/
│   ├── main.py           # FastAPI app — all routes
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── api.js
    │   └── components/
    │       ├── BookingFlow.jsx
    │       ├── CleanerCard.jsx
    │       ├── MyBookings.jsx
    │       └── ServiceSection.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Running Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API available at: http://localhost:8000  
Swagger docs: http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App available at: http://localhost:3000

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cleaners` | List all cleaning professionals |
| GET | `/cleaners/{id}/slots?date=&duration=` | Get available time slots |
| GET | `/suggestions?date=&duration=&exclude_cleaner_id=` | Suggest available alternatives |
| POST | `/bookings` | Create a booking |
| GET | `/bookings` | List all bookings |
| DELETE | `/bookings/{id}` | Cancel a booking |
