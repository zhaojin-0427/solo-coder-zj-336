from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class TeaSampleBase(BaseModel):
    name: str = Field(..., max_length=100)
    origin: Optional[str] = None
    roast_level: Optional[str] = None
    grind_fineness: Optional[str] = None
    year: Optional[int] = None
    notes: Optional[str] = None


class TeaSampleCreate(TeaSampleBase):
    pass


class TeaSampleUpdate(TeaSampleBase):
    name: Optional[str] = None


class TeaSampleOut(TeaSampleBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class TeaBowlBase(BaseModel):
    name: str = Field(..., max_length=100)
    kiln: Optional[str] = None
    glaze: Optional[str] = None
    capacity_ml: Optional[int] = None
    notes: Optional[str] = None


class TeaBowlCreate(TeaBowlBase):
    pass


class TeaBowlUpdate(TeaBowlBase):
    name: Optional[str] = None


class TeaBowlOut(TeaBowlBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class TeaWhiskBase(BaseModel):
    name: str = Field(..., max_length=100)
    prong_count: Optional[int] = None
    material: Optional[str] = None
    age_years: Optional[float] = None
    notes: Optional[str] = None


class TeaWhiskCreate(TeaWhiskBase):
    pass


class TeaWhiskUpdate(TeaWhiskBase):
    name: Optional[str] = None


class TeaWhiskOut(TeaWhiskBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PouringTechniqueBase(BaseModel):
    name: str = Field(..., max_length=100)
    water_temp_c: Optional[int] = None
    pour_speed: Optional[str] = None
    description: Optional[str] = None


class PouringTechniqueCreate(PouringTechniqueBase):
    pass


class PouringTechniqueUpdate(PouringTechniqueBase):
    name: Optional[str] = None


class PouringTechniqueOut(PouringTechniqueBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PracticeRecordCreate(BaseModel):
    practitioner_name: str = Field(..., max_length=50)
    tea_sample_id: int
    tea_bowl_id: int
    tea_whisk_id: int
    technique_id: int
    tea_powder_grams: float = Field(..., gt=0)
    water_pour_rounds: int = Field(..., ge=1)
    whisking_duration_sec: int = Field(..., ge=0)
    foam_state: str = Field(..., max_length=50)
    pattern_description: Optional[str] = None


class ReviewOut(BaseModel):
    id: int
    practice_record_id: int
    teacher_name: str
    foam_delicacy_score: int
    cup_biting_duration_sec: int
    pattern_completeness_score: int
    correction_suggestion: Optional[str]
    is_successful: int
    failure_reason: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class PracticeRecordOut(BaseModel):
    id: int
    practitioner_name: str
    tea_sample_id: int
    tea_bowl_id: int
    tea_whisk_id: int
    technique_id: int
    tea_powder_grams: float
    water_pour_rounds: int
    whisking_duration_sec: int
    foam_state: str
    pattern_description: Optional[str]
    pattern_seed: Optional[int]
    created_at: datetime
    tea_sample: Optional[TeaSampleOut] = None
    tea_bowl: Optional[TeaBowlOut] = None
    tea_whisk: Optional[TeaWhiskOut] = None
    technique: Optional[PouringTechniqueOut] = None
    review: Optional[ReviewOut] = None

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    practice_record_id: int
    teacher_name: str = Field(..., max_length=50)
    foam_delicacy_score: int = Field(..., ge=0, le=100)
    cup_biting_duration_sec: int = Field(..., ge=0)
    pattern_completeness_score: int = Field(..., ge=0, le=100)
    correction_suggestion: Optional[str] = None
    is_successful: bool = False
    failure_reason: Optional[str] = None


class ExperienceCreate(BaseModel):
    tea_sample_id: int
    technique_id: int
    summary: str
    key_points: Optional[str] = None


class ExperienceOut(BaseModel):
    id: int
    tea_sample_id: int
    technique_id: int
    summary: str
    key_points: Optional[str]
    success_count: int
    total_count: int
    created_at: datetime
    tea_sample: Optional[TeaSampleOut] = None
    technique: Optional[PouringTechniqueOut] = None

    class Config:
        from_attributes = True


class OverviewOut(BaseModel):
    total_records: int
    total_reviews: int
    success_count: int
    fail_count: int
    success_rate: float
    pending_reviews: int
    total_teas: int
    total_bowls: int
    total_whisks: int
    total_techniques: int
    total_experiences: int
