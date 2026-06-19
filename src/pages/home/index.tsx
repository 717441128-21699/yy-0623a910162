import React, { useState, useCallback } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import { currentTask, mockUserInfo } from '@/data/photoTasks';
import { PhotoTask, UserInfo } from '@/types';
import classnames from 'classnames';

const HomePage: React.FC = () => {
  const [task, setTask] = useState<PhotoTask>(currentTask);
  const [userInfo] = useState<UserInfo>(mockUserInfo);
  const [loading, setLoading] = useState(false);

  useDidShow(() => {
    console.log('[HomePage] 页面显示');
  });

  usePullDownRefresh(() => {
    console.log('[HomePage] 下拉刷新');
    handleRefresh();
  });

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  }, []);

  const handleGoPhotoTask = () => {
    console.log('[HomePage] 跳转到拍照任务页');
    Taro.navigateTo({
      url: '/pages/photo-task/index'
    });
  };

  const handleGoHistory = () => {
    console.log('[HomePage] 跳转到历史变化页');
    Taro.navigateTo({
      url: '/pages/history/index'
    });
  };

  const progressPercent = task.totalCount > 0
    ? Math.round((task.completedCount / task.totalCount) * 100)
    : 0;

  const getDaysUntilAppointment = () => {
    const today = new Date();
    const appointment = new Date(userInfo.nextAppointment);
    const diff = Math.ceil((appointment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysUntil = getDaysUntilAppointment();

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
      </View>

      <View className={styles.appointmentCard}>
        <View className={styles.left}>
          <Text className={styles.label}>下次复诊</Text>
          <Text className={styles.date}>{userInfo.nextAppointment}</Text>
          <Text className={styles.countdown}>
            {daysUntil > 0 ? `还有 ${daysUntil} 天` : daysUntil === 0 ? '就是今天！' : '已过期'}
          </Text>
        </View>
        <View className={styles.right}>
          <Text className={styles.icon}>📅</Text>
        </View>
      </View>

      <Text className={styles.sectionTitle}>快捷入口</Text>

      <View
        className={classnames(styles.entryCard, styles.primary)}
        onClick={handleGoPhotoTask}
      >
        <View className={styles.cardHeader}>
          <View className={styles.cardIcon}>
            <Text>📸</Text>
          </View>
          <Text className={styles.cardTitle}>今日拍照任务</Text>
        </View>
        <Text className={styles.cardDesc}>
          {task.status === 'in_progress'
            ? '继续完成复诊前的照片拍摄，帮助医生提前了解牙齿情况'
            : task.status === 'submitted'
              ? '照片已提交，等待护士核对'
              : task.status === 'approved'
                ? '照片已通过审核，复诊当天医生会查看'
                : task.status === 'rejected'
                  ? '有照片需要重拍，请尽快完成'
                  : '开始复诊前的照片拍摄'}
        </Text>
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
          <View className={styles.goBtn}>
            <Text>去拍照</Text>
          </View>
        </View>
      </View>

      <View
        className={styles.entryCard}
        onClick={handleGoHistory}
      >
        <View className={styles.cardHeader}>
          <View className={styles.cardIcon}>
            <Text>📊</Text>
          </View>
          <Text className={styles.cardTitle}>历史变化</Text>
        </View>
        <Text className={styles.cardDesc}>
          查看历次牙齿照片记录，见证矫治过程中的每一步变化
        </Text>
        <View className={styles.secondaryFooter}>
          <Text className={styles.hintText}>共 9 次记录 · 最早 2025年7月</Text>
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
