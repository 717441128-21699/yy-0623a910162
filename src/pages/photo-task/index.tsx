import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { currentTask } from '@/data/photoTasks';
import { PhotoItem as PhotoItemType, PhotoTask } from '@/types';
import classnames from 'classnames';

const PhotoTaskPage: React.FC = () => {
  const [task, setTask] = useState<PhotoTask>(currentTask);

  const handleStartCapture = (itemId: string) => {
    console.log(`[PhotoTask] 开始拍摄: ${itemId}`);
    Taro.navigateTo({
      url: `/pages/capture-guide/index?itemId=${itemId}`
    });
  };

  const handleViewPhoto = (url: string) => {
    Taro.previewImage({
      urls: [url],
      current: url
    });
  };

  const handleSubmit = () => {
    if (task.completedCount < task.totalCount) {
      Taro.showModal({
        title: '提示',
        content: `还有 ${task.totalCount - task.completedCount} 张照片未拍摄，确定要提交吗？`,
        confirmText: '确定提交',
        cancelText: '继续拍摄',
        success: (res) => {
          if (res.confirm) {
            doSubmit();
          }
        }
      });
    } else {
      doSubmit();
    }
  };

  const doSubmit = () => {
    console.log('[PhotoTask] 提交照片任务');
    Taro.showLoading({ title: '提交中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '提交成功', icon: 'success' });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    }, 1500);
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '待拍摄',
      submitted: '已提交',
      approved: '已通过',
      rejected: '需重拍'
    };
    return map[status] || status;
  };

  const getActionBtnConfig = (item: PhotoItemType) => {
    switch (item.status) {
      case 'pending':
        return { text: '去拍摄', className: 'primary' };
      case 'submitted':
        return { text: '查看', className: 'secondary' };
      case 'approved':
        return { text: '查看', className: 'secondary' };
      case 'rejected':
        return { text: '重拍', className: 'warning' };
      default:
        return { text: '去拍摄', className: 'primary' };
    }
  };

  const progressPercent = task.totalCount > 0
    ? Math.round((task.completedCount / task.totalCount) * 100)
    : 0;

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.taskTitle}>{task.title}</Text>
        <View className={styles.taskMeta}>
          <View className={styles.metaItem}>
            <Text className={styles.metaLabel}>医生：</Text>
            <Text>{task.doctorName}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaLabel}>复诊：</Text>
            <Text>{task.appointmentDate}</Text>
          </View>
        </View>
        <View className={styles.progressSection}>
          <View className={styles.progressHeader}>
            <Text className={styles.progressLabel}>拍摄进度</Text>
            <Text className={styles.progressNum}>
              {task.completedCount} / {task.totalCount} 张
            </Text>
          </View>
          <View className={styles.progressBar}>
            <View
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.photoList}>
        <Text className={styles.listTitle}>拍摄项目</Text>

        {task.items.map((item, index) => {
          const btnConfig = getActionBtnConfig(item);
          const hasPhoto = item.userPhoto && item.status !== 'pending';

          return (
            <View
              key={item.id}
              className={styles.photoItem}
              onClick={() => handleStartCapture(item.id)}
            >
              <View className={styles.photoPreview}>
                {hasPhoto ? (
                  <>
                    <Image
                      className={styles.previewImg}
                      src={item.userPhoto}
                      mode="aspectFill"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPhoto(item.userPhoto!);
                      }}
                    />
                    {item.status !== 'pending' && (
                      <View className={styles.statusOverlay}>
                        <Text className={styles.statusText}>
                          {getStatusText(item.status)}
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <Text className={styles.placeholderIcon}>📷</Text>
                )}
              </View>

              <View className={styles.photoInfo}>
                <Text className={styles.photoName}>
                  {index + 1}. {item.name}
                </Text>
                <Text className={styles.photoDesc}>{item.description}</Text>
              </View>

              <View className={classnames(styles.actionBtn, styles[btnConfig.className])}>
                <Text>{btnConfig.text}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View className={styles.bottomBar}>
        <View
          className={styles.submitBtn}
          onClick={handleSubmit}
        >
          <Text>提交审核</Text>
        </View>
      </View>
    </View>
  );
};

export default PhotoTaskPage;
