import React, { useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { photoItems } from '@/data/photoTasks';
import { PhotoItem } from '@/types';

const CaptureGuidePage: React.FC = () => {
  const router = useRouter();
  const itemId = router.params.itemId || '1';

  const photoItem = useMemo(() => {
    return photoItems.find(item => item.id === itemId) || photoItems[0];
  }, [itemId]);

  const handleTakePhoto = () => {
    console.log('[CaptureGuide] 开始拍照');
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        console.log('[CaptureGuide] 拍照成功:', tempFilePath);
        Taro.navigateTo({
          url: `/pages/photo-confirm/index?itemId=${itemId}&photoUrl=${encodeURIComponent(tempFilePath)}`
        });
      },
      fail: (err) => {
        console.error('[CaptureGuide] 拍照失败:', err);
      }
    });
  };

  const handleChooseFromAlbum = () => {
    console.log('[CaptureGuide] 从相册选择');
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        console.log('[CaptureGuide] 选择图片成功:', tempFilePath);
        Taro.navigateTo({
          url: `/pages/photo-confirm/index?itemId=${itemId}&photoUrl=${encodeURIComponent(tempFilePath)}`
        });
      }
    });
  };

  return (
    <View className={styles.container}>
      <Text className={styles.photoName}>{photoItem.name}</Text>

      <ScrollView scrollY>
        <View className={styles.exampleSection}>
          <Text className={styles.sectionTitle}>📷 拍摄示例</Text>
          <View className={styles.exampleCard}>
            <Image
              className={styles.exampleImage}
              src={photoItem.exampleImage}
              mode="aspectFill"
              onClick={() => {
                Taro.previewImage({
                  urls: [photoItem.exampleImage],
                  current: photoItem.exampleImage
                });
              }}
            />
            <View className={styles.exampleInfo}>
              {photoItem.tips.map((tip, index) => (
                <View key={index} className={styles.tipItem}>
                  <Text className={styles.tipIcon}>✓</Text>
                  <Text className={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.guideSection}>
          <Text className={styles.sectionTitle}>📋 拍摄要点</Text>
          <View className={styles.guideList}>
            <View className={styles.guideItem}>
              <View className={styles.guideIcon}>
                <Text>📏</Text>
              </View>
              <View className={styles.guideContent}>
                <Text className={styles.guideLabel}>拍摄距离</Text>
                <Text className={styles.guideText}>{photoItem.distanceTip}</Text>
              </View>
            </View>

            <View className={styles.guideItem}>
              <View className={styles.guideIcon}>
                <Text>👄</Text>
              </View>
              <View className={styles.guideContent}>
                <Text className={styles.guideLabel}>张口方式</Text>
                <Text className={styles.guideText}>{photoItem.mouthTip}</Text>
              </View>
            </View>

            <View className={styles.guideItem}>
              <View className={styles.guideIcon}>
                <Text>🦷</Text>
              </View>
              <View className={styles.guideContent}>
                <Text className={styles.guideLabel}>咬合状态</Text>
                <Text className={styles.guideText}>{photoItem.biteTip}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.captureBtn} onClick={handleTakePhoto}>
          <Text className={styles.btnIcon}>📸</Text>
          <Text>开始拍照</Text>
        </View>
        <Text className={styles.hintText} onClick={handleChooseFromAlbum}>
          从相册选择照片
        </Text>
      </View>
    </View>
  );
};

export default CaptureGuidePage;
