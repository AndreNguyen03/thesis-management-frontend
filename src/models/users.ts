export type Role = 'student' | 'teacher' | 'admin'

export interface StudentProfile {
  year: number
  majorSubjects: string[]
  skills: string[]
  careerOrientation: string[]
  gpa: number
}

export interface ResearchStats {
  totalProjects: number
  completedProjects: number
  excellentProjects: number
  goodProjects: number
  averageProjects: number
  successRate: string
}

export interface PublishedResearch {
  title: string
  journal?: string
  conference?: string
  year: number
  link?: string
}

export interface TeacherOngoingProject {
  projectId: string
  title: string
  field?: string
  year?: number
  startDate?: string
}

export interface TeacherCompletedProject {
  projectId: string
  title: string
  field?: string
  year?: number
}

export interface TeacherProfile {
  title: string
  department: string
  university: string
  phone: string
  officeLocation: string
  expertise: string[]
  researchStats: ResearchStats
  publishedResearch: PublishedResearch[]
  ongoingProjects: TeacherOngoingProject[]
  completedProjects: TeacherCompletedProject[]
}

export interface User {
  id: string
  username: string
  email: string
  fullName?: string
  role: Role
  isActive: boolean
  studentProfile?: StudentProfile
  teacherProfile?: TeacherProfile
  createdAt: string
  updatedAt: string
}
