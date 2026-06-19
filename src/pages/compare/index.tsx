import React, { useState } from 'react';
import { View, Text, Image, Slider } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { historyRecords } from '@/data/historyRecords';
import { HistoryRecord } from '@/types';
import classnames from 'classnames';

const ComparePage: React.FC = () => {
  const [leftRecord, setLeftRecord] = useState<HistoryRecord>(historyRecords[historyRecords.length - 1]);
  const [rightRecord, setRightRecord] = useState<HistoryRecord>(historyRecords[0]);
  const [activePhotoType, setActivePhotoType] = useState<number>(0);
  const [sliderValue, setSliderValue] = useState(50);

  const photoTypes = ['正面咬合照', '左侧咬合照', '右侧咬合照', '上牙弓照', '下牙弓照'];

  const leftPhoto = leftRecord.photos[activePhotoType] || leftRecord.photos[0];
  const rightPhoto = rightRecord.photos[activePhotoType] || rightRecord.photos[0];

  const handleLeftSelect = () => {
    console.log('[Compare] 选择左侧照片');
    Taro.showActionSheet({
      itemList: historyRecords.map(r => `${r.date} ${r.typeLabel}`),
      success: (res) => {
        setLeftRecord(historyRecords[res.tapIndex]);
      }
    });
  };

  const handleRightSelect = () => {
    console.log('[Compare] 选择右侧照片');
    Taro.showActionSheet({
      itemList: historyRecords.map(r => `${r.date} ${r.typeLabel}`),
      success: (res) => {
        setRightRecord(historyRecords[res.tapIndex]);
      }
    });
  };

  const handlePhotoTypeChange = (index: number) => {
    setActivePhotoType(index);
    console.log(`[Compare] 切换照片类型: ${photoTypes[index]}`);
  };

  const handleSliderChange = (e: any) => {
    setSliderValue(e.detail.value);
  };

  const handlePreviewLeft = () => {
    Taro.previewImage({
      urls: leftRecord.photos,
      current: leftPhoto
    });
  };

  const handlePreviewRight = () => {
    Taro.previewImage({
      urls: rightRecord.photos,
      current: rightPhoto
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.selector}>
        <View className={styles.selectorItem} onClick={handleLeftSelect}>
          <Text className={styles.label}>对比前</Text>
          <Text className={styles.value}>{leftRecord.date}</Text>
        </View>
        <View className={styles.selectorItem} onClick={handleRightSelect}>
          <Text className={styles.label}>对比后</Text>
          <Text className={styles.value}>{rightRecord.date}</Text>
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
              <Text className={styles.itemLabel}>{leftRecord.typeLabel}</Text>
              <Text className={styles.itemDate}>{leftRecord.date}</Text>
            </View>
            <View className={styles.photoWrapper} onClick={handlePreviewLeft}>
              <Image
                className={styles.photo}
                src={leftPhoto}
                mode="aspectFill"
              />
            </View>
          </View>

          <View className={styles.compareItem}>
            <View className={styles.itemHeader}>
              <Text className={styles.itemLabel}>{rightRecord.typeLabel}</Text>
              <Text className={styles.itemDate}>{rightRecord.date}</Text>
            </View>
            <View className={styles.photoWrapper} onClick={handlePreviewRight}>
              <Image
                className={styles.photo}
                src={rightPhoto}
                mode="aspectFill"
              />
            </View>
          </View>
        </View>

        <View className={styles.sliderSection}>
          <Text className={styles.sliderTitle}>滑动对比</Text>
          <View className={styles.sliderContainer}>
            <Image
              className={styles.photoBase}
              src={leftPhoto}
              mode="aspectFill"
            />
            <View
              className={styles.photoOverlay}
              style={{ width: `${sliderValue}%` }}
            >
              <Image
                className={styles.overlayImg}
                src={rightPhoto}
                mode="aspectFill"
              />
            </View>
            <View
              className={styles.sliderLine}
              style={{ left: `${sliderValue}%` }}
            >
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
            <Text className={styles.infoValue}>{leftRecord.date} · {leftRecord.typeLabel}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>对比后</Text>
            <Text className={styles.infoValue}>{rightRecord.date} · {rightRecord.typeLabel}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>间隔时间</Text>
            <Text className={styles.infoValue}>约 11 个月</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>当前照片</Text>
            <Text className={styles.infoValue}>{photoTypes[activePhotoType]}</Text>
          </View>

          {rightRecord.doctorNote && (
            <View className={styles.doctorNote}>
              <Text className={styles.noteLabel}>📝 医生备注</Text>
              <Text className={styles.noteText}>{rightRecord.doctorNote}</Text>
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
