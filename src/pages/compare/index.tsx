import React, { useState, useMemo } from 'react';
import { View, Text, Image, Slider, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import { HistoryRecord } from '@/types';
import classnames from 'classnames';

const photoTypes = ['正面咬合照', '左侧咬合照', '右侧咬合照', '上牙弓照', '下牙弓照'];
const PLACEHOLDER = 'https://picsum.photos/id/64/600/600';

const getPhotoAt = (record: HistoryRecord, index: number): string => {
  if (!record || !record.photos || record.photos.length === 0) return PLACEHOLDER;
  return record.photos[index % record.photos.length];
};

const ComparePage: React.FC = () => {
  const { state } = useApp();
  const records = state.historyRecords;

  const defaultLeft = records.length > 1 ? records[records.length - 1] : records[0];
  const defaultRight = records[0];

  const [leftRecord, setLeftRecord] = useState<HistoryRecord>(defaultLeft);
  const [rightRecord, setRightRecord] = useState<HistoryRecord>(defaultRight);
  const [activePhotoType, setActivePhotoType] = useState<number>(0);
  const [sliderValue, setSliderValue] = useState(50);

  const safeLeft = leftRecord || defaultLeft;
  const safeRight = rightRecord || defaultRight;

  const leftPhoto = useMemo(() => getPhotoAt(safeLeft, activePhotoType), [safeLeft, activePhotoType]);
  const rightPhoto = useMemo(() => getPhotoAt(safeRight, activePhotoType), [safeRight, activePhotoType]);

  const handleLeftSelect = () => {
    if (records.length === 0) return;
    Taro.showActionSheet({
      itemList: records.map(r => `${r.date} ${r.typeLabel}`),
      success: (res) => {
        const rec = records[res.tapIndex];
        if (rec) setLeftRecord(rec);
      }
    });
  };

  const handleRightSelect = () => {
    if (records.length === 0) return;
    Taro.showActionSheet({
      itemList: records.map(r => `${r.date} ${r.typeLabel}`),
      success: (res) => {
        const rec = records[res.tapIndex];
        if (rec) setRightRecord(rec);
      }
    });
  };

  const handlePhotoTypeChange = (index: number) => {
    setActivePhotoType(index);
  };

  const handleSliderChange = (e: any) => {
    setSliderValue(e.detail.value);
  };

  const handlePreviewLeft = () => {
    const urls = safeLeft.photos?.length ? safeLeft.photos : [PLACEHOLDER];
    Taro.previewImage({ urls, current: leftPhoto });
  };

  const handlePreviewRight = () => {
    const urls = safeRight.photos?.length ? safeRight.photos : [PLACEHOLDER];
    Taro.previewImage({ urls, current: rightPhoto });
  };

  const calcInterval = (a: HistoryRecord, b: HistoryRecord) => {
    try {
      const d1 = new Date(a.date);
      const d2 = new Date(b.date);
      const diff = Math.abs(d2.getTime() - d1.getTime());
      const months = Math.round(diff / (1000 * 60 * 60 * 24 * 30));
      return months > 0 ? `约 ${months} 个月` : '不足 1 个月';
    } catch {
      return '—';
    }
  };

  return (
    <View className={styles.container}>
      <View className={styles.selector}>
        <View className={styles.selectorItem} onClick={handleLeftSelect}>
          <Text className={styles.label}>对比前</Text>
          <Text className={styles.value}>{safeLeft.date}</Text>
          <Text className={styles.subLabel}>{safeLeft.typeLabel}</Text>
        </View>
        <View className={styles.selectorItem} onClick={handleRightSelect}>
          <Text className={styles.label}>对比后</Text>
          <Text className={styles.value}>{safeRight.date}</Text>
          <Text className={styles.subLabel}>{safeRight.typeLabel}</Text>
        </View>
      </View>

      <ScrollView scrollX className={styles.photoTypeTab}>
        {photoTypes.map((type, index) => (
          <View
            key={index}
            className={classnames(styles.tabItem, activePhotoType === index && styles.active)}
            onClick={() => handlePhotoTypeChange(index)}
          >
            <Text>{type}</Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView scrollY className={styles.compareSection}>
        <View className={styles.compareGrid}>
          <View className={styles.compareItem}>
            <View className={styles.itemHeader}>
              <Text className={styles.itemLabel}>{safeLeft.typeLabel}</Text>
              <Text className={styles.itemDate}>{safeLeft.date}</Text>
            </View>
            <View className={styles.photoWrapper} onClick={handlePreviewLeft}>
              <Image className={styles.photo} src={leftPhoto} mode="aspectFill" />
            </View>
          </View>

          <View className={styles.compareItem}>
            <View className={styles.itemHeader}>
              <Text className={styles.itemLabel}>{safeRight.typeLabel}</Text>
              <Text className={styles.itemDate}>{safeRight.date}</Text>
            </View>
            <View className={styles.photoWrapper} onClick={handlePreviewRight}>
              <Image className={styles.photo} src={rightPhoto} mode="aspectFill" />
            </View>
          </View>
        </View>

        <View className={styles.sliderSection}>
          <Text className={styles.sliderTitle}>滑动对比</Text>
          <View className={styles.sliderContainer}>
            <Image className={styles.photoBase} src={leftPhoto} mode="aspectFill" />
            <View className={styles.photoOverlay} style={{ width: `${sliderValue}%` }}>
              <Image className={styles.overlayImg} src={rightPhoto} mode="aspectFill" />
            </View>
            <View className={styles.sliderLine} style={{ left: `${sliderValue}%` }}>
              <View className={styles.sliderHandle}>
                <Text className={styles.handleIcon}>⇋</Text>
              </View>
            </View>
          </View>

          <Slider
            min={0}
            max={100}
            value={sliderValue}
            activeColor="#2D7FF9"
            backgroundColor="#E5E7EB"
            blockSize={24}
            onChange={handleSliderChange}
          />

          <Text className={styles.sliderHint}>拖动滑块查看左右对比效果</Text>
        </View>

        <View className={styles.infoSection}>
          <Text className={styles.infoTitle}>治疗信息</Text>

          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>对比前</Text>
            <Text className={styles.infoValue}>{safeLeft.date} · {safeLeft.typeLabel}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>对比后</Text>
            <Text className={styles.infoValue}>{safeRight.date} · {safeRight.typeLabel}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>间隔时间</Text>
            <Text className={styles.infoValue}>{calcInterval(safeLeft, safeRight)}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>当前照片</Text>
            <Text className={styles.infoValue}>{photoTypes[activePhotoType]}</Text>
          </View>

          {safeRight.doctorNote && (
            <View className={styles.doctorNote}>
              <Text className={styles.noteLabel}>📝 医生备注</Text>
              <Text className={styles.noteText}>{safeRight.doctorNote}</Text>
            </View>
          )}
        </View>

        <View className={styles.reminderSection}>
          <Text className={styles.reminderTitle}>
            <Text className={styles.reminderIcon}>💡</Text>
            温馨提示
          </Text>
          <Text className={styles.reminderText}>
            请继续保持良好的口腔卫生习惯，按时佩戴保持器和皮筋。
            如有任何不适，请及时联系您的主治医生。
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ComparePage;
