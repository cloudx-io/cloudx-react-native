import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DemoEnvironmentConfig } from '../config/DemoConfig';

interface MRECScreenProps {
  environment: DemoEnvironmentConfig;
}

const MRECScreen: React.FC<MRECScreenProps> = ({ environment }) => {
  return (
    <View style={styles.container}>
      <Text>MREC Screen - Coming Soon</Text>
      <Text>Placement: {environment.mrecPlacement}</Text>
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

export default MRECScreen;

