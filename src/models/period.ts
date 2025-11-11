export type PeriodStatus =  "ongoing" | "completed";
export type PhaseType = 1 | 2 | 3 | 4;
export type TopicStatus = 
  | "pending" 
  | "approved" 
  | "rejected" 
  | "in_progress" 
  | "paused" 
  | "completed";

export interface RegistrationPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: PeriodStatus;
  currentPhase: PhaseType;
  totalTopics: number;
}

export interface Topic {
  id: string;
  title: string;
  instructor: string;
  student?: string;
  status: TopicStatus;
  submittedAt: string;
  registrationCount?: number;
  progress?: number;
  score?: number;
  reportFile?: string;
}

export interface PhaseStats {
  label: string;
  value: number;
  variant?: "default" | "success" | "warning" | "destructive";
}

export interface Phase {
  id: PhaseType;
  name: string;
  description: string;
  status: "inactive" | "active" | "completed";
}
