import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store';
import classnames from 'classnames';

const HomePage: React.FC = () => {
  const { state } = useApp();
  const task = state.currentTask;
  const userInfo = state.userInfo;
  const historyRecords = state.historyRecords;
  const [loading, setLoading] = useState(false);

  usePullDownRefresh(() => {
    handleRefresh();
  });

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Taro.stopPullDownRefresh();
    }, 800);
  }, []);

  const handleGoPhotoTask = () => {
    Taro.navigateTo({
      url: '/pages/photo-task/index'
    });
  };

  const handleGoReport = () => {
    Taro.navigateTo({
      url: '/pages/photo-report/index?from=patient'
    });
  };

  const hasReportView = task.status === 'reviewing' || task.status === 'approved' || task.status === 'rejected';

  const handleGoHistory = () => {
    Taro.navigateTo({
      url: '/pages/history/index'
    });
  };

  const progressPercent = useMemo(() => {
    return task.totalCount > 0
      ? Math.round((task.completedCount / task.totalCount) * 100)
      : 0;
  }, [task]);

  const daysUntil = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointment = new Date(userInfo.nextAppointment);
    appointment.setHours(0, 0, 0, 0);
    const diff = Math.ceil((appointment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, [userInfo.nextAppointment]);

  const taskStatusInfo = useMemo(() => {
    switch (task.status) {
      case 'reviewing':
        return { desc: '照片已提交，等待护士核对中...', tag: '审核中', tagClass: 'tagReviewing' };
      case 'approved':
        return { desc: '✅ 全部照片已通过审核，复诊当天医生会查看', tag: '已通过', tagClass: 'tagApproved' };
      case 'rejected':
        return { desc: '⚠️ 有照片需要重拍，请点击进入完成重拍', tag: '需重拍', tagClass: 'tagRejected' };
      case 'in_progress':
        if (task.completedCount === 0) {
          return { desc: '开始复诊前的照片拍摄，帮助医生提前了解牙齿情况', tag: '未开始', tagClass: 'tagPending' };
        }
        return { desc: `继续完成剩余${task.totalCount - task.completedCount}张照片拍摄`, tag: '进行中', tagClass: 'tagProgress' };
      default:
        return { desc: '开始复诊前的照片拍摄', tag: '未开始', tagClass: 'tagPending' };
    }
  }, [task]);

  return (
    <ScrollView
      className={styles.container}
      scrollY
      refresherEnabled
      refresherTriggered={loading}
      onRefresherRefresh={handleRefresh}
    >
      <View className={styles.userCard}>
        <Image
          className={styles.avatar}
          src={userInfo.avatar}
          mode="aspectFill"
        />
        <View className={styles.info}>
          <Text className={styles.name}>{userInfo.name}</Text>
          <Text className={styles.stage}>{userInfo.treatmentStage} · 主治：{userInfo.doctorName}</Text>
        </View>
        <View className={styles.patientIdTag}>
          <Text>{userInfo.patientId}</Text>
        </View>
      </View>

      <View className={styles.appointmentCard}>
        <View className={styles.left}>
          <Text className={styles.label}>下次复诊</Text>
          <Text className={styles.date}>{userInfo.nextAppointment}</Text>
          <Text className={classnames(
            styles.countdown,
            daysUntil <= 3 && styles.urgent
          )}>
            {daysUntil > 3 ? `还有 ${daysUntil} 天`
              : daysUntil > 0 ? `⏰ 还有 ${daysUntil} 天，请尽快拍照`
              : daysUntil === 0 ? '🔔 就是今天！'
              : '已过期'}
          </Text>
        </View>
        <View className={styles.right}>
          <Text className={styles.icon}>📅</Text>
        </View>
      </View>

      <Text className={styles.sectionTitle}>快捷入口</Text>

      <View
        className={classnames(
          styles.entryCard,
          styles.primary,
          task.status === 'rejected' && styles.cardRejected
        )}
        onClick={handleGoPhotoTask}
      >
        <View className={styles.cardHeader}>
          <View className={styles.cardIcon}>
            <Text>📸</Text>
          </View>
          <Text className={styles.cardTitle}>今日拍照任务</Text>
          <View className={classnames(styles.tag, styles[taskStatusInfo.tagClass])}>
            <Text>{taskStatusInfo.tag}</Text>
          </View>
        </View>
        <Text className={styles.cardDesc}>{taskStatusInfo.desc}</Text>
        <View className={styles.cardFooter}>
          <View className={styles.progressInfo}>
            <View className={styles.progressBar}>
              <View
                className={styles.progressFill}
                style={{ width: `${progressPercent}%` }}
              />
            </View>
            <Text className={styles.progressText}>
              已完成 {task.completedCount} / {task.totalCount} 张
            </Text>
          </View>
          <View className={styles.footerActions}>
            {hasReportView && (
              <View
                className={classnames(styles.goBtn, styles.btnSecondary)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleGoReport();
                }}
              >
                <Text>看报告</Text>
              </View>
            )}
            <View className={styles.goBtn}>
              <Text>
                {task.status === 'approved' ? '查看' : task.status === 'rejected' ? '去重拍' : '去拍照'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View
        className={styles.entryCard}
        onClick={handleGoHistory}
      >
        <View className={styles.cardHeader}>
          <View className={classnames(styles.cardIcon, styles.iconHistory)}>
            <Text>📊</Text>
          </View>
          <Text className={styles.cardTitle}>历史变化</Text>
        </View>
        <Text className={styles.cardDesc}>
          查看历次牙齿照片记录，见证矫治过程中的每一步变化
        </Text>
        <View className={styles.secondaryFooter}>
          <Text className={styles.hintText}>
            共 {historyRecords.length} 次记录 · 含 {historyRecords.filter(r => r.type === 'self_photo').length} 次自拍
          </Text>
          <Text className={styles.goText}>去查看 →</Text>
        </View>
      </View>

      <View className={styles.tipsSection}>
        <View className={styles.tipsCard}>
          <Text className={styles.tipsTitle}>📌 拍照小贴士</Text>
          <View className={styles.tipItem}>
            <Text className={styles.tipIcon}>💡</Text>
            <Text className={styles.tipText}>选择光线充足的地方拍摄，避免背光</Text>
          </View>
          <View className={styles.tipItem}>
            <Text className={styles.tipIcon}>📏</Text>
            <Text className={styles.tipText}>保持手机与面部适当距离，确保牙齿清晰可见</Text>
          </View>
          <View className={styles.tipItem}>
            <Text className={styles.tipIcon}>⏰</Text>
            <Text className={styles.tipText}>建议在复诊前1-2天完成拍照，方便护士提前核对</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
