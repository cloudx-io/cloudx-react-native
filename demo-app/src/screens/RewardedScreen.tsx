import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DemoEnvironmentConfig } from '../config/DemoConfig';

interface RewardedScreenProps {
  environment: DemoEnvironmentConfig;
}

const RewardedScreen: React.FC<RewardedScreenProps> = ({ environment }) => {
  return (
    <View style={styles.container}>
      <Text>Rewarded Screen - Coming Soon</Text>
      <Text>Placement: {environment.rewardedPlacement}</Text>
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

export default RewardedScreen;

