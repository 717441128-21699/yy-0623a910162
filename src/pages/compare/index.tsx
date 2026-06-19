import React, { useState, useMemo } from 'react';
import { View, Text, Image, Slider, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import { HistoryRecord } from '@/types';
import classnames from 'classnames';

const photoTypes = ['正面咬合照', '左侧咬合照', '右侧咬合照', '上牙弓照', '下牙弓照'];
const PLACEHOLDER = 'https://picsum.photos/id/64/600/600';

const getPhotoAt = (record: HistoryRecord | null, index: number): string => {
  if (!record || !record.photos || record.photos.length === 0) return PLACEHOLDER;
  return record.photos[index % record.photos.length];
};

const ComparePage: React.FC = () => {
  const router = useRouter();
  const { state } = useApp();
  const records = state.historyRecords;

  const appointmentId = router.params.appointmentId || '';
  const leftIdParam = router.params.leftId || '';
  const rightIdParam = router.params.rightId || '';

  const { defaultLeft, defaultRight, matchHint, matchType } = useMemo(() => {
    let left: HistoryRecord | null = null;
    let right: HistoryRecord | null = null;
    let hint = '';
    let mType: 'appointment' | 'explicit' | 'fallback' = 'fallback';

    if (appointmentId) {
      const group = records.filter(r => r.appointmentId === appointmentId);
      const self = group.find(r => r.type === 'self_photo') || null;
      const clinic = group.find(r => r.type === 'clinic_photo') || null;

      if (self && clinic) {
        left = self;
        right = clinic;
        mType = 'appointment';
        hint = '已匹配本次复诊的自拍（左）与诊室拍摄（右）';
      } else if (self && !clinic) {
        left = self;
        const others = records.filter(r => r.type === 'clinic_photo');
        right = others.length > 0 ? others[0] : null;
        mType = 'appointment';
        hint = '⚠️ 本次复诊暂无诊室拍摄，已用最近一次诊室拍摄对比';
      } else if (!self && clinic) {
        right = clinic;
        const others = records.filter(r => r.type === 'self_photo');
        left = others.length > 0 ? others[0] : null;
        mType = 'appointment';
        hint = '⚠️ 本次复诊暂无自助拍照，已用最近一次自拍对比';
      } else {
        hint = '⚠️ 本次复诊尚未找到拍摄记录';
      }
    }

    if (leftIdParam) {
      const r = records.find(x => x.id === leftIdParam);
      if (r) { left = r; mType = 'explicit'; }
    }
    if (rightIdParam) {
      const r = records.find(x => x.id === rightIdParam);
      if (r) { right = r; mType = 'explicit'; }
    }

    if (!left && records.length > 0) {
      left = records.length > 1 ? records[records.length - 1] : records[0];
    }
    if (!right && records.length > 0) {
      right = records[0];
    }

    return { defaultLeft: left, defaultRight: right, matchHint: hint, matchType: mType };
  }, [records, appointmentId, leftIdParam, rightIdParam]);

  const [leftRecord, setLeftRecord] = useState<HistoryRecord | null>(defaultLeft);
  const [rightRecord, setRightRecord] = useState<HistoryRecord | null>(defaultRight);
  const [activePhotoType, setActivePhotoType] = useState<number>(0);
  const [sliderValue, setSliderValue] = useState(50);

  const safeLeft = leftRecord || defaultLeft;
  const safeRight = rightRecord || defaultRight;

  const leftPhoto = useMemo(() => getPhotoAt(safeLeft, activePhotoType), [safeLeft, activePhotoType]);
  const rightPhoto = useMemo(() => getPhotoAt(safeRight, activePhotoType), [safeRight, activePhotoType]);

  const missingLeft = !safeLeft;
  const missingRight = !safeRight;

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
    if (!safeLeft) return;
    const urls = safeLeft.photos?.length ? safeLeft.photos : [PLACEHOLDER];
    Taro.previewImage({ urls, current: leftPhoto });
  };

  const handlePreviewRight = () => {
    if (!safeRight) return;
    const urls = safeRight.photos?.length ? safeRight.photos : [PLACEHOLDER];
    Taro.previewImage({ urls, current: rightPhoto });
  };

  const calcInterval = (a: HistoryRecord | null, b: HistoryRecord | null) => {
    if (!a || !b) return '—';
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
      {matchHint && (
        <View className={classnames(
          styles.matchHint,
          matchHint.startsWith('⚠️') ? styles.hintWarn : styles.hintOk
        )}>
          <Text>{matchHint}</Text>
        </View>
      )}

      <View className={styles.selector}>
        <View className={classnames(styles.selectorItem, missingLeft && styles.missing)} onClick={handleLeftSelect}>
          <Text className={styles.label}>对比前</Text>
          {safeLeft ? (
            <>
              <Text className={styles.value}>{safeLeft.date}</Text>
              <Text className={styles.subLabel}>{safeLeft.typeLabel}</Text>
            </>
          ) : (
            <Text className={styles.emptyVal}>点击选择记录</Text>
          )}
        </View>
        <View className={classnames(styles.selectorItem, missingRight && styles.missing)} onClick={handleRightSelect}>
          <Text className={styles.label}>对比后</Text>
          {safeRight ? (
            <>
              <Text className={styles.value}>{safeRight.date}</Text>
              <Text className={styles.subLabel}>{safeRight.typeLabel}</Text>
            </>
          ) : (
            <Text className={styles.emptyVal}>点击选择记录</Text>
          )}
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
          <View className={classnames(styles.compareItem, missingLeft && styles.missingItem)}>
            <View className={styles.itemHeader}>
              <Text className={styles.itemLabel}>{safeLeft?.typeLabel || '暂无记录'}</Text>
              <Text className={styles.itemDate}>{safeLeft?.date || '—'}</Text>
            </View>
            <View className={styles.photoWrapper} onClick={handlePreviewLeft}>
              {safeLeft ? (
                <Image className={styles.photo} src={leftPhoto} mode="aspectFill" />
              ) : (
                <View className={styles.emptyPhoto}>
                  <Text className={styles.emptyIcon}>📭</Text>
                  <Text className={styles.emptyPhotoText}>尚未有自拍记录</Text>
                  <Text className={styles.emptyPhotoSub}>完成拍摄后可在此对比</Text>
                </View>
              )}
            </View>
          </View>

          <View className={classnames(styles.compareItem, missingRight && styles.missingItem)}>
            <View className={styles.itemHeader}>
              <Text className={styles.itemLabel}>{safeRight?.typeLabel || '暂无记录'}</Text>
              <Text className={styles.itemDate}>{safeRight?.date || '—'}</Text>
            </View>
            <View className={styles.photoWrapper} onClick={handlePreviewRight}>
              {safeRight ? (
                <Image className={styles.photo} src={rightPhoto} mode="aspectFill" />
              ) : (
                <View className={styles.emptyPhoto}>
                  <Text className={styles.emptyIcon}>🦷</Text>
                  <Text className={styles.emptyPhotoText}>暂无诊室拍摄记录</Text>
                  <Text className={styles.emptyPhotoSub}>复诊当天医生会补充</Text>
                </View>
              )}
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
            <Text className={styles.infoValue}>
              {safeLeft ? `${safeLeft.date} · ${safeLeft.typeLabel}` : '—'}
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>对比后</Text>
            <Text className={styles.infoValue}>
              {safeRight ? `${safeRight.date} · ${safeRight.typeLabel}` : '—'}
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>间隔时间</Text>
            <Text className={styles.infoValue}>{calcInterval(safeLeft, safeRight)}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>当前照片</Text>
            <Text className={styles.infoValue}>{photoTypes[activePhotoType]}</Text>
          </View>

          {safeRight?.doctorNote && (
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
