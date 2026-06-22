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
    columns = {col["name"] for col in inspector.get_columns("review")}
    with engine.begin() as conn:
        if "archive_as_experience" not in columns:
            conn.execute(text("ALTER TABLE review ADD COLUMN archive_as_experience INTEGER NOT NULL DEFAULT 0"))
        if "experience_key_points" not in columns:
            conn.execute(text("ALTER TABLE review ADD COLUMN experience_key_points TEXT"))


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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=9552)
