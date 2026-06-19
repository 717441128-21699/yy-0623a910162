import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import TimelineItem from '@/components/TimelineItem';
import classnames from 'classnames';

const HistoryPage: React.FC = () => {
  const { state } = useApp();
  const historyRecords = state.historyRecords;
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const months = useMemo(() => {
    const monthSet = new Set<string>();
    historyRecords.forEach(record => monthSet.add(record.month));
    return ['all', ...Array.from(monthSet)];
  }, [historyRecords]);

  const filteredRecords = useMemo(() => {
    if (activeFilter === 'all') {
      return historyRecords;
    }
    return historyRecords.filter(record => record.month === activeFilter);
  }, [historyRecords, activeFilter]);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleGoCompare = () => {
    if (historyRecords.length < 2) {
      Taro.showToast({ title: '至少需要2次记录才能对比', icon: 'none' });
      return;
    }
    Taro.navigateTo({
      url: '/pages/compare/index'
    });
  };

  const handleRecordClick = (recordId: string, urls: string[]) => {
    if (urls && urls.length > 0) {
      Taro.previewImage({ urls, current: urls[0] });
    }
  };

  const selfPhotoCount = historyRecords.filter(r => r.type === 'self_photo').length;
  const clinicPhotoCount = historyRecords.filter(r => r.type === 'clinic_photo').length;
  const earliestDate = historyRecords.length > 0
    ? historyRecords[historyRecords.length - 1].month
    : '-';

  const filterLabels: Record<string, string> = {
    all: '全部'
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>牙齿变化记录</Text>
        <Text className={styles.subtitle}>见证每一次复诊的进步</Text>
        <View className={styles.stats}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{historyRecords.length}</Text>
            <Text className={styles.statLabel}>总记录</Text>
          </View>
          <View className={classnames(styles.statItem, styles.selfStat)}>
            <Text className={styles.statNum}>{selfPhotoCount}</Text>
            <Text className={styles.statLabel}>自拍次数</Text>
          </View>
          <View className={classnames(styles.statItem, styles.clinicStat)}>
            <Text className={styles.statNum}>{clinicPhotoCount}</Text>
            <Text className={styles.statLabel}>诊室拍摄</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollX className={styles.filterSection}>
        {months.map(month => (
          <View
            key={month}
            className={classnames(styles.filterItem, activeFilter === month && styles.active)}
            onClick={() => handleFilterChange(month)}
          >
            <Text>{filterLabels[month] || month}</Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView scrollY className={styles.timeline}>
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record, index) => (
            <TimelineItem
              key={record.id}
              date={record.date}
              type={record.type}
              typeLabel={record.typeLabel}
              description={record.description}
              photos={record.photos}
              doctorNote={record.doctorNote}
              isLast={index === filteredRecords.length - 1}
              onClick={() => handleRecordClick(record.id, record.photos)}
            />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>暂无记录</Text>
          </View>
        )}
      </ScrollView>

      <View
        className={classnames(styles.compareBtn, historyRecords.length < 2 && styles.disabled)}
        onClick={handleGoCompare}
      >
        <Text className={styles.btnIcon}>🔍</Text>
        <Text className={styles.btnText}>
          {historyRecords.length < 2 ? '需至少2次记录' : '照片对比'}
        </Text>
      </View>
    </View>
  );
};

export default HistoryPage;
