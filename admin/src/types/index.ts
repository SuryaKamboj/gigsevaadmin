export type AdminNavTab =
  | 'dashboard'
  | 'users'
  | 'workers'
  | 'jobs'
  | 'disputes'
  | 'payments'
  | 'security';

// ==========================================
// AUTHENTICATION & LOGIN ROLES
// ==========================================

export type AuthRole = 'society_member' | 'federation';

export interface AuthUserSession {
  userId: string;
  role: AuthRole;
  roleTitle: string;
  name: string;
  societyName?: string;
  societyCode?: string;
  department?: string;
  loginTime: string;
  securityLevel: string;
}


// ==========================================
// USER MANAGEMENT TYPES (USR-XXXX)
// ==========================================

export type UserAccountStatus = 'Active' | 'Blocked';

export interface UserActivityItem {
  id: string;
  date: string;
  time: string;
  activity:
    | 'Booking Created'
    | 'Booking Accepted'
    | 'Booking Completed'
    | 'Booking Cancelled'
    | 'Payment Successful'
    | 'Payment Failed'
    | 'Payment Refunded'
    | 'Admin Note Updated'
    | 'Account Status Changed';
  jobId?: string; // e.g. JOB-3001
  transactionId?: string; // e.g. TXN-4001
  details: string;
}

export interface UserItem {
  id: string; // e.g. USR-1001
  name: string;
  phone: string;
  phoneVerified: boolean;
  image: string;
  status: UserAccountStatus;
  blockReason?: string;
  joinedDate: string;
  address: string;
  email?: string;
  adminNote: string;
  activity: UserActivityItem[];
}

// ==========================================
// WORKER MANAGEMENT TYPES (WRK-XXXX)
// ==========================================

export type WorkerApprovalStatus = 'Pending' | 'Approved' | 'Rejected';
export type WorkerAccountStatus = 'Active' | 'Inactive' | 'Suspended' | 'Blocked';
export type CertificationStatus =
  | 'Not Submitted'
  | 'Submitted'
  | 'Under Review'
  | 'Verified'
  | 'Rejected'
  | 'Expired';
export type InsuranceStatus =
  | 'Not Applied'
  | 'Application Submitted'
  | 'Under Review'
  | 'Active'
  | 'Rejected'
  | 'Expired';

export interface WorkerCertificationItem {
  id: string;
  name: string;
  issuer?: string;
  certificateNumber?: string;
  documentUrl?: string;
  status: CertificationStatus;
  issueDate?: string;
  expiryDate?: string;
  verifiedDate?: string;
  verifiedBy?: string;
  rejectionReason?: string;
}

export interface WorkerInsuranceInfo {
  status: InsuranceStatus;
  planName: string;
  coverage: string;
  applicationDate?: string;
  validUntil?: string;
  policyNumber?: string;
  rejectionReason?: string;
}

export interface WorkerActivityLogItem {
  id: string;
  date: string;
  time: string;
  action: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  performedBy: string;
}

export interface WorkerReviewItem {
  id: string;
  jobId: string;
  customerName: string;
  userId: string;
  rating: number;
  comment: string;
  date: string;
}

export interface WorkerPortfolioItem {
  id: string;
  url: string;
  imageUrl?: string;
  title: string;
  description?: string;
  serviceTag?: string;
  createdAt?: string;
}

export interface WorkerItem {
  id: string; // e.g. WRK-2045
  name: string;
  phone: string;
  image: string;
  category: string; // Primary category
  primarySkill?: string;
  skills: string[]; // Additional skills/categories
  yearsOfExperience: number;
  skillLevel?: 'Beginner' | 'Intermediate' | 'Expert' | string;
  servicesOffered?: string[];
  toolsAndEquipment?: string[];
  availableDays?: string[];
  workingHoursStart?: string;
  workingHoursEnd?: string;
  workType?: 'Full-time' | 'Part-time' | string;
  aboutMe?: string;
  previousWorkExperience?: string;
  trainingCompleted?: string[];
  portfolio?: WorkerPortfolioItem[];
  currentAddress?: string;
  city?: string;
  pincode?: string;
  preferredWorkingAreas?: string[];
  dateOfBirth?: string;
  gender?: string;
  email?: string;
  joinedDate: string;
  location: string;
  serviceArea: string;
  workingHours: string;
  approvalStatus: WorkerApprovalStatus;
  rejectionReason?: string;
  aadhaarNumberMasked?: string;
  aadhaarVerified?: boolean;
  selfieUrl?: string;
  status: WorkerAccountStatus;
  statusReason?: string;
  profileCompletion: number; // Percentage e.g. 90
  adminRemarks: string;

  // Professional Certifications (Admin verifies)
  certifications: WorkerCertificationItem[];

  // Insurance (Admin manages)
  insurance: WorkerInsuranceInfo;

  // Audit Activity Trail
  activityLogs: WorkerActivityLogItem[];

  // Derived Performance Indicators (View-only / derived from jobs & ratings)
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  averageRating: number;
  totalRatings: number;
  complaintsCount: number;
  reviews: WorkerReviewItem[];
}

// ==========================================
// JOB MANAGEMENT TYPES (JOB-XXXX)
// ==========================================

export type JobStatus = 'Pending' | 'Active' | 'Completed' | 'Cancelled';
export type JobPaymentStatus = 'Paid' | 'Escrow Pending' | 'Refunded' | 'Failed' | 'Pending';

export interface JobTimelineItem {
  event:
    | 'Booking Created'
    | 'Worker Accepted'
    | 'Worker Reached Location'
    | 'Work Started'
    | 'Work Completed'
    | 'Payment Successful'
    | 'Payment Failed'
    | 'Payment Refunded'
    | 'Booking Cancelled';
  date: string;
  time: string;
  detail: string;
  referenceId?: string;
}

export interface JobItem {
  id: string; // e.g. JOB-3001
  service: string;
  serviceCategory: string;
  description: string;
  status: JobStatus;
  scheduledDate: string;
  scheduledTime: string;
  createdDate: string;
  createdTime: string;
  location: string;

  // Customer Reference (Owner: User Management)
  customer: {
    userId: string; // e.g. USR-1001
    name: string;
    phone: string;
    address: string;
  };

  // Worker Reference (Owner: Worker Management)
  worker: {
    workerId: string; // e.g. WRK-2045
    name: string;
    phone: string;
    category: string;
    averageRating: number;
  };

  // Service details & Evidence
  servicePhotos: string[];
  workEvidence: {
    beforePhotos: string[];
    afterPhotos: string[];
  };

  // Timeline
  timeline: JobTimelineItem[];

  // Payment Reference (Owner: Payments TXN-XXXX)
  payment: {
    amount: string;
    status: JobPaymentStatus;
    transactionId: string; // e.g. TXN-4001
    paymentMethod: string;
    paidAt?: string;
  };

  // Work Timing & Duration (Calculated from Worker Dashboard Stopwatch)
  workStartTime?: number; // Timestamp in ms when worker starts stopwatch
  completionTime?: number; // Timestamp in ms when worker completes job
  actualWorkDuration?: string; // Formatted duration in HH:MM:SS
}

// ==========================================
// DASHBOARD & COMMON METRIC TYPES
// ==========================================

export interface StatMetric {
  id: string;
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  timeframe: string;
  iconName: string;
}

export interface PopularServiceItem {
  id: string;
  serviceName: string;
  bookingsCount: number;
  percentage: number;
  revenue: string;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'user' | 'worker' | 'job' | 'dispute' | 'payment';
}

export interface GrowthDataPoint {
  month: string;
  users: number;
  workers: number;
}

export interface JobsOverviewStatus {
  status: 'Completed' | 'Active' | 'Pending' | 'Cancelled';
  count: number;
  percentage: number;
  color: string;
}

// ==========================================
// DISPUTES & COMPLAINTS TYPES (CMP-XXXX)
// ==========================================

export type ComplaintStatus =
  | 'Pending'
  | 'Under Review'
  | 'Escalated'
  | 'Resolved'
  | 'Rejected';

export type ComplaintType =
  | 'Poor Service Quality'
  | 'Worker Behaviour'
  | 'Customer Behaviour'
  | 'Job Not Completed'
  | 'Property Damage'
  | 'Safety Issue'
  | 'Overcharging / Amount Dispute'
  | 'Payment Issue'
  | 'Job Cancellation Dispute'
  | 'Other';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ComplaintPartyType = 'Customer' | 'Worker';

export interface ComplaintPartyInfo {
  name: string;
  id: string; // e.g. USR-1001 or WRK-2045
  phone: string;
  type: ComplaintPartyType;
}

export interface ComplaintRelatedJob {
  id: string; // e.g. JOB-3001
  service: string;
  customerName: string;
  workerName: string;
  scheduledDate: string;
  scheduledTime: string;
  location: string;
  jobStatus: JobStatus;
}

export interface ComplaintEvidenceItem {
  id: string;
  title: string;
  type:
    | 'customer_photo'
    | 'worker_photo'
    | 'before_photo'
    | 'after_photo'
    | 'document'
    | 'other';
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
}

export interface ComplaintInvestigationRemark {
  id: string;
  officer: string;
  date: string;
  time: string;
  remark: string;
}

export type ComplaintDecisionType =
  | 'Complaint Valid'
  | 'Complaint Partially Valid'
  | 'Complaint Invalid'
  | 'Insufficient Evidence';

export interface ComplaintAdminDecision {
  decision: ComplaintDecisionType;
  reason: string;
  officer: string;
  date: string;
  time: string;
}

export type ComplaintActionType =
  | 'Refund'
  | 'Worker Penalty'
  | 'Customer Penalty'
  | 'No Action';

export interface ComplaintRefundAction {
  type: 'Full Refund' | 'Partial Refund' | 'No Refund';
  refundAmount?: number;
  reason?: string;
  originalAmount: number;
  transactionId: string;
  refundId?: string; // e.g. REF-6001
}

export interface ComplaintPenaltyAction {
  type: 'Warning' | 'Monetary Penalty' | 'Suspension';
  penaltyAmount?: number;
  suspensionDuration?: string;
  reason: string;
}

export interface ComplaintResolution {
  finalDecision: ComplaintDecisionType;
  actionTaken: ComplaintActionType;
  refundAmount?: number;
  penaltyAmount?: number;
  suspensionDuration?: string;
  resolutionRemarks: string;
  resolvedBy: string;
  resolvedDate: string;
  resolvedTime: string;
}

export interface ComplaintTimelineEvent {
  id: string;
  event: string;
  date: string;
  time: string;
  officer: string;
  details: string;
}

export interface ComplaintItem {
  id: string; // e.g. CMP-5001
  jobId: string; // e.g. JOB-3001
  raisedBy: ComplaintPartyInfo;
  against: ComplaintPartyInfo;
  type: ComplaintType;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdDate: string;
  createdTime: string;
  description: string;
  relatedJob: ComplaintRelatedJob;
  evidence: ComplaintEvidenceItem[];
  investigationRemarks: ComplaintInvestigationRemark[];
  decision?: ComplaintAdminDecision;
  refundAction?: ComplaintRefundAction;
  workerPenaltyAction?: ComplaintPenaltyAction;
  customerPenaltyAction?: ComplaintPenaltyAction;
  resolution?: ComplaintResolution;
  timeline: ComplaintTimelineEvent[];
  transactionId?: string; // e.g. TXN-4001
}

// ==========================================
// PAYMENTS & ESCROW TYPES (TXN, REF, PAY, COM)
// ==========================================

export type TransactionStatus =
  | 'Successful'
  | 'Pending'
  | 'Failed'
  | 'Refunded';

export type PaymentMethodType =
  | 'UPI / Instant'
  | 'Net Banking'
  | 'Debit/Credit Card'
  | 'Escrow / Wallet'
  | 'Cash / On-Site';

export interface TransactionItem {
  id: string; // e.g. TXN-4001
  jobId: string; // e.g. JOB-3001
  customer: {
    userId: string; // e.g. USR-1001
    name: string;
    phone: string;
  };
  worker: {
    workerId: string; // e.g. WRK-2045
    name: string;
    phone: string;
  };
  grossAmount: number;
  commissionAmount: number;
  workerAmount: number;
  refundAmount?: number;
  paymentMethod: PaymentMethodType;
  status: TransactionStatus;
  date: string;
  time: string;
  gatewayRefId: string;
  refundId?: string; // e.g. REF-6001
  commissionId: string; // e.g. COM-7001
  payoutId?: string; // e.g. PAY-8001
  failureReason?: string;
}

export type PayoutStatus = 'Pending' | 'Processing' | 'Paid' | 'Failed';

export interface WorkerPayoutItem {
  id: string; // e.g. PAY-8001
  worker: {
    workerId: string; // e.g. WRK-2045
    name: string;
    phone: string;
    category: string;
  };
  jobId: string; // e.g. JOB-3001
  transactionId: string; // e.g. TXN-4001
  grossEarning: number;
  commission: number;
  adjustments: number; // Penalties or fee deductions
  netPayout: number;
  payoutMethod: string;
  bankAccountMasked?: string;
  payoutDate: string;
  status: PayoutStatus;
}

export interface PlatformCommissionItem {
  id: string; // e.g. COM-7001
  jobId: string; // e.g. JOB-3001
  transactionId: string; // e.g. TXN-4001
  service: string;
  serviceCategory: string;
  customerName: string;
  workerName: string;
  workerId: string;
  grossAmount: number;
  rate: number; // e.g. 10 for 10%
  commissionAmount: number;
  workerAmount: number;
  date: string;
  status: 'Collected' | 'Pending Escrow' | 'Reversed';
}

export type RefundStatus = 'Requested' | 'Processing' | 'Refunded' | 'Failed';

export interface RefundItem {
  id: string; // e.g. REF-6001
  transactionId: string; // e.g. TXN-4001
  jobId: string; // e.g. JOB-3001
  customer: {
    userId: string;
    name: string;
    phone: string;
  };
  originalAmount: number;
  refundAmount: number;
  reason: string;
  complaintId?: string; // e.g. CMP-5001
  requestedDate: string;
  completedDate?: string;
  status: RefundStatus;
}

export interface FailedPaymentItem {
  id: string; // e.g. TXN-4091
  jobId: string; // e.g. JOB-3008
  customer: {
    userId: string;
    name: string;
    phone: string;
  };
  worker: {
    workerId: string;
    name: string;
    phone: string;
  };
  amount: number;
  paymentMethod: PaymentMethodType;
  failureReason:
    | 'Insufficient Funds'
    | 'Bank Declined'
    | 'UPI Timeout'
    | 'Payment Gateway Error'
    | 'Payment Cancelled'
    | 'Network Error';
  gatewayRefId: string;
  date: string;
  time: string;
  status: 'Failed';
}

export interface PaymentSettingsRules {
  defaultCommissionRate: number; // e.g. 10 (%)
  serviceCategoryRates: { category: string; rate: number; effectiveDate: string; active: boolean }[];
  payoutCycle: string; // e.g. 'Weekly (Every Monday)'
  minimumPayout: number; // e.g. 500
  payoutProcessingPeriod: string; // e.g. '24–48 Bank Business Hours'
  fullRefundAvailable: boolean;
  partialRefundAvailable: boolean;
  refundProcessingPeriod: string; // e.g. '3–5 Business Working Days'
  refundEligibilityRules: string[];
}

// ==========================================
// ADMIN & SECURITY TYPES (ADM-XXXX)
// ==========================================

export type AdminRole =
  | 'Super Administrator'
  | 'Dispute Adjudicator'
  | 'Operations Officer'
  | 'Finance Auditor'
  | 'Support Supervisor';

export type AdminAccountStatus = 'Active' | 'Inactive';

export type SecurityTab =
  | 'admin-accounts'
  | 'roles-permissions'
  | 'login-security'
  | 'login-activity'
  | 'audit-logs';

export interface AdminAccountItem {
  id: string; // e.g. ADM-001
  name: string;
  email: string;
  mobile: string;
  role: AdminRole;
  department: string;
  status: AdminAccountStatus;
  createdDate: string;
  lastLoginDate: string;
  lastLoginTime: string;
  avatar?: string;
  twoFactorEnabled: boolean;
}

export type LoginActivityStatus = 'Successful' | 'Failed';
export type LoginActivityAction =
  | 'Successful Login'
  | 'Failed Login'
  | 'Logout'
  | 'Session Expired'
  | 'Password Changed'
  | '2FA Verification';

export interface LoginActivityItem {
  id: string; // e.g. LOG-1001
  adminId: string;
  adminName: string;
  email: string;
  ipAddress: string;
  device: string; // e.g. "Chrome 124 on Windows 11"
  location: string; // e.g. "New Delhi, DL"
  activity: LoginActivityAction;
  status: LoginActivityStatus;
  timestamp: string; // e.g. "2026-09-09 18:30:12"
  date: string;
  time: string;
  failureReason?: string;
}

export type AuditLogModule =
  | 'Worker Management'
  | 'User Management'
  | 'Job Management'
  | 'Disputes & Complaints'
  | 'Payments & Finance'
  | 'Admin & Security';

export interface AuditLogItem {
  id: string; // e.g. AUD-9001
  timestamp: string;
  date: string;
  time: string;
  adminId: string; // e.g. ADM-001
  adminName: string;
  module: AuditLogModule;
  action: string;
  recordId: string; // e.g. WRK-2045, CMP-5007, USR-1001, JOB-3001, REF-6001, TXN-4001
  details: string;
  ipAddress: string;
}

export interface SecuritySettingsConfig {
  twoFactorRequired: boolean;
  twoFactorMethod: 'SMS OTP' | 'Authenticator App (TOTP)' | 'Email OTP';
  sessionTimeoutMinutes: number; // 15, 30, 60, 120
  loginAlertsEnabled: boolean;
  maxFailedAttempts: number; // 3, 5, 10
  lockoutDurationMinutes: number; // 15, 30, 60
  passwordMinLength: number;
  passwordRequireSpecialChar: boolean;
  passwordExpiryDays: number;
}

// ==========================================
// NAVIGATION CONTEXT SYSTEM (Cross-Module)
// ==========================================

export type NavigationRecordType = 'worker' | 'user' | 'job' | 'complaint' | 'transaction' | 'refund' | 'payout' | 'commission';

export type NavigationReturnModal =
  | 'worker-details'
  | 'user-details'
  | 'job-details'
  | 'complaint-details'
  | 'transaction-details'
  | 'refund-details'
  | 'payout-details'
  | 'commission-details';

export interface NavigationSourceContext {
  sourceModule: AdminNavTab;
  sourceModuleName: string;
  sourceRecordType?: NavigationRecordType;
  sourceRecordId?: string;
  sourceRecordName?: string;
  returnModal?: NavigationReturnModal;
  filterContextLabel?: string;
  filterCriteria?: {
    workerId?: string;
    workerName?: string;
    userId?: string;
    userName?: string;
    jobId?: string;
    complaintId?: string;
    transactionId?: string;
    refundId?: string;
    status?: string;
  };
  returnContext?: {
    module: AdminNavTab;
    recordId?: string;
    modal?: NavigationReturnModal;
    paymentsTab?: 'transactions' | 'payouts' | 'commissions' | 'refunds' | 'failed' | 'settings';
  };
}



