import random
from datetime import datetime, timedelta

from database import engine, SessionLocal, Base
import models

Base.metadata.create_all(bind=engine)


def seed_if_empty():
    db = SessionLocal()
    try:
        if db.query(models.TeaSample).count() > 0:
            return

        tea_samples = [
            models.TeaSample(name="白茶一号", origin="福建福鼎", roast_level="轻焙", grind_fineness="极细", year=2024, notes="芽头肥壮，茶汤清雅"),
            models.TeaSample(name="龙团胜雪", origin="福建建瓯", roast_level="中焙", grind_fineness="细", year=2023, notes="复刻宋式龙团，膏饼浓稠"),
            models.TeaSample(name="抹茶青", origin="浙江杭州", roast_level="蒸青", grind_fineness="超细", year=2024, notes="色泽翠绿，宜作茶百戏"),
        ]
        db.add_all(tea_samples)
        db.commit()

        tea_bowls = [
            models.TeaBowl(name="兔毫盏甲", kiln="建窑", glaze="兔毫", capacity_ml=120, notes="毫纹清晰，聚香佳"),
            models.TeaBowl(name="油滴盏乙", kiln="建窑", glaze="油滴", capacity_ml=130, notes="星点莹润，显汤花"),
            models.TeaBowl(name="青瓷小盏", kiln="龙泉窑", glaze="粉青", capacity_ml=110, notes="釉色温润，宜观色"),
        ]
        db.add_all(tea_bowls)
        db.commit()

        tea_whisks = [
            models.TeaWhisk(name="七十二穗筅", prong_count=72, material="老竹", age_years=1.5, notes="穗密而柔，击拂细腻"),
            models.TeaWhisk(name="三十六穗筅", prong_count=36, material="新竹", age_years=0.5, notes="穗粗力足，宜起沫"),
        ]
        db.add_all(tea_whisks)
        db.commit()

        techniques = [
            models.PouringTechnique(name="高冲低斟", water_temp_c=85, pour_speed="先快后慢", description="高悬注汤激茶香，低斟定沫"),
            models.PouringTechnique(name="环绕注汤", water_temp_c=80, pour_speed="匀速环绕", description="沿盏壁环注，使茶粉旋起"),
            models.PouringTechnique(name="点滴注汤", water_temp_c=90, pour_speed="缓慢点滴", description="少量多次，适宜细沫"),
        ]
        db.add_all(techniques)
        db.commit()

        foam_states = ["细密如雪", "粗散易消", "乳白绵厚", "薄而不匀", "凝乳咬盏"]
        failure_reasons = ["沫饽粗散", "咬盏时长不足", "纹样断裂", "汤花未起", "水量过多"]

        now = datetime.utcnow()
        records_data = [
            ("张清和", 1, 1, 1, 1, 2.5, 3, 180, "细密如雪", "竹枝斜出，留白处似远山"),
            ("张清和", 2, 2, 2, 1, 3.0, 4, 220, "乳白绵厚", "兰叶三笔，汤花咬盏久"),
            ("李墨白", 1, 1, 2, 2, 2.0, 2, 150, "粗散易消", "纹样未成形，茶汤稀薄"),
            ("李墨白", 3, 3, 1, 3, 2.8, 3, 200, "凝乳咬盏", "梅枝疏影，留白得当"),
            ("王听松", 2, 2, 1, 1, 3.2, 4, 240, "薄而不匀", "纹样初现即散"),
            ("王听松", 3, 1, 2, 2, 2.6, 3, 190, "细密如雪", "云纹舒卷，复现稳定"),
            ("张清和", 1, 2, 1, 3, 2.4, 3, 210, "凝乳咬盏", "松针细描，纹样完整"),
            ("李墨白", 3, 3, 1, 1, 3.0, 4, 230, "薄而不匀", "汤花未起，纹样难绘"),
        ]

        photo_placeholders = [
            "bamboo_slope", "orchid_three", "empty_scatter", "plum_shadow",
            "early_dissolve", "cloud_roll", "pine_needle", "no_foam",
        ]
        for i, (pn, ts, tb, tw, tc, grams, rounds, dur, foam, desc) in enumerate(records_data):
            rec = models.PracticeRecord(
                practitioner_name=pn,
                tea_sample_id=ts,
                tea_bowl_id=tb,
                tea_whisk_id=tw,
                technique_id=tc,
                tea_powder_grams=grams,
                water_pour_rounds=rounds,
                whisking_duration_sec=dur,
                foam_state=foam,
                pattern_description=desc,
                pattern_photo_url=photo_placeholders[i],
                pattern_seed=random.randint(1000, 9999),
                created_at=now - timedelta(days=8 - i),
            )
            db.add(rec)
            db.commit()
            db.refresh(rec)

            if i in (0, 1, 3, 5, 6):
                is_success = True
                reason = None
                suggestion = "汤花细腻，咬盏充分，纹样复现稳定，可作示范。"
            else:
                is_success = False
                reason = failure_reasons[i % len(failure_reasons)]
                suggestion = "注水宜匀，击拂时手腕发力下沉，待汤花凝乳再行茶百戏。"

            review = models.Review(
                practice_record_id=rec.id,
                teacher_name="陈老师",
                foam_delicacy_score=random.randint(70, 95) if is_success else random.randint(40, 65),
                cup_biting_duration_sec=random.randint(40, 120) if is_success else random.randint(5, 25),
                pattern_completeness_score=random.randint(75, 95) if is_success else random.randint(30, 55),
                correction_suggestion=suggestion,
                is_successful=1 if is_success else 0,
                failure_reason=reason,
                created_at=rec.created_at + timedelta(hours=2),
            )
            db.add(review)
        db.commit()

        experiences = [
            models.Experience(
                tea_sample_id=1,
                technique_id=1,
                summary="白茶一号配高冲低斟，汤花细密如雪，咬盏可达90秒以上",
                key_points="茶粉2.5g、注水3轮、击拂180秒、水温85度",
                success_count=3,
                total_count=4,
            ),
            models.Experience(
                tea_sample_id=3,
                technique_id=2,
                summary="抹茶青配环绕注汤，色泽翠绿宜作茶百戏，复现稳定",
                key_points="茶粉2.6g、注水3轮、击拂190秒、环绕匀速",
                success_count=2,
                total_count=3,
            ),
            models.Experience(
                tea_sample_id=2,
                technique_id=1,
                summary="龙团胜雪膏饼浓稠，需延长击拂至220秒方可起沫",
                key_points="茶粉3.0g、注水4轮、击拂220秒、先快后慢",
                success_count=2,
                total_count=3,
            ),
        ]
        db.add_all(experiences)
        db.commit()

        print("Seed data inserted successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_if_empty()
