/**
 * Banner Ad Screen
 * Demonstrates CloudX banner ad integration with load/show/hide controls
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

interface BannerScreenProps {
  environment: DemoEnvironmentConfig;
}

const BannerScreen: React.FC<BannerScreenProps> = ({ environment }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentAdId, setCurrentAdId] = useState<string | null>(null);
  const [status, setStatus] = useState('No Ad Loaded');
  const [statusColor, setStatusColor] = useState('#F44336');

  // Generate unique ad ID
  const generateAdId = () => `banner_${Date.now()}`;

  // Setup event listeners
  useEffect(() => {
    const onLoaded = CloudXSDKManager.addEventListener(
      CloudXEventTypes.BANNER_LOADED,
      (event) => {
        if (event.adId === currentAdId) {
          logger.logAdEvent('✅ Banner loaded', event);
          setIsLoaded(true);
          setIsLoading(false);
          setStatus('Banner Ad Loaded');
          setStatusColor('#4CAF50');
        }
      }
    );

    const onFailedToLoad = CloudXSDKManager.addEventListener(
      CloudXEventTypes.BANNER_FAILED_TO_LOAD,
      (event) => {
        if (event.adId === currentAdId) {
          logger.logAdEvent('❌ Banner failed to load', event);
          logger.logMessage(`  Error: ${event.error}`);
          setIsLoaded(false);
          setIsLoading(false);
          setStatus(`Failed: ${event.error}`);
          setStatusColor('#F44336');
        }
      }
    );

    const onShown = CloudXSDKManager.addEventListener(
      CloudXEventTypes.BANNER_SHOWN,
      (event) => {
        if (event.adId === currentAdId) {
          logger.logAdEvent('👀 Banner shown', event);
          setIsVisible(true);
          setStatus('Banner Ad Visible');
          setStatusColor('#4CAF50');
        }
      }
    );

    const onHidden = CloudXSDKManager.addEventListener(
      CloudXEventTypes.BANNER_HIDDEN,
      (event) => {
        if (event.adId === currentAdId) {
          logger.logAdEvent('🙈 Banner hidden', event);
          setIsVisible(false);
          setStatus('Banner Ad Hidden');
          setStatusColor('#FF9800');
        }
      }
    );

    const onClicked = CloudXSDKManager.addEventListener(
      CloudXEventTypes.BANNER_CLICKED,
      (event) => {
        if (event.adId === currentAdId) {
          logger.logAdEvent('👆 Banner clicked', event);
          setStatus('Banner Ad Clicked');
        }
      }
    );

    return () => {
      onLoaded.remove();
      onFailedToLoad.remove();
      onShown.remove();
      onHidden.remove();
      onClicked.remove();

      // Cleanup ad on unmount
      if (currentAdId) {
        CloudXSDKManager.stopAutoRefresh({ adId: currentAdId }).catch(() => {});
        CloudXSDKManager.destroyAd({ adId: currentAdId }).catch(() => {});
      }
    };
  }, [currentAdId]);

  const handleLoad = async () => {
    logger.logMessage('🔄 User clicked Load Banner');
    setIsLoading(true);
    setStatus('Loading...');
    setStatusColor('#FF9800');

    const adId = generateAdId();
    setCurrentAdId(adId);

    try {
      // Create banner
      await CloudXSDKManager.createBanner({
        placement: environment.bannerPlacement,
        adId,
      });

      // Load banner
      await CloudXSDKManager.loadBanner({ adId });
      
      // Auto-show after load
      await CloudXSDKManager.showBanner({ adId });
      
      // Enable auto-refresh
      await CloudXSDKManager.startAutoRefresh({ adId });
    } catch (error) {
      logger.logMessage(`❌ Error creating/loading banner: ${error}`);
      setIsLoading(false);
      setStatus(`Error: ${error}`);
      setStatusColor('#F44336');
    }
  };

  const handleHide = async () => {
    if (!currentAdId || !isVisible) return;

    logger.logMessage('🙈 User clicked Hide Banner');
    try {
      await CloudXSDKManager.hideBanner({ adId: currentAdId });
    } catch (error) {
      logger.logMessage(`❌ Error hiding banner: ${error}`);
    }
  };

  const handleShow = async () => {
    if (!currentAdId || isVisible) return;

    logger.logMessage('👀 User clicked Show Banner');
    try {
      await CloudXSDKManager.showBanner({ adId: currentAdId });
    } catch (error) {
      logger.logMessage(`❌ Error showing banner: ${error}`);
    }
  };

  const handleStop = async () => {
    if (!currentAdId) return;

    logger.logMessage('🛑 User clicked Stop');
    try {
      await CloudXSDKManager.stopAutoRefresh({ adId: currentAdId });
      await CloudXSDKManager.hideBanner({ adId: currentAdId });
      await CloudXSDKManager.destroyAd({ adId: currentAdId });
      
      setCurrentAdId(null);
      setIsLoaded(false);
      setIsVisible(false);
      setStatus('No Ad Loaded');
      setStatusColor('#F44336');
    } catch (error) {
      logger.logMessage(`❌ Error stopping banner: ${error}`);
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
        {!isLoaded ? (
          <TouchableOpacity
            style={[
              styles.button,
              styles.loadButton,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleLoad}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Load / Show</Text>
            )}
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[
                styles.button,
                styles.hideButton,
                !isVisible && styles.buttonDisabled,
              ]}
              onPress={handleHide}
              disabled={!isVisible}>
              <Text style={styles.buttonText}>Hide</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.showButton,
                isVisible && styles.buttonDisabled,
              ]}
              onPress={handleShow}
              disabled={isVisible}>
              <Text style={styles.buttonText}>Show</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.stopButton]}
              onPress={handleStop}>
              <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.spacer} />

      {/* Banner Display Area */}
      <View style={styles.bannerContainer}>
        {isLoaded && isVisible ? (
          <View style={styles.bannerPlaceholder}>
            <Text style={styles.bannerPlaceholderText}>
              📱 Banner Ad (320x50)
            </Text>
            <Text style={styles.bannerNote}>
              Note: Native banner view rendering requires UIView integration
            </Text>
          </View>
        ) : (
          <View style={styles.emptyBanner}>
            <Text style={styles.emptyText}>No banner displayed</Text>
          </View>
        )}
      </View>

      {/* Info Container */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Banner Ads</Text>
        <Text style={styles.infoText}>
          • Small rectangular ads (320x50)
        </Text>
        <Text style={styles.infoText}>
          • Displayed inline with content
        </Text>
        <Text style={styles.infoText}>
          • Can be hidden/shown dynamically
        </Text>
        <Text style={styles.infoText}>
          • Auto-refresh support
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
    gap: 12,
  },
  button: {
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadButton: {
    backgroundColor: '#2196F3',
  },
  hideButton: {
    backgroundColor: '#FF9800',
  },
  showButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
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
  bannerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  bannerPlaceholder: {
    width: 320,
    height: 50,
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerPlaceholderText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  bannerNote: {
    fontSize: 10,
    color: '#757575',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyBanner: {
    width: 320,
    height: 50,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9E9E9E',
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

export default BannerScreen;
