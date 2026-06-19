import { PhotoTask, PhotoItem } from '@/types';

export const photoItems: PhotoItem[] = [
  {
    id: '1',
    name: '正面咬合照',
    description: '拍摄牙齿正面咬合状态',
    exampleImage: 'https://picsum.photos/id/64/600/600',
    tips: [
      '保持自然微笑，嘴唇轻轻分开',
      '手机距离面部约20-30厘米',
      '确保上下牙齿完全咬合对齐'
    ],
    distanceTip: '手机距离面部约20-30厘米，与眼睛平齐',
    mouthTip: '嘴唇轻轻分开，露出全部上下牙齿',
    biteTip: '上下牙齿完全咬合对齐，不要单侧咬合',
    status: 'pending'
  },
  {
    id: '2',
    name: '左侧咬合照',
    description: '拍摄左侧牙齿咬合状态',
    exampleImage: 'https://picsum.photos/id/338/600/600',
    tips: [
      '头转向右侧，露出左侧牙齿',
      '用手指轻轻拉开左侧嘴角',
      '确保能看到最后一颗磨牙'
    ],
    distanceTip: '手机距离面部约20厘米，垂直于侧脸',
    mouthTip: '用手拉开嘴角，充分露出左侧牙齿',
    biteTip: '保持正常咬合，不要张口过大',
    status: 'pending'
  },
  {
    id: '3',
    name: '右侧咬合照',
    description: '拍摄右侧牙齿咬合状态',
    exampleImage: 'https://picsum.photos/id/177/600/600',
    tips: [
      '头转向左侧，露出右侧牙齿',
      '用手指轻轻拉开右侧嘴角',
      '确保能看到最后一颗磨牙'
    ],
    distanceTip: '手机距离面部约20厘米，垂直于侧脸',
    mouthTip: '用手拉开嘴角，充分露出右侧牙齿',
    biteTip: '保持正常咬合，不要张口过大',
    status: 'pending'
  },
  {
    id: '4',
    name: '上牙弓照',
    description: '拍摄上排牙齿牙弓形态',
    exampleImage: 'https://picsum.photos/id/91/600/600',
    tips: [
      '头向后仰，嘴巴尽量张大',
      '手机从下巴下方往上拍摄',
      '确保能看到所有上排牙齿'
    ],
    distanceTip: '手机位于下巴下方约15厘米处',
    mouthTip: '嘴巴尽量张大，舌头自然放下',
    biteTip: '张口状态，不要咬合',
    status: 'pending'
  },
  {
    id: '5',
    name: '下牙弓照',
    description: '拍摄下排牙齿牙弓形态',
    exampleImage: 'https://picsum.photos/id/1027/600/600',
    tips: [
      '头向前低，嘴巴尽量张大',
      '手机从额头上方往下拍摄',
      '确保能看到所有下排牙齿'
    ],
    distanceTip: '手机位于额头前上方约15厘米处',
    mouthTip: '嘴巴尽量张大，舌头自然放平',
    biteTip: '张口状态，不要咬合',
    status: 'pending'
  }
];

export const currentTask: PhotoTask = {
  id: 'task-001',
  title: '复诊前自拍检查',
  deadline: '2026-06-22 18:00',
  appointmentDate: '2026-06-23 09:30',
  doctorName: '张明医生',
  items: photoItems,
  totalCount: 5,
  completedCount: 2,
  status: 'in_progress'
};

export const mockUserInfo = {
  name: '李小朋',
  avatar: 'https://picsum.photos/id/64/200/200',
  patientId: 'P202600123',
  doctorName: '张明医生',
  nextAppointment: '2026-06-23 09:30',
  treatmentStage: '矫治第12个月',
  totalAppointments: 24,
  completedAppointments: 12
};

export default currentTask;
