from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime, date as date_type
import uuid

app = FastAPI(title="Cleaning Service API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory data ──────────────────────────────────────────────────────────

cleaners = [
    {
        "id": "1",
        "name": "Priya Sharma",
        "rating": 4.8,
        "reviews": 120,
        "experience": "3 years",
        "photo": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face",
        "specialties": ["Deep Cleaning", "Kitchen", "Bathroom"],
        "price_per_hour": 150,
    },
    {
        "id": "2",
        "name": "Rahul Verma",
        "rating": 4.6,
        "reviews": 85,
        "experience": "2 years",
        "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
        "specialties": ["General Cleaning", "Living Room"],
        "price_per_hour": 150,
    },
    {
        "id": "3",
        "name": "Sunita Patel",
        "rating": 4.9,
        "reviews": 200,
        "experience": "5 years",
        "photo": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=face",
        "specialties": ["Deep Cleaning", "Post-Construction"],
        "price_per_hour": 150,
    },
    {
        "id": "4",
        "name": "Amit Singh",
        "rating": 4.7,
        "reviews": 95,
        "experience": "4 years",
        "photo": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=face",
        "specialties": ["General Cleaning", "Office Cleaning"],
        "price_per_hour": 150,
    },
    {
        "id": "5",
        "name": "Kavita Rao",
        "rating": 4.5,
        "reviews": 60,
        "experience": "1 year",
        "photo": "https://images.unsplash.com/photo-1546961342-ea5f73d193dc?w=200&h=200&fit=crop&crop=face",
        "specialties": ["General Cleaning", "Bedroom"],
        "price_per_hour": 150,
    },
]

bookings: list = []

VALID_DURATIONS = [1.0, 1.5, 2.0, 3.0]
WORK_START = 9.0   # 9:00 AM
WORK_END   = 18.0  # 6:00 PM


# ── Helpers ─────────────────────────────────────────────────────────────────

def float_to_display(t: float) -> str:
    h = int(t)
    m = int((t % 1) * 60)
    suffix = "AM" if h < 12 else "PM"
    display_h = h if h <= 12 else h - 12
    if display_h == 0:
        display_h = 12
    return f"{display_h}:{m:02d} {suffix}"


def has_conflict(cleaner_id: str, date: str, start: float, end: float, exclude_id: str = None) -> bool:
    for b in bookings:
        if b["id"] == exclude_id:
            continue
        if b["cleaner_id"] == cleaner_id and b["date"] == date:
            b_s, b_e = b["start_time"], b["end_time"]
            if not (end <= b_s or start >= b_e):
                return True
    return False


def get_available_slots(cleaner_id: str, date: str, duration: float) -> list:
    slots = []

    # For today, skip slots that have already started (require at least 30-min buffer)
    now = datetime.now()
    is_today = (date == now.strftime("%Y-%m-%d"))
    current_hour_float = now.hour + now.minute / 60.0 + 0.5  # 30-min lead time

    t = WORK_START
    while t + duration <= WORK_END:
        end = t + duration
        if is_today and t < current_hour_float:
            t += 0.5
            continue
        if not has_conflict(cleaner_id, date, t, end):
            slots.append({
                "start": t,
                "end": end,
                "start_display": float_to_display(t),
                "end_display": float_to_display(end),
            })
        t += 0.5
    return slots


def cleaner_slot_count(cleaner_id: str, date: str, duration: float) -> int:
    """Return number of available slots for a cleaner on a date."""
    return len(get_available_slots(cleaner_id, date, duration))


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/cleaners")
def list_cleaners():
    return cleaners


@app.get("/cleaners/{cleaner_id}")
def get_cleaner(cleaner_id: str):
    c = next((x for x in cleaners if x["id"] == cleaner_id), None)
    if not c:
        raise HTTPException(404, "Cleaner not found")
    return c


@app.get("/cleaners/{cleaner_id}/slots")
def available_slots(cleaner_id: str, date: str, duration: float):
    if not next((x for x in cleaners if x["id"] == cleaner_id), None):
        raise HTTPException(404, "Cleaner not found")
    if duration not in VALID_DURATIONS:
        raise HTTPException(400, f"Duration must be one of {VALID_DURATIONS}")
    return {"slots": get_available_slots(cleaner_id, date, duration)}


class BookingRequest(BaseModel):
    cleaner_id: str
    customer_name: str
    phone: str
    address: str
    date: str          # YYYY-MM-DD
    start_time: float  # e.g. 9.0 = 9:00 AM, 9.5 = 9:30 AM
    duration: float    # 1, 1.5, 2, 3


@app.post("/bookings", status_code=201)
def create_booking(req: BookingRequest):
    cleaner = next((x for x in cleaners if x["id"] == req.cleaner_id), None)
    if not cleaner:
        raise HTTPException(404, "Cleaner not found")
    if req.duration not in VALID_DURATIONS:
        raise HTTPException(400, "Invalid duration")

    # Reject past dates
    today_str = datetime.now().strftime("%Y-%m-%d")
    if req.date < today_str:
        raise HTTPException(400, "Cannot book a service in the past")

    # Reject past time slots for today
    if req.date == today_str:
        now = datetime.now()
        current_float = now.hour + now.minute / 60.0
        if req.start_time <= current_float:
            raise HTTPException(400, "Cannot book a time slot that has already passed")

    end_time = req.start_time + req.duration
    if has_conflict(req.cleaner_id, req.date, req.start_time, end_time):
        raise HTTPException(409, "This time slot is no longer available")

    total_price = cleaner["price_per_hour"] * req.duration

    booking = {
        "id": str(uuid.uuid4())[:8].upper(),
        "cleaner_id": req.cleaner_id,
        "cleaner_name": cleaner["name"],
        "cleaner_photo": cleaner["photo"],
        "customer_name": req.customer_name,
        "phone": req.phone,
        "address": req.address,
        "date": req.date,
        "start_time": req.start_time,
        "end_time": end_time,
        "start_display": float_to_display(req.start_time),
        "end_display": float_to_display(end_time),
        "duration": req.duration,
        "total_price": total_price,
        "status": "confirmed",
    }
    bookings.append(booking)
    return booking


@app.get("/suggestions")
def suggest_alternatives(date: str, duration: float, exclude_cleaner_id: str = ""):
    """Return other cleaners who have slots available for the given date & duration."""
    if duration not in VALID_DURATIONS:
        raise HTTPException(400, f"Duration must be one of {VALID_DURATIONS}")
    result = []
    for c in cleaners:
        if c["id"] == exclude_cleaner_id:
            continue
        slots = get_available_slots(c["id"], date, duration)
        if slots:
            result.append({
                "id":             c["id"],
                "name":           c["name"],
                "photo":          c["photo"],
                "rating":         c["rating"],
                "price_per_hour": c["price_per_hour"],
                "experience":     c["experience"],
                "available_slots": len(slots),
                "next_slot":       slots[0]["start_display"],
            })
    result.sort(key=lambda x: -x["rating"])
    return result


@app.get("/bookings")
def list_bookings():
    return sorted(bookings, key=lambda b: (b["date"], b["start_time"]))


@app.delete("/bookings/{booking_id}")
def cancel_booking(booking_id: str):
    global bookings
    idx = next((i for i, b in enumerate(bookings) if b["id"] == booking_id), None)
    if idx is None:
        raise HTTPException(404, "Booking not found")
    bookings[idx]["status"] = "cancelled"
    return {"message": "Booking cancelled"}
