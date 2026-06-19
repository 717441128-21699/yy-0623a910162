import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'submitted' | 'reviewing';
  text?: string;
  size?: 'small' | 'medium';
}

const statusMap = {
  pending: { label: '待拍摄', className: styles.statusPending },
  in_progress: { label: '进行中', className: styles.statusInProgress },
  submitted: { label: '已提交', className: styles.statusSubmitted },
  reviewing: { label: '待核对', className: styles.statusReviewing },
  approved: { label: '已通过', className: styles.statusApproved },
  rejected: { label: '需重拍', className: styles.statusRejected }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text, size = 'small' }) => {
  const statusInfo = statusMap[status] || statusMap.pending;
  const displayText = text || statusInfo.label;

  return (
    <View className={classnames(styles.badge, statusInfo.className, size === 'medium' && styles.medium)}>
      <Text className={styles.text}>{displayText}</Text>
    </View>
  );
};

export default StatusBadge;
