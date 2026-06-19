import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import { PhotoTask, PhotoItem, HistoryRecord, ReviewTask } from '@/types';
import { photoItems as defaultPhotoItems, mockUserInfo } from '@/data/photoTasks';
import { historyRecords as defaultHistoryRecords } from '@/data/historyRecords';
import { reviewTasks as defaultReviewTasks, rejectReasons } from '@/data/reviewTasks';

const STORAGE_KEY = 'ortho_app_state_v1';

const createInitialPhotoTask = (): PhotoTask => {
  const items: PhotoItem[] = defaultPhotoItems.map(item => ({
    ...item,
    status: 'pending',
    userPhoto: undefined,
    rejectReason: undefined,
  }));
  return {
    id: 'task-current',
    title: '复诊前自拍检查',
    deadline: '2026-06-22 18:00',
    appointmentDate: '2026-06-23 09:30',
    doctorName: '张明医生',
    items,
    totalCount: items.length,
    completedCount: 0,
    status: 'in_progress',
  };
};

export interface AppState {
  currentTask: PhotoTask;
  historyRecords: HistoryRecord[];
  reviewTasks: ReviewTask[];
  rejectReasons: typeof rejectReasons;
  userInfo: typeof mockUserInfo;
  staffInfo: { name: string; avatar: string; role: string; department: string };
}

type Action =
  | { type: 'UPDATE_PHOTO'; payload: { itemId: string; photoUrl: string } }
  | { type: 'MARK_REJECTED'; payload: { itemId: string; reasons: string[] } }
  | { type: 'CLEAR_PHOTO'; payload: { itemId: string } }
  | { type: 'SUBMIT_TASK' }
  | { type: 'APPROVE_REVIEW_PHOTO'; payload: { taskId: string; photoId: string } }
  | { type: 'REJECT_REVIEW_PHOTO'; payload: { taskId: string; photoId: string; reasons: string[] } }
  | { type: 'APPROVE_ALL_REVIEW'; payload: { taskId: string } }
  | { type: 'APPLY_REVIEW_RESULTS'; payload: { taskId: string } }
  | { type: 'RESET_TASK' }
  | { type: 'LOAD_STATE'; payload: AppState };

const getCompletedCount = (items: PhotoItem[]): number => {
  return items.filter(i => i.status === 'submitted' || i.status === 'approved').length;
};

const calcTaskStatus = (task: PhotoTask): PhotoTask['status'] => {
  if (task.status === 'reviewing' || task.status === 'approved' || task.status === 'rejected') {
    return task.status;
  }
  if (task.completedCount === 0) return 'pending';
  if (task.completedCount < task.totalCount) return 'in_progress';
  return 'in_progress';
};

const initialState: AppState = {
  currentTask: createInitialPhotoTask(),
  historyRecords: defaultHistoryRecords,
  reviewTasks: defaultReviewTasks,
  rejectReasons,
  userInfo: mockUserInfo,
  staffInfo: {
    name: '李护士',
    avatar: 'https://picsum.photos/id/1005/200/200',
    role: '前台护士',
    department: '正畸科',
  },
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE': {
      return action.payload;
    }

    case 'UPDATE_PHOTO': {
      const { itemId, photoUrl } = action.payload;
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
      const newItems = state.currentTask.items.map(item =>
        item.id === itemId
          ? { ...item, status: 'submitted' as const, userPhoto: photoUrl, rejectReason: undefined, submittedAt: ts }
          : item
      );
      const completedCount = getCompletedCount(newItems);
      const newTask: PhotoTask = {
        ...state.currentTask,
        items: newItems,
        completedCount,
        status: calcTaskStatus({ ...state.currentTask, items: newItems, completedCount }),
      };
      return { ...state, currentTask: newTask };
    }

    case 'CLEAR_PHOTO': {
      const { itemId } = action.payload;
      const newItems = state.currentTask.items.map(item =>
        item.id === itemId
          ? { ...item, status: 'pending' as const, userPhoto: undefined, rejectReason: undefined }
          : item
      );
      const completedCount = getCompletedCount(newItems);
      const newTask: PhotoTask = {
        ...state.currentTask,
        items: newItems,
        completedCount,
        status: calcTaskStatus({ ...state.currentTask, items: newItems, completedCount }),
      };
      return { ...state, currentTask: newTask };
    }

    case 'MARK_REJECTED': {
      const { itemId, reasons } = action.payload;
      const newItems = state.currentTask.items.map(item =>
        item.id === itemId
          ? { ...item, status: 'rejected' as const, rejectReason: reasons.join('、') }
          : item
      );
      const completedCount = getCompletedCount(newItems);
      const newTask: PhotoTask = {
        ...state.currentTask,
        items: newItems,
        completedCount,
        status: 'rejected',
      };
      return { ...state, currentTask: newTask };
    }

    case 'SUBMIT_TASK': {
      const task = state.currentTask;
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const submitTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const monthStr = `${now.getFullYear()}年${now.getMonth() + 1}月`;
      const appointmentId = `apt-${task.appointmentDate.replace(/-/g, '')}`;
      const reviewTaskId = `review-${Date.now()}`;

      const submittedItems = task.items.filter(i => i.userPhoto);
      const reviewPhotos = submittedItems.map(item => ({
        id: `rp-${item.id}-${Date.now()}`,
        name: item.name,
        url: item.userPhoto!,
        status: 'pending' as const,
      }));

      const newReviewTask: ReviewTask = {
        id: reviewTaskId,
        patientName: state.userInfo.name,
        patientAvatar: state.userInfo.avatar,
        submitTime,
        appointmentDate: task.appointmentDate,
        appointmentId,
        photoCount: reviewPhotos.length,
        status: 'pending',
        photos: reviewPhotos,
      };

      const newHistory: HistoryRecord = {
        id: `h-${Date.now()}`,
        date: dateStr,
        month: monthStr,
        type: 'self_photo',
        typeLabel: '自助拍照',
        photos: reviewPhotos.map(p => p.url),
        photoNames: submittedItems.map(i => i.name),
        description: `第${state.userInfo.completedAppointments + 1}次复诊前自拍（${submittedItems.length}张）`,
        doctorNote: '待护士核对',
        appointmentId,
        appointmentDate: task.appointmentDate,
        reviewStatus: 'pending',
        reviewSummary: { approvedCount: 0, rejectedCount: 0 },
        rejectedItems: [],
      };

      const newTask: PhotoTask = {
        ...task,
        status: 'reviewing',
        submittedAt: submitTime,
        appointmentId,
        reviewTaskId,
      };

      return {
        ...state,
        currentTask: newTask,
        reviewTasks: [newReviewTask, ...state.reviewTasks],
        historyRecords: [newHistory, ...state.historyRecords],
      };
    }

    case 'APPROVE_REVIEW_PHOTO': {
      const { taskId, photoId } = action.payload;
      const newReviewTasks = state.reviewTasks.map(rt => {
        if (rt.id !== taskId) return rt;
        const newPhotos = rt.photos.map(p =>
          p.id === photoId ? { ...p, status: 'approved' as const } : p
        );
        const allApproved = newPhotos.every(p => p.status === 'approved');
        return {
          ...rt,
          photos: newPhotos,
          status: allApproved ? 'approved' as const : rt.status,
        };
      });
      return { ...state, reviewTasks: newReviewTasks };
    }

    case 'REJECT_REVIEW_PHOTO': {
      const { taskId, photoId, reasons } = action.payload;
      const reasonStr = reasons.join('、');
      const newReviewTasks = state.reviewTasks.map(rt => {
        if (rt.id !== taskId) return rt;
        const newPhotos = rt.photos.map(p =>
          p.id === photoId
            ? { ...p, status: 'rejected' as const, rejectReason: reasonStr }
            : p
        );
        const hasRejected = newPhotos.some(p => p.status === 'rejected');
        return {
          ...rt,
          photos: newPhotos,
          status: hasRejected ? 'rejected' as const : rt.status,
        };
      });
      return { ...state, reviewTasks: newReviewTasks };
    }

    case 'APPROVE_ALL_REVIEW': {
      const { taskId } = action.payload;
      const newReviewTasks = state.reviewTasks.map(rt => {
        if (rt.id !== taskId) return rt;
        return {
          ...rt,
          status: 'approved' as const,
          photos: rt.photos.map(p => ({ ...p, status: 'approved' as const })),
        };
      });
      return { ...state, reviewTasks: newReviewTasks };
    }

    case 'APPLY_REVIEW_RESULTS': {
      const { taskId } = action.payload;
      const reviewTask = state.reviewTasks.find(rt => rt.id === taskId);
      if (!reviewTask) return state;

      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const reviewedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
      const staffName = state.staffInfo.name;

      const nameToIdMap: Record<string, string> = {};
      state.currentTask.items.forEach(item => {
        nameToIdMap[item.name] = item.id;
      });

      let newItems = [...state.currentTask.items];
      const approvedList: string[] = [];
      const rejectedList: { name: string; reason: string }[] = [];

      reviewTask.photos.forEach(rp => {
        const itemId = nameToIdMap[rp.name];
        if (!itemId) return;
        if (rp.status === 'approved') {
          newItems = newItems.map(item =>
            item.id === itemId ? { ...item, status: 'approved' as const } : item
          );
          approvedList.push(rp.name);
        } else if (rp.status === 'rejected' && rp.rejectReason) {
          newItems = newItems.map(item =>
            item.id === itemId
              ? { ...item, status: 'rejected' as const, rejectReason: rp.rejectReason, userPhoto: rp.url }
              : item
          );
          rejectedList.push({ name: rp.name, reason: rp.rejectReason });
        }
      });

      const completedCount = getCompletedCount(newItems);
      const hasRejected = newItems.some(i => i.status === 'rejected');
      const allApproved = newItems.every(i => i.status === 'approved');

      const newTask: PhotoTask = {
        ...state.currentTask,
        items: newItems,
        completedCount,
        status: allApproved ? 'approved' : hasRejected ? 'rejected' : 'reviewing',
        reviewedAt,
      };

      // 同步更新 reviewTask 的 reviewedAt/reviewedBy
      const newReviewTasks = state.reviewTasks.map(rt => {
        if (rt.id !== taskId) return rt;
        return { ...rt, reviewedAt, reviewedBy: staffName };
      });

      // 更新对应历史记录（按 appointmentId 匹配）
      const newHistoryRecords = state.historyRecords.map(h => {
        if (h.appointmentId !== reviewTask.appointmentId || h.type !== 'self_photo') return h;
        const summary = {
          approvedCount: approvedList.length,
          rejectedCount: rejectedList.length,
          reviewedAt,
          reviewedBy: staffName
        };
        let note = '';
        if (allApproved) {
          note = `✅ 全部${approvedList.length}张照片通过审核，复诊当天可直接使用`;
        } else if (hasRejected) {
          note = `⚠️ ${rejectedList.length}张照片不合格需要重拍：${rejectedList.map(r => r.name).join('、')}`;
        }
        return {
          ...h,
          reviewStatus: allApproved ? 'approved' as const : hasRejected ? 'rejected' as const : h.reviewStatus,
          reviewSummary: summary,
          rejectedItems: rejectedList,
          doctorNote: note || h.doctorNote,
        };
      });

      return {
        ...state,
        currentTask: newTask,
        reviewTasks: newReviewTasks,
        historyRecords: newHistoryRecords,
      };
    }

    case 'RESET_TASK': {
      return { ...state, currentTask: createInitialPhotoTask() };
    }

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const saved = Taro.getStorageSync(STORAGE_KEY);
      if (saved) {
        dispatch({ type: 'LOAD_STATE', payload: saved });
      }
    } catch (e) {
      console.error('Load state error:', e);
    }
  }, []);

  useEffect(() => {
    try {
      Taro.setStorageSync(STORAGE_KEY, state);
    } catch (e) {
      console.error('Save state error:', e);
    }
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
};

export const resetAppState = () => {
  try {
    Taro.removeStorageSync(STORAGE_KEY);
  } catch (e) {
    console.error('Reset state error:', e);
  }
};
