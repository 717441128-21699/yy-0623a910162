import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import TimelineItem from '@/components/TimelineItem';
import { HistoryRecord } from '@/types';
import classnames from 'classnames';

const HistoryPage: React.FC = () => {
  const { state } = useApp();
  const historyRecords = state.historyRecords;
  const [activeMonth, setActiveMonth] = useState<string>('all');
  const [activeType, setActiveType] = useState<'all' | 'self_photo' | 'clinic_photo'>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'appointment'>('timeline');

  const months = useMemo(() => {
    const monthSet = new Set<string>();
    historyRecords.forEach(record => monthSet.add(record.month));
    return ['all', ...Array.from(monthSet)];
  }, [historyRecords]);

  const appointmentGroups = useMemo(() => {
    const map = new Map<string, HistoryRecord[]>();
    historyRecords.forEach(r => {
      const key = r.appointmentId || `unknown-${r.id}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return Array.from(map.values()).map(group => ({
      appointmentId: group[0].appointmentId || '',
      appointmentDate: group[0].appointmentDate || group[0].date,
      records: group.sort((a, b) => a.date.localeCompare(b.date))
    })).sort((a, b) => b.appointmentDate.localeCompare(a.appointmentDate));
  }, [historyRecords]);

  const filteredRecords = useMemo(() => {
    return historyRecords.filter(record => {
      if (activeMonth !== 'all' && record.month !== activeMonth) return false;
      if (activeType !== 'all' && record.type !== activeType) return false;
      return true;
    });
  }, [historyRecords, activeMonth, activeType]);

  const filteredGroups = useMemo(() => {
    if (activeMonth === 'all' && activeType === 'all') return appointmentGroups;
    return appointmentGroups
      .map(g => ({
        ...g,
        records: g.records.filter(r => {
          if (activeMonth !== 'all' && r.month !== activeMonth) return false;
          if (activeType !== 'all' && r.type !== activeType) return false;
          return true;
        })
      }))
      .filter(g => g.records.length > 0);
  }, [appointmentGroups, activeMonth, activeType]);

  const handleMonthChange = (m: string) => setActiveMonth(m);
  const handleTypeChange = (t: typeof activeType) => setActiveType(t);

  const handleGoCompare = (aptId?: string) => {
    if (historyRecords.length < 2) {
      Taro.showToast({ title: '至少需要2次记录才能对比', icon: 'none' });
      return;
    }
    const url = aptId
      ? `/pages/compare/index?appointmentId=${aptId}`
      : '/pages/compare/index';
    Taro.navigateTo({ url });
  };

  const handleRecordClick = (recordId: string) => {
    Taro.navigateTo({
      url: `/pages/history-detail/index?id=${recordId}`
    });
  };

  const selfPhotoCount = historyRecords.filter(r => r.type === 'self_photo').length;
  const clinicPhotoCount = historyRecords.filter(r => r.type === 'clinic_photo').length;
  const appointmentCount = appointmentGroups.length;

  const filterLabels: Record<string, string> = { all: '全部' };

  const typeOptions: { key: typeof activeType; label: string; icon: string }[] = [
    { key: 'all', label: '全部', icon: '📚' },
    { key: 'self_photo', label: '自拍', icon: '📸' },
    { key: 'clinic_photo', label: '诊室', icon: '🦷' }
  ];

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>牙齿变化记录</Text>
        <Text className={styles.subtitle}>见证每一次复诊的进步</Text>
        <View className={styles.stats}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{appointmentCount}</Text>
            <Text className={styles.statLabel}>复诊次数</Text>
          </View>
          <View className={classnames(styles.statItem, styles.selfStat)}>
            <Text className={styles.statNum}>{selfPhotoCount}</Text>
            <Text className={styles.statLabel}>自拍次数</Text>
          </View>
          <View className={classnames(styles.statItem, styles.clinicStat)}>
            <Text className={styles.statNum}>{clinicPhotoCount}</Text>
            <Text className={styles.statLabel}>诊室拍摄</Text>
          </View>
          <View className={classnames(styles.statItem, styles.totalStat)}>
            <Text className={styles.statNum}>{historyRecords.length}</Text>
            <Text className={styles.statLabel}>总记录</Text>
          </View>
        </View>

        <View className={styles.modeTabs}>
          <View
            className={classnames(styles.modeTab, viewMode === 'timeline' && styles.modeActive)}
            onClick={() => setViewMode('timeline')}
          >
            <Text>时间轴</Text>
          </View>
          <View
            className={classnames(styles.modeTab, viewMode === 'appointment' && styles.modeActive)}
            onClick={() => setViewMode('appointment')}
          >
            <Text>按复诊分组</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollX className={styles.filterSection}>
        {months.map(m => (
          <View
            key={m}
            className={classnames(styles.filterItem, activeMonth === m && styles.active)}
            onClick={() => handleMonthChange(m)}
          >
            <Text>{filterLabels[m] || m}</Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.typeFilter}>
        {typeOptions.map(opt => (
          <View
            key={opt.key}
            className={classnames(styles.typeChip, activeType === opt.key && styles.chipActive)}
            onClick={() => handleTypeChange(opt.key)}
          >
            <Text className={styles.chipIcon}>{opt.icon}</Text>
            <Text>{opt.label}</Text>
          </View>
        ))}
      </View>

      {viewMode === 'timeline' ? (
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
                reviewStatus={record.reviewStatus}
                reviewSummary={record.reviewSummary}
                isLast={index === filteredRecords.length - 1}
                onClick={() => handleRecordClick(record.id)}
              />
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📭</Text>
              <Text className={styles.emptyText}>暂无符合条件的记录</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView scrollY className={styles.appointmentView}>
          {filteredGroups.length > 0 ? (
            filteredGroups.map(group => (
              <View key={group.appointmentId || Math.random()} className={styles.appointmentGroup}>
                <View className={styles.groupHeader}>
                  <Text className={styles.groupDate}>
                    {group.appointmentDate} 复诊
                  </Text>
                  <Text className={styles.groupCount}>
                    {group.records.length} 份记录
                  </Text>
                </View>

                <View className={styles.groupRecords}>
                  {group.records.map((record, idx) => (
                    <View
                      key={record.id}
                      className={classnames(
                        styles.groupCard,
                        record.type === 'self_photo' ? styles.cardSelf : styles.cardClinic
                      )}
                      onClick={() => handleRecordClick(record.id)}
                    >
                      <View className={styles.cardTop}>
                        <View className={styles.cardType}>
                          <Text className={styles.cardTypeIcon}>
                            {record.type === 'self_photo' ? '📸' : '🦷'}
                          </Text>
                          <Text className={styles.cardTypeLabel}>{record.typeLabel}</Text>
                        </View>
                        <Text className={styles.cardDate}>{record.date}</Text>
                      </View>

                      <View className={styles.cardDesc}>{record.description}</View>

                      <View className={styles.cardThumbs}>
                        {record.photos.slice(0, 5).map((url, i) => (
                          <View key={i} className={styles.thumbItem} />
                        ))}
                      </View>

                      {record.reviewStatus && record.reviewSummary && (
                        <View className={styles.cardReview}>
                          <Text className={styles.reviewText}>
                            ✓ {record.reviewSummary.approvedCount}通过
                            {record.reviewSummary.rejectedCount > 0 && (
                              <Text> · ✗ {record.reviewSummary.rejectedCount}重拍</Text>
                            )}
                          </Text>
                        </View>
                      )}

                      {record.doctorNote && (
                        <View className={styles.cardNote}>
                          <Text className={styles.noteIcon}>📝</Text>
                          <Text className={styles.noteText} numberOfLines={2}>{record.doctorNote}</Text>
                        </View>
                      )}
                    </View>
                  ))}

                  {group.records.length >= 2 && (
                    <View className={styles.compareHint} onClick={() => handleGoCompare(group.appointmentId)}>
                      <Text>📊 点击对比本次自拍与诊室拍摄 →</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📭</Text>
              <Text className={styles.emptyText}>暂无符合条件的记录</Text>
            </View>
          )}
        </ScrollView>
      )}

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
