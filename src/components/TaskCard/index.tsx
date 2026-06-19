import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import classnames from 'classnames';

interface TaskCardProps {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'reviewing' | 'approved' | 'rejected';
  progress?: { current: number; total: number };
  onClick?: () => void;
  type?: 'patient' | 'review';
}

const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  subtitle,
  date,
  status,
  progress,
  onClick,
  type = 'patient'
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const progressPercent = progress
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <View
      className={classnames(styles.card, type === 'review' && styles.reviewType)}
      onClick={handleClick}
    >
      <View className={styles.header}>
        <View className={styles.titleRow}>
          <Text className={styles.title}>{title}</Text>
          <StatusBadge status={status} />
        </View>
        {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
      </View>

      {progress && (
        <View className={styles.progressSection}>
          <View className={styles.progressBar}>
            <View
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </View>
          <Text className={styles.progressText}>
            {progress.current} / {progress.total} 张
          </Text>
        </View>
      )}

      {date && (
        <View className={styles.footer}>
          <Text className={styles.dateText}>📅 {date}</Text>
        </View>
      )}
    </View>
  );
};

export default TaskCard;
