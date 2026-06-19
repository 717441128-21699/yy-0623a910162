import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import { ReviewPhoto } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import classnames from 'classnames';

const ReviewDetailPage: React.FC = () => {
  const router = useRouter();
  const taskId = router.params.id || '';
  const { state, dispatch } = useApp();

  const task = useMemo(() => {
    return state.reviewTasks.find(t => t.id === taskId) || state.reviewTasks[0];
  }, [state.reviewTasks, taskId]);

  const rejectReasons = state.rejectReasons;

  const [photos, setPhotos] = useState<ReviewPhoto[]>(task ? [...task.photos] : []);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentPhotoId, setCurrentPhotoId] = useState<string | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  const handleApprovePhoto = (photoId: string) => {
    const newPhotos = photos.map(p =>
      p.id === photoId ? { ...p, status: 'approved' as const, rejectReason: undefined } : p
    );
    setPhotos(newPhotos);
    if (task) {
      dispatch({ type: 'APPROVE_REVIEW_PHOTO', payload: { taskId: task.id, photoId } });
    }
    Taro.showToast({ title: '已通过', icon: 'success' });
  };

  const handleRejectPhoto = (photoId: string) => {
    setCurrentPhotoId(photoId);
    setSelectedReasons([]);
    setShowRejectModal(true);
  };

  const handleToggleReason = (reasonId: string) => {
    setSelectedReasons(prev =>
      prev.includes(reasonId)
        ? prev.filter(r => r !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleConfirmReject = () => {
    if (selectedReasons.length === 0 || !currentPhotoId) {
      Taro.showToast({ title: '请选择不合格原因', icon: 'none' });
      return;
    }

    const reasonLabels = rejectReasons
      .filter(r => selectedReasons.includes(r.id))
      .map(r => r.label);

    const reasonStr = reasonLabels.join('、');

    const newPhotos = photos.map(p =>
      p.id === currentPhotoId
        ? { ...p, status: 'rejected' as const, rejectReason: reasonStr }
        : p
    );
    setPhotos(newPhotos);

    if (task) {
      dispatch({
        type: 'REJECT_REVIEW_PHOTO',
        payload: { taskId: task.id, photoId: currentPhotoId, reasons: reasonLabels }
      });
    }

    setShowRejectModal(false);
    setCurrentPhotoId(null);
    setSelectedReasons([]);
    Taro.showToast({ title: '已标记重拍', icon: 'none' });
  };

  const handleCancelReject = () => {
    setShowRejectModal(false);
    setCurrentPhotoId(null);
    setSelectedReasons([]);
  };

  const handleBatchApprove = () => {
    Taro.showModal({
      title: '确认通过',
      content: '确定要通过所有照片吗？',
      success: (res) => {
        if (res.confirm) {
          const newPhotos = photos.map(p => ({ ...p, status: 'approved' as const, rejectReason: undefined }));
          setPhotos(newPhotos);
          if (task) {
            dispatch({ type: 'APPROVE_ALL_REVIEW', payload: { taskId: task.id } });
          }
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

    Taro.showLoading({ title: '提交中...' });
    setTimeout(() => {
      if (task) {
        dispatch({ type: 'APPLY_REVIEW_RESULTS', payload: { taskId: task.id } });
      }
      Taro.hideLoading();
      Taro.showToast({
        title: `审核完成\n通过${approvedCount}张，重拍${rejectedCount}张`,
        icon: 'none',
        duration: 2000
      });
      setTimeout(() => Taro.navigateBack(), 2000);
    }, 800);
  };

  const handlePreviewPhoto = (url: string) => {
    Taro.previewImage({
      urls: photos.map(p => p.url),
      current: url
    });
  };

  if (!task) {
    return (
      <View className={styles.container}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>⚠️</Text>
          <Text className={styles.emptyText}>未找到核对任务</Text>
        </View>
      </View>
    );
  }

  const approvedCount = photos.filter(p => p.status === 'approved').length;
  const rejectedCount = photos.filter(p => p.status === 'rejected').length;
  const pendingCount = photos.filter(p => p.status === 'pending').length;
  const allDone = pendingCount === 0;

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
        <View className={styles.badgeWrap}>
          <StatusBadge status={task.status === 'pending' ? 'reviewing' : task.status} />
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
          <View
            key={photo.id}
            className={classnames(
              styles.photoItem,
              photo.status === 'rejected' && styles.itemRejected
            )}
          >
            <View className={styles.photoHeader}>
              <Text className={styles.photoName}>{photo.name}</Text>
              {photo.status !== 'pending' && (
                <StatusBadge status={photo.status} size="small" />
              )}
            </View>

            <View className={styles.photoContent}>
              <Image
                className={styles.photo}
                src={photo.url}
                mode="aspectFill"
                onClick={() => handlePreviewPhoto(photo.url)}
              />
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
                  <Text>✅ 通过</Text>
                </View>
                <View
                  className={classnames(styles.btn, styles.reject)}
                  onClick={() => handleRejectPhoto(photo.id)}
                >
                  <Text>❌ 不合格</Text>
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
          className={classnames(styles.btn, styles.primary, !allDone && styles.disabled)}
          onClick={handleSubmit}
        >
          <Text>
            {allDone ? `提交审核结果` : `还剩${pendingCount}张未审核`}
          </Text>
        </View>
      </View>

      {showRejectModal && (
        <View className={styles.rejectModal} onClick={handleCancelReject}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>选择不合格原因（可多选）</Text>

            <View className={styles.reasonGrid}>
              {rejectReasons.map(reason => (
                <View
                  key={reason.id}
                  className={classnames(
                    styles.reasonItem,
                    selectedReasons.includes(reason.id) && styles.selected
                  )}
                  onClick={() => handleToggleReason(reason.id)}
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
                className={classnames(styles.btn, styles.confirm, selectedReasons.length === 0 && styles.disabled)}
                onClick={handleConfirmReject}
              >
                <Text>确认（{selectedReasons.length}）</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ReviewDetailPage;
