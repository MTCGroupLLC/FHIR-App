from pydantic import BaseModel
from typing import Optional
from enum import Enum


class Gender(str, Enum):
    male = "male"
    female = "female"
    other = "other"
    unknown = "unknown"


class PatientDemographics(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: str          # YYYY-MM-DD
    gender: Optional[Gender] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    member_id: Optional[str] = None  # insurance member ID
    ssn_last4: Optional[str] = None
