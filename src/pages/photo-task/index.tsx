import React from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import { PhotoItem as PhotoItemType } from '@/types';
import classnames from 'classnames';

const PhotoTaskPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const task = state.currentTask;

  const handleStartCapture = (itemId: string) => {
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
    if (task.completedCount === 0) {
      Taro.showToast({ title: '请先拍摄至少一张照片', icon: 'none' });
      return;
    }
    if (task.status === 'reviewing' || task.status === 'approved') {
      Taro.showToast({ title: '已提交，无需重复提交', icon: 'none' });
      return;
    }
    if (task.completedCount < task.totalCount) {
      Taro.showModal({
        title: '提示',
        content: `还有 ${task.totalCount - task.completedCount} 张照片未拍摄，确定要提交吗？`,
        confirmText: '确定提交',
        cancelText: '继续拍摄',
        success: (res) => {
          if (res.confirm) doSubmit();
        }
      });
    } else {
      doSubmit();
    }
  };

  const doSubmit = () => {
    Taro.showLoading({ title: '提交中...' });
    setTimeout(() => {
      dispatch({ type: 'SUBMIT_TASK' });
      Taro.hideLoading();
      Taro.showToast({ title: '提交成功，请等待护士核对', icon: 'success' });
      setTimeout(() => {
        Taro.redirectTo({ url: '/pages/photo-report/index?from=patient' });
      }, 1200);
    }, 800);
  };

  const handleGoReport = () => {
    Taro.navigateTo({ url: '/pages/photo-report/index?from=patient' });
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

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      pending: 'statusPending',
      submitted: 'statusSubmitted',
      approved: 'statusApproved',
      rejected: 'statusRejected'
    };
    return map[status] || 'statusPending';
  };

  const getActionBtnConfig = (item: PhotoItemType) => {
    switch (item.status) {
      case 'pending':
        return { text: '去拍摄', className: 'primary' };
      case 'submitted':
        return { text: '查看', className: 'secondary' };
      case 'approved':
        return { text: '已通过', className: 'approved' };
      case 'rejected':
        return { text: '重拍', className: 'warning' };
      default:
        return { text: '去拍摄', className: 'primary' };
    }
  };

  const handleItemClick = (item: PhotoItemType) => {
    if (item.status === 'approved') {
      if (item.userPhoto) handleViewPhoto(item.userPhoto);
      return;
    }
    handleStartCapture(item.id);
  };

  const progressPercent = task.totalCount > 0
    ? Math.round((task.completedCount / task.totalCount) * 100)
    : 0;

  const canSubmit = task.completedCount > 0 && task.status !== 'reviewing' && task.status !== 'approved';

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
          {progressPercent === 100 && (
            <Text className={styles.progressComplete}>✅ 已完成全部拍摄</Text>
          )}
        </View>
      </View>

      <ScrollView scrollY className={styles.photoList}>
        <Text className={styles.listTitle}>拍摄项目</Text>

        {task.items.map((item, index) => {
          const btnConfig = getActionBtnConfig(item);
          const hasPhoto = !!item.userPhoto;

          return (
            <View
              key={item.id}
              className={classnames(styles.photoItem, item.status === 'rejected' && styles.itemRejected)}
              onClick={() => handleItemClick(item)}
            >
              <View className={styles.photoPreview}>
                {hasPhoto ? (
                  <>
                    <Image
                      className={styles.previewImg}
                      src={item.userPhoto!}
                      mode="aspectFill"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPhoto(item.userPhoto!);
                      }}
                    />
                    <View className={classnames(styles.statusOverlay, styles[getStatusClass(item.status)])}>
                      <Text className={styles.statusText}>{getStatusText(item.status)}</Text>
                    </View>
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
                {item.status === 'rejected' && item.rejectReason && (
                  <View className={styles.rejectReason}>
                    <Text className={styles.rejectIcon}>⚠️</Text>
                    <Text className={styles.rejectText}>不合格原因：{item.rejectReason}</Text>
                  </View>
                )}
              </View>

              <View
                className={classnames(styles.actionBtn, styles[btnConfig.className])}
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick(item);
                }}
              >
                <Text>{btnConfig.text}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View className={styles.bottomBar}>
        {(task.status === 'reviewing' || task.status === 'approved' || task.status === 'rejected') && (
          <View className={styles.reportBtn} onClick={handleGoReport}>
            <Text className={styles.reportIcon}>📊</Text>
            <Text>查看拍照报告</Text>
          </View>
        )}
        {task.status === 'reviewing' && (
          <View className={styles.reviewingHint}>
            <Text className={styles.hintIcon}>⏳</Text>
            <Text className={styles.hintText}>已提交，等待护士核对中...</Text>
          </View>
        )}
        {task.status === 'approved' && (
          <View className={styles.approvedHint}>
            <Text className={styles.hintIcon}>✅</Text>
            <Text className={styles.hintText}>全部照片已通过审核</Text>
          </View>
        )}
        {task.status !== 'reviewing' && task.status !== 'approved' && (
          <View
            className={classnames(styles.submitBtn, !canSubmit && styles.disabled)}
            onClick={handleSubmit}
          >
            <Text>
              {task.completedCount === 0 ? '请先拍摄照片' : `提交审核 (${task.completedCount}张)`}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default PhotoTaskPage;
