import random
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, inspect, text

from database import engine, get_db, Base
import models
import schemas
from seed import seed_if_empty


def migrate_db():
    inspector = inspect(engine)
    all_tables = set(inspector.get_table_names())
    if "review" in all_tables:
        review_columns = {col["name"] for col in inspector.get_columns("review")}
        with engine.begin() as conn:
            if "archive_as_experience" not in review_columns:
                conn.execute(text("ALTER TABLE review ADD COLUMN archive_as_experience INTEGER NOT NULL DEFAULT 0"))
            if "experience_key_points" not in review_columns:
                conn.execute(text("ALTER TABLE review ADD COLUMN experience_key_points TEXT"))
    if "practice_record" in all_tables:
        pr_columns = {col["name"] for col in inspector.get_columns("practice_record")}
        with engine.begin() as conn:
            if "training_plan_id" not in pr_columns:
                conn.execute(text("ALTER TABLE practice_record ADD COLUMN training_plan_id INTEGER"))
            if "training_session_id" not in pr_columns:
                conn.execute(text("ALTER TABLE practice_record ADD COLUMN training_session_id INTEGER"))


Base.metadata.create_all(bind=engine)
migrate_db()
seed_if_empty()

app = FastAPI(title="宋式点茶练习与茶百戏纹样复现平台 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_or_404(db, model, item_id):
    obj = db.query(model).filter(model.id == item_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail=f"{model.__name__} id={item_id} not found")
    return obj


def apply_update(db, obj, schema):
    data = schema.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj


def generate_pattern_seed(name: str) -> int:
    return abs(hash(name + str(datetime.utcnow()))) % 9000 + 1000


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/tea-samples", response_model=list[schemas.TeaSampleOut])
def list_tea_samples(db: Session = Depends(get_db)):
    return db.query(models.TeaSample).order_by(models.TeaSample.created_at.desc()).all()


@app.post("/api/tea-samples", response_model=schemas.TeaSampleOut)
def create_tea_sample(payload: schemas.TeaSampleCreate, db: Session = Depends(get_db)):
    obj = models.TeaSample(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.put("/api/tea-samples/{item_id}", response_model=schemas.TeaSampleOut)
def update_tea_sample(item_id: int, payload: schemas.TeaSampleUpdate, db: Session = Depends(get_db)):
    obj = get_or_404(db, models.TeaSample, item_id)
    return apply_update(db, obj, payload)


@app.delete("/api/tea-samples/{item_id}")
def delete_tea_sample(item_id: int, db: Session = Depends(get_db)):
    obj = get_or_404(db, models.TeaSample, item_id)
    db.delete(obj)
    db.commit()
    return {"ok": True}


@app.get("/api/tea-bowls", response_model=list[schemas.TeaBowlOut])
def list_tea_bowls(db: Session = Depends(get_db)):
    return db.query(models.TeaBowl).order_by(models.TeaBowl.created_at.desc()).all()


@app.post("/api/tea-bowls", response_model=schemas.TeaBowlOut)
def create_tea_bowl(payload: schemas.TeaBowlCreate, db: Session = Depends(get_db)):
    obj = models.TeaBowl(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.put("/api/tea-bowls/{item_id}", response_model=schemas.TeaBowlOut)
def update_tea_bowl(item_id: int, payload: schemas.TeaBowlUpdate, db: Session = Depends(get_db)):
    obj = get_or_404(db, models.TeaBowl, item_id)
    return apply_update(db, obj, payload)


@app.delete("/api/tea-bowls/{item_id}")
def delete_tea_bowl(item_id: int, db: Session = Depends(get_db)):
    obj = get_or_404(db, models.TeaBowl, item_id)
    db.delete(obj)
    db.commit()
    return {"ok": True}


@app.get("/api/tea-whisks", response_model=list[schemas.TeaWhiskOut])
def list_tea_whisks(db: Session = Depends(get_db)):
    return db.query(models.TeaWhisk).order_by(models.TeaWhisk.created_at.desc()).all()


@app.post("/api/tea-whisks", response_model=schemas.TeaWhiskOut)
def create_tea_whisk(payload: schemas.TeaWhiskCreate, db: Session = Depends(get_db)):
    obj = models.TeaWhisk(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.put("/api/tea-whisks/{item_id}", response_model=schemas.TeaWhiskOut)
def update_tea_whisk(item_id: int, payload: schemas.TeaWhiskUpdate, db: Session = Depends(get_db)):
    obj = get_or_404(db, models.TeaWhisk, item_id)
    return apply_update(db, obj, payload)


@app.delete("/api/tea-whisks/{item_id}")
def delete_tea_whisk(item_id: int, db: Session = Depends(get_db)):
    obj = get_or_404(db, models.TeaWhisk, item_id)
    db.delete(obj)
    db.commit()
    return {"ok": True}


@app.get("/api/pouring-techniques", response_model=list[schemas.PouringTechniqueOut])
def list_techniques(db: Session = Depends(get_db)):
    return db.query(models.PouringTechnique).order_by(models.PouringTechnique.created_at.desc()).all()


@app.post("/api/pouring-techniques", response_model=schemas.PouringTechniqueOut)
def create_technique(payload: schemas.PouringTechniqueCreate, db: Session = Depends(get_db)):
    obj = models.PouringTechnique(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.put("/api/pouring-techniques/{item_id}", response_model=schemas.PouringTechniqueOut)
def update_technique(item_id: int, payload: schemas.PouringTechniqueUpdate, db: Session = Depends(get_db)):
    obj = get_or_404(db, models.PouringTechnique, item_id)
    return apply_update(db, obj, payload)


@app.delete("/api/pouring-techniques/{item_id}")
def delete_technique(item_id: int, db: Session = Depends(get_db)):
    obj = get_or_404(db, models.PouringTechnique, item_id)
    db.delete(obj)
    db.commit()
    return {"ok": True}


@app.get("/api/practice-records", response_model=list[schemas.PracticeRecordOut])
def list_records(
    tea_sample_id: int | None = None,
    status: str | None = Query(None, pattern="^(success|fail|pending)$"),
    db: Session = Depends(get_db),
):
    query = db.query(models.PracticeRecord)
    if tea_sample_id:
        query = query.filter(models.PracticeRecord.tea_sample_id == tea_sample_id)
    records = query.order_by(models.PracticeRecord.created_at.desc()).all()
    if status == "success":
        records = [r for r in records if r.review and r.review.is_successful == 1]
    elif status == "fail":
        records = [r for r in records if r.review and r.review.is_successful == 0]
    elif status == "pending":
        records = [r for r in records if not r.review]
    return records


@app.post("/api/practice-records", response_model=schemas.PracticeRecordOut)
def create_record(payload: schemas.PracticeRecordCreate, db: Session = Depends(get_db)):
    get_or_404(db, models.TeaSample, payload.tea_sample_id)
    get_or_404(db, models.TeaBowl, payload.tea_bowl_id)
    get_or_404(db, models.TeaWhisk, payload.tea_whisk_id)
    get_or_404(db, models.PouringTechnique, payload.technique_id)
    if payload.training_plan_id:
        get_or_404(db, models.TrainingPlan, payload.training_plan_id)
    if payload.training_session_id:
        session = get_or_404(db, models.TrainingSession, payload.training_session_id)
        if session.status == "scheduled":
            session.status = "completed"
            db.commit()
    data = payload.model_dump()
    data["pattern_seed"] = generate_pattern_seed(payload.practitioner_name + payload.foam_state)
    obj = models.PracticeRecord(**data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.get("/api/practice-records/{item_id}", response_model=schemas.PracticeRecordOut)
def get_record(item_id: int, db: Session = Depends(get_db)):
    return get_or_404(db, models.PracticeRecord, item_id)


@app.delete("/api/practice-records/{item_id}")
def delete_record(item_id: int, db: Session = Depends(get_db)):
    obj = get_or_404(db, models.PracticeRecord, item_id)

    if obj.review and obj.review.archive_as_experience == 1:
        experience = (
            db.query(models.Experience)
            .filter(
                models.Experience.tea_sample_id == obj.tea_sample_id,
                models.Experience.technique_id == obj.technique_id,
            )
            .first()
        )
        if experience:
            if obj.review.is_successful == 1 and experience.success_count > 0:
                experience.success_count -= 1
            if experience.total_count > 0:
                experience.total_count -= 1
            if experience.total_count <= 0:
                db.delete(experience)
            db.commit()

    db.delete(obj)
    db.commit()
    return {"ok": True}


@app.get("/api/reviews", response_model=list[schemas.ReviewOut])
def list_reviews(pending: bool | None = None, db: Session = Depends(get_db)):
    query = db.query(models.Review)
    reviews = query.order_by(models.Review.created_at.desc()).all()
    if pending:
        reviewed_ids = {r.practice_record_id for r in reviews}
        pending_records = (
            db.query(models.PracticeRecord)
            .filter(~models.PracticeRecord.id.in_(reviewed_ids))
            .order_by(models.PracticeRecord.created_at.desc())
            .all()
        )
        return [
            schemas.ReviewOut(
                id=0,
                practice_record_id=pr.id,
                teacher_name="",
                foam_delicacy_score=0,
                cup_biting_duration_sec=0,
                pattern_completeness_score=0,
                correction_suggestion=None,
                is_successful=0,
                failure_reason=None,
                archive_as_experience=0,
                experience_key_points=None,
                created_at=pr.created_at,
            )
            for pr in pending_records
        ]
    return reviews


@app.post("/api/reviews", response_model=schemas.ReviewOut)
def create_review(payload: schemas.ReviewCreate, db: Session = Depends(get_db)):
    record = get_or_404(db, models.PracticeRecord, payload.practice_record_id)
    if record.review:
        raise HTTPException(status_code=400, detail="该练习记录已有点评")
    data = payload.model_dump()
    data["is_successful"] = 1 if data["is_successful"] else 0
    data["archive_as_experience"] = 1 if data["archive_as_experience"] else 0
    review = models.Review(**data)
    db.add(review)
    db.commit()
    db.refresh(review)

    if review.archive_as_experience == 1:
        tea = record.tea_sample
        tech = record.technique

        def get_or_create_exp():
            e = (
                db.query(models.Experience)
                .filter(
                    models.Experience.tea_sample_id == record.tea_sample_id,
                    models.Experience.technique_id == record.technique_id,
                )
                .first()
            )
            if not e:
                tea_desc = f"{tea.name}" if tea else "该茶样"
                tech_desc = f"{tech.name}" if tech else "该手法"
                e = models.Experience(
                    tea_sample_id=record.tea_sample_id,
                    technique_id=record.technique_id,
                    summary=f"{tea_desc} 配 {tech_desc} 的组合经验沉淀",
                    key_points=f"茶粉{record.tea_powder_grams}g、注水{record.water_pour_rounds}轮、击拂{record.whisking_duration_sec}秒、沫饽{record.foam_state}",
                    success_count=0,
                    total_count=0,
                )
                db.add(e)
                db.commit()
                db.refresh(e)
            return e

        if review.is_successful == 1:
            exp = get_or_create_exp()
            exp.success_count += 1
            exp.total_count += 1
            if tea and tech:
                exp.summary = f"{tea.name} 配 {tech.name}，汤花{record.foam_state}，纹样复现成功"
            if review.experience_key_points:
                exp.key_points = review.experience_key_points
            elif tea and tech:
                exp.key_points = f"茶粉{record.tea_powder_grams}g、注水{record.water_pour_rounds}轮、击拂{record.whisking_duration_sec}秒、水温{tech.water_temp_c or '—'}度"
            db.commit()
        else:
            exp = get_or_create_exp()
            exp.total_count += 1
            if review.experience_key_points:
                exp.key_points = review.experience_key_points
            db.commit()

    return review


@app.get("/api/experiences", response_model=list[schemas.ExperienceOut])
def list_experiences(db: Session = Depends(get_db)):
    return db.query(models.Experience).order_by(models.Experience.created_at.desc()).all()


@app.post("/api/experiences", response_model=schemas.ExperienceOut)
def create_experience(payload: schemas.ExperienceCreate, db: Session = Depends(get_db)):
    get_or_404(db, models.TeaSample, payload.tea_sample_id)
    get_or_404(db, models.PouringTechnique, payload.technique_id)
    obj = models.Experience(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.get("/api/statistics/overview", response_model=schemas.OverviewOut)
def stats_overview(db: Session = Depends(get_db)):
    total_records = db.query(models.PracticeRecord).count()
    reviews = db.query(models.Review).all()
    total_reviews = len(reviews)
    success_count = sum(1 for r in reviews if r.is_successful == 1)
    fail_count = sum(1 for r in reviews if r.is_successful == 0)
    success_rate = (success_count / total_reviews * 100) if total_reviews > 0 else 0
    pending = total_records - total_reviews
    return schemas.OverviewOut(
        total_records=total_records,
        total_reviews=total_reviews,
        success_count=success_count,
        fail_count=fail_count,
        success_rate=round(success_rate, 1),
        pending_reviews=pending,
        total_teas=db.query(models.TeaSample).count(),
        total_bowls=db.query(models.TeaBowl).count(),
        total_whisks=db.query(models.TeaWhisk).count(),
        total_techniques=db.query(models.PouringTechnique).count(),
        total_experiences=db.query(models.Experience).count(),
    )


@app.get("/api/statistics/tea-sample-success")
def stats_tea_success(db: Session = Depends(get_db)):
    teas = db.query(models.TeaSample).all()
    result = []
    for tea in teas:
        records = db.query(models.PracticeRecord).filter(models.PracticeRecord.tea_sample_id == tea.id).all()
        total = len(records)
        success = sum(1 for r in records if r.review and r.review.is_successful == 1)
        rate = round(success / total * 100, 1) if total > 0 else 0
        result.append({"name": tea.name, "total": total, "success": success, "rate": rate})
    return result


@app.get("/api/statistics/failure-reasons")
def stats_failure_reasons(db: Session = Depends(get_db)):
    reasons = (
        db.query(models.Review.failure_reason, func.count(models.Review.id))
        .filter(models.Review.is_successful == 0, models.Review.failure_reason.isnot(None))
        .group_by(models.Review.failure_reason)
        .all()
    )
    total = sum(c for _, c in reasons)
    return [
        {"reason": r, "count": c, "percent": round(c / total * 100, 1) if total > 0 else 0}
        for r, c in reasons
    ]


@app.get("/api/statistics/pattern-stability")
def stats_pattern_stability(db: Session = Depends(get_db)):
    teas = db.query(models.TeaSample).all()
    techniques = db.query(models.PouringTechnique).all()
    result = []
    for tea in teas:
        for tech in techniques:
            records = (
                db.query(models.PracticeRecord)
                .filter(
                    models.PracticeRecord.tea_sample_id == tea.id,
                    models.PracticeRecord.technique_id == tech.id,
                )
                .all()
            )
            scored = [r.review.pattern_completeness_score for r in records if r.review]
            if len(scored) >= 2:
                mean = sum(scored) / len(scored)
                variance = sum((s - mean) ** 2 for s in scored) / len(scored)
                std = round(variance ** 0.5, 1)
                result.append(
                    {
                        "label": f"{tea.name}·{tech.name}",
                        "std": std,
                        "mean": round(mean, 1),
                        "count": len(scored),
                    }
                )
    result.sort(key=lambda x: x["std"])
    return result


@app.get("/api/statistics/duration-distribution")
def stats_duration(db: Session = Depends(get_db)):
    records = db.query(models.PracticeRecord).all()
    bins = [
        {"label": "0-120s", "min": 0, "max": 120, "count": 0},
        {"label": "120-180s", "min": 120, "max": 180, "count": 0},
        {"label": "180-240s", "min": 180, "max": 240, "count": 0},
        {"label": "240s+", "min": 240, "max": 9999, "count": 0},
    ]
    for r in records:
        for b in bins:
            if b["min"] <= r.whisking_duration_sec < b["max"]:
                b["count"] += 1
                break
    return [{"label": b["label"], "count": b["count"]} for b in bins]


def compute_plan_status(plan: models.TrainingPlan, db: Session) -> str:
    now = datetime.utcnow()
    sessions = db.query(models.TrainingSession).filter(models.TrainingSession.plan_id == plan.id).all()
    total_sessions = len(sessions)
    completed_sessions = sum(1 for s in sessions if s.status == "completed")
    if now < plan.start_date:
        return "not_started"
    if total_sessions > 0 and completed_sessions == total_sessions:
        return "completed"
    if now > plan.end_date:
        return "overdue"
    return "in_progress"


def build_plan_detail(plan: models.TrainingPlan, db: Session) -> schemas.TrainingPlanDetailOut:
    sessions = sorted(plan.sessions, key=lambda s: s.session_date)
    total_sessions = len(sessions)
    completed_sessions = sum(1 for s in sessions if s.status == "completed")
    linked_records = plan.practice_records
    linked_count = len(linked_records)
    reviewed_records = [r for r in linked_records if r.review]
    reviewed_count = len(reviewed_records)
    success_count = sum(1 for r in reviewed_records if r.review.is_successful == 1)
    achievement_rate = 0.0
    if total_sessions > 0:
        achievement_rate = round(completed_sessions / total_sessions * 100, 1)
    recent_reviews = []
    pending_improvements = []
    for r in reviewed_records[:5]:
        review_data = {
            "record_id": r.id,
            "practitioner_name": r.practitioner_name,
            "created_at": r.review.created_at,
            "teacher_name": r.review.teacher_name,
            "correction_suggestion": r.review.correction_suggestion,
            "is_successful": r.review.is_successful,
        }
        recent_reviews.append(review_data)
        if r.review.is_successful == 0 and r.review.correction_suggestion:
            pending_improvements.append(review_data)
    return schemas.TrainingPlanDetailOut(
        id=plan.id,
        name=plan.name,
        tea_sample_id=plan.tea_sample_id,
        target_pattern=plan.target_pattern,
        target_technique_id=plan.target_technique_id,
        start_date=plan.start_date,
        end_date=plan.end_date,
        weekly_frequency=plan.weekly_frequency,
        stage_goal=plan.stage_goal,
        teacher_name=plan.teacher_name,
        created_at=plan.created_at,
        tea_sample=plan.tea_sample,
        target_technique=plan.target_technique,
        sessions=sessions,
        completed_sessions=completed_sessions,
        linked_records_count=linked_count,
        reviewed_count=reviewed_count,
        success_count=success_count,
        achievement_rate=achievement_rate,
        recent_reviews=recent_reviews,
        pending_improvements=pending_improvements,
    )


@app.get("/api/training-plans", response_model=list[schemas.TrainingPlanOut])
def list_training_plans(
    tea_sample_id: int | None = None,
    teacher_name: str | None = None,
    status: str | None = Query(None, pattern="^(not_started|in_progress|completed|overdue)$"),
    db: Session = Depends(get_db),
):
    query = db.query(models.TrainingPlan)
    if tea_sample_id:
        query = query.filter(models.TrainingPlan.tea_sample_id == tea_sample_id)
    if teacher_name:
        query = query.filter(models.TrainingPlan.teacher_name.like(f"%{teacher_name}%"))
    plans = query.order_by(models.TrainingPlan.created_at.desc()).all()
    if status:
        plans = [p for p in plans if compute_plan_status(p, db) == status]
    return plans


@app.post("/api/training-plans", response_model=schemas.TrainingPlanOut)
def create_training_plan(payload: schemas.TrainingPlanCreate, db: Session = Depends(get_db)):
    get_or_404(db, models.TeaSample, payload.tea_sample_id)
    get_or_404(db, models.PouringTechnique, payload.target_technique_id)
    obj = models.TrainingPlan(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.get("/api/training-plans/{item_id}", response_model=schemas.TrainingPlanDetailOut)
def get_training_plan(item_id: int, db: Session = Depends(get_db)):
    plan = get_or_404(db, models.TrainingPlan, item_id)
    return build_plan_detail(plan, db)


@app.put("/api/training-plans/{item_id}", response_model=schemas.TrainingPlanOut)
def update_training_plan(item_id: int, payload: schemas.TrainingPlanUpdate, db: Session = Depends(get_db)):
    obj = get_or_404(db, models.TrainingPlan, item_id)
    return apply_update(db, obj, payload)


@app.delete("/api/training-plans/{item_id}")
def delete_training_plan(item_id: int, db: Session = Depends(get_db)):
    obj = get_or_404(db, models.TrainingPlan, item_id)
    db.delete(obj)
    db.commit()
    return {"ok": True}


@app.get("/api/training-plans/{plan_id}/sessions", response_model=list[schemas.TrainingSessionOut])
def list_plan_sessions(plan_id: int, db: Session = Depends(get_db)):
    get_or_404(db, models.TrainingPlan, plan_id)
    return (
        db.query(models.TrainingSession)
        .filter(models.TrainingSession.plan_id == plan_id)
        .order_by(models.TrainingSession.session_date.asc())
        .all()
    )


@app.post("/api/training-sessions", response_model=schemas.TrainingSessionOut)
def create_training_session(payload: schemas.TrainingSessionCreate, db: Session = Depends(get_db)):
    get_or_404(db, models.TrainingPlan, payload.plan_id)
    if payload.expected_tea_bowl_id:
        get_or_404(db, models.TeaBowl, payload.expected_tea_bowl_id)
    if payload.expected_tea_whisk_id:
        get_or_404(db, models.TeaWhisk, payload.expected_tea_whisk_id)
    obj = models.TrainingSession(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.put("/api/training-sessions/{item_id}", response_model=schemas.TrainingSessionOut)
def update_training_session(item_id: int, payload: schemas.TrainingSessionUpdate, db: Session = Depends(get_db)):
    obj = get_or_404(db, models.TrainingSession, item_id)
    return apply_update(db, obj, payload)


@app.delete("/api/training-sessions/{item_id}")
def delete_training_session(item_id: int, db: Session = Depends(get_db)):
    obj = get_or_404(db, models.TrainingSession, item_id)
    db.delete(obj)
    db.commit()
    return {"ok": True}


@app.get("/api/statistics/training-plans", response_model=list[schemas.TrainingPlanStatOut])
def stats_training_plans(db: Session = Depends(get_db)):
    plans = db.query(models.TrainingPlan).all()
    now = datetime.utcnow()
    result = []
    for plan in plans:
        detail = build_plan_detail(plan, db)
        total_sessions = len(plan.sessions)
        completed = detail.completed_sessions
        session_completion_rate = round(completed / total_sessions * 100, 1) if total_sessions > 0 else 0.0
        in_plan_success_rate = 0.0
        if detail.reviewed_count > 0:
            in_plan_success_rate = round(detail.success_count / detail.reviewed_count * 100, 1)
        overdue_count = sum(1 for s in plan.sessions if s.session_date < now and s.status != "completed")
        result.append(
            schemas.TrainingPlanStatOut(
                id=plan.id,
                name=plan.name,
                teacher_name=plan.teacher_name,
                achievement_rate=detail.achievement_rate,
                session_completion_rate=session_completion_rate,
                in_plan_success_rate=in_plan_success_rate,
                overdue_sessions_count=overdue_count,
                tea_sample_name=plan.tea_sample.name if plan.tea_sample else "—",
            )
        )
    return result


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=9552)
