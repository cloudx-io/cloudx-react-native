/**
 * CloudX SDK React Native Example App
 * Demonstrates how to integrate CloudX ads in React Native
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  Platform,
} from 'react-native';

import CloudXSDK, {
  CloudXBannerView,
  CloudXEventTypes,
  BannerSizes,
} from 'react-native-cloudx-sdk';

const APP_KEY = '8pRtAn-tx7hRen8DmolSf'; // Replace with your CloudX app key

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [interstitialReady, setInterstitialReady] = useState(false);
  const [rewardedReady, setRewardedReady] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs((prevLogs) => [`${new Date().toLocaleTimeString()}: ${message}`, ...prevLogs]);
  };

  useEffect(() => {
    initializeSDK();
    setupEventListeners();

    return () => {
      CloudXSDK.removeAllEventListeners();
    };
  }, []);

  const initializeSDK = async () => {
    try {
      addLog('Initializing CloudX SDK...');
      const result = await CloudXSDK.initialize(APP_KEY);

      if (result.success) {
        setIsInitialized(true);
        addLog('✅ SDK initialized successfully');

        // Set privacy settings (example)
        CloudXSDK.setPrivacyConsent(true);
        CloudXSDK.setCOPPAApplies(false);

        // Create ad instances
        await createAds();
      } else {
        addLog('❌ SDK initialization failed');
      }
    } catch (error) {
      addLog(`❌ Error initializing SDK: ${error.message}`);
    }
  };

  const createAds = async () => {
    try {
      // Create interstitial
      await CloudXSDK.createInterstitial('interstitial-placement');
      addLog('Created interstitial');

      // Create rewarded
      await CloudXSDK.createRewarded('rewarded-placement');
      addLog('Created rewarded ad');

      // Start loading ads
      loadInterstitial();
      loadRewarded();
    } catch (error) {
      addLog(`Error creating ads: ${error.message}`);
    }
  };

  const setupEventListeners = () => {
    // Interstitial events
    CloudXSDK.addEventListener(CloudXEventTypes.INTERSTITIAL_LOADED, (event) => {
      addLog(`Interstitial loaded: ${event.placement}`);
      setInterstitialReady(true);
    });

    CloudXSDK.addEventListener(CloudXEventTypes.INTERSTITIAL_FAILED_TO_LOAD, (event) => {
      addLog(`Interstitial failed to load: ${event.error}`);
      setInterstitialReady(false);
    });

    CloudXSDK.addEventListener(CloudXEventTypes.INTERSTITIAL_SHOWN, () => {
      addLog('Interstitial shown');
    });

    CloudXSDK.addEventListener(CloudXEventTypes.INTERSTITIAL_CLOSED, () => {
      addLog('Interstitial closed');
      setInterstitialReady(false);
      // Load next interstitial
      setTimeout(() => loadInterstitial(), 1000);
    });

    // Rewarded events
    CloudXSDK.addEventListener(CloudXEventTypes.REWARDED_LOADED, (event) => {
      addLog(`Rewarded loaded: ${event.placement}`);
      setRewardedReady(true);
    });

    CloudXSDK.addEventListener(CloudXEventTypes.REWARDED_FAILED_TO_LOAD, (event) => {
      addLog(`Rewarded failed to load: ${event.error}`);
      setRewardedReady(false);
    });

    CloudXSDK.addEventListener(CloudXEventTypes.REWARD_EARNED, () => {
      addLog('🎁 Reward earned!');
      Alert.alert('Reward Earned', 'You earned a reward!');
    });

    CloudXSDK.addEventListener(CloudXEventTypes.REWARDED_CLOSED, () => {
      addLog('Rewarded closed');
      setRewardedReady(false);
      // Load next rewarded
      setTimeout(() => loadRewarded(), 1000);
    });
  };

  const loadInterstitial = async () => {
    try {
      addLog('Loading interstitial...');
      await CloudXSDK.loadInterstitial('interstitial-placement');
    } catch (error) {
      addLog(`Error loading interstitial: ${error.message}`);
    }
  };

  const showInterstitial = async () => {
    try {
      const ready = await CloudXSDK.isInterstitialReady('interstitial-placement');
      if (ready) {
        await CloudXSDK.showInterstitial('interstitial-placement');
      } else {
        Alert.alert('Not Ready', 'Interstitial is not ready yet');
        loadInterstitial();
      }
    } catch (error) {
      addLog(`Error showing interstitial: ${error.message}`);
    }
  };

  const loadRewarded = async () => {
    try {
      addLog('Loading rewarded ad...');
      await CloudXSDK.loadRewarded('rewarded-placement');
    } catch (error) {
      addLog(`Error loading rewarded: ${error.message}`);
    }
  };

  const showRewarded = async () => {
    try {
      await CloudXSDK.showRewarded('rewarded-placement');
    } catch (error) {
      Alert.alert('Not Ready', 'Rewarded ad is not ready yet');
      loadRewarded();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <Text style={styles.title}>CloudX SDK Example</Text>
          <Text style={styles.status}>
            Status: {isInitialized ? '✅ Initialized' : '⏳ Not Initialized'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Banner Ad</Text>
          <Button
            title={showBanner ? 'Hide Banner' : 'Show Banner'}
            onPress={() => setShowBanner(!showBanner)}
            disabled={!isInitialized}
          />
          {showBanner && (
            <View style={styles.bannerContainer}>
              <CloudXBannerView
                style={styles.banner}
                placement="banner-placement"
                bannerSize={BannerSizes.BANNER}
                onAdLoaded={(e) => addLog(`Banner loaded: ${e.placement}`)}
                onAdFailedToLoad={(e) => addLog(`Banner failed: ${e.error}`)}
                onAdClicked={() => addLog('Banner clicked')}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MREC Ad</Text>
          {isInitialized && (
            <View style={styles.mrecContainer}>
              <CloudXBannerView
                style={styles.mrec}
                placement="mrec-placement"
                bannerSize={BannerSizes.MREC}
                onAdLoaded={(e) => addLog(`MREC loaded: ${e.placement}`)}
                onAdFailedToLoad={(e) => addLog(`MREC failed: ${e.error}`)}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interstitial Ad</Text>
          <Button
            title={`Show Interstitial ${interstitialReady ? '(Ready)' : '(Loading...)'}`}
            onPress={showInterstitial}
            disabled={!isInitialized || !interstitialReady}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rewarded Ad</Text>
          <Button
            title={`Show Rewarded ${rewardedReady ? '(Ready)' : '(Loading...)'}`}
            onPress={showRewarded}
            disabled={!isInitialized || !rewardedReady}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Logs</Text>
          <View style={styles.logsContainer}>
            {logs.slice(0, 10).map((log, index) => (
              <Text key={index} style={styles.logText}>
                {log}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  status: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  bannerContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  banner: {
    width: 320,
    height: 50,
    backgroundColor: '#f0f0f0',
  },
  mrecContainer: {
    alignItems: 'center',
  },
  mrec: {
    width: 300,
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  logsContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 4,
    maxHeight: 200,
  },
  logText: {
    fontSize: 12,
    color: '#333',
    marginVertical: 2,
  },
});

export default App;