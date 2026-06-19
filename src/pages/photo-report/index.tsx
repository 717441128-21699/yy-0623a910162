import React, { useMemo, useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import { ActionLog, PhotoItem, PhotoTask, ReviewTask } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import classnames from 'classnames';

const PhotoReportPage: React.FC = () => {
  const router = useRouter();
  const { state } = useApp();

  const from = (router.params.from || 'patient') as 'patient' | 'staff';
  const targetReviewId = router.params.reviewId || '';

  const now = useMemo(() => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }, []);

  const reviewTask = useMemo<ReviewTask | undefined>(() => {
    if (from === 'staff' && targetReviewId) {
      return state.reviewTasks.find(r => r.id === targetReviewId);
    }
    const patientTask = state.currentTask;
    if (patientTask.reviewTaskId) {
      return state.reviewTasks.find(r => r.id === patientTask.reviewTaskId);
    }
    return state.reviewTasks.find(
      r => r.patientName === state.userInfo.name && r.appointmentDate === patientTask.appointmentDate
    );
  }, [state.reviewTasks, state.currentTask, state.userInfo.name, from, targetReviewId]);

  const task: PhotoTask = useMemo(() => {
    if (from === 'staff' && reviewTask) {
      const items: PhotoItem[] = reviewTask.photos.map((rp, idx) => ({
        id: rp.id,
        name: rp.name,
        description: `第${idx + 1}项拍摄`,
        exampleImage: rp.url,
        tips: [],
        distanceTip: '',
        mouthTip: '',
        biteTip: '',
        status: rp.status,
        userPhoto: rp.url,
        rejectReason: rp.rejectReason,
        submittedAt: reviewTask.submitTime,
      }));
      const total = state.currentTask.items.length > 0 ? state.currentTask.items.length : items.length;
      const missingCount = Math.max(0, total - items.length);
      for (let i = items.length; i < total; i++) {
        const original = state.currentTask.items[i];
        items.push({
          id: original?.id || `missing-${i}`,
          name: original?.name || `第${i + 1}项`,
          description: original?.description || '',
          exampleImage: original?.exampleImage || 'https://picsum.photos/id/64/300/300',
          tips: [],
          distanceTip: '',
          mouthTip: '',
          biteTip: '',
          status: 'pending',
        });
      }
      const hasRejected = items.some(i => i.status === 'rejected');
      const allApproved = items.filter(i => i.status !== 'pending').length > 0
        && items.filter(i => i.status !== 'pending').every(i => i.status === 'approved');
      return {
        id: `staff-task-${reviewTask.id}`,
        title: '复诊前自拍检查',
        deadline: '-',
        appointmentDate: reviewTask.appointmentDate,
        appointmentId: reviewTask.appointmentId,
        doctorName: state.currentTask.doctorName,
        items,
        totalCount: items.length,
        completedCount: items.filter(i => i.status !== 'pending').length,
        status: allApproved ? 'approved' : hasRejected ? 'rejected' : reviewTask.status === 'pending' ? 'reviewing' : reviewTask.status,
        submittedAt: reviewTask.submitTime,
        reviewedAt: reviewTask.reviewedAt,
        reviewTaskId: reviewTask.id,
        overallNote: reviewTask.overallNote,
        patientTip: reviewTask.patientTip,
        actionLogs: reviewTask.actionLogs,
      };
    }
    return state.currentTask;
  }, [from, reviewTask, state.currentTask]);

  const patientName = from === 'staff' && reviewTask ? reviewTask.patientName : state.userInfo.name;
  const patientId = from === 'staff' && reviewTask ? `PAT-${reviewTask.id.slice(-6)}` : state.userInfo.patientId;
  const patientAvatar = from === 'staff' && reviewTask ? reviewTask.patientAvatar : state.userInfo.avatar;

  const submittedItems = task.items.filter(i => i.status === 'submitted' || i.status === 'approved' || i.status === 'rejected');
  const missingItems = task.items.filter(i => i.status === 'pending');
  const approvedItems = task.items.filter(i => i.status === 'approved');
  const rejectedItems = task.items.filter(i => i.status === 'rejected');
  const pendingReview = submittedItems.filter(i => i.status === 'submitted');

  const total = task.totalCount;
  const submittedCount = submittedItems.length;
  const progressPct = Math.round((submittedCount / total) * 100);
  const ringStyle = { '--p': `${progressPct}%` } as React.CSSProperties;

  const reportStatus = useMemo(() => {
    switch (task.status) {
      case 'approved':
        return { text: '全部通过', tagClass: 'tagApproved' };
      case 'rejected':
        return { text: '有照片需重拍', tagClass: 'tagRejected' };
      case 'reviewing':
        return { text: '护士核对中', tagClass: 'tagReviewing' };
      case 'pending':
        return { text: '未开始拍摄', tagClass: 'tagPending' };
      default:
        if (submittedCount === 0) return { text: '未上传照片', tagClass: 'tagPending' };
        if (submittedCount < total) return { text: '拍摄进行中', tagClass: 'tagProgress' };
        return { text: '已提交待核对', tagClass: 'tagReviewing' };
    }
  }, [task.status, submittedCount, total]);

  const currentStage = useMemo(() => {
    if (task.status === 'approved') {
      return {
        owner: 'doctor',
        ownerName: '医生',
        ownerIcon: '🦷',
        ownerLabel: '目前在医生手里',
        nextStep: '医生复诊当天会使用这些照片进行对比查看，请按时到诊。',
        variant: 'doctor',
      } as const;
    }
    if (task.status === 'rejected' || rejectedItems.length > 0) {
      return {
        owner: 'patient',
        ownerName: '患者',
        ownerIcon: '🙋',
        ownerLabel: '现在轮到您处理',
        nextStep: `请尽快重新拍摄 ${rejectedItems.length} 张不合格的照片，完成后再次提交。`,
        variant: 'patient',
      } as const;
    }
    if (task.status === 'reviewing' || pendingReview.length > 0) {
      return {
        owner: 'staff',
        ownerName: '护士',
        ownerIcon: '👩‍⚕️',
        ownerLabel: '目前在护士手里',
        nextStep: '护士正在核对照片，通常 30 分钟内会给出结果，请留意通知。',
        variant: 'staff',
      } as const;
    }
    if (submittedCount > 0 && submittedCount < total) {
      return {
        owner: 'patient',
        ownerName: '患者',
        ownerIcon: '📸',
        ownerLabel: '现在轮到您处理',
        nextStep: `还有 ${total - submittedCount} 张未完成，继续拍摄后即可提交审核。`,
        variant: 'patient',
      } as const;
    }
    return {
      owner: 'patient',
      ownerName: '患者',
      ownerIcon: '🎯',
      ownerLabel: '等待开始拍摄',
      nextStep: '请点击下方「继续拍摄」按引导完成所有项目。',
      variant: 'patient',
    } as const;
  }, [task.status, rejectedItems.length, pendingReview.length, submittedCount, total]);

  const actionLogs = useMemo<ActionLog[]>(() => {
    const logs: ActionLog[] = task.actionLogs ? [...task.actionLogs] : [];
    logs.sort((a, b) => a.time.localeCompare(b.time));
    return logs;
  }, [task.actionLogs]);

  function missingCountStr(s: number, t: number) {
    return s < t ? `，还有 ${t - s} 张未完成` : '';
  }
  function describeReview(ok: number, fail: number, pending: number) {
    const parts: string[] = [];
    if (ok > 0) parts.push(`${ok} 张通过`);
    if (fail > 0) parts.push(`${fail} 张不合格`);
    if (pending > 0) parts.push(`${pending} 张待审核`);
    if (parts.length === 0) return '尚未开始审核';
    return parts.join('，');
  }

  const handleViewPhoto = (url: string) => {
    const urls = submittedItems.filter(i => i.userPhoto).map(i => i.userPhoto!) as string[];
    if (urls.length === 0) return;
    Taro.previewImage({ urls, current: url });
  };

  const handleGoRetake = (itemId: string) => {
    Taro.navigateTo({
      url: `/pages/capture-guide/index?itemId=${itemId}`
    });
  };

  const handleGoContinue = () => {
    Taro.redirectTo({ url: '/pages/photo-task/index' });
  };

  const handleGoSubmit = () => {
    if (submittedCount === 0) {
      Taro.showToast({ title: '请先拍摄至少一张照片', icon: 'none' });
      return;
    }
    Taro.redirectTo({ url: '/pages/photo-task/index' });
  };

  const handleGoCompare = () => {
    if (state.historyRecords.length < 2) {
      Taro.showToast({ title: '记录不足', icon: 'none' });
      return;
    }
    const aptId = task.appointmentId || '';
    const url = aptId
      ? `/pages/compare/index?appointmentId=${aptId}`
      : '/pages/compare/index';
    Taro.navigateTo({ url });
  };

  const handleGoReviewDetail = () => {
    if (!reviewTask) return;
    Taro.redirectTo({
      url: `/pages/review-detail/index?id=${reviewTask.id}`
    });
  };

  const handleGoBackWorkbench = () => {
    Taro.switchTab({ url: '/pages/workbench/index' });
  };

  const renderPhotoCard = (item: PhotoItem, idx: number) => {
    const isMissing = item.status === 'pending';
    const isRejected = item.status === 'rejected';

    let statusLabel = '';
    let statusClass = '';
    if (isMissing) { statusLabel = '未上传'; statusClass = 'tagMissing'; }
    else if (isRejected) { statusLabel = '需重拍'; statusClass = 'tagRejected'; }
    else if (item.status === 'approved') { statusLabel = '通过'; statusClass = 'tagApproved'; }
    else { statusLabel = '待核对'; statusClass = 'tagSubmitted'; }

    return (
      <View
        key={item.id}
        className={classnames(
          styles.photoCard,
          isMissing && styles.cardMissing,
          isRejected && styles.cardRejected
        )}
        onClick={() => !isMissing && item.userPhoto && handleViewPhoto(item.userPhoto)}
      >
        <View className={styles.photoWrap}>
          {isMissing ? (
            <View className={styles.placeholder}>
              <Text className={styles.phIcon}>📷</Text>
              <Text className={styles.phText}>尚未拍摄</Text>
            </View>
          ) : (
            <>
              <Image className={styles.photo} src={item.userPhoto || item.exampleImage} mode="aspectFill" />
              <View className={classnames(styles.statusTag, styles[statusClass])}>
                <Text>{statusLabel}</Text>
              </View>
            </>
          )}
        </View>
        <View className={styles.cardFooter}>
          <Text className={styles.name}>{idx + 1}. {item.name}</Text>
          {!isMissing && <Text className={styles.time}>{item.submittedAt || '刚刚上传'}</Text>}
          {isRejected && item.rejectReason && (
            <Text className={styles.reason}>⚠️ {item.rejectReason}</Text>
          )}
        </View>
      </View>
    );
  };

  const appointmentNth = useMemo(() => {
    if (from === 'staff' && reviewTask) {
      const datePart = reviewTask.appointmentDate.replace(/-/g, '').slice(4);
      return `${parseInt(datePart.slice(0, 2))}月${parseInt(datePart.slice(2))}日`;
    }
    return `${state.userInfo.completedAppointments + 1} 次`;
  }, [from, reviewTask, state.userInfo.completedAppointments]);

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        {from === 'staff' && reviewTask && (
          <View className={styles.patientBanner}>
            <Image className={styles.bannerAvatar} src={patientAvatar} mode="aspectFill" />
            <View className={styles.bannerInfo}>
              <Text className={styles.bannerName}>{patientName}</Text>
              <Text className={styles.bannerMeta}>ID：{patientId} · 复诊 {task.appointmentDate}</Text>
            </View>
            <View className={styles.bannerTag}>护士视角</View>
          </View>
        )}
        <Text className={styles.title}>
          {from === 'staff' ? `${patientName} 的复诊拍照报告` : `第 ${appointmentNth} 次复诊拍照报告`}
        </Text>
        <Text className={styles.subtitle}>医生：{task.doctorName} · 复诊：{task.appointmentDate}</Text>
        <View className={styles.statusBadge}>
          {reportStatus.text}
        </View>
      </View>

      <View className={styles.summarySection}>
        <View className={styles.summaryCard}>
          <View className={styles.metaRow}>
            <View className={styles.metaItem}>
              <Text className={styles.label}>患者姓名</Text>
              <Text className={styles.value}>{patientName}</Text>
            </View>
            <View className={styles.metaItem}>
              <Text className={styles.label}>患者 ID</Text>
              <Text className={styles.value}>{patientId}</Text>
            </View>
            <View className={styles.metaItem}>
              <Text className={styles.label}>提交时间</Text>
              <Text className={styles.value}>{task.submittedAt || (submittedCount > 0 ? now : '未提交')}</Text>
            </View>
            <View className={styles.metaItem}>
              <Text className={styles.label}>核对人</Text>
              <Text className={styles.value}>{reviewTask?.reviewedBy || (reviewTask ? '李护士' : '待分配')}</Text>
            </View>
          </View>

          <View className={styles.progressRow}>
            <View className={styles.progressRing} style={ringStyle}>
              <Text className={styles.ringText}>{progressPct}%</Text>
            </View>
            <View className={styles.stats}>
              <View className={classnames(styles.statBox, styles.statSubmitted)}>
                <Text className={styles.num}>{submittedCount}</Text>
                <Text className={styles.label}>已上传</Text>
              </View>
              <View className={classnames(styles.statBox, styles.statApproved)}>
                <Text className={styles.num}>{approvedItems.length}</Text>
                <Text className={styles.label}>已通过</Text>
              </View>
              <View className={classnames(styles.statBox, styles.statRejected)}>
                <Text className={styles.num}>{rejectedItems.length}</Text>
                <Text className={styles.label}>需重拍</Text>
              </View>
              <View className={classnames(styles.statBox, styles.statPending)}>
                <Text className={styles.num}>{pendingReview.length}</Text>
                <Text className={styles.label}>待核对</Text>
              </View>
              <View className={classnames(styles.statBox, styles.statMissing)}>
                <Text className={styles.num}>{missingItems.length}</Text>
                <Text className={styles.label}>未完成</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView scrollY style={{ flex: 1 }}>
        <View className={classnames(
          styles.stageCard,
          styles[`stage${currentStage.variant.charAt(0).toUpperCase() + currentStage.variant.slice(1)}`]
        )}>
          <View className={styles.stageLeft}>
            <Text className={styles.stageIcon}>{currentStage.ownerIcon}</Text>
          </View>
          <View className={styles.stageContent}>
            <Text className={styles.stageLabel}>{currentStage.ownerLabel}</Text>
            <Text className={styles.stageNext}>下一步：{currentStage.nextStep}</Text>
          </View>
        </View>

        <View className={styles.photoSection}>
          <Text className={styles.sectionTitle}>
            📋 照片清单
            <Text className={styles.count}>（共 {total} 项）</Text>
          </Text>
          <View className={styles.photoGrid}>
            {task.items.map((item, idx) => renderPhotoCard(item, idx))}
          </View>
        </View>

        <View className={styles.timeline}>
          <Text className={styles.tlTitle}>� 处理记录</Text>
          {actionLogs.length > 0 ? (
            <View className={styles.tlList}>
              {actionLogs.map((log, i) => {
                const isLast = i === actionLogs.length - 1;
                return (
                  <View
                    key={log.id}
                    className={classnames(
                      styles.logItem,
                      isLast && styles.logLast,
                      styles[`logActor${log.actor.charAt(0).toUpperCase() + log.actor.slice(1)}`]
                    )}
                  >
                    <View className={styles.logDot}>
                      <View className={styles.dotInner} />
                    </View>
                    <View className={styles.logBody}>
                      <View className={styles.logHead}>
                        <Text className={styles.logTitle}>{log.title}</Text>
                        <Text className={styles.logTime}>{log.time.slice(5)}</Text>
                      </View>
                      <Text className={styles.logDesc}>{log.description}</Text>
                      {log.photoName && (
                        <View className={styles.logMeta}>
                          <Text className={styles.metaLabel}>照片</Text>
                          <Text className={styles.metaValue}>{log.photoName}</Text>
                        </View>
                      )}
                      {log.reasons && log.reasons.length > 0 && (
                        <View className={styles.logReasons}>
                          {log.reasons.map((r, ri) => (
                            <Text key={ri} className={styles.reasonChip}>⚠️ {r}</Text>
                          ))}
                        </View>
                      )}
                      <Text className={styles.logActor}>
                        {log.actor === 'patient' ? '👤 ' : log.actor === 'staff' ? '👩‍⚕️ ' : log.actor === 'doctor' ? '🦷 ' : '🤖 '}
                        {log.actorName}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className={styles.logEmpty}>
              <Text>暂无处理记录，提交任务后会实时更新</Text>
            </View>
          )}
        </View>

        {from === 'staff' ? (
          <>
            {task.overallNote && (
              <View className={styles.staffNote}>
                <Text className={styles.noteTitle}>📝 护士交接备注（内部）</Text>
                <Text className={styles.noteText}>{task.overallNote}</Text>
              </View>
            )}
            {reviewTask?.handoverNote && reviewTask.handoverNote !== task.overallNote && (
              <View className={styles.staffNote}>
                <Text className={styles.noteTitle}>🧾 医生重点关注</Text>
                <Text className={styles.noteText}>{reviewTask.handoverNote}</Text>
              </View>
            )}
          </>
        ) : (
          <>
            {task.patientTip && (
              <View className={styles.patientTip}>
                <Text className={styles.tipIcon}>💡</Text>
                <Text className={styles.tipText}>{task.patientTip}</Text>
              </View>
            )}
            {task.status === 'rejected' && rejectedItems.length > 0 && (
              <View className={styles.patientTipWarn}>
                <Text className={styles.tipIcon}>⚠️</Text>
                <View className={styles.tipContent}>
                  <Text className={styles.tipTitle}>不合格的 {rejectedItems.length} 张照片请尽快重拍</Text>
                  {rejectedItems.map((it, i) => (
                    <Text key={it.id} className={styles.tipRow}>
                      · {it.name}：{it.rejectReason}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View className={styles.bottomBar}>
        {from === 'staff' ? (
          <>
            <View className={classnames(styles.btn, styles.secondary)} onClick={handleGoBackWorkbench}>
              <Text>工作台</Text>
            </View>
            {reviewTask && (
              <View className={classnames(styles.btn, styles.warning)} onClick={handleGoReviewDetail}>
                <Text>核对详情</Text>
              </View>
            )}
            <View className={classnames(styles.btn, styles.primary)} onClick={handleGoCompare}>
              <Text>同次历史对比</Text>
            </View>
          </>
        ) : (
          <>
            {missingItems.length > 0 && (
              <View className={classnames(styles.btn, styles.warning)} onClick={handleGoContinue}>
                <Text>继续拍摄（{missingItems.length}张）</Text>
              </View>
            )}
            {rejectedItems.length > 0 && (
              <View className={classnames(styles.btn, styles.primary)} onClick={() => handleGoRetake(rejectedItems[0].id)}>
                <Text>去重拍（{rejectedItems.length}张）</Text>
              </View>
            )}
            {task.status === 'in_progress' && submittedCount > 0 && rejectedItems.length === 0 && missingItems.length > 0 && (
              <View className={classnames(styles.btn, styles.primary)} onClick={handleGoSubmit}>
                <Text>先去提交</Text>
              </View>
            )}
            {(task.status === 'reviewing' || task.status === 'approved' || task.status === 'rejected') && (
              <>
                <View className={classnames(styles.btn, styles.secondary)} onClick={() => Taro.switchTab({ url: '/pages/home/index' })}>
                  <Text>返回首页</Text>
                </View>
                <View className={classnames(styles.btn, styles.primary)} onClick={handleGoCompare}>
                  <Text>查看历史对比</Text>
                </View>
              </>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default PhotoReportPage;
