import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import { PhotoTask, PhotoItem, HistoryRecord, ReviewTask, ActionLog, ActionLogType } from '@/types';
import { photoItems as defaultPhotoItems, mockUserInfo } from '@/data/photoTasks';
import { historyRecords as defaultHistoryRecords } from '@/data/historyRecords';
import { reviewTasks as defaultReviewTasks, rejectReasons } from '@/data/reviewTasks';

const STORAGE_KEY = 'ortho_app_state_v1';
export const COMPARE_PARAMS_KEY = 'ortho_compare_params_v1';

export interface LastCompareParams {
  appointmentId?: string;
  leftId?: string;
  rightId?: string;
}

const makeLog = (type: ActionLogType, actor: ActionLog['actor'], actorName: string, title: string, description: string, extra?: Partial<ActionLog>): ActionLog => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const time = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    time,
    actor,
    actorName,
    title,
    description,
    ...extra,
  };
};

const appendLog = <T extends { actionLogs?: ActionLog[] }>(target: T, log: ActionLog): T => {
  const logs = [...(target.actionLogs || []), log];
  return { ...target, actionLogs: logs };
};

const createInitialPhotoTask = (): PhotoTask => {
  const items: PhotoItem[] = defaultPhotoItems.map(item => ({
    ...item,
    status: 'pending',
    userPhoto: undefined,
    rejectReason: undefined,
  }));
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const created = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
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
    actionLogs: [{
      id: `log-init-${Date.now()}`,
      type: 'task_created',
      time: created,
      actor: 'system',
      actorName: '系统',
      title: '🎯 任务下发',
      description: `医生配置了 ${items.length} 张拍摄项目`,
    }],
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
  | { type: 'APPLY_REVIEW_RESULTS'; payload: { taskId: string; handoverNote?: string; patientTip?: string } }
  | { type: 'RESET_TASK' }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'ADD_ACTION_LOG'; payload: { target: 'currentTask' | 'reviewTask'; taskId: string; log: ActionLog } };

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
      const targetItem = state.currentTask.items.find(i => i.id === itemId);
      const isRetake = targetItem?.status === 'rejected';
      const newItems = state.currentTask.items.map(item =>
        item.id === itemId
          ? { ...item, status: 'submitted' as const, userPhoto: photoUrl, rejectReason: undefined, submittedAt: ts }
          : item
      );
      const completedCount = getCompletedCount(newItems);
      let newTask: PhotoTask = {
        ...state.currentTask,
        items: newItems,
        completedCount,
        status: calcTaskStatus({ ...state.currentTask, items: newItems, completedCount }),
      };
      if (targetItem) {
        const log = makeLog(
          isRetake ? 'patient_retake' : 'patient_upload',
          'patient',
          state.userInfo.name,
          isRetake ? '🔁 患者重拍照片' : '📤 患者上传照片',
          isRetake ? `重新上传了「${targetItem.name}」，等待护士再次核对` : `完成了「${targetItem.name}」的拍摄`,
          { photoName: targetItem.name }
        );
        newTask = appendLog(newTask, log);
      }
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

      const submitLog = makeLog(
        'patient_submit',
        'patient',
        state.userInfo.name,
        '📨 患者提交审核',
        `提交了 ${submittedItems.length} 张照片，等待护士核对`,
      );

      const initLog = makeLog(
        'task_created',
        'system',
        '系统',
        '🎯 患者任务待核',
        `共 ${submittedItems.length} 张照片待核对，复诊日期 ${task.appointmentDate}`,
      );

      let newReviewTask: ReviewTask = {
        id: reviewTaskId,
        patientName: state.userInfo.name,
        patientAvatar: state.userInfo.avatar,
        submitTime,
        appointmentDate: task.appointmentDate,
        appointmentId,
        photoCount: reviewPhotos.length,
        status: 'pending',
        photos: reviewPhotos,
        actionLogs: [initLog, submitLog],
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

      let newTask: PhotoTask = {
        ...task,
        status: 'reviewing',
        submittedAt: submitTime,
        appointmentId,
        reviewTaskId,
      };
      newTask = appendLog(newTask, submitLog);

      return {
        ...state,
        currentTask: newTask,
        reviewTasks: [newReviewTask, ...state.reviewTasks],
        historyRecords: [newHistory, ...state.historyRecords],
      };
    }

    case 'APPROVE_REVIEW_PHOTO': {
      const { taskId, photoId } = action.payload;
      let logged = false;
      const newReviewTasks = state.reviewTasks.map(rt => {
        if (rt.id !== taskId) return rt;
        const photo = rt.photos.find(p => p.id === photoId);
        const newPhotos = rt.photos.map(p =>
          p.id === photoId ? { ...p, status: 'approved' as const } : p
        );
        const allApproved = newPhotos.every(p => p.status === 'approved');
        let result = {
          ...rt,
          photos: newPhotos,
          status: allApproved ? 'approved' as const : rt.status,
        };
        if (photo && !logged) {
          logged = true;
          const log = makeLog(
            'staff_approve',
            'staff',
            state.staffInfo.name,
            '✅ 护士通过照片',
            `「${photo.name}」符合要求，审核通过`,
            { photoName: photo.name }
          );
          result = appendLog(result, log);
        }
        return result;
      });
      return { ...state, reviewTasks: newReviewTasks };
    }

    case 'REJECT_REVIEW_PHOTO': {
      const { taskId, photoId, reasons } = action.payload;
      const reasonStr = reasons.join('、');
      let logged = false;
      const newReviewTasks = state.reviewTasks.map(rt => {
        if (rt.id !== taskId) return rt;
        const photo = rt.photos.find(p => p.id === photoId);
        const newPhotos = rt.photos.map(p =>
          p.id === photoId
            ? { ...p, status: 'rejected' as const, rejectReason: reasonStr }
            : p
        );
        const hasRejected = newPhotos.some(p => p.status === 'rejected');
        let result = {
          ...rt,
          photos: newPhotos,
          status: hasRejected ? 'rejected' as const : rt.status,
        };
        if (photo && !logged) {
          logged = true;
          const log = makeLog(
            'staff_reject',
            'staff',
            state.staffInfo.name,
            '❌ 护士打回照片',
            `「${photo.name}」不合格：${reasonStr}`,
            { photoName: photo.name, reasons }
          );
          result = appendLog(result, log);
        }
        return result;
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
      const { taskId, handoverNote, patientTip } = action.payload;
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

      let patientTipText = patientTip || '';
      if (!patientTipText) {
        if (allApproved) patientTipText = '✅ 所有照片均已通过审核，复诊当天可正常使用，期待您准时到诊。';
        else if (hasRejected) patientTipText = `⚠️ 您有 ${rejectedList.length} 张照片需要重新拍摄，请尽快按提示重拍后再次提交。`;
      }

      const overallNote = handoverNote || (
        allApproved
          ? `本次共 ${approvedList.length} 张照片全部通过，可直接用于本次复诊对比。`
          : `${approvedList.length} 张可用，${rejectedList.length} 张需复拍（${rejectedList.map(r => r.name).join('、')}），复诊当天请优先确认。`
      );

      const submitLog = makeLog(
        'staff_submit',
        'staff',
        staffName,
        '📝 护士完成核对',
        `通过 ${approvedList.length} 张，重拍 ${rejectedList.length} 张。${overallNote}`,
      );

      let newTask: PhotoTask = {
        ...state.currentTask,
        items: newItems,
        completedCount,
        status: allApproved ? 'approved' : hasRejected ? 'rejected' : 'reviewing',
        reviewedAt,
        overallNote,
        patientTip: patientTipText,
      };
      newTask = appendLog(newTask, submitLog);

      // 同步更新 reviewTask 的 reviewedAt/reviewedBy/交接备注/患者提示
      const newReviewTasks = state.reviewTasks.map(rt => {
        if (rt.id !== taskId) return rt;
        return {
          ...rt,
          reviewedAt,
          reviewedBy: staffName,
          handoverNote,
          patientTip: patientTipText,
          overallNote,
          actionLogs: [...(rt.actionLogs || []), submitLog],
        };
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

    case 'ADD_ACTION_LOG': {
      const { target, taskId, log } = action.payload;
      if (target === 'currentTask') {
        return { ...state, currentTask: appendLog(state.currentTask, log) };
      }
      const newRT = state.reviewTasks.map(rt => rt.id === taskId ? appendLog(rt, log) : rt);
      return { ...state, reviewTasks: newRT };
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
