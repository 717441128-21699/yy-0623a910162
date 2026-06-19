import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { reviewTasks, rejectReasons } from '@/data/reviewTasks';
import { ReviewPhoto } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import classnames from 'classnames';

const ReviewDetailPage: React.FC = () => {
  const router = useRouter();
  const taskId = router.params.id || 'r1';

  const task = useMemo(() => {
    return reviewTasks.find(t => t.id === taskId) || reviewTasks[0];
  }, [taskId]);

  const [photos, setPhotos] = useState<ReviewPhoto[]>(task.photos);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentPhotoId, setCurrentPhotoId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const handleApprovePhoto = (photoId: string) => {
    console.log(`[ReviewDetail] 通过照片: ${photoId}`);
    setPhotos(prev =>
      prev.map(p =>
        p.id === photoId ? { ...p, status: 'approved', rejectReason: undefined } : p
      )
    );
    Taro.showToast({ title: '已通过', icon: 'success' });
  };

  const handleRejectPhoto = (photoId: string) => {
    console.log(`[ReviewDetail] 拒绝照片: ${photoId}`);
    setCurrentPhotoId(photoId);
    setSelectedReason(null);
    setShowRejectModal(true);
  };

  const handleSelectReason = (reasonId: string) => {
    setSelectedReason(reasonId);
  };

  const handleConfirmReject = () => {
    if (!selectedReason || !currentPhotoId) {
      Taro.showToast({ title: '请选择不合格原因', icon: 'none' });
      return;
    }

    const reason = rejectReasons.find(r => r.id === selectedReason);
    setPhotos(prev =>
      prev.map(p =>
        p.id === currentPhotoId
          ? { ...p, status: 'rejected', rejectReason: reason?.label }
          : p
      )
    );

    setShowRejectModal(false);
    setCurrentPhotoId(null);
    setSelectedReason(null);
    Taro.showToast({ title: '已标记重拍', icon: 'none' });
  };

  const handleCancelReject = () => {
    setShowRejectModal(false);
    setCurrentPhotoId(null);
    setSelectedReason(null);
  };

  const handleBatchApprove = () => {
    console.log('[ReviewDetail] 批量通过');
    Taro.showModal({
      title: '确认通过',
      content: '确定要通过所有照片吗？',
      success: (res) => {
        if (res.confirm) {
          setPhotos(prev =>
            prev.map(p => ({ ...p, status: 'approved', rejectReason: undefined }))
          );
          Taro.showToast({ title: '全部通过', icon: 'success' });
        }
      }
    });
  };

  const handleSubmit = () => {
    const approvedCount = photos.filter(p => p.status === 'approved').length;
    const rejectedCount = photos.filter(p => p.status === 'rejected').length;
    const pendingCount = photos.filter(p => p.status === 'pending').length;

    if (pendingCount > 0) {
      Taro.showToast({ title: '还有照片未审核', icon: 'none' });
      return;
    }

    console.log('[ReviewDetail] 提交审核结果');
    Taro.showLoading({ title: '提交中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({
        title: `审核完成\n通过${approvedCount}张，重拍${rejectedCount}张`,
        icon: 'none',
        duration: 2000
      });
      setTimeout(() => {
        Taro.navigateBack();
      }, 2000);
    }, 1500);
  };

  const handlePreviewPhoto = (url: string) => {
    Taro.previewImage({
      urls: photos.map(p => p.url),
      current: url
    });
  };

  const approvedCount = photos.filter(p => p.status === 'approved').length;
  const rejectedCount = photos.filter(p => p.status === 'rejected').length;
  const pendingCount = photos.filter(p => p.status === 'pending').length;

  return (
    <View className={styles.container}>
      <View className={styles.patientHeader}>
        <Image
          className={styles.avatar}
          src={task.patientAvatar}
          mode="aspectFill"
        />
        <View className={styles.patientInfo}>
          <Text className={styles.name}>{task.patientName}</Text>
          <Text className={styles.meta}>
            提交于 {task.submitTime} · 复诊 {task.appointmentDate}
          </Text>
        </View>
      </View>

      <ScrollView scrollY className={styles.photoList}>
        <Text className={styles.listTitle}>
          照片列表（{photos.length}张）
          <Text style={{ fontSize: '24rpx', color: '#86909C', marginLeft: '12rpx' }}>
            已通过{approvedCount} · 需重拍{rejectedCount} · 待审核{pendingCount}
          </Text>
        </Text>

        {photos.map(photo => (
          <View key={photo.id} className={styles.photoItem}>
            <View className={styles.photoHeader}>
              <Text className={styles.photoName}>{photo.name}</Text>
            </View>

            <View className={styles.photoContent}>
              <Image
                className={styles.photo}
                src={photo.url}
                mode="aspectFill"
                onClick={() => handlePreviewPhoto(photo.url)}
              />
              {photo.status !== 'pending' && (
                <View className={styles.statusBadge}>
                  <StatusBadge status={photo.status} size="small" />
                </View>
              )}
            </View>

            {photo.status === 'rejected' && photo.rejectReason && (
              <View className={styles.rejectSection}>
                <Text className={styles.rejectLabel}>不合格原因</Text>
                <Text className={styles.rejectReason}>{photo.rejectReason}</Text>
              </View>
            )}

            {photo.status === 'pending' && (
              <View className={styles.actionButtons}>
                <View
                  className={classnames(styles.btn, styles.approve)}
                  onClick={() => handleApprovePhoto(photo.id)}
                >
                  <Text>通过</Text>
                </View>
                <View
                  className={classnames(styles.btn, styles.reject)}
                  onClick={() => handleRejectPhoto(photo.id)}
                >
                  <Text>不合格</Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View className={styles.bottomBar}>
        <View
          className={classnames(styles.btn, styles.secondary)}
          onClick={handleBatchApprove}
        >
          <Text>全部通过</Text>
        </View>
        <View
          className={classnames(styles.btn, styles.primary)}
          onClick={handleSubmit}
        >
          <Text>提交审核结果</Text>
        </View>
      </View>

      {showRejectModal && (
        <View className={styles.rejectModal} onClick={handleCancelReject}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>选择不合格原因</Text>

            <View className={styles.reasonGrid}>
              {rejectReasons.map(reason => (
                <View
                  key={reason.id}
                  className={classnames(
                    styles.reasonItem,
                    selectedReason === reason.id && styles.selected
                  )}
                  onClick={() => handleSelectReason(reason.id)}
                >
                  <Text className={styles.reasonIcon}>{reason.icon}</Text>
                  <Text className={styles.reasonLabel}>{reason.label}</Text>
                </View>
              ))}
            </View>

            <View className={styles.modalButtons}>
              <View
                className={classnames(styles.btn, styles.cancel)}
                onClick={handleCancelReject}
              >
                <Text>取消</Text>
              </View>
              <View
                className={classnames(styles.btn, styles.confirm)}
                onClick={handleConfirmReject}
              >
                <Text>确认</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ReviewDetailPage;
