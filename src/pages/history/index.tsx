import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { historyRecords } from '@/data/historyRecords';
import { HistoryRecord } from '@/types';
import TimelineItem from '@/components/TimelineItem';
import classnames from 'classnames';

const HistoryPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const months = useMemo(() => {
    const monthSet = new Set<string>();
    historyRecords.forEach(record => monthSet.add(record.month));
    return ['all', ...Array.from(monthSet)];
  }, []);

  const filteredRecords = useMemo(() => {
    if (activeFilter === 'all') {
      return historyRecords;
    }
    return historyRecords.filter(record => record.month === activeFilter);
  }, [activeFilter]);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    console.log(`[History] 切换筛选: ${filter}`);
  };

  const handleGoCompare = () => {
    console.log('[History] 跳转到对比页');
    Taro.navigateTo({
      url: '/pages/compare/index'
    });
  };

  const handleRecordClick = (recordId: string) => {
    console.log(`[History] 点击记录: ${recordId}`);
  };

  const selfPhotoCount = historyRecords.filter(r => r.type === 'self_photo').length;
  const clinicPhotoCount = historyRecords.filter(r => r.type === 'clinic_photo').length;

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
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{selfPhotoCount}</Text>
            <Text className={styles.statLabel}>自拍次数</Text>
          </View>
          <View className={styles.statItem}>
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
              onClick={() => handleRecordClick(record.id)}
            />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>暂无记录</Text>
          </View>
        )}
      </ScrollView>

      <View className={styles.compareBtn} onClick={handleGoCompare}>
        <Text className={styles.btnIcon}>🔍</Text>
        <Text className={styles.btnText}>照片对比</Text>
      </View>
    </View>
  );
};

export default HistoryPage;
