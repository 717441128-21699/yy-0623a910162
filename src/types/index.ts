// 拍照项目类型
export interface PhotoItem {
  id: string;
  name: string;
  description: string;
  exampleImage: string;
  tips: string[];
  distanceTip: string;
  mouthTip: string;
  biteTip: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  userPhoto?: string;
  rejectReason?: string;
  submittedAt?: string;
}

// 拍照任务类型
export interface PhotoTask {
  id: string;
  title: string;
  deadline: string;
  appointmentDate: string;
  appointmentId?: string;
  doctorName: string;
  items: PhotoItem[];
  totalCount: number;
  completedCount: number;
  status: 'pending' | 'in_progress' | 'submitted' | 'reviewing' | 'approved' | 'rejected';
  submittedAt?: string;
  reviewedAt?: string;
  reviewTaskId?: string;
  overallNote?: string;
}

// 历史记录类型
export interface HistoryRecord {
  id: string;
  date: string;
  month: string;
  type: 'self_photo' | 'clinic_photo';
  typeLabel: string;
  photos: string[];
  photoNames?: string[];
  description: string;
  doctorNote?: string;
  appointmentId?: string;
  appointmentDate?: string;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  reviewSummary?: {
    approvedCount: number;
    rejectedCount: number;
    reviewedAt?: string;
    reviewedBy?: string;
  };
  rejectedItems?: { name: string; reason: string }[];
}

// 待核对任务类型
export interface ReviewTask {
  id: string;
  patientName: string;
  patientAvatar: string;
  submitTime: string;
  appointmentDate: string;
  appointmentId?: string;
  photoCount: number;
  status: 'pending' | 'approved' | 'rejected' | 'reviewing';
  photos: ReviewPhoto[];
  reviewedAt?: string;
  reviewedBy?: string;
  overallNote?: string;
}

export interface ReviewPhoto {
  id: string;
  name: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  reviewedAt?: string;
}

// 不合格原因类型
export interface RejectReason {
  id: string;
  label: string;
  icon: string;
}

// 用户信息类型
export interface UserInfo {
  name: string;
  avatar: string;
  patientId: string;
  doctorName: string;
  nextAppointment: string;
  treatmentStage: string;
  totalAppointments: number;
  completedAppointments: number;
}

// 护士/医护人员信息
export interface StaffInfo {
  name: string;
  avatar: string;
  role: string;
  department: string;
}
