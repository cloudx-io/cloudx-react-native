import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DemoEnvironmentConfig } from '../config/DemoConfig';

interface InterstitialScreenProps {
  environment: DemoEnvironmentConfig;
}

const InterstitialScreen: React.FC<InterstitialScreenProps> = ({ environment }) => {
  return (
    <View style={styles.container}>
      <Text>Interstitial Screen - Coming Soon</Text>
      <Text>Placement: {environment.interstitialPlacement}</Text>
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

export default InterstitialScreen;

