import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import { ReviewTask } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import classnames from 'classnames';

type TabType = 'pending' | 'approved' | 'rejected';

const WorkbenchPage: React.FC = () => {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const tasks = state.reviewTasks;
  const staffInfo = state.staffInfo;

  usePullDownRefresh(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Taro.stopPullDownRefresh();
    }, 800);
  });

  const allDates = useMemo(() => {
    const s = new Set<string>();
    tasks.forEach(t => s.add(t.appointmentDate));
    return ['', ...Array.from(s).sort()];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (task.status !== activeTab) return false;
      if (searchName && !task.patientName.includes(searchName.trim())) return false;
      if (filterDate && task.appointmentDate !== filterDate) return false;
      return true;
    });
  }, [tasks, activeTab, searchName, filterDate]);

  const stats = useMemo(() => {
    return {
      pending: tasks.filter(t => t.status === 'pending').length,
      approved: tasks.filter(t => t.status === 'approved').length,
      rejected: tasks.filter(t => t.status === 'rejected').length
    };
  }, [tasks]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleGoReview = (taskId: string) => {
    Taro.navigateTo({
      url: `/pages/review-detail/index?id=${taskId}`
    });
  };

  const handleGoReport = (taskId: string) => {
    Taro.navigateTo({
      url: `/pages/photo-report/index?from=staff&reviewId=${taskId}`
    });
  };

  const handleResetFilters = () => {
    setSearchName('');
    setFilterDate('');
  };

  const handlePickDate = () => {
    const list = allDates.map(d => d || '全部日期');
    Taro.showActionSheet({
      itemList: list,
      success: res => {
        setFilterDate(allDates[res.tapIndex]);
      }
    });
  };

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'pending', label: '待核对', count: stats.pending },
    { key: 'approved', label: '已通过', count: stats.approved },
    { key: 'rejected', label: '需重拍', count: stats.rejected }
  ];

  const hasFilters = !!searchName || !!filterDate;

  return (
    <View className={styles.container}>
      <View className={styles.staffHeader}>
        <Image className={styles.staffAvatar} src={staffInfo.avatar} mode="aspectFill" />
        <View className={styles.staffInfo}>
          <Text className={styles.staffName}>{staffInfo.name}</Text>
          <Text className={styles.staffRole}>{staffInfo.department} · {staffInfo.role}</Text>
        </View>
      </View>

      <View className={styles.statsSection}>
        <View className={styles.statsGrid}>
          <View className={classnames(styles.statItem, styles.pending)}>
            <Text className={styles.statNum}>{stats.pending}</Text>
            <Text className={styles.statLabel}>待核对</Text>
          </View>
          <View className={classnames(styles.statItem, styles.approved)}>
            <Text className={styles.statNum}>{stats.approved}</Text>
            <Text className={styles.statLabel}>已通过</Text>
          </View>
          <View className={classnames(styles.statItem, styles.rejected)}>
            <Text className={styles.statNum}>{stats.rejected}</Text>
            <Text className={styles.statLabel}>需重拍</Text>
          </View>
        </View>
      </View>

      <View className={styles.filterBar}>
        <View className={styles.searchBox}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索患者姓名"
            placeholderClass={styles.searchPlaceholder}
            value={searchName}
            onInput={(e) => setSearchName(e.detail.value)}
            confirmType="search"
          />
          {searchName && (
            <Text className={styles.clearBtn} onClick={() => setSearchName('')}>✕</Text>
          )}
        </View>
        <View className={styles.filterBtn} onClick={handlePickDate}>
          <Text className={styles.filterIcon}>📅</Text>
          <Text className={styles.filterText}>{filterDate || '日期'}</Text>
        </View>
        <View
          className={classnames(styles.filterBtn, styles.togglePanel)}
          onClick={() => setShowFilterPanel(!showFilterPanel)}
        >
          <Text className={styles.filterIcon}>⚙️</Text>
        </View>
      </View>

      {showFilterPanel && (
        <View className={styles.filterPanel}>
          <View className={styles.panelRow}>
            <Text className={styles.panelLabel}>复诊日期</Text>
            <View className={styles.chipList}>
              {allDates.map(d => (
                <View
                  key={d || 'all'}
                  className={classnames(styles.chip, filterDate === d && styles.chipActive)}
                  onClick={() => setFilterDate(d)}
                >
                  <Text>{d || '全部'}</Text>
                </View>
              ))}
            </View>
          </View>
          <View className={styles.panelActions}>
            <View className={styles.resetBtn} onClick={handleResetFilters}>
              <Text>重置筛选</Text>
            </View>
          </View>
        </View>
      )}

      {hasFilters && (
        <View className={styles.filterHint}>
          <Text>已筛选：共 {filteredTasks.length} 条</Text>
          <Text className={styles.hintReset} onClick={handleResetFilters}>清除条件</Text>
        </View>
      )}

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
          setTimeout(() => setLoading(false), 800);
        }}
      >
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <View key={task.id} className={styles.taskItem}>
              <View className={styles.patientRow} onClick={() => handleGoReview(task.id)}>
                <Image
                  className={styles.avatar}
                  src={task.patientAvatar}
                  mode="aspectFill"
                />
                <View className={styles.patientInfo}>
                  <Text className={styles.name}>{task.patientName}</Text>
                  <Text className={styles.time}>
                    提交于 {task.submitTime}
                  </Text>
                  <View className={styles.tagsRow}>
                    <View className={styles.miniTag}>
                      <Text>复诊：{task.appointmentDate}</Text>
                    </View>
                    {task.reviewedBy && (
                      <View className={classnames(styles.miniTag, styles.tagReviewer)}>
                        <Text>核对：{task.reviewedBy}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View className={styles.statusBadge}>
                  <StatusBadge status={task.status === 'pending' ? 'reviewing' : task.status} />
                </View>
              </View>

              <View className={styles.photoPreview} onClick={() => handleGoReview(task.id)}>
                {task.photos.slice(0, 5).map(photo => (
                  <View key={photo.id} className={styles.previewWrapper}>
                    <Image
                      className={styles.previewImg}
                      src={photo.url}
                      mode="aspectFill"
                    />
                    {photo.status !== 'pending' && (
                      <View className={classnames(
                        styles.miniBadge,
                        photo.status === 'approved' && styles.miniApproved,
                        photo.status === 'rejected' && styles.miniRejected
                      )}>
                        <Text>{photo.status === 'approved' ? '✓' : '✗'}</Text>
                      </View>
                    )}
                  </View>
                ))}
                {task.photos.length > 5 && (
                  <View className={styles.morePhotos}>
                    <Text>+{task.photos.length - 5}</Text>
                  </View>
                )}
              </View>

              <View className={styles.footer}>
                <View className={styles.photoMeta}>
                  <Text className={styles.photoCount}>
                    {task.photos.filter(p => p.status === 'approved').length > 0 && (
                      <Text className={styles.countGreen}>✓ {task.photos.filter(p => p.status === 'approved').length}张通过</Text>
                    )}
                    {task.photos.filter(p => p.status === 'rejected').length > 0 && (
                      <Text className={styles.countRed}>✗ {task.photos.filter(p => p.status === 'rejected').length}张重拍</Text>
                    )}
                    {task.photos.every(p => p.status === 'pending') && (
                      <Text className={styles.countBlue}>共{task.photoCount}张待核对</Text>
                    )}
                  </Text>
                </View>
                <View className={styles.footerActions}>
                  <View
                    className={classnames(styles.footerBtn, styles.ghost)}
                    onClick={() => handleGoReport(task.id)}
                  >
                    <Text>报告</Text>
                  </View>
                  <View
                    className={classnames(styles.footerBtn, task.status === 'pending' && styles.primary)}
                    onClick={() => handleGoReview(task.id)}
                  >
                    <Text>{task.status === 'pending' ? '去核对' : '查看详情'}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>
              {hasFilters
                ? '没有符合条件的记录，试试清除筛选条件'
                : activeTab === 'pending'
                  ? '太棒啦，所有核对任务已完成！'
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
