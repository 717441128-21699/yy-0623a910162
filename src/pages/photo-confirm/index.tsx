import React, { useState, useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { photoItems } from '@/data/photoTasks';
import { useApp } from '@/store';
import classnames from 'classnames';

const PhotoConfirmPage: React.FC = () => {
  const router = useRouter();
  const itemId = router.params.itemId || '1';
  const photoUrl = decodeURIComponent(router.params.photoUrl || '');
  const { dispatch } = useApp();

  const photoItem = useMemo(() => {
    return photoItems.find(item => item.id === itemId) || photoItems[0];
  }, [itemId]);

  const [isClear, setIsClear] = useState(false);
  const [hasMolar, setHasMolar] = useState(false);

  const canSubmit = isClear && hasMolar;

  const handleRetake = () => {
    Taro.navigateBack();
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      Taro.showToast({
        title: '请确认照片清晰且露出磨牙区',
        icon: 'none'
      });
      return;
    }

    const finalPhoto = photoUrl || photoItem.exampleImage;

    Taro.showLoading({ title: '保存中...' });

    setTimeout(() => {
      dispatch({
        type: 'UPDATE_PHOTO',
        payload: { itemId, photoUrl: finalPhoto }
      });

      Taro.hideLoading();
      Taro.showToast({
        title: '照片已保存',
        icon: 'success'
      });

      setTimeout(() => {
        Taro.navigateBack();
      }, 1200);
    }, 800);
  };

  const toggleClear = () => setIsClear(!isClear);
  const toggleMolar = () => setHasMolar(!hasMolar);

  const displayPhoto = photoUrl || photoItem.exampleImage;

  return (
    <View className={styles.container}>
      <View className={styles.photoSection}>
        <Text className={styles.photoTitle}>{photoItem.name}</Text>
        <View className={styles.photoWrapper}>
          <Image
            className={styles.photo}
            src={displayPhoto}
            mode="aspectFit"
            onClick={() => {
              Taro.previewImage({
                urls: [displayPhoto],
                current: displayPhoto
              });
            }}
          />
        </View>
      </View>

      <View className={styles.checkSection}>
        <Text className={styles.sectionTitle}>✅ 照片质量确认</Text>
        <View className={styles.checkList}>
          <View className={styles.checkItem} onClick={toggleClear}>
            <View className={classnames(styles.checkIcon, isClear && styles.checked)}>
              <Text className={styles.iconText}>{isClear ? '✓' : ''}</Text>
            </View>
            <View className={styles.checkContent}>
              <Text className={styles.checkLabel}>照片清晰</Text>
              <Text className={styles.checkDesc}>牙齿和托槽清晰可见，没有模糊</Text>
            </View>
          </View>

          <View className={styles.checkItem} onClick={toggleMolar}>
            <View className={classnames(styles.checkIcon, hasMolar && styles.checked)}>
              <Text className={styles.iconText}>{hasMolar ? '✓' : ''}</Text>
            </View>
            <View className={styles.checkContent}>
              <Text className={styles.checkLabel}>露出磨牙区</Text>
              <Text className={styles.checkDesc}>能看到最后一颗磨牙，没有被嘴唇遮挡</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.tipsSection}>
        <View className={styles.tipsCard}>
          <Text className={styles.tipsTitle}>
            <Text className={styles.tipsIcon}>💡</Text>
            小提示
          </Text>
          <Text className={styles.tipsContent}>
            如果照片质量不合格，护士会标记原因并让您重拍。
            提前确认好照片质量，可以减少反复补拍的次数哦~
          </Text>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={classnames(styles.btn, styles.secondary)} onClick={handleRetake}>
          <Text>重新拍摄</Text>
        </View>
        <View
          className={classnames(styles.btn, styles.primary, !canSubmit && styles.disabled)}
          onClick={handleSubmit}
        >
          <Text>{canSubmit ? '确认并继续' : '请完成两项确认'}</Text>
        </View>
      </View>
    </View>
  );
};

export default PhotoConfirmPage;
