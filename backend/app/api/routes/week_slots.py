from datetime import date, timedelta
from typing import List, Optional, Set

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models import Availability, User
from app.schemas import WeekSlot, WeekSlotsPreferences

router = APIRouter()


@router.get("/week-slots", response_model=List[WeekSlot])
def get_week_slots(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    today = date.today()
    dates = [today + timedelta(days=i + 1) for i in range(7)]

    stmt = select(Availability.date, Availability.user_id).where(
        Availability.date.in_(dates)
    )
    rows = db.execute(stmt).all()

    counts = {d: 0 for d in dates}
    for d, _user_id in rows:
        counts[d] = counts.get(d, 0) + 1

    return [
        WeekSlot(date=d, playersCount=counts[d])
        for d in dates
    ]


@router.post("/week-slots/preferences")
def set_week_slots_preferences(
    prefs: WeekSlotsPreferences,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    valid_dates: Set[date] = {
        today + timedelta(days=i + 1) for i in range(7)
    }

    chosen = set(prefs.dates) & valid_dates

    db.query(Availability).filter(
        Availability.user_id == current_user.id,
        Availability.date.in_(list(valid_dates)),
    ).delete(synchronize_session=False)

    for d in sorted(chosen):
        db.add(Availability(user_id=current_user.id, date=d))
    db.commit()

    return {"ok": True, "dates": sorted(chosen)}