from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    Text,
    Float,
    ForeignKey,
    DateTime,
)
from sqlalchemy.orm import relationship

from database import Base


class TeaSample(Base):
    __tablename__ = "tea_sample"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    origin = Column(Text)
    roast_level = Column(Text)
    grind_fineness = Column(Text)
    year = Column(Integer)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    practice_records = relationship("PracticeRecord", back_populates="tea_sample")
    experiences = relationship("Experience", back_populates="tea_sample")


class TeaBowl(Base):
    __tablename__ = "tea_bowl"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    kiln = Column(Text)
    glaze = Column(Text)
    capacity_ml = Column(Integer)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    practice_records = relationship("PracticeRecord", back_populates="tea_bowl")


class TeaWhisk(Base):
    __tablename__ = "tea_whisk"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    prong_count = Column(Integer)
    material = Column(Text)
    age_years = Column(Float)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    practice_records = relationship("PracticeRecord", back_populates="tea_whisk")


class PouringTechnique(Base):
    __tablename__ = "pouring_technique"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    water_temp_c = Column(Integer)
    pour_speed = Column(Text)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    practice_records = relationship("PracticeRecord", back_populates="technique")
    experiences = relationship("Experience", back_populates="technique")


class PracticeRecord(Base):
    __tablename__ = "practice_record"

    id = Column(Integer, primary_key=True, autoincrement=True)
    practitioner_name = Column(Text, nullable=False)
    tea_sample_id = Column(Integer, ForeignKey("tea_sample.id"), nullable=False)
    tea_bowl_id = Column(Integer, ForeignKey("tea_bowl.id"), nullable=False)
    tea_whisk_id = Column(Integer, ForeignKey("tea_whisk.id"), nullable=False)
    technique_id = Column(Integer, ForeignKey("pouring_technique.id"), nullable=False)
    tea_powder_grams = Column(Float, nullable=False)
    water_pour_rounds = Column(Integer, nullable=False)
    whisking_duration_sec = Column(Integer, nullable=False)
    foam_state = Column(Text, nullable=False)
    pattern_description = Column(Text)
    pattern_photo_url = Column(Text)
    pattern_seed = Column(Integer)
    training_plan_id = Column(Integer, ForeignKey("training_plan.id"))
    training_session_id = Column(Integer, ForeignKey("training_session.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    tea_sample = relationship("TeaSample", back_populates="practice_records")
    tea_bowl = relationship("TeaBowl", back_populates="practice_records")
    tea_whisk = relationship("TeaWhisk", back_populates="practice_records")
    technique = relationship("PouringTechnique", back_populates="practice_records")
    review = relationship("Review", back_populates="practice_record", uselist=False, cascade="all, delete-orphan")
    training_plan = relationship("TrainingPlan", back_populates="practice_records")
    training_session = relationship("TrainingSession", back_populates="practice_records")


class Review(Base):
    __tablename__ = "review"

    id = Column(Integer, primary_key=True, autoincrement=True)
    practice_record_id = Column(Integer, ForeignKey("practice_record.id"), nullable=False)
    teacher_name = Column(Text, nullable=False)
    foam_delicacy_score = Column(Integer, nullable=False)
    cup_biting_duration_sec = Column(Integer, nullable=False)
    pattern_completeness_score = Column(Integer, nullable=False)
    correction_suggestion = Column(Text)
    is_successful = Column(Integer, nullable=False, default=0)
    failure_reason = Column(Text)
    archive_as_experience = Column(Integer, nullable=False, default=0)
    experience_key_points = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    practice_record = relationship("PracticeRecord", back_populates="review")


class Experience(Base):
    __tablename__ = "experience"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tea_sample_id = Column(Integer, ForeignKey("tea_sample.id"), nullable=False)
    technique_id = Column(Integer, ForeignKey("pouring_technique.id"), nullable=False)
    summary = Column(Text, nullable=False)
    key_points = Column(Text)
    success_count = Column(Integer, default=0)
    total_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    tea_sample = relationship("TeaSample", back_populates="experiences")
    technique = relationship("PouringTechnique", back_populates="experiences")


class TrainingPlan(Base):
    __tablename__ = "training_plan"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    tea_sample_id = Column(Integer, ForeignKey("tea_sample.id"), nullable=False)
    target_pattern = Column(Text)
    target_technique_id = Column(Integer, ForeignKey("pouring_technique.id"), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    weekly_frequency = Column(Integer, nullable=False, default=1)
    stage_goal = Column(Text)
    teacher_name = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    tea_sample = relationship("TeaSample")
    target_technique = relationship("PouringTechnique")
    sessions = relationship("TrainingSession", back_populates="plan", cascade="all, delete-orphan")
    practice_records = relationship("PracticeRecord", back_populates="training_plan")


class TrainingSession(Base):
    __tablename__ = "training_session"

    id = Column(Integer, primary_key=True, autoincrement=True)
    plan_id = Column(Integer, ForeignKey("training_plan.id"), nullable=False)
    session_date = Column(DateTime, nullable=False)
    practitioner_name = Column(Text, nullable=False)
    expected_tea_bowl_id = Column(Integer, ForeignKey("tea_bowl.id"))
    expected_tea_whisk_id = Column(Integer, ForeignKey("tea_whisk.id"))
    status = Column(Text, nullable=False, default="scheduled")
    pre_session_tip = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    plan = relationship("TrainingPlan", back_populates="sessions")
    expected_tea_bowl = relationship("TeaBowl")
    expected_tea_whisk = relationship("TeaWhisk")
    practice_records = relationship("PracticeRecord", back_populates="training_session")
