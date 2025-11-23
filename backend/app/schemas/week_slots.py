from datetime import date
from typing import List

from pydantic import BaseModel


class WeekSlot(BaseModel):
    date: date
    playersCount: int


class WeekSlotsPreferences(BaseModel):
    dates: List[date]