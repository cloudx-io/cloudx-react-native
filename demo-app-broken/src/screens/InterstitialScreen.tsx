/**
 * Interstitial Ad Screen
 * Demonstrates CloudX interstitial ad integration
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { CloudXSDKManager, CloudXEventTypes } from 'cloudx-react-native';
import { DemoEnvironmentConfig } from '../config/DemoConfig';
import { logger } from '../utils/DemoAppLogger';

interface InterstitialScreenProps {
  environment: DemoEnvironmentConfig;
}

const InterstitialScreen: React.FC<InterstitialScreenProps> = ({ environment }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAdId, setCurrentAdId] = useState<string | null>(null);
  const [status, setStatus] = useState('No Ad Loaded');
  const [statusColor, setStatusColor] = useState('#F44336');

  // Generate unique ad ID
  const generateAdId = () => `interstitial_${Date.now()}`;

  // Setup event listeners
  useEffect(() => {
    const onLoaded = CloudXSDKManager.addEventListener(
      CloudXEventTypes.INTERSTITIAL_LOADED,
      (event) => {
        if (event.adId === currentAdId) {
          logger.logAdEvent('✅ Interstitial loaded', event);
          setIsLoaded(true);
          setIsLoading(false);
          setStatus('Interstitial Ad Loaded');
          setStatusColor('#4CAF50');
        }
      }
    );

    const onFailedToLoad = CloudXSDKManager.addEventListener(
      CloudXEventTypes.INTERSTITIAL_FAILED_TO_LOAD,
      (event) => {
        if (event.adId === currentAdId) {
          logger.logAdEvent('❌ Interstitial failed to load', event);
          logger.logMessage(`  Error: ${event.error}`);
          setIsLoaded(false);
          setIsLoading(false);
          setStatus(`Failed: ${event.error}`);
          setStatusColor('#F44336');
        }
      }
    );

    const onShown = CloudXSDKManager.addEventListener(
      CloudXEventTypes.INTERSTITIAL_SHOWN,
      (event) => {
        if (event.adId === currentAdId) {
          logger.logAdEvent('👀 Interstitial shown', event);
          setStatus('Interstitial Ad Shown');
          setStatusColor('#4CAF50');
        }
      }
    );

    const onClosed = CloudXSDKManager.addEventListener(
      CloudXEventTypes.INTERSTITIAL_CLOSED,
      (event) => {
        if (event.adId === currentAdId) {
          logger.logAdEvent('🔚 Interstitial closed', event);
          setIsLoaded(false);
          setStatus('No Ad Loaded');
          setStatusColor('#F44336');
        }
      }
    );

    const onClicked = CloudXSDKManager.addEventListener(
      CloudXEventTypes.INTERSTITIAL_CLICKED,
      (event) => {
        if (event.adId === currentAdId) {
          logger.logAdEvent('👆 Interstitial clicked', event);
        }
      }
    );

    return () => {
      onLoaded.remove();
      onFailedToLoad.remove();
      onShown.remove();
      onClosed.remove();
      onClicked.remove();

      // Cleanup ad on unmount
      if (currentAdId) {
        CloudXSDKManager.destroyAd({ adId: currentAdId }).catch(() => {});
      }
    };
  }, [currentAdId]);

  const handleLoad = async () => {
    logger.logMessage('🔄 User clicked Load Interstitial');
    setIsLoading(true);
    setStatus('Loading...');
    setStatusColor('#FF9800');

    const adId = generateAdId();
    setCurrentAdId(adId);

    try {
      // Create interstitial
      await CloudXSDKManager.createInterstitial({
        placement: environment.interstitialPlacement,
        adId,
      });

      // Load interstitial
      await CloudXSDKManager.loadInterstitial({ adId });
    } catch (error) {
      logger.logMessage(`❌ Error creating/loading interstitial: ${error}`);
      setIsLoading(false);
      setStatus(`Error: ${error}`);
      setStatusColor('#F44336');
    }
  };

  const handleShow = async () => {
    if (!currentAdId || !isLoaded) {
      logger.logMessage('⚠️ No ad loaded to show');
      return;
    }

    logger.logMessage('🎬 User clicked Show Interstitial');

    try {
      await CloudXSDKManager.showInterstitial({ adId: currentAdId });
    } catch (error) {
      logger.logMessage(`❌ Error showing interstitial: ${error}`);
      setStatus(`Show failed: ${error}`);
      setStatusColor('#F44336');
    }
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

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.loadButton,
            (isLoading || isLoaded) && styles.buttonDisabled,
          ]}
          onPress={handleLoad}
          disabled={isLoading || isLoaded}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              {isLoaded ? 'Interstitial Loaded' : 'Load Interstitial'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.showButton,
            !isLoaded && styles.buttonDisabled,
          ]}
          onPress={handleShow}
          disabled={!isLoaded}>
          <Text style={styles.buttonText}>Show Interstitial</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.spacer} />

      {/* Info Container */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Interstitial Ads</Text>
        <Text style={styles.infoText}>
          • Full-screen ads that cover the entire app
        </Text>
        <Text style={styles.infoText}>
          • Shown modally by the native SDK
        </Text>
        <Text style={styles.infoText}>
          • No UI component needed in React Native
        </Text>
        <Text style={styles.infoText}>
          • Load first, then show when ready
        </Text>
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
  buttonsContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadButton: {
    backgroundColor: '#2196F3',
  },
  showButton: {
    backgroundColor: '#4CAF50',
  },
  buttonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  },
  infoContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 6,
    color: '#424242',
  },
});

export default InterstitialScreen;
