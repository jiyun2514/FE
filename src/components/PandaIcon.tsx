// src/components/PandaIcon.tsx

import React from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';

type PandaIconSize = 'small' | 'medium' | 'large';

interface PandaIconProps {
  size?: PandaIconSize;
  style?: StyleProp<ViewStyle>;
}

// 이 경로 기준: src/components → src/assets/images
const pandaImg = require('../assets/images/panda-mascot.png');

const SIZE_MAP: Record<PandaIconSize, number> = {
  small: 48,  // w-12 h-12 느낌
  medium: 80, // w-20 h-20
  large: 112, // w-28 h-28
};

export default function PandaIcon({ size = 'medium', style }: PandaIconProps) {
  const dimension = SIZE_MAP[size];

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
        },
        style,
      ]}
    >
      <Image source={pandaImg} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
