
import type { RegistrationPeriod, Topic, PhaseStats } from "@/models/period";

export const mockPeriods: RegistrationPeriod[] = [
  {
    id: "1",
    name: "Đợt đăng ký Tốt nghiệp HK1 2024-2025",
    startDate: "2024-09-01",
    endDate: "2025-01-30",
    status: "ongoing",
    currentPhase: 2,
    totalTopics: 145,
  },
  {
    id: "2",
    name: "Đợt đăng ký Tốt nghiệp HK2 2023-2024",
    startDate: "2024-02-01",
    endDate: "2024-06-30",
    status: "completed",
    currentPhase: 4,
    totalTopics: 187,
  },
  {
    id: "3",
    name: "Đợt đăng ký Tốt nghiệp HK2 2024-2025",
    startDate: "2025-02-01",
    endDate: "2025-06-30",
    status: "completed",
    currentPhase: 1,
    totalTopics: 0,
  },
];

export const mockTopicsPhase1: Topic[] = [
  {
    id: "T001",
    title: "Xây dựng hệ thống quản lý thư viện điện tử",
    instructor: "TS. Nguyễn Văn A",
    status: "approved",
    submittedAt: "2024-09-15",
  },
  {
    id: "T002",
    title: "Ứng dụng AI trong phân tích dữ liệu y tế",
    instructor: "PGS. Trần Thị B",
    status: "pending",
    submittedAt: "2024-09-18",
  },
  {
    id: "T003",
    title: "Phát triển ứng dụng mobile cho Smart Home",
    instructor: "TS. Lê Văn C",
    status: "rejected",
    submittedAt: "2024-09-12",
  },
];

export const mockTopicsPhase2: Topic[] = [
  {
    id: "T001",
    title: "Xây dựng hệ thống quản lý thư viện điện tử",
    instructor: "TS. Nguyễn Văn A",
    status: "approved",
    submittedAt: "2024-09-15",
    registrationCount: 3,
    student: "Trần Văn X",
  },
  {
    id: "T004",
    title: "Hệ thống giám sát giao thông thông minh",
    instructor: "TS. Phạm Thị D",
    status: "approved",
    submittedAt: "2024-09-20",
    registrationCount: 0,
  },
];

export const mockTopicsPhase3: Topic[] = [
  {
    id: "T001",
    title: "Xây dựng hệ thống quản lý thư viện điện tử",
    instructor: "TS. Nguyễn Văn A",
    student: "Trần Văn X",
    status: "in_progress",
    submittedAt: "2024-09-15",
    progress: 65,
  },
  {
    id: "T005",
    title: "Phân tích cảm xúc trên mạng xã hội",
    instructor: "PGS. Trần Thị B",
    student: "Nguyễn Thị Y",
    status: "paused",
    submittedAt: "2024-09-18",
    progress: 40,
  },
];

export const mockTopicsPhase4: Topic[] = [
  {
    id: "T001",
    title: "Xây dựng hệ thống quản lý thư viện điện tử",
    instructor: "TS. Nguyễn Văn A",
    student: "Trần Văn X",
    status: "completed",
    submittedAt: "2024-09-15",
    score: 8.5,
    reportFile: "report_T001.pdf",
  },
  {
    id: "T002",
    title: "Ứng dụng AI trong phân tích dữ liệu y tế",
    instructor: "PGS. Trần Thị B",
    student: "Lê Thị Z",
    status: "completed",
    submittedAt: "2024-09-18",
    score: 9.0,
    reportFile: "report_T002.pdf",
  },
];

export const getPhaseStats = (phase: number): PhaseStats[] => {
  switch (phase) {
    case 1:
      return [
        { label: "Đề tài đã nộp", value: 145, variant: "default" },
        { label: "Chờ xem xét", value: 23, variant: "warning" },
        { label: "Đã duyệt", value: 98, variant: "success" },
        { label: "Bị từ chối", value: 24, variant: "destructive" },
      ];
    case 2:
      return [
        { label: "Đang mở đăng ký", value: 98, variant: "default" },
        { label: "Đã có sinh viên", value: 72, variant: "success" },
        { label: "Chưa có sinh viên", value: 26, variant: "warning" },
        { label: "Tổng SV đăng ký", value: 156, variant: "default" },
      ];
    case 3:
      return [
        { label: "Đang thực hiện", value: 72, variant: "default" },
        { label: "Tạm dừng", value: 8, variant: "warning" },
        { label: "Đã hoàn thành", value: 18, variant: "success" },
        { label: "Gặp vấn đề", value: 2, variant: "destructive" },
      ];
    case 4:
      return [
        { label: "Đã hoàn tất", value: 72, variant: "success" },
        { label: "Lưu thư viện", value: 68, variant: "default" },
        { label: "Chờ chấm", value: 4, variant: "warning" },
        { label: "Bị từ chối", value: 0, variant: "destructive" },
      ];
    default:
      return [];
  }
};
