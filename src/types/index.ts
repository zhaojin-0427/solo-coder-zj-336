export interface TeaSample {
  id: number;
  name: string;
  origin?: string;
  roast_level?: string;
  grind_fineness?: string;
  year?: number;
  notes?: string;
  created_at: string;
}

export interface TeaBowl {
  id: number;
  name: string;
  kiln?: string;
  glaze?: string;
  capacity_ml?: number;
  notes?: string;
  created_at: string;
}

export interface TeaWhisk {
  id: number;
  name: string;
  prong_count?: number;
  material?: string;
  age_years?: number;
  notes?: string;
  created_at: string;
}

export interface PouringTechnique {
  id: number;
  name: string;
  water_temp_c?: number;
  pour_speed?: string;
  description?: string;
  created_at: string;
}

export interface Review {
  id: number;
  practice_record_id: number;
  teacher_name: string;
  foam_delicacy_score: number;
  cup_biting_duration_sec: number;
  pattern_completeness_score: number;
  correction_suggestion?: string;
  is_successful: number;
  failure_reason?: string;
  archive_as_experience: number;
  experience_key_points?: string;
  created_at: string;
}

export interface PracticeRecord {
  id: number;
  practitioner_name: string;
  tea_sample_id: number;
  tea_bowl_id: number;
  tea_whisk_id: number;
  technique_id: number;
  tea_powder_grams: number;
  water_pour_rounds: number;
  whisking_duration_sec: number;
  foam_state: string;
  pattern_description?: string;
  pattern_photo_url?: string;
  pattern_seed?: number;
  training_plan_id?: number;
  training_session_id?: number;
  created_at: string;
  tea_sample?: TeaSample;
  tea_bowl?: TeaBowl;
  tea_whisk?: TeaWhisk;
  technique?: PouringTechnique;
  review?: Review;
  training_plan?: TrainingPlan;
  training_session?: TrainingSession;
}

export interface Experience {
  id: number;
  tea_sample_id: number;
  technique_id: number;
  summary: string;
  key_points?: string;
  success_count: number;
  total_count: number;
  created_at: string;
  tea_sample?: TeaSample;
  technique?: PouringTechnique;
}

export interface ExperienceCreate {
  tea_sample_id: number;
  technique_id: number;
  summary: string;
  key_points?: string;
}

export interface Overview {
  total_records: number;
  total_reviews: number;
  success_count: number;
  fail_count: number;
  success_rate: number;
  pending_reviews: number;
  total_teas: number;
  total_bowls: number;
  total_whisks: number;
  total_techniques: number;
  total_experiences: number;
}

export interface TeaSuccessStat {
  name: string;
  total: number;
  success: number;
  rate: number;
}

export interface FailureReasonStat {
  reason: string;
  count: number;
  percent: number;
}

export interface StabilityStat {
  label: string;
  std: number;
  mean: number;
  count: number;
}

export interface DurationBin {
  label: string;
  count: number;
}

export type RecordStatus = "all" | "success" | "fail" | "pending";

export interface PracticeRecordCreate {
  practitioner_name: string;
  tea_sample_id: number;
  tea_bowl_id: number;
  tea_whisk_id: number;
  technique_id: number;
  tea_powder_grams: number;
  water_pour_rounds: number;
  whisking_duration_sec: number;
  foam_state: string;
  pattern_description?: string;
  pattern_photo_url?: string;
  training_plan_id?: number;
  training_session_id?: number;
}

export interface ReviewCreate {
  practice_record_id: number;
  teacher_name: string;
  foam_delicacy_score: number;
  cup_biting_duration_sec: number;
  pattern_completeness_score: number;
  correction_suggestion?: string;
  is_successful: boolean;
  failure_reason?: string;
  archive_as_experience: boolean;
  experience_key_points?: string;
}

export type PlanStatus = "not_started" | "in_progress" | "completed" | "overdue";

export type SessionStatus = "scheduled" | "completed" | "cancelled";

export interface TrainingPlan {
  id: number;
  name: string;
  tea_sample_id: number;
  target_pattern?: string;
  target_technique_id: number;
  start_date: string;
  end_date: string;
  weekly_frequency: number;
  stage_goal?: string;
  teacher_name: string;
  created_at: string;
  tea_sample?: TeaSample;
  target_technique?: PouringTechnique;
  status?: PlanStatus;
}

export interface TrainingPlanCreate {
  name: string;
  tea_sample_id: number;
  target_pattern?: string;
  target_technique_id: number;
  start_date: string;
  end_date: string;
  weekly_frequency: number;
  stage_goal?: string;
  teacher_name: string;
}

export interface TrainingSession {
  id: number;
  plan_id: number;
  session_date: string;
  practitioner_name: string;
  expected_tea_bowl_id?: number;
  expected_tea_whisk_id?: number;
  status: SessionStatus;
  pre_session_tip?: string;
  created_at: string;
  expected_tea_bowl?: TeaBowl;
  expected_tea_whisk?: TeaWhisk;
}

export interface TrainingSessionCreate {
  plan_id: number;
  session_date: string;
  practitioner_name: string;
  expected_tea_bowl_id?: number;
  expected_tea_whisk_id?: number;
  status?: SessionStatus;
  pre_session_tip?: string;
}

export interface TrainingSessionUpdate {
  session_date?: string;
  practitioner_name?: string;
  expected_tea_bowl_id?: number;
  expected_tea_whisk_id?: number;
  status?: SessionStatus;
  pre_session_tip?: string;
}

export interface PlanReviewInfo {
  record_id: number;
  practitioner_name: string;
  created_at: string;
  teacher_name: string;
  correction_suggestion?: string;
  is_successful: number;
}

export interface TrainingPlanDetail extends TrainingPlan {
  sessions: TrainingSession[];
  completed_sessions: number;
  linked_records_count: number;
  reviewed_count: number;
  success_count: number;
  achievement_rate: number;
  recent_reviews: PlanReviewInfo[];
  pending_improvements: PlanReviewInfo[];
}

export interface TrainingPlanStat {
  id: number;
  name: string;
  teacher_name: string;
  achievement_rate: number;
  session_completion_rate: number;
  in_plan_success_rate: number;
  overdue_sessions_count: number;
  tea_sample_name: string;
}

export interface PlanListFilters {
  tea_sample_id?: number;
  teacher_name?: string;
  status?: PlanStatus;
}
