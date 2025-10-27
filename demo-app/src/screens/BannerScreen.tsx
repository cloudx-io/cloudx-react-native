import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DemoEnvironmentConfig } from '../config/DemoConfig';

interface BannerScreenProps {
  environment: DemoEnvironmentConfig;
}

const BannerScreen: React.FC<BannerScreenProps> = ({ environment }) => {
  return (
    <View style={styles.container}>
      <Text>Banner Screen - Coming Soon</Text>
      <Text>Placement: {environment.bannerPlacement}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BannerScreen;

