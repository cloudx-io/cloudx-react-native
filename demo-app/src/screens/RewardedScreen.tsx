/**
 * Rewarded Ad Screen
 * Demonstrates CloudX rewarded ad integration with reward tracking
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

interface RewardedScreenProps {
  environment: DemoEnvironmentConfig;
}

const RewardedScreen: React.FC<RewardedScreenProps> = ({ environment }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAdId, setCurrentAdId] = useState<string | null>(null);
  const [status, setStatus] = useState('No Ad Loaded');
  const [statusColor, setStatusColor] = useState('#F44336');
  const [rewardEarned, setRewardEarned] = useState(false);
  const [rewardCount, setRewardCount] = useState(0);

  // Generate unique ad ID
  const generateAdId = () => `rewarded_${Date.now()}`;

  // Setup event listeners
  useEffect(() => {
    const onLoaded = CloudXSDKManager.addEventListener(
      CloudXEventTypes.REWARDED_LOADED,
      (event) => {
        if (event.adId === currentAdId) {
          logger.logAdEvent('✅ Rewarded loaded', event);
          setIsLoaded(true);
          setIsLoading(false);
          setStatus('Rewarded Ad Loaded');
          setStatusColor('#4CAF50');
          setRewardEarned(false);
        }
      }
    );

    const onFailedToLoad = CloudXSDKManager.addEventListener(
      CloudXEventTypes.REWARDED_FAILED_TO_LOAD,
      (event) => {
        if (event.adId === currentAdId) {
          logger.logAdEvent('❌ Rewarded failed to load', event);
          logger.logMessage(`  Error: ${event.error}`);
          setIsLoaded(false);
          setIsLoading(false);
          setStatus(`Failed: ${event.error}`);
          setStatusColor('#F44336');
        }
      }
    );

    const onShown = CloudXSDKManager.addEventListener(
      CloudXEventTypes.REWARDED_SHOWN,
      (event) => {
        if (event.adId === currentAdId) {
          logger.logAdEvent('👀 Rewarded shown', event);
          setStatus('Rewarded Ad Shown');
          setStatusColor('#4CAF50');
        }
      }
    );

    const onClosed = CloudXSDKManager.addEventListener(
      CloudXEventTypes.REWARDED_CLOSED,
      (event) => {
        if (event.adId === currentAdId) {
          logger.logAdEvent('🔚 Rewarded closed', event);
          setIsLoaded(false);
          if (rewardEarned) {
            setStatus('Reward Earned!');
            setStatusColor('#4CAF50');
          } else {
            setStatus('Ad Closed (No Reward)');
            setStatusColor('#FF9800');
          }
        }
      }
    );

    const onClicked = CloudXSDKManager.addEventListener(
      CloudXEventTypes.REWARDED_CLICKED,
      (event) => {
        if (event.adId === currentAdId) {
          logger.logAdEvent('👆 Rewarded clicked', event);
        }
      }
    );

    const onRewardEarned = CloudXSDKManager.addEventListener(
      CloudXEventTypes.REWARD_EARNED,
      (event) => {
        if (event.adId === currentAdId) {
          logger.logAdEvent('🎁 REWARD EARNED!', event);
          setRewardEarned(true);
          setRewardCount(prev => prev + 1);
          setStatus('🎁 Reward Earned!');
          setStatusColor('#4CAF50');
        }
      }
    );

    return () => {
      onLoaded.remove();
      onFailedToLoad.remove();
      onShown.remove();
      onClosed.remove();
      onClicked.remove();
      onRewardEarned.remove();

      // Cleanup ad on unmount
      if (currentAdId) {
        CloudXSDKManager.destroyAd({ adId: currentAdId }).catch(() => {});
      }
    };
  }, [currentAdId, rewardEarned]);

  const handleLoad = async () => {
    logger.logMessage('🔄 User clicked Load Rewarded');
    setIsLoading(true);
    setStatus('Loading...');
    setStatusColor('#FF9800');

    const adId = generateAdId();
    setCurrentAdId(adId);

    try {
      // Create rewarded ad
      await CloudXSDKManager.createRewarded({
        placement: environment.rewardedPlacement,
        adId,
      });

      // Load rewarded ad
      await CloudXSDKManager.loadRewarded({ adId });
    } catch (error) {
      logger.logMessage(`❌ Error creating/loading rewarded: ${error}`);
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

    logger.logMessage('🎬 User clicked Show Rewarded');

    try {
      await CloudXSDKManager.showRewarded({ adId: currentAdId });
    } catch (error) {
      logger.logMessage(`❌ Error showing rewarded: ${error}`);
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

      {/* Reward Counter */}
      <View style={styles.rewardCounter}>
        <Text style={styles.rewardLabel}>Rewards Earned:</Text>
        <View style={styles.rewardBadge}>
          <Text style={styles.rewardCount}>{rewardCount}</Text>
        </View>
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
              {isLoaded ? 'Rewarded Ad Loaded' : 'Load Rewarded'}
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
          <Text style={styles.buttonText}>Show Rewarded</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.spacer} />

      {/* Info Container */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Rewarded Ads</Text>
        <Text style={styles.infoText}>
          • Full-screen video ads that offer rewards
        </Text>
        <Text style={styles.infoText}>
          • Users must watch to completion for reward
        </Text>
        <Text style={styles.infoText}>
          • Listen for REWARD_EARNED event
        </Text>
        <Text style={styles.infoText}>
          • Grant in-app currency or items on reward
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
  rewardCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  rewardLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
  },
  rewardBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 50,
    alignItems: 'center',
  },
  rewardCount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
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

export default RewardedScreen;
