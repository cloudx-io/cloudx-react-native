/**
 * Banner Ad Screen
 * Demonstrates CloudX banner ad integration
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CloudXBannerView } from 'cloudx-react-native';
import { DemoEnvironmentConfig } from '../config/DemoConfig';
import { logger } from '../utils/DemoAppLogger';

interface BannerScreenProps {
  environment: DemoEnvironmentConfig;
}

const BannerScreen: React.FC<BannerScreenProps> = ({ environment }) => {
  const [status, setStatus] = useState('No Ad Loaded');
  const [statusColor, setStatusColor] = useState('#F44336');
  const [shouldRenderBanner, setShouldRenderBanner] = useState(false);
  const [key, setKey] = useState(0);

  // Clear logs when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      logger.clearLogs();
    }, [])
  );

  const handleLoadBanner = () => {
    logger.logMessage('🔄 User clicked Load Banner');
    setStatus('Loading...');
    setStatusColor('#FF9800');
    setShouldRenderBanner(true);
    setKey(prev => prev + 1); // Force new instance
  };

  const handleAdLoaded = (event: any) => {
    logger.logAdEvent('✅ Banner loaded', event);
    setStatus('Banner Ad Loaded');
    setStatusColor('#4CAF50');
  };

  const handleAdFailedToLoad = (event: any) => {
    logger.logAdEvent('❌ Banner failed to load', event);
    logger.logMessage(`  Error: ${event.error}`);
    setStatus(`Failed: ${event.error}`);
    setStatusColor('#F44336');
    setShouldRenderBanner(false); // Hide on error
  };

  const handleAdShown = (event: any) => {
    logger.logAdEvent('👀 Banner shown', event);
  };

  const handleAdClicked = (event: any) => {
    logger.logAdEvent('👆 Banner clicked', event);
    setStatus('Banner Ad Clicked');
  };

  const handleAdHidden = (event: any) => {
    logger.logAdEvent('🙈 Banner hidden', event);
  };

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: statusColor },
          ]}
        />
        <Text style={[styles.statusText, { color: statusColor }]}>
          {status}
        </Text>
      </View>

      {/* Load Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.loadButton,
            shouldRenderBanner && styles.loadButtonDisabled
          ]}
          onPress={handleLoadBanner}
          disabled={shouldRenderBanner}>
          <Text style={styles.buttonText}>Load Banner</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.spacer} />

      {/* Banner Display Area at Bottom - ONLY render when button pressed */}
      <View style={styles.bannerContainer}>
        {shouldRenderBanner ? (
          <CloudXBannerView
            key={key}
            placement={environment.bannerPlacement}
            adId={`banner_${key}_${Date.now()}`}
            bannerSize="BANNER"
            shouldLoad={true}
            onAdLoaded={handleAdLoaded}
            onAdFailedToLoad={handleAdFailedToLoad}
            onAdShown={handleAdShown}
            onAdClicked={handleAdClicked}
            onAdHidden={handleAdHidden}
            style={styles.banner}
          />
        ) : (
          <View style={styles.emptyBanner}>
            <Text style={styles.emptyText}>Press "Load Banner" to display</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    alignItems: 'center',
  },
  loadButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  loadButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  },
  bannerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 30,
    backgroundColor: '#F5F5F5',
    minHeight: 90,
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  banner: {
    width: 320,
    height: 50,
  },
  emptyBanner: {
    width: 320,
    height: 50,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  emptyText: {
    color: '#757575',
    fontSize: 14,
  },
});

export default BannerScreen;
