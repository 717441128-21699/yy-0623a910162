import React, { useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp, resetAppState } from '@/store';

const MinePage: React.FC = () => {
  const { state, dispatch } = useApp();
  const userInfo = state.userInfo;
  const progressPercent = useMemo(
    () => Math.round((userInfo.completedAppointments / userInfo.totalAppointments) * 100),
    [userInfo]
  );

  const handleResetData = () => {
    Taro.showModal({
      title: '重置演示数据',
      content: '这将清除所有拍照进度和核对记录，回到初始状态。是否继续？',
      success: (res) => {
        if (res.confirm) {
          resetAppState();
          dispatch({ type: 'RESET_TASK' });
          Taro.showToast({ title: '已重置数据', icon: 'success' });
        }
      }
    });
  };

  const handleMenuItemClick = (type: string) => {
    if (type === 'reset') {
      handleResetData();
      return;
    }
    Taro.showToast({ title: '功能开发中', icon: 'none' });
  };

  const menuGroups = [
    {
      title: '诊疗信息',
      items: [
        { icon: '📋', title: '就诊记录', desc: '查看历次复诊详情', type: 'records' },
        { icon: '🦷', title: '治疗方案', desc: '了解当前治疗进度', type: 'plan' },
        { icon: '💰', title: '费用明细', desc: '查看诊疗费用记录', type: 'billing' }
      ]
    },
    {
      title: '其他',
      items: [
        { icon: '❓', title: '帮助中心', desc: '常见问题解答', type: 'help' },
        { icon: '⚙️', title: '设置', desc: '消息通知、隐私设置', type: 'settings' },
        { icon: '📞', title: '联系诊所', desc: '电话/在线咨询', type: 'contact' },
        { icon: '🔄', title: '重置演示数据', desc: '清除所有进度，回到初始状态', type: 'reset' }
      ]
    }
  ];

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <Image
            className={styles.avatar}
            src={userInfo.avatar}
            mode="aspectFill"
          />
          <View className={styles.info}>
            <Text className={styles.name}>{userInfo.name}</Text>
            <Text className={styles.patientId}>患者编号：{userInfo.patientId}</Text>
          </View>
        </View>

        <View className={styles.treatmentCard}>
          <View className={styles.treatmentHeader}>
            <Text className={styles.label}>治疗进度</Text>
            <Text className={styles.stage}>{userInfo.treatmentStage}</Text>
          </View>
          <View className={styles.progressBar}>
            <View
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </View>
          <Text className={styles.progressText}>
            第 {userInfo.completedAppointments} / {userInfo.totalAppointments} 次复诊
          </Text>
        </View>
      </View>

      {menuGroups.map((group, groupIndex) => (
        <View key={groupIndex} className={styles.section}>
          <Text className={styles.sectionTitle}>{group.title}</Text>
          <View className={styles.menuCard}>
            {group.items.map((item, itemIndex) => (
              <View
                key={itemIndex}
                className={styles.menuItem}
                onClick={() => handleMenuItemClick(item.type)}
              >
                <View className={styles.menuIcon}>
                  <Text>{item.icon}</Text>
                </View>
                <View className={styles.menuContent}>
                  <Text className={styles.menuTitle}>{item.title}</Text>
                  <Text className={styles.menuDesc}>{item.desc}</Text>
                </View>
                <Text className={styles.menuArrow}>›</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default MinePage;
