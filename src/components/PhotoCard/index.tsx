import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';

interface PhotoCardProps {
  imageUrl: string;
  title?: string;
  status?: 'default' | 'selected' | 'error';
  showStatusIcon?: boolean;
  onClick?: () => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({
  imageUrl,
  title,
  status = 'default',
  showStatusIcon = false,
  onClick
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.previewImage({
        urls: [imageUrl],
        current: imageUrl
      });
    }
  };

  return (
    <View
      className={classnames(
        styles.card,
        status === 'selected' && styles.selected,
        status === 'error' && styles.error
      )}
      onClick={handleClick}
    >
      <Image
        className={styles.image}
        src={imageUrl}
        mode="aspectFill"
        lazyLoad
      />
      {title && (
        <View className={styles.titleContainer}>
          <Text className={styles.title}>{title}</Text>
        </View>
      )}
      {showStatusIcon && status === 'selected' && (
        <View className={styles.checkIcon}>
          <Text className={styles.checkText}>✓</Text>
        </View>
      )}
      {showStatusIcon && status === 'error' && (
        <View className={styles.errorIcon}>
          <Text className={styles.errorText}>!</Text>
        </View>
      )}
    </View>
  );
};

export default PhotoCard;
