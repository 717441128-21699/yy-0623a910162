import React, { useMemo, useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import { HistoryRecord } from '@/types';
import classnames from 'classnames';

const HistoryDetailPage: React.FC = () => {
  const router = useRouter();
  const recordId = router.params.id || '';
  const { state } = useApp();

  const record = useMemo(() => {
    return state.historyRecords.find(r => r.id === recordId) || state.historyRecords[0];
  }, [state.historyRecords, recordId]);

  const [records] = useState(state.historyRecords);

  const relatedRecords = useMemo(() => {
    if (!record || !record.appointmentId) return [];
    return records.filter(
      r => r.appointmentId === record.appointmentId && r.id !== record.id
    );
  }, [record, records]);

  const handlePreview = (url: string) => {
    if (!record) return;
    const urls = record.photos;
    Taro.previewImage({ urls, current: url });
  };

  const handleGoRelated = (id: string) => {
    Taro.redirectTo({
      url: `/pages/history-detail/index?id=${id}`
    });
  };

  const handleGoCompare = () => {
    if (records.length < 2) {
      Taro.showToast({ title: '记录不足，无法对比', icon: 'none' });
      return;
    }
    const aptId = record?.appointmentId || '';
    const leftId = record?.type === 'self_photo' ? record.id : relatedRecords.find(r => r.type === 'self_photo')?.id || '';
    const rightId = record?.type === 'clinic_photo' ? record.id : relatedRecords.find(r => r.type === 'clinic_photo')?.id || '';
    let url = '/pages/compare/index?';
    const params: string[] = [];
    if (aptId) params.push(`appointmentId=${aptId}`);
    if (leftId) params.push(`leftId=${leftId}`);
    if (rightId) params.push(`rightId=${rightId}`);
    Taro.navigateTo({ url: url + params.join('&') });
  };

  const handleGoClinic = () => {
    if (!record || !record.appointmentId) return;
    const clinic = relatedRecords.find(r => r.type === 'clinic_photo');
    if (clinic) {
      handleGoRelated(clinic.id);
    } else {
      Taro.showToast({ title: '本次暂无诊室拍摄', icon: 'none' });
    }
  };

  const handleGoSelf = () => {
    if (!record || !record.appointmentId) return;
    const self = relatedRecords.find(r => r.type === 'self_photo');
    if (self) {
      handleGoRelated(self.id);
    } else {
      Taro.showToast({ title: '本次暂无自助拍照', icon: 'none' });
    }
  };

  if (!record) {
    return (
      <View className={styles.container}>
        <View className={styles.emptyState}>
          <Text className={styles.icon}>📭</Text>
          <Text className={styles.text}>未找到该记录</Text>
        </View>
      </View>
    );
  }

  const isSelfPhoto = record.type === 'self_photo';
  const hasReview = !!record.reviewSummary;

  return (
    <View className={styles.container}>
      <View className={styles.recordHeader}>
        <View className={styles.dateRow}>
          <Text className={styles.date}>{record.date}</Text>
          <View className={classnames(
            styles.typeBadge,
            isSelfPhoto ? styles.selfPhoto : styles.clinicPhoto
          )}>
            <Text>{record.typeLabel}</Text>
          </View>
        </View>
        <Text className={styles.desc}>{record.description}</Text>
        {record.appointmentDate && (
          <Text className={styles.appointment}>🦷 关联复诊：{record.appointmentDate}</Text>
        )}

        {relatedRecords.length > 0 && (
          <View className={styles.relatedSection}>
            <Text className={styles.relatedTitle}>📎 同一次复诊的其他记录</Text>
            <View className={styles.relatedList}>
              {relatedRecords.map(r => (
                <View
                  key={r.id}
                  className={styles.relatedItem}
                  onClick={() => handleGoRelated(r.id)}
                >
                  <View className={styles.meta}>
                    <Text className={styles.date}>{r.date} · {r.typeLabel}</Text>
                    <Text className={styles.desc}>{r.description}</Text>
                  </View>
                  <Text className={styles.go}>查看 →</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {hasReview && record.type === 'self_photo' && (
        <View className={styles.reviewSection}>
          <Text className={styles.sectionTitle}>🔍 护士核对结果</Text>
          <View className={styles.summaryRow}>
            <View className={classnames(styles.box, styles.boxTotal)}>
              <Text className={styles.num}>{record.reviewSummary!.approvedCount + record.reviewSummary!.rejectedCount}</Text>
              <Text className={styles.label}>总数</Text>
            </View>
            <View className={classnames(styles.box, styles.boxOk)}>
              <Text className={styles.num}>{record.reviewSummary!.approvedCount}</Text>
              <Text className={styles.label}>通过</Text>
            </View>
            <View className={classnames(styles.box, styles.boxFail)}>
              <Text className={styles.num}>{record.reviewSummary!.rejectedCount}</Text>
              <Text className={styles.label}>重拍</Text>
            </View>
          </View>

          {record.reviewSummary!.reviewedAt && (
            <Text className={styles.reviewerInfo}>
              {record.reviewSummary!.reviewedBy || '护士'} 于 {record.reviewSummary!.reviewedAt} 完成核对
            </Text>
          )}

          {record.rejectedItems && record.rejectedItems.length > 0 && (
            <View className={styles.rejectList}>
              <Text className={styles.rejectTitle}>需重拍项目</Text>
              {record.rejectedItems.map((item, idx) => (
                <View key={idx} className={styles.rejectItem}>
                  <Text className={styles.itemName}>• {item.name}</Text>
                  <Text className={styles.itemReason}>原因：{item.reason}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <View className={styles.photoSection}>
        <Text className={styles.sectionTitle}>
          📷 照片列表
          <Text className={styles.count}>（共{record.photos.length}张）</Text>
        </Text>
        <View className={styles.photoGrid}>
          {record.photos.map((url, idx) => (
            <View
              key={idx}
              className={styles.photoCard}
              onClick={() => handlePreview(url)}
            >
              <View className={styles.wrap}>
                <Image className={styles.photo} src={url} mode="aspectFill" />
              </View>
              <View className={styles.footer}>
                <Text className={styles.name}>
                  {idx + 1}. {record.photoNames?.[idx] || `照片${idx + 1}`}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.noteSection}>
        <Text className={styles.sectionTitle}>📝 医生备注</Text>
        {record.doctorNote ? (
          <Text className={styles.text}>{record.doctorNote}</Text>
        ) : (
          <Text className={styles.empty}>暂无备注，复诊后医生会更新</Text>
        )}
      </View>

      <View className={styles.bottomBar}>
        {isSelfPhoto ? (
          <View
            className={classnames(styles.btn, relatedRecords.length === 0 && styles.disabled, styles.purple)}
            onClick={handleGoClinic}
          >
            <Text>看诊室拍摄</Text>
          </View>
        ) : (
          <View
            className={classnames(styles.btn, relatedRecords.length === 0 && styles.disabled, styles.secondary)}
            onClick={handleGoSelf}
          >
            <Text>看自助拍照</Text>
          </View>
        )}
        <View
          className={classnames(styles.btn, styles.primary, records.length < 2 && styles.disabled)}
          onClick={handleGoCompare}
        >
          <Text>📊 进入对比</Text>
        </View>
      </View>
    </View>
  );
};

export default HistoryDetailPage;
