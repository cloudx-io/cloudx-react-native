/**
 * CloudX SDK for React Native
 * Main JavaScript interface
 */

import { NativeModules, NativeEventEmitter, requireNativeComponent, Platform } from 'react-native';

const { CloudXSDK } = NativeModules;

class CloudX {
  constructor() {
    this.eventEmitter = new NativeEventEmitter(CloudXSDK);
    this.listeners = {};
    this.interstitialListeners = {};
    this.rewardedListeners = {};
  }

  // SDK Initialization
  async initialize(appKey) {
    if (Platform.OS !== 'ios') {
      console.warn('CloudX SDK currently only supports iOS');
      return Promise.resolve({ success: false, message: 'Only iOS supported' });
    }
    return CloudXSDK.initSDK(appKey);
  }

  async isInitialized() {
    return CloudXSDK.isInitialized();
  }

  // Privacy Methods
  setPrivacyConsent(consent) {
    CloudXSDK.setPrivacyConsent(consent);
  }

  setDoNotSell(doNotSell) {
    CloudXSDK.setDoNotSell(doNotSell);
  }

  setCOPPAApplies(coppaApplies) {
    CloudXSDK.setCOPPAApplies(coppaApplies);
  }

  setGDPRApplies(gdprApplies) {
    CloudXSDK.setGDPRApplies(gdprApplies);
  }

  // Interstitial Management
  async createInterstitial(placement) {
    return CloudXSDK.createInterstitial(placement);
  }

  async loadInterstitial(placement) {
    return CloudXSDK.loadInterstitial(placement);
  }

  async showInterstitial(placement) {
    return CloudXSDK.showInterstitial(placement);
  }

  async isInterstitialReady(placement) {
    return CloudXSDK.isInterstitialReady(placement);
  }

  // Rewarded Management
  async createRewarded(placement) {
    return CloudXSDK.createRewarded(placement);
  }

  async loadRewarded(placement) {
    return CloudXSDK.loadRewarded(placement);
  }

  async showRewarded(placement) {
    return CloudXSDK.showRewarded(placement);
  }

  // Event Listeners
  addEventListener(eventType, handler) {
    const listener = this.eventEmitter.addListener(eventType, handler);

    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(listener);

    return listener;
  }

  removeEventListener(eventType, handler) {
    if (this.listeners[eventType]) {
      const index = this.listeners[eventType].findIndex(l => l === handler);
      if (index > -1) {
        this.listeners[eventType][index].remove();
        this.listeners[eventType].splice(index, 1);
      }
    }
  }

  removeAllEventListeners(eventType) {
    if (eventType && this.listeners[eventType]) {
      this.listeners[eventType].forEach(listener => listener.remove());
      delete this.listeners[eventType];
    } else if (!eventType) {
      Object.keys(this.listeners).forEach(key => {
        this.listeners[key].forEach(listener => listener.remove());
      });
      this.listeners = {};
    }
  }

  // Convenience methods for common event patterns
  onInterstitialLoaded(placement, handler) {
    return this.addEventListener('onInterstitialLoaded', (data) => {
      if (data.placement === placement) handler(data);
    });
  }

  onInterstitialFailedToLoad(placement, handler) {
    return this.addEventListener('onInterstitialFailedToLoad', (data) => {
      if (data.placement === placement) handler(data);
    });
  }

  onRewardEarned(placement, handler) {
    return this.addEventListener('onRewardEarned', (data) => {
      if (data.placement === placement) handler(data);
    });
  }
}

// Export singleton instance
export const CloudXSDKManager = new CloudX();

// Export event types
export const CloudXEventTypes = {
  INTERSTITIAL_LOADED: 'onInterstitialLoaded',
  INTERSTITIAL_FAILED_TO_LOAD: 'onInterstitialFailedToLoad',
  INTERSTITIAL_SHOWN: 'onInterstitialShown',
  INTERSTITIAL_FAILED_TO_SHOW: 'onInterstitialFailedToShow',
  INTERSTITIAL_CLOSED: 'onInterstitialClosed',
  INTERSTITIAL_CLICKED: 'onInterstitialClicked',
  REWARDED_LOADED: 'onRewardedLoaded',
  REWARDED_FAILED_TO_LOAD: 'onRewardedFailedToLoad',
  REWARDED_SHOWN: 'onRewardedShown',
  REWARDED_FAILED_TO_SHOW: 'onRewardedFailedToShow',
  REWARDED_CLOSED: 'onRewardedClosed',
  REWARDED_CLICKED: 'onRewardedClicked',
  REWARD_EARNED: 'onRewardEarned',
};

// Export Banner component
export const CloudXBannerView = Platform.OS === 'ios'
  ? requireNativeComponent('CloudXBannerView')
  : () => {
      console.warn('CloudXBannerView is only supported on iOS');
      return null;
    };

// Export banner sizes
export const BannerSizes = {
  BANNER: 'BANNER',
  MREC: 'MREC',
  LEADERBOARD: 'LEADERBOARD',
};

export default CloudXSDKManager;