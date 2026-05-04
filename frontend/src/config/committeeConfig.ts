import {
  Users, UserPlus, CalendarCheck, ClipboardList, Award, BarChart3, FileCheck,
  Handshake, Globe, Mail, TrendingUp, Contact, Megaphone,
  Settings, Package, AlertTriangle, Cog, CheckSquare,
  BookOpen, GraduationCap, Presentation, Brain,
  PenTool, Hash, Zap, Image,
  LayoutDashboard, Target, MessageSquare, Bell, Cpu
} from "lucide-react";

export type CommitteeId = "hr" | "pr" | "or" | "training" | "social";

export interface CommitteeConfig {
  id: CommitteeId;
  name: string;
  nameAr: string;
  description: string;
  themeClass: string;
  colors: {
    primary: string;
    primaryLight: string;
    secondary: string;
    gradient: string;
    gradientText: string;
  };
  icon: any;
  navItems: { id: string; label: string; icon: any }[];
  quickActions: { label: string; icon: any; action: string }[];
  kpis: { label: string; key: string; icon: any; format?: string }[];
}

export const COMMITTEE_CONFIGS: Record<CommitteeId, CommitteeConfig> = {
  hr: {
    id: "hr",
    name: "Human Resources",
    nameAr: "الموارد البشرية",
    description: "Member recruitment, performance evaluation, and team management",
    themeClass: "committee-hr",
    colors: {
      primary: "#3b82f6",
      primaryLight: "#60a5fa",
      secondary: "#10b981",
      gradient: "linear-gradient(135deg, #3b82f6, #10b981)",
      gradientText: "linear-gradient(135deg, #60a5fa, #34d399)",
    },
    icon: Users,
    navItems: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "recruitment", label: "Recruitment Pipeline", icon: UserPlus },
      { id: "members", label: "Member Database", icon: Users },
      { id: "attendance", label: "Attendance", icon: CalendarCheck },
      { id: "evaluations", label: "Evaluations", icon: ClipboardList },
      { id: "certificates", label: "Certificates", icon: Award },
      { id: "analytics", label: "Analytics", icon: BarChart3 },
      { id: "onboarding", label: "Onboarding", icon: FileCheck },
      { id: "tasks", label: "Tasks", icon: CheckSquare },
    ],
    quickActions: [
      { label: "Schedule Interview", icon: CalendarCheck, action: "schedule-interview" },
      { label: "Issue Certificate", icon: Award, action: "issue-certificate" },
      { label: "View Reports", icon: BarChart3, action: "view-reports" },
    ],
    kpis: [
      { label: "Total Members", key: "totalMembers", icon: Users },
      { label: "Pending Applications", key: "pendingApps", icon: UserPlus },
      { label: "Retention Rate", key: "retentionRate", icon: TrendingUp, format: "percent" },
      { label: "Avg Performance", key: "avgPerformance", icon: Target, format: "score" },
    ],
  },

  pr: {
    id: "pr",
    name: "Public Relations",
    nameAr: "العلاقات العامة",
    description: "Partnership management, sponsorship tracking, and external communications",
    themeClass: "committee-pr",
    colors: {
      primary: "#8b5cf6",
      primaryLight: "#a78bfa",
      secondary: "#f59e0b",
      gradient: "linear-gradient(135deg, #8b5cf6, #f59e0b)",
      gradientText: "linear-gradient(135deg, #a78bfa, #fbbf24)",
    },
    icon: Handshake,
    navItems: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "partnerships", label: "Partnerships", icon: Handshake },
      { id: "sponsors", label: "Sponsors", icon: Award },
      { id: "communications", label: "Communications", icon: Mail },
      { id: "contacts", label: "Contact CRM", icon: Contact },
      { id: "outreach", label: "Outreach Pipeline", icon: Globe },
      { id: "analytics", label: "Analytics", icon: BarChart3 },
      { id: "tasks", label: "Tasks", icon: CheckSquare },
    ],
    quickActions: [
      { label: "New Partnership", icon: Handshake, action: "new-partnership" },
      { label: "Send Outreach", icon: Mail, action: "send-outreach" },
      { label: "View Analytics", icon: BarChart3, action: "view-analytics" },
    ],
    kpis: [
      { label: "Active Partners", key: "activePartners", icon: Handshake },
      { label: "Sponsor Revenue", key: "sponsorRevenue", icon: Award },
      { label: "Outreach Rate", key: "outreachRate", icon: Globe, format: "percent" },
      { label: "Reputation Score", key: "reputationScore", icon: TrendingUp, format: "score" },
    ],
  },

  or: {
    id: "or",
    name: "Operations",
    nameAr: "العمليات",
    description: "Operations workflow, resource allocation, and logistics tracking",
    themeClass: "committee-or",
    colors: {
      primary: "#f97316",
      primaryLight: "#fb923c",
      secondary: "#1e3a5f",
      gradient: "linear-gradient(135deg, #f97316, #1e3a5f)",
      gradientText: "linear-gradient(135deg, #fb923c, #60a5fa)",
    },
    icon: Cog,
    navItems: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "workflows", label: "Workflows", icon: Settings },
      { id: "tasks", label: "Task Distribution", icon: ClipboardList },
      { id: "incidents", label: "Incidents", icon: AlertTriangle },
      { id: "analytics", label: "Analytics", icon: TrendingUp },
      { id: "committee-tasks", label: "Committee Tasks", icon: CheckSquare },
    ],
    quickActions: [
      { label: "New Workflow", icon: Settings, action: "new-workflow" },
      { label: "Report Incident", icon: AlertTriangle, action: "report-incident" },
      { label: "View Dashboard", icon: BarChart3, action: "view-dashboard" },
    ],
    kpis: [
      { label: "Active Workflows", key: "activeWorkflows", icon: Settings },
      { label: "Efficiency Rate", key: "efficiencyRate", icon: TrendingUp, format: "percent" },
      { label: "Open Incidents", key: "openIncidents", icon: AlertTriangle },
    ],
  },

  training: {
    id: "training",
    name: "Training & Development",
    nameAr: "التدريب والتطوير",
    description: "Training programs, session management, and skill development",
    themeClass: "committee-training",
    colors: {
      primary: "#06b6d4",
      primaryLight: "#22d3ee",
      secondary: "#6366f1",
      gradient: "linear-gradient(135deg, #06b6d4, #6366f1)",
      gradientText: "linear-gradient(135deg, #22d3ee, #818cf8)",
    },
    icon: GraduationCap,
    navItems: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "tasks", label: "Tasks", icon: CheckSquare },
      { id: "programs", label: "Programs", icon: BookOpen },
      { id: "sessions", label: "Sessions", icon: Presentation },
      { id: "attendance", label: "Attendance", icon: CalendarCheck },
      { id: "progress", label: "Progress", icon: TrendingUp },
      { id: "certifications", label: "Certifications", icon: Award },
      { id: "instructors", label: "Instructors", icon: GraduationCap },
      { id: "analytics", label: "Analytics", icon: Brain },
    ],
    quickActions: [
      { label: "New Program", icon: BookOpen, action: "new-program" },
      { label: "Schedule Session", icon: CalendarCheck, action: "schedule-session" },
      { label: "Issue Certificate", icon: Award, action: "issue-certificate" },
      { label: "View Progress", icon: TrendingUp, action: "view-progress" },
    ],
    kpis: [
      { label: "Active Programs", key: "activePrograms", icon: BookOpen },
      { label: "Enrolled Members", key: "enrolledMembers", icon: Users },
      { label: "Completion Rate", key: "completionRate", icon: TrendingUp, format: "percent" },
      { label: "Avg Assessment", key: "avgAssessment", icon: Brain, format: "score" },
    ],
  },

  social: {
    id: "social",
    name: "Social Media",
    nameAr: "الإعلام الرقمي",
    description: "Content management, analytics, and social media campaigns",
    themeClass: "committee-social",
    colors: {
      primary: "#ec4899",
      primaryLight: "#f472b6",
      secondary: "#334155",
      gradient: "linear-gradient(135deg, #ec4899, #a855f7)",
      gradientText: "linear-gradient(135deg, #f472b6, #c084fc)",
    },
    icon: Megaphone,
    navItems: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "calendar", label: "Content Calendar", icon: CalendarCheck },
      { id: "scheduling", label: "Scheduling", icon: Zap },
      { id: "analytics", label: "Analytics", icon: BarChart3 },
      { id: "campaigns", label: "Campaigns", icon: Megaphone },
      { id: "assets", label: "Creative Assets", icon: Image },
      { id: "trends", label: "Trends", icon: TrendingUp },
      { id: "hashtags", label: "Hashtags", icon: Hash },
      { id: "tasks", label: "Tasks", icon: CheckSquare },
    ],
    quickActions: [
      { label: "Schedule Post", icon: PenTool, action: "schedule-post" },
      { label: "Create Campaign", icon: Megaphone, action: "create-campaign" },
      { label: "Upload Asset", icon: Image, action: "upload-asset" },
      { label: "View Analytics", icon: BarChart3, action: "view-analytics" },
    ],
    kpis: [
      { label: "Posts This Month", key: "postsThisMonth", icon: PenTool },
      { label: "Total Reach", key: "totalReach", icon: Globe },
      { label: "Engagement Rate", key: "engagementRate", icon: TrendingUp, format: "percent" },
      { label: "Followers Growth", key: "followersGrowth", icon: Users, format: "percent" },
    ],
  },
};

export const getCommitteeById = (id: string): CommitteeConfig | undefined =>
  COMMITTEE_CONFIGS[id as CommitteeId];

export const getCommitteeByDepartmentName = (name: string): CommitteeConfig | undefined => {
  const n = name.toLowerCase();
  if (n.includes("hr") || n.includes("human")) return COMMITTEE_CONFIGS.hr;
  if (n.includes("pr") || n.includes("public")) return COMMITTEE_CONFIGS.pr;
  if (n.includes("or") || n.includes("operation")) return COMMITTEE_CONFIGS.or;
  if (n.includes("train")) return COMMITTEE_CONFIGS.training;
  if (n.includes("social") || n.includes("media")) return COMMITTEE_CONFIGS.social;
  return undefined;
};
