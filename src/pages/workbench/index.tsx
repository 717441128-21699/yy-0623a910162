import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import { reviewTasks } from '@/data/reviewTasks';
import { ReviewTask } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import classnames from 'classnames';

type TabType = 'pending' | 'approved' | 'rejected';

const WorkbenchPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<ReviewTask[]>(reviewTasks);

  usePullDownRefresh(() => {
    console.log('[Workbench] 下拉刷新');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => task.status === activeTab);
  }, [tasks, activeTab]);

  const stats = useMemo(() => {
    return {
      pending: tasks.filter(t => t.status === 'pending').length,
      approved: tasks.filter(t => t.status === 'approved').length,
      rejected: tasks.filter(t => t.status === 'rejected').length
    };
  }, [tasks]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    console.log(`[Workbench] 切换到 ${tab} 标签`);
  };

  const handleGoReview = (taskId: string) => {
    console.log(`[Workbench] 跳转到核对详情: ${taskId}`);
    Taro.navigateTo({
      url: `/pages/review-detail/index?id=${taskId}`
    });
  };

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'pending', label: '待核对', count: stats.pending },
    { key: 'approved', label: '已通过', count: stats.approved },
    { key: 'rejected', label: '需重拍', count: stats.rejected }
  ];

  return (
    <View className={styles.container}>
      <View className={styles.statsSection}>
        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.pending}</Text>
            <Text className={styles.statLabel}>待核对</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.approved}</Text>
            <Text className={styles.statLabel}>已通过</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.rejected}</Text>
            <Text className={styles.statLabel}>需重拍</Text>
          </View>
        </View>
      </View>

      <View className={styles.tabs}>
        {tabs.map(tab => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.active)}
            onClick={() => handleTabChange(tab.key)}
          >
            <Text className={styles.tabText}>{tab.label}</Text>
            <Text className={styles.tabCount}>{tab.count}</Text>
          </View>
        ))}
      </View>

      <ScrollView
        scrollY
        className={styles.taskList}
        refresherEnabled
        refresherTriggered={loading}
        onRefresherRefresh={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 1000);
        }}
      >
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <View
              key={task.id}
              className={styles.taskItem}
              onClick={() => handleGoReview(task.id)}
            >
              <View className={styles.patientRow}>
                <Image
                  className={styles.avatar}
                  src={task.patientAvatar}
                  mode="aspectFill"
                />
                <View className={styles.patientInfo}>
                  <Text className={styles.name}>{task.patientName}</Text>
                  <Text className={styles.time}>提交于 {task.submitTime}</Text>
                </View>
                <View className={styles.statusBadge}>
                  <StatusBadge status={task.status === 'pending' ? 'reviewing' : task.status} />
                </View>
              </View>

              <View className={styles.photoPreview}>
                {task.photos.slice(0, 5).map(photo => (
                  <Image
                    key={photo.id}
                    className={styles.previewImg}
                    src={photo.url}
                    mode="aspectFill"
                  />
                ))}
              </View>

              <View className={styles.footer}>
                <Text className={styles.appointment}>复诊：{task.appointmentDate}</Text>
                <View className={styles.reviewBtn}>
                  <Text>{task.status === 'pending' ? '去核对' : '查看详情'}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>
              {activeTab === 'pending'
                ? '暂无待核对的照片'
                : activeTab === 'approved'
                  ? '暂无已通过的照片'
                  : '暂无需重拍的照片'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default WorkbenchPage;
