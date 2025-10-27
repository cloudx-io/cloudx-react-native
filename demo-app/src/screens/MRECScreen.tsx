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
  ActivityIndicator,
} from 'react-native';
import { CloudXSDKManager, CloudXEventTypes } from 'cloudx-react-native';
import { DemoEnvironmentConfig } from '../config/DemoConfig';
import { logger } from '../utils/DemoAppLogger';

interface MRECScreenProps {
  environment: DemoEnvironmentConfig;
}

const MRECScreen: React.FC<MRECScreenProps> = ({ environment }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentAdId, setCurrentAdId] = useState<string | null>(null);
  const [status, setStatus] = useState('No Ad Loaded');
  const [statusColor, setStatusColor] = useState('#F44336');

  // Generate unique ad ID
  const generateAdId = () => `mrec_${Date.now()}`;

  // Setup event listeners
  useEffect(() => {
    const onLoaded = CloudXSDKManager.addEventListener(
      CloudXEventTypes.BANNER_LOADED, // MREC uses banner events
      (event) => {
        if (event.adId === currentAdId) {
          logger.logAdEvent('✅ MREC loaded', event);
          setIsLoaded(true);
          setIsLoading(false);
          setStatus('MREC Ad Loaded');
          setStatusColor('#4CAF50');
        }
      }
    );

    const onFailedToLoad = CloudXSDKManager.addEventListener(
      CloudXEventTypes.BANNER_FAILED_TO_LOAD,
      (event) => {
        if (event.adId === currentAdId) {
          logger.logAdEvent('❌ MREC failed to load', event);
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
          logger.logAdEvent('👀 MREC shown', event);
          setIsVisible(true);
          setStatus('MREC Ad Visible');
          setStatusColor('#4CAF50');
        }
      }
    );

    const onHidden = CloudXSDKManager.addEventListener(
      CloudXEventTypes.BANNER_HIDDEN,
      (event) => {
        if (event.adId === currentAdId) {
          logger.logAdEvent('🙈 MREC hidden', event);
          setIsVisible(false);
          setStatus('MREC Ad Hidden');
          setStatusColor('#FF9800');
        }
      }
    );

    const onClicked = CloudXSDKManager.addEventListener(
      CloudXEventTypes.BANNER_CLICKED,
      (event) => {
        if (event.adId === currentAdId) {
          logger.logAdEvent('👆 MREC clicked', event);
          setStatus('MREC Ad Clicked');
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
    logger.logMessage('🔄 User clicked Load MREC');
    setIsLoading(true);
    setStatus('Loading...');
    setStatusColor('#FF9800');

    const adId = generateAdId();
    setCurrentAdId(adId);

    try {
      // Create MREC (uses banner API with MREC placement)
      await CloudXSDKManager.createBanner({
        placement: environment.mrecPlacement,
        adId,
      });

      // Load MREC
      await CloudXSDKManager.loadBanner({ adId });
      
      // Auto-show after load
      await CloudXSDKManager.showBanner({ adId });
      
      // Enable auto-refresh
      await CloudXSDKManager.startAutoRefresh({ adId });
    } catch (error) {
      logger.logMessage(`❌ Error creating/loading MREC: ${error}`);
      setIsLoading(false);
      setStatus(`Error: ${error}`);
      setStatusColor('#F44336');
    }
  };

  const handleHide = async () => {
    if (!currentAdId || !isVisible) return;

    logger.logMessage('🙈 User clicked Hide MREC');
    try {
      await CloudXSDKManager.hideBanner({ adId: currentAdId });
    } catch (error) {
      logger.logMessage(`❌ Error hiding MREC: ${error}`);
    }
  };

  const handleShow = async () => {
    if (!currentAdId || isVisible) return;

    logger.logMessage('👀 User clicked Show MREC');
    try {
      await CloudXSDKManager.showBanner({ adId: currentAdId });
    } catch (error) {
      logger.logMessage(`❌ Error showing MREC: ${error}`);
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
      logger.logMessage(`❌ Error stopping MREC: ${error}`);
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

      {/* MREC Display Area */}
      <View style={styles.mrecContainer}>
        {isLoaded && isVisible ? (
          <View style={styles.mrecPlaceholder}>
            <Text style={styles.mrecPlaceholderText}>
              ⬜ MREC Ad (300x250)
            </Text>
            <Text style={styles.mrecNote}>
              Note: Native MREC view rendering requires UIView integration
            </Text>
          </View>
        ) : (
          <View style={styles.emptyMREC}>
            <Text style={styles.emptyText}>No MREC displayed</Text>
          </View>
        )}
      </View>

      {/* Info Container */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>MREC Ads (300x250)</Text>
        <Text style={styles.infoText}>
          • Medium Rectangle format
        </Text>
        <Text style={styles.infoText}>
          • Larger than banner ads
        </Text>
        <Text style={styles.infoText}>
          • Better viewability & engagement
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
  mrecContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  mrecPlaceholder: {
    width: 300,
    height: 250,
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mrecPlaceholderText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  mrecNote: {
    fontSize: 10,
    color: '#757575',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyMREC: {
    width: 300,
    height: 250,
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

export default MRECScreen;
