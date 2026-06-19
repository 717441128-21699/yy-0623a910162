import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';

interface TimelineItemProps {
  date: string;
  type: 'self_photo' | 'clinic_photo';
  typeLabel: string;
  description: string;
  photos: string[];
  doctorNote?: string;
  isLast?: boolean;
  onClick?: () => void;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  date,
  type,
  typeLabel,
  description,
  photos,
  doctorNote,
  isLast = false,
  onClick
}) => {
  const handlePhotoClick = (url: string) => {
    Taro.previewImage({
      urls: photos,
      current: url
    });
  };

  return (
    <View className={classnames(styles.item, isLast && styles.lastItem)}>
      <View className={styles.timelineLine} />
      <View className={styles.dot}>
        <View className={classnames(styles.dotInner, type === 'clinic_photo' && styles.dotClinic)} />
      </View>

      <View className={styles.content} onClick={onClick}>
        <View className={styles.header}>
          <Text className={styles.date}>{date}</Text>
          <View className={classnames(styles.typeTag, type === 'clinic_photo' && styles.typeClinic)}>
            <Text className={styles.typeText}>{typeLabel}</Text>
          </View>
        </View>

        <Text className={styles.description}>{description}</Text>

        <View className={styles.photos}>
          {photos.slice(0, 5).map((photo, index) => (
            <Image
              key={index}
              className={styles.photo}
              src={photo}
              mode="aspectFill"
              onClick={(e) => {
                e.stopPropagation();
                handlePhotoClick(photo);
              }}
            />
          ))}
        </View>

        {doctorNote && (
          <View className={styles.doctorNote}>
            <Text className={styles.noteLabel}>医生备注</Text>
            <Text className={styles.noteText}>{doctorNote}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default TimelineItem;
