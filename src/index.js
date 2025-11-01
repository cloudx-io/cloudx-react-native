/**
 * CloudX SDK for React Native
 * Main JavaScript interface
 */

import { NativeModules, NativeEventEmitter, requireNativeComponent, Platform } from 'react-native';

// Platform-specific module names
const CloudXNativeModule = Platform.select({
  ios: NativeModules.CloudXSDK,
  android: NativeModules.CloudXReactNative,
  default: null,
});

if (!CloudXNativeModule) {
  console.error('CloudX native module not found');
}

class CloudX {
  constructor() {
    this.eventEmitter = CloudXNativeModule ? new NativeEventEmitter(CloudXNativeModule) : null;
    this.listeners = {};
    this.interstitialListeners = {};
    this.rewardedListeners = {};
  }

  // SDK Initialization
  async initialize(config) {
    if (!CloudXNativeModule) {
      console.error('CloudX SDK not available on this platform');
      return Promise.resolve({ success: false, message: 'Platform not supported' });
    }
    
    // Support both string and object formats for backwards compatibility
    const initConfig = typeof config === 'string' 
      ? { appKey: config }
      : config;
    
    // Platform-specific initialization
    if (Platform.OS === 'ios') {
      return CloudXNativeModule.initSDK(initConfig);
    } else if (Platform.OS === 'android') {
      return CloudXNativeModule.initializeSDK(initConfig.appKey);
    }
    
    return Promise.resolve({ success: false, message: 'Unknown platform' });
  }

  async isInitialized() {
    if (!CloudXNativeModule) return false;
    return CloudXNativeModule.isInitialized();
  }

  async getVersion() {
    if (!CloudXNativeModule) return 'Unknown';
    return CloudXNativeModule.getVersion();
  }

  async setLoggingEnabled(enabled) {
    if (!CloudXNativeModule) return;
    return CloudXNativeModule.setLoggingEnabled(enabled);
  }

  async setEnvironment(environment) {
    if (!CloudXNativeModule) return;
    return CloudXNativeModule.setEnvironment(environment);
  }

  // Privacy Methods - CCPA
  async setCCPAPrivacyString(ccpaString) {
    if (!CloudXNativeModule) return;
    return CloudXNativeModule.setCCPAPrivacyString(ccpaString);
  }

  async getCCPAPrivacyString() {
    if (!CloudXNativeModule) return null;
    return CloudXNativeModule.getCCPAPrivacyString();
  }

  async setIsDoNotSell(doNotSell) {
    if (!CloudXNativeModule) return;
    return CloudXNativeModule.setIsDoNotSell(doNotSell);
  }

  // Privacy Methods - GPP
  async setGPPString(gppString) {
    if (!CloudXNativeModule) return;
    return CloudXNativeModule.setGPPString(gppString);
  }

  async getGPPString() {
    if (!CloudXNativeModule) return null;
    return CloudXNativeModule.getGPPString();
  }

  async setGPPSectionIds(sectionIds) {
    if (!CloudXNativeModule) return;
    return CloudXNativeModule.setGPPSectionIds(sectionIds);
  }

  async getGPPSectionIds() {
    if (!CloudXNativeModule) return null;
    return CloudXNativeModule.getGPPSectionIds();
  }

  // Privacy Methods - GDPR
  async setIsUserConsent(hasConsent) {
    if (!CloudXNativeModule) return;
    return CloudXNativeModule.setIsUserConsent(hasConsent);
  }

  async getIsUserConsent() {
    if (!CloudXNativeModule) return false;
    return CloudXNativeModule.getIsUserConsent();
  }

  // Privacy Methods - COPPA
  async setIsAgeRestrictedUser(isAgeRestricted) {
    if (!CloudXNativeModule) return;
    return CloudXNativeModule.setIsAgeRestrictedUser(isAgeRestricted);
  }

  async getIsAgeRestrictedUser() {
    if (!CloudXNativeModule) return false;
    return CloudXNativeModule.getIsAgeRestrictedUser();
  }

  // Legacy privacy methods (deprecated)
  setPrivacyConsent(consent) {
    this.setIsUserConsent(consent);
  }

  setDoNotSell(doNotSell) {
    this.setIsDoNotSell(doNotSell);
  }

  setCOPPAApplies(coppaApplies) {
    this.setIsAgeRestrictedUser(coppaApplies);
  }

  setGDPRApplies(gdprApplies) {
    this.setIsUserConsent(gdprApplies);
  }

  // User Targeting - User ID
  async setHashedUserID(hashedUserID) {
    if (!CloudXNativeModule) return;
    return CloudXNativeModule.setHashedUserID(hashedUserID);
  }

  async getUserID() {
    if (!CloudXNativeModule) return null;
    return CloudXNativeModule.getUserID();
  }

  async setUserID(userID) {
    if (!CloudXNativeModule) return;
    return CloudXNativeModule.setUserID(userID);
  }

  // User Targeting - Generic key-values
  async setTargetingKeyValue(key, value) {
    if (!CloudXNativeModule) return;
    return CloudXNativeModule.setTargetingKeyValue(key, value);
  }

  async setTargetingKeyValues(keyValues) {
    if (!CloudXNativeModule) return;
    return CloudXNativeModule.setTargetingKeyValues(keyValues);
  }

  // User Targeting - User-level (privacy-sensitive)
  async setUserKeyValue(key, value) {
    if (!CloudXNativeModule) return;
    return CloudXNativeModule.setUserKeyValue(key, value);
  }

  // User Targeting - App-level (persistent)
  async setAppKeyValue(key, value) {
    if (!CloudXNativeModule) return;
    return CloudXNativeModule.setAppKeyValue(key, value);
  }

  // User Targeting - Bidder-specific
  async setBidderKeyValue(bidder, key, value) {
    if (!CloudXNativeModule) return;
    return CloudXNativeModule.setBidderKeyValue(bidder, key, value);
  }

  // User Targeting - Clear all
  async clearAllTargeting() {
    if (!CloudXNativeModule) return;
    return CloudXNativeModule.clearAllTargeting();
  }

  // Banner Management
  async createBanner(config) {
    if (!CloudXNativeModule) return { success: false };
    return CloudXNativeModule.createBanner(config);
  }

  async loadBanner(config) {
    if (!CloudXNativeModule) return { success: false };
    return CloudXNativeModule.loadBanner(config);
  }

  async showBanner(config) {
    if (!CloudXNativeModule) return { success: false };
    return CloudXNativeModule.showBanner(config);
  }

  async hideBanner(config) {
    if (!CloudXNativeModule) return { success: false };
    return CloudXNativeModule.hideBanner(config);
  }

  async startAutoRefresh(config) {
    if (!CloudXNativeModule) return { success: false };
    return CloudXNativeModule.startAutoRefresh(config);
  }

  async stopAutoRefresh(config) {
    if (!CloudXNativeModule) return { success: false };
    return CloudXNativeModule.stopAutoRefresh(config);
  }

  // Interstitial Management
  async createInterstitial(config) {
    if (!CloudXNativeModule) return { success: false };
    return CloudXNativeModule.createInterstitial(config);
  }

  async loadInterstitial(config) {
    if (!CloudXNativeModule) return { success: false };
    return CloudXNativeModule.loadInterstitial(config);
  }

  async showInterstitial(config) {
    if (!CloudXNativeModule) return { success: false };
    return CloudXNativeModule.showInterstitial(config);
  }

  async isInterstitialReady(config) {
    if (!CloudXNativeModule) return false;
    return CloudXNativeModule.isInterstitialReady(config);
  }

  // Rewarded Management
  async createRewarded(config) {
    if (!CloudXNativeModule) return { success: false };
    return CloudXNativeModule.createRewarded(config);
  }

  async loadRewarded(config) {
    if (!CloudXNativeModule) return { success: false };
    return CloudXNativeModule.loadRewarded(config);
  }

  async showRewarded(config) {
    if (!CloudXNativeModule) return { success: false };
    return CloudXNativeModule.showRewarded(config);
  }

  async isRewardedReady(config) {
    if (!CloudXNativeModule) return false;
    return CloudXNativeModule.isRewardedReady(config);
  }

  // Generic Ad Management
  async destroyAd(config) {
    if (!CloudXNativeModule) return { success: false };
    return CloudXNativeModule.destroyAd(config);
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

// Export React Hooks
export { useCloudXInterstitial, useCloudXRewarded, useCloudXBanner } from './hooks';

// Export Banner View Component
export { CloudXBannerView } from './CloudXBannerView';

// Export event types
export const CloudXEventTypes = {
  // Banner events
  BANNER_LOADED: 'onBannerLoaded',
  BANNER_FAILED_TO_LOAD: 'onBannerFailedToLoad',
  BANNER_SHOWN: 'onBannerShown',
  BANNER_FAILED_TO_SHOW: 'onBannerFailedToShow',
  BANNER_HIDDEN: 'onBannerHidden',
  BANNER_CLICKED: 'onBannerClicked',
  BANNER_IMPRESSION: 'onBannerImpression',
  BANNER_REVENUE_PAID: 'onBannerRevenuePaid',
  // Interstitial events
  INTERSTITIAL_LOADED: 'onInterstitialLoaded',
  INTERSTITIAL_FAILED_TO_LOAD: 'onInterstitialFailedToLoad',
  INTERSTITIAL_SHOWN: 'onInterstitialShown',
  INTERSTITIAL_FAILED_TO_SHOW: 'onInterstitialFailedToShow',
  INTERSTITIAL_CLOSED: 'onInterstitialClosed',
  INTERSTITIAL_CLICKED: 'onInterstitialClicked',
  INTERSTITIAL_IMPRESSION: 'onInterstitialImpression',
  INTERSTITIAL_REVENUE_PAID: 'onInterstitialRevenuePaid',
  // Rewarded events
  REWARDED_LOADED: 'onRewardedLoaded',
  REWARDED_FAILED_TO_LOAD: 'onRewardedFailedToLoad',
  REWARDED_SHOWN: 'onRewardedShown',
  REWARDED_FAILED_TO_SHOW: 'onRewardedFailedToShow',
  REWARDED_CLOSED: 'onRewardedClosed',
  REWARDED_CLICKED: 'onRewardedClicked',
  REWARDED_IMPRESSION: 'onRewardedImpression',
  REWARDED_REVENUE_PAID: 'onRewardedRevenuePaid',
  REWARD_EARNED: 'onRewardEarned',
};

// CloudXBannerView is exported from './CloudXBannerView' above (line 325)

// Export banner sizes
export const BannerSizes = {
  BANNER: 'BANNER',
  MREC: 'MREC',
  LEADERBOARD: 'LEADERBOARD',
};

export default CloudXSDKManager;