export interface User {
  id: number;
  name: string;
  email: string;
  username?: string | null;
  role: "USER" | "ADMIN";
  status: "PENDING" | "APPROVED" | "REJECTED";
  gender?: string;
  governorate?: string;
  nationalIdMasked?: string;
  departmentId?: number | null;
  department?: Department;
  score?: number;
  points?: number;
  level?: string;
  mustChangePassword?: boolean;
  badges?: Badge[];
  taskCount?: number;
  createdAt?: string;
  lastActive?: string;
  profilePicture?: string | null;
  phone?: string | null;
  rejectionReason?: string;
  currentVpi?: number;
  cumulativeVpi?: number;
  totalVolunteerHours?: number;
  requiredMonthlyHours?: number;
}

export interface Image {
  id: number;
  url: string;
  description: string | null;
  uploadedBy: number;
  user?: { id: number; name: string; email: string };
  createdAt: string;
}

export interface Department {
  id: number;
  name: string;
  headName: string;
  viceName: string;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  mustChangePassword?: boolean;
  user: User;
}

export interface SignupResponse {
  message: string;
  user: Pick<User, "id" | "name" | "email" | "status">;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  deadline?: string;
  points?: number;
  departmentId: number | null;
  createdAt: string;
  department?: Department;
  submissions?: TaskSubmission[];
}

export interface TaskSubmission {
  id: number;
  taskId: number;
  userId: number;
  fileUrl: string | null;
  notes: string | null;
  isOnTime?: boolean;
  quality?: string;
  initiative?: boolean;
  letterGrade?: string;
  gradeValue?: number;
  approvedHours?: number;
  createdAt: string;
  user?: User;
  task?: Task;
}

export interface Meeting {
  id: number;
  title: string;
  link: string;
  date: string;
  time: string;
  active: boolean;
}

export interface Badge {
  id: number;
  key: string;
  name: string;
  nameAr: string;
  description: string;
  icon: string;
  color: string;
  points: number;
  earnedAt?: string;
}

export interface ScoreBreakdown {
  tasks: number;
  deadlines: number;
  attendance: number;
  engagement: number;
  total: number;
}

export interface ScoreLog {
  id: number;
  userId: number;
  delta: number;
  reason: string;
  category: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface AiInsight {
  type: "warning" | "suggestion" | "info" | "danger";
  title: string;
  message: string;
  action?: string;
  priority: number;
}

export interface KpiDepartment {
  id: number;
  name: string;
  memberCount: number;
  taskCount: number;
  completionRate: number;
  avgScore: number;
  deadlineRate: number;
  kpiHistory: KpiSnapshot[];
}

export interface KpiSnapshot {
  id: number;
  departmentId: number;
  week: string;
  taskCompletion: number;
  avgTime: number;
  attendance: number;
  activityScore: number;
  missedDeadlines: number;
}

export interface LeaderboardEntry {
  rank: number;
  id: number;
  name: string;
  username?: string;
  score: number;
  points: number;
  level: string;
  governorate?: string;
  department?: { id: number; name: string };
  badges: { icon: string; key: string; nameAr: string }[];
}

export interface AnalyticsData {
  totalMembers: number;
  governorateData: { name: string; count: number }[];
  genderData: { name: string; value: number }[];
  levelData: { name: string; value: number }[];
  scoreDistribution: { range: string; count: number }[];
  monthlyRegistrations: { month: string; count: number }[];
}

export interface ActivityLog {
  id: number;
  userId?: number;
  action: string;
  details?: string;
  ip?: string;
  severity: string;
  createdAt: string;
  user?: { id: number; name: string; email: string };
}

export interface VpiRecord {
  id: number;
  userId: number;
  month: string;
  taskPerformance: number;
  monthlyPoints: number;
  completedHours: number;
  requiredHours: number;
  vpiScore: number;
  bonusPoints: number;
  deductions: number;
  departmentRank: number;
  overallRank: number;
  createdAt: string;
}

export interface MonthlyEvaluation {
  id: number;
  userId: number;
  month: string;
  evaluatorId?: number;
  attendance: number;
  taskCompletion: number;
  timeCommitment: number;
  reportQuality: number;
  technicalSkills: number;
  professionalConduct: number;
  innovation: number;
  policyCompliance: number;
  teamCollaboration: number;
  positiveContribution: number;
  totalScore: number;
  notes?: string;
  createdAt: string;
  user?: User;
}

export interface VolunteerHour {
  id: number;
  userId: number;
  month: string;
  hours: number;
  description?: string;
  category: string;
  proofUrl?: string;
  isApproved: boolean;
  approvedBy?: number;
  taskSubmissionId?: number;
  createdAt: string;
}

export interface OfficialDocument {
  id: number;
  userId: number;
  type: string;
  purpose?: string;
  title: string;
  titleAr: string;
  content?: string;
  documentUrl?: string;
  issuedBy?: string;
  referenceNo?: string;
  createdAt: string;
  user?: User;
}

export interface RecruitmentApplication {
  id: number;
  userId: number;
  currentStage: string;
  englishScore?: number;
  personalityScore?: number;
  technicalScore?: number;
  stage1Completed: boolean;
  stage1Date?: string;
  interviewScore?: number;
  interviewNotes?: string;
  interviewerId?: number;
  stage2Completed: boolean;
  stage2Date?: string;
  simulationScore?: number;
  simulationNotes?: string;
  stage3Completed: boolean;
  stage3Date?: string;
  finalDecision?: string;
  decisionNotes?: string;
  createdAt: string;
  user?: User;
}
