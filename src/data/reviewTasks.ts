import { ReviewTask, RejectReason } from '@/types';

export const reviewTasks: ReviewTask[] = [
  {
    id: 'r1',
    patientName: '李小朋',
    patientAvatar: 'https://picsum.photos/id/64/200/200',
    submitTime: '2026-06-20 14:30',
    appointmentDate: '2026-06-23 09:30',
    photoCount: 5,
    status: 'pending',
    photos: [
      { id: 'p1', name: '正面咬合照', url: 'https://picsum.photos/id/64/600/600', status: 'pending' },
      { id: 'p2', name: '左侧咬合照', url: 'https://picsum.photos/id/338/600/600', status: 'pending' },
      { id: 'p3', name: '右侧咬合照', url: 'https://picsum.photos/id/177/600/600', status: 'pending' },
      { id: 'p4', name: '上牙弓照', url: 'https://picsum.photos/id/91/600/600', status: 'pending' },
      { id: 'p5', name: '下牙弓照', url: 'https://picsum.photos/id/1027/600/600', status: 'pending' }
    ]
  },
  {
    id: 'r2',
    patientName: '王一诺',
    patientAvatar: 'https://picsum.photos/id/91/200/200',
    submitTime: '2026-06-20 13:15',
    appointmentDate: '2026-06-23 10:00',
    photoCount: 5,
    status: 'pending',
    photos: [
      { id: 'p1', name: '正面咬合照', url: 'https://picsum.photos/id/64/600/600', status: 'pending' },
      { id: 'p2', name: '左侧咬合照', url: 'https://picsum.photos/id/338/600/600', status: 'pending' },
      { id: 'p3', name: '右侧咬合照', url: 'https://picsum.photos/id/177/600/600', status: 'pending' },
      { id: 'p4', name: '上牙弓照', url: 'https://picsum.photos/id/91/600/600', status: 'pending' },
      { id: 'p5', name: '下牙弓照', url: 'https://picsum.photos/id/1027/600/600', status: 'pending' }
    ]
  },
  {
    id: 'r3',
    patientName: '张雨欣',
    patientAvatar: 'https://picsum.photos/id/338/200/200',
    submitTime: '2026-06-20 11:20',
    appointmentDate: '2026-06-24 14:00',
    photoCount: 5,
    status: 'pending',
    photos: [
      { id: 'p1', name: '正面咬合照', url: 'https://picsum.photos/id/64/600/600', status: 'pending' },
      { id: 'p2', name: '左侧咬合照', url: 'https://picsum.photos/id/338/600/600', status: 'pending' },
      { id: 'p3', name: '右侧咬合照', url: 'https://picsum.photos/id/177/600/600', status: 'pending' },
      { id: 'p4', name: '上牙弓照', url: 'https://picsum.photos/id/91/600/600', status: 'pending' },
      { id: 'p5', name: '下牙弓照', url: 'https://picsum.photos/id/1027/600/600', status: 'pending' }
    ]
  },
  {
    id: 'r4',
    patientName: '刘子轩',
    patientAvatar: 'https://picsum.photos/id/177/200/200',
    submitTime: '2026-06-19 16:45',
    appointmentDate: '2026-06-23 11:00',
    photoCount: 5,
    status: 'approved',
    photos: [
      { id: 'p1', name: '正面咬合照', url: 'https://picsum.photos/id/64/600/600', status: 'approved' },
      { id: 'p2', name: '左侧咬合照', url: 'https://picsum.photos/id/338/600/600', status: 'approved' },
      { id: 'p3', name: '右侧咬合照', url: 'https://picsum.photos/id/177/600/600', status: 'approved' },
      { id: 'p4', name: '上牙弓照', url: 'https://picsum.photos/id/91/600/600', status: 'approved' },
      { id: 'p5', name: '下牙弓照', url: 'https://picsum.photos/id/1027/600/600', status: 'approved' }
    ]
  },
  {
    id: 'r5',
    patientName: '陈佳怡',
    patientAvatar: 'https://picsum.photos/id/1027/200/200',
    submitTime: '2026-06-19 10:30',
    appointmentDate: '2026-06-24 09:00',
    photoCount: 5,
    status: 'rejected',
    photos: [
      { id: 'p1', name: '正面咬合照', url: 'https://picsum.photos/id/64/600/600', status: 'approved' },
      { id: 'p2', name: '左侧咬合照', url: 'https://picsum.photos/id/338/600/600', status: 'rejected', rejectReason: '光线暗' },
      { id: 'p3', name: '右侧咬合照', url: 'https://picsum.photos/id/177/600/600', status: 'approved' },
      { id: 'p4', name: '上牙弓照', url: 'https://picsum.photos/id/91/600/600', status: 'rejected', rejectReason: '嘴唇遮挡' },
      { id: 'p5', name: '下牙弓照', url: 'https://picsum.photos/id/1027/600/600', status: 'approved' }
    ]
  }
];

export const rejectReasons: RejectReason[] = [
  { id: '1', label: '光线暗', icon: '🔅' },
  { id: '2', label: '角度偏', icon: '📐' },
  { id: '3', label: '嘴唇遮挡', icon: '👄' },
  { id: '4', label: '未露磨牙', icon: '🦷' },
  { id: '5', label: '照片模糊', icon: '💨' },
  { id: '6', label: '咬合不对', icon: '🔗' }
];

export default reviewTasks;
