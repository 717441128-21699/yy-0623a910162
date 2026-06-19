import { HistoryRecord } from '@/types';

export const historyRecords: HistoryRecord[] = [
  {
    id: 'h1',
    date: '2026-06-12',
    month: '2026年6月',
    type: 'self_photo',
    typeLabel: '自助拍照',
    photos: [
      'https://picsum.photos/id/1/600/600',
      'https://picsum.photos/id/2/600/600',
      'https://picsum.photos/id/3/600/600',
      'https://picsum.photos/id/4/600/600',
      'https://picsum.photos/id/5/600/600'
    ],
    photoNames: ['正面咬合照', '左侧咬合照', '右侧咬合照', '上牙弓照', '下牙弓照'],
    description: '第12次复诊前自拍',
    doctorNote: '✅ 全部5张照片通过审核，上颌第4号牙齿间隙收缝进展顺利，继续保持皮筋佩戴。',
    appointmentId: 'apt-20260615',
    appointmentDate: '2026-06-15',
    reviewStatus: 'approved',
    reviewSummary: {
      approvedCount: 5,
      rejectedCount: 0,
      reviewedAt: '2026-06-13 10:25',
      reviewedBy: '李护士'
    },
    rejectedItems: []
  },
  {
    id: 'h2',
    date: '2026-06-15',
    month: '2026年6月',
    type: 'clinic_photo',
    typeLabel: '诊室拍摄',
    photos: [
      'https://picsum.photos/id/11/600/600',
      'https://picsum.photos/id/12/600/600',
      'https://picsum.photos/id/13/600/600',
      'https://picsum.photos/id/14/600/600',
      'https://picsum.photos/id/15/600/600'
    ],
    photoNames: ['正面咬合照', '左侧咬合照', '右侧咬合照', '上牙弓照', '下牙弓照'],
    description: '第12次复诊：诊室标准口内照',
    doctorNote: '对比上次复诊，上下牙列排列明显改善。保持器佩戴情况良好。',
    appointmentId: 'apt-20260615',
    appointmentDate: '2026-06-15'
  },
  {
    id: 'h3',
    date: '2026-05-28',
    month: '2026年5月',
    type: 'self_photo',
    typeLabel: '自助拍照',
    photos: [
      'https://picsum.photos/id/21/600/600',
      'https://picsum.photos/id/22/600/600',
      'https://picsum.photos/id/23/600/600',
      'https://picsum.photos/id/24/600/600'
    ],
    photoNames: ['正面咬合照', '左侧咬合照', '右侧咬合照', '下牙弓照'],
    description: '第11次复诊前自拍',
    doctorNote: '✅ 5张通过，重拍1张。下牙弓照光线略暗，但可以看清牙齿情况。',
    appointmentId: 'apt-20260601',
    appointmentDate: '2026-06-01',
    reviewStatus: 'approved',
    reviewSummary: {
      approvedCount: 4,
      rejectedCount: 0,
      reviewedAt: '2026-05-29 15:10',
      reviewedBy: '王护士'
    },
    rejectedItems: []
  },
  {
    id: 'h4',
    date: '2026-06-01',
    month: '2026年6月',
    type: 'clinic_photo',
    typeLabel: '诊室拍摄',
    photos: [
      'https://picsum.photos/id/31/600/600',
      'https://picsum.photos/id/32/600/600',
      'https://picsum.photos/id/33/600/600',
      'https://picsum.photos/id/34/600/600',
      'https://picsum.photos/id/35/600/600'
    ],
    photoNames: ['正面咬合照', '左侧咬合照', '右侧咬合照', '上牙弓照', '下牙弓照'],
    description: '第11次复诊：诊室标准口内照 + 面型照',
    doctorNote: '治疗进展顺利，咬合关系稳定。注意保持口腔卫生，牙龈情况有轻微红肿。',
    appointmentId: 'apt-20260601',
    appointmentDate: '2026-06-01'
  },
  {
    id: 'h5',
    date: '2026-05-12',
    month: '2026年5月',
    type: 'self_photo',
    typeLabel: '自助拍照',
    photos: [
      'https://picsum.photos/id/41/600/600',
      'https://picsum.photos/id/42/600/600',
      'https://picsum.photos/id/43/600/600',
      'https://picsum.photos/id/44/600/600',
      'https://picsum.photos/id/45/600/600'
    ],
    photoNames: ['正面咬合照', '左侧咬合照', '右侧咬合照', '上牙弓照', '下牙弓照'],
    description: '第10次复诊前自拍',
    doctorNote: '✅ 全部通过。拍摄角度很标准，继续保持这样的拍摄方式。',
    appointmentId: 'apt-20260518',
    appointmentDate: '2026-05-18',
    reviewStatus: 'approved',
    reviewSummary: {
      approvedCount: 5,
      rejectedCount: 0,
      reviewedAt: '2026-05-13 09:45',
      reviewedBy: '李护士'
    },
    rejectedItems: []
  },
  {
    id: 'h6',
    date: '2026-05-18',
    month: '2026年5月',
    type: 'clinic_photo',
    typeLabel: '诊室拍摄',
    photos: [
      'https://picsum.photos/id/51/600/600',
      'https://picsum.photos/id/52/600/600',
      'https://picsum.photos/id/53/600/600',
      'https://picsum.photos/id/54/600/600',
      'https://picsum.photos/id/55/600/600'
    ],
    photoNames: ['正面咬合照', '左侧咬合照', '右侧咬合照', '上牙弓照', '下牙弓照'],
    description: '第10次复诊：诊室标准口内照',
    doctorNote: '前牙内收效果显著，已调整弓丝力度。下次评估是否可以拆除前牙附件。',
    appointmentId: 'apt-20260518',
    appointmentDate: '2026-05-18'
  },
  {
    id: 'h7',
    date: '2026-04-25',
    month: '2026年4月',
    type: 'self_photo',
    typeLabel: '自助拍照',
    photos: [
      'https://picsum.photos/id/61/600/600',
      'https://picsum.photos/id/62/600/600',
      'https://picsum.photos/id/63/600/600'
    ],
    photoNames: ['正面咬合照', '左侧咬合照', '右侧咬合照'],
    description: '第9次复诊前自拍',
    doctorNote: '✅ 3张通过。建议下次拍摄时尽量张大嘴，这样能更清楚看到磨牙区咬合情况。',
    appointmentId: 'apt-20260504',
    appointmentDate: '2026-05-04',
    reviewStatus: 'approved',
    reviewSummary: {
      approvedCount: 5,
      rejectedCount: 0,
      reviewedAt: '2026-04-26 14:30',
      reviewedBy: '王护士'
    },
    rejectedItems: []
  },
  {
    id: 'h8',
    date: '2026-05-04',
    month: '2026年5月',
    type: 'clinic_photo',
    typeLabel: '诊室拍摄',
    photos: [
      'https://picsum.photos/id/71/600/600',
      'https://picsum.photos/id/72/600/600',
      'https://picsum.photos/id/73/600/600',
      'https://picsum.photos/id/74/600/600',
      'https://picsum.photos/id/75/600/600'
    ],
    photoNames: ['正面咬合照', '左侧咬合照', '右侧咬合照', '上牙弓照', '下牙弓照'],
    description: '第9次复诊：诊室标准口内照 + X光片',
    doctorNote: '根尖片显示牙根平行度良好。预计还需要6-8个月完成矫治。',
    appointmentId: 'apt-20260504',
    appointmentDate: '2026-05-04'
  },
  {
    id: 'h9',
    date: '2026-04-10',
    month: '2026年4月',
    type: 'self_photo',
    typeLabel: '自助拍照',
    photos: [
      'https://picsum.photos/id/81/600/600',
      'https://picsum.photos/id/82/600/600',
      'https://picsum.photos/id/83/600/600',
      'https://picsum.photos/id/84/600/600',
      'https://picsum.photos/id/85/600/600'
    ],
    photoNames: ['正面咬合照', '左侧咬合照', '右侧咬合照', '上牙弓照', '下牙弓照'],
    description: '第8次复诊前自拍',
    doctorNote: '✅ 全部通过。这是您第一次尝试自助拍照，完成度非常棒！',
    appointmentId: 'apt-20260413',
    appointmentDate: '2026-04-13',
    reviewStatus: 'approved',
    reviewSummary: {
      approvedCount: 5,
      rejectedCount: 0,
      reviewedAt: '2026-04-11 11:20',
      reviewedBy: '李护士'
    },
    rejectedItems: []
  },
  {
    id: 'h10',
    date: '2026-04-13',
    month: '2026年4月',
    type: 'clinic_photo',
    typeLabel: '诊室拍摄',
    photos: [
      'https://picsum.photos/id/91/600/600',
      'https://picsum.photos/id/92/600/600',
      'https://picsum.photos/id/93/600/600',
      'https://picsum.photos/id/94/600/600',
      'https://picsum.photos/id/95/600/600'
    ],
    photoNames: ['正面咬合照', '左侧咬合照', '右侧咬合照', '上牙弓照', '下牙弓照'],
    description: '第8次复诊：治疗基线照',
    doctorNote: '治疗开始第8个月，建立完整对比基线。重点关注前牙拥挤改善情况。',
    appointmentId: 'apt-20260413',
    appointmentDate: '2026-04-13'
  }
];
