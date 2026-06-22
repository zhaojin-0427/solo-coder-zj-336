import axios from "axios";
import type {
  TeaSample,
  TeaBowl,
  TeaWhisk,
  PouringTechnique,
  PracticeRecord,
  PracticeRecordCreate,
  Review,
  ReviewCreate,
  Experience,
  ExperienceCreate,
  Overview,
  TeaSuccessStat,
  FailureReasonStat,
  StabilityStat,
  DurationBin,
  RecordStatus,
  TrainingPlan,
  TrainingPlanCreate,
  TrainingPlanDetail,
  TrainingSession,
  TrainingSessionCreate,
  TrainingSessionUpdate,
  TrainingPlanStat,
  PlanStatus,
} from "@/types";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

async function safe<T>(p: Promise<{ data: T }>): Promise<T> {
  const res = await p;
  return res.data;
}

export const teaSampleApi = {
  list: () => safe<TeaSample[]>(api.get("/tea-samples")),
  create: (data: Partial<TeaSample>) => safe<TeaSample>(api.post("/tea-samples", data)),
  update: (id: number, data: Partial<TeaSample>) => safe<TeaSample>(api.put(`/tea-samples/${id}`, data)),
  remove: (id: number) => safe<{ ok: boolean }>(api.delete(`/tea-samples/${id}`)),
};

export const teaBowlApi = {
  list: () => safe<TeaBowl[]>(api.get("/tea-bowls")),
  create: (data: Partial<TeaBowl>) => safe<TeaBowl>(api.post("/tea-bowls", data)),
  update: (id: number, data: Partial<TeaBowl>) => safe<TeaBowl>(api.put(`/tea-bowls/${id}`, data)),
  remove: (id: number) => safe<{ ok: boolean }>(api.delete(`/tea-bowls/${id}`)),
};

export const teaWhiskApi = {
  list: () => safe<TeaWhisk[]>(api.get("/tea-whisks")),
  create: (data: Partial<TeaWhisk>) => safe<TeaWhisk>(api.post("/tea-whisks", data)),
  update: (id: number, data: Partial<TeaWhisk>) => safe<TeaWhisk>(api.put(`/tea-whisks/${id}`, data)),
  remove: (id: number) => safe<{ ok: boolean }>(api.delete(`/tea-whisks/${id}`)),
};

export const techniqueApi = {
  list: () => safe<PouringTechnique[]>(api.get("/pouring-techniques")),
  create: (data: Partial<PouringTechnique>) => safe<PouringTechnique>(api.post("/pouring-techniques", data)),
  update: (id: number, data: Partial<PouringTechnique>) => safe<PouringTechnique>(api.put(`/pouring-techniques/${id}`, data)),
  remove: (id: number) => safe<{ ok: boolean }>(api.delete(`/pouring-techniques/${id}`)),
};

export const recordApi = {
  list: (params?: { tea_sample_id?: number; status?: RecordStatus }) =>
    safe<PracticeRecord[]>(api.get("/practice-records", { params })),
  get: (id: number) => safe<PracticeRecord>(api.get(`/practice-records/${id}`)),
  create: (data: PracticeRecordCreate) => safe<PracticeRecord>(api.post("/practice-records", data)),
  remove: (id: number) => safe<{ ok: boolean }>(api.delete(`/practice-records/${id}`)),
};

export const reviewApi = {
  list: (pending?: boolean) => safe<Review[]>(api.get("/reviews", { params: { pending } })),
  create: (data: ReviewCreate) => safe<Review>(api.post("/reviews", data)),
};

export const experienceApi = {
  list: () => safe<Experience[]>(api.get("/experiences")),
  create: (data: ExperienceCreate) => safe<Experience>(api.post("/experiences", data)),
};

export const statsApi = {
  overview: () => safe<Overview>(api.get("/statistics/overview")),
  teaSuccess: () => safe<TeaSuccessStat[]>(api.get("/statistics/tea-sample-success")),
  failureReasons: () => safe<FailureReasonStat[]>(api.get("/statistics/failure-reasons")),
  stability: () => safe<StabilityStat[]>(api.get("/statistics/pattern-stability")),
  duration: () => safe<DurationBin[]>(api.get("/statistics/duration-distribution")),
  trainingPlans: () => safe<TrainingPlanStat[]>(api.get("/statistics/training-plans")),
};

export const trainingPlanApi = {
  list: (params?: { tea_sample_id?: number; teacher_name?: string; status?: PlanStatus }) =>
    safe<TrainingPlan[]>(api.get("/training-plans", { params })),
  get: (id: number) => safe<TrainingPlanDetail>(api.get(`/training-plans/${id}`)),
  create: (data: TrainingPlanCreate) => safe<TrainingPlan>(api.post("/training-plans", data)),
  update: (id: number, data: Partial<TrainingPlanCreate>) =>
    safe<TrainingPlan>(api.put(`/training-plans/${id}`, data)),
  remove: (id: number) => safe<{ ok: boolean }>(api.delete(`/training-plans/${id}`)),
  listSessions: (planId: number) =>
    safe<TrainingSession[]>(api.get(`/training-plans/${planId}/sessions`)),
};

export const trainingSessionApi = {
  create: (data: TrainingSessionCreate) => safe<TrainingSession>(api.post("/training-sessions", data)),
  update: (id: number, data: TrainingSessionUpdate) =>
    safe<TrainingSession>(api.put(`/training-sessions/${id}`, data)),
  remove: (id: number) => safe<{ ok: boolean }>(api.delete(`/training-sessions/${id}`)),
};
