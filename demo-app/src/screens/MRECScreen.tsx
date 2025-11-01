/**
 * MREC Ad Screen
 * Demonstrates CloudX MREC (Medium Rectangle) ad integration (300x250)
 */

import React, { useState, useEffect } from 'react';
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

interface MRECScreenProps {
  environment: DemoEnvironmentConfig;
}

const MRECScreen: React.FC<MRECScreenProps> = ({ environment }) => {
  const [status, setStatus] = useState('No Ad Loaded');
  const [statusColor, setStatusColor] = useState('#F44336');
  const [shouldRenderMREC, setShouldRenderMREC] = useState(false);
  const [key, setKey] = useState(0);

  // Clear logs on initial mount
  useEffect(() => {
    logger.clearLogs();
  }, []);

  // Reset state when screen gains focus (tab switching)
  useFocusEffect(
    React.useCallback(() => {
      setShouldRenderMREC(false);
      setStatus('No Ad Loaded');
      setStatusColor('#F44336');
    }, [])
  );

  const handleLoadMREC = () => {
    setStatus('Loading...');
    setStatusColor('#FF9800');
    setShouldRenderMREC(true);
    setKey(prev => prev + 1); // Force new instance
  };

  const handleAdLoaded = (event: any) => {
    logger.logAdEvent('✅ MREC loaded', event);
    setStatus('MREC Ad Loaded');
    setStatusColor('#4CAF50');
  };

  const handleAdFailedToLoad = (event: any) => {
    logger.logAdEvent('❌ MREC failed to load', event);
    logger.logMessage(`  Error: ${event.error}`);
    setStatus(`Failed: ${event.error}`);
    setStatusColor('#F44336');
    setShouldRenderMREC(false); // Hide on error
  };

  const handleAdShown = (event: any) => {
    logger.logAdEvent('👀 MREC shown', event);
  };

  const handleAdClicked = (event: any) => {
    logger.logAdEvent('👆 MREC clicked', event);
    setStatus('MREC Ad Clicked');
  };

  const handleAdHidden = (event: any) => {
    logger.logAdEvent('🙈 MREC hidden', event);
  };

  const handleAdFailedToShow = (event: any) => {
    logger.logAdEvent('❌ MREC failed to show', event);
    logger.logMessage(`  Error: ${event.error}`);
  };

  const handleAdImpression = (event: any) => {
    logger.logAdEvent('👁️ MREC impression', event);
  };

  const handleAdRevenuePaid = (event: any) => {
    logger.logAdEvent('💰 MREC revenue paid', event);
    if (event.revenue) {
      logger.logMessage(`  Revenue: $${event.revenue}`);
    }
  };

  const handleAdExpanded = (event: any) => {
    logger.logAdEvent('📤 MREC expanded', event);
  };

  const handleAdCollapsed = (event: any) => {
    logger.logAdEvent('📥 MREC collapsed', event);
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
            shouldRenderMREC && styles.loadButtonDisabled
          ]}
          onPress={handleLoadMREC}
          disabled={shouldRenderMREC}>
          <Text style={styles.buttonText}>Load MREC</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.spacer} />

      {/* MREC Display Area - ONLY render when button pressed */}
      <View style={styles.mrecContainer}>
        {shouldRenderMREC ? (
          <CloudXBannerView
            key={key}
            placement={environment.mrecPlacement}
            adId={`mrec_${key}_${Date.now()}`}
            bannerSize="MREC"
            shouldLoad={true}
            onAdLoaded={handleAdLoaded}
            onAdFailedToLoad={handleAdFailedToLoad}
            onAdShown={handleAdShown}
            onAdFailedToShow={handleAdFailedToShow}
            onAdClicked={handleAdClicked}
            onAdHidden={handleAdHidden}
            onAdImpression={handleAdImpression}
            onAdRevenuePaid={handleAdRevenuePaid}
            onAdExpanded={handleAdExpanded}
            onAdCollapsed={handleAdCollapsed}
            style={styles.mrec}
          />
        ) : (
          <View style={styles.emptyMREC}>
            <Text style={styles.emptyText}>Press "Load MREC" to display</Text>
          </View>
        )}
      </View>

      <View style={styles.spacer} />
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
  mrecContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F5F5F5',
    minHeight: 290,
    justifyContent: 'center',
  },
  mrec: {
    width: 300,
    height: 250,
  },
  emptyMREC: {
    width: 300,
    height: 250,
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

export default MRECScreen;
