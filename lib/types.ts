// ============================================================
// CloudPath Quiz — Type Definitions
// All TypeScript interfaces for the quiz data layer
// ============================================================

/** The 6 cloud career result paths */
export type ResultPath = "SA" | "CE" | "SEC" | "DML" | "SRE" | "CON";

/** All valid result path values, useful for validation */
export const RESULT_PATHS: ResultPath[] = ["SA", "CE", "SEC", "DML", "SRE", "CON"];

// -----------------------------------------------------------
// Questions
// -----------------------------------------------------------

export interface QuizQuestion {
  id: number;
  text: string;
  subtext: string | null;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  id: string;
  text: string;
  scores: Record<ResultPath, number>;
}

export interface QuestionsData {
  questions: QuizQuestion[];
}

// -----------------------------------------------------------
// Results
// -----------------------------------------------------------

export interface ResultData {
  path: ResultPath;
  title: string;
  archetype: string;
  emoji: string;
  accent_colour: string;
  description: string;
  day_in_the_life: string[];
  salary_ranges: SalaryRange[];
  certifications: CertRoute[];
  skills: string[];
  sholas_take: string;
  cta_primary: CTA;
  cta_secondary: CTA;
  share_text: string;
  og_description: string;
}

export interface SalaryRange {
  level: string;
  uk_gbp: string;
  us_usd: string;
  remote_global: string;
}

export interface CertRoute {
  route: "beginner" | "accelerated";
  description: string;
  first_cert: CertRecommendation;
  second_cert: CertRecommendation;
}

export interface CertRecommendation {
  name: string;
  code: string;
  provider: string;
  study_weeks: number;
  exam_cost_usd: number;
  why: string;
}

export interface CTA {
  text: string;
  url: string;
  utm_params: Record<string, string>;
}

export interface ResultsData {
  results: ResultData[];
}

// -----------------------------------------------------------
// Prompts
// -----------------------------------------------------------

export interface PromptTemplate {
  system_prompt: string;
  user_prompt_template: string;
  max_tokens: number;
  temperature: number;
}

export interface PromptsData {
  generate_result: PromptTemplate;
}

// -----------------------------------------------------------
// API Request / Response Types
// -----------------------------------------------------------

export interface GenerateResultRequest {
  answers: string[];
  result_path: ResultPath;
  first_name: string;
  scores: Record<ResultPath, number>;
}

export interface GenerateResultResponse {
  personalised_text: string;
  result_path: ResultPath;
}

export interface SubscribeRequest {
  email: string;
  first_name: string;
  result_path: ResultPath;
}

export interface SubscribeResponse {
  success: boolean;
}

// -----------------------------------------------------------
// Analytics Events
// -----------------------------------------------------------

export type AnalyticsEvent =
  | "quiz_start"
  | "question_complete"
  | "email_gate_view"
  | "email_submit"
  | "result_view"
  | "share_click";

export type SharePlatform = "linkedin" | "twitter" | "copy_link" | "download_badge";

// -----------------------------------------------------------
// Scoring
// -----------------------------------------------------------

export interface ScoreBreakdown {
  scores: Record<ResultPath, number>;
  winner: ResultPath;
}
