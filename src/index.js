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
  async initialize(config) {
    if (Platform.OS !== 'ios') {
      console.warn('CloudX SDK currently only supports iOS');
      return Promise.resolve({ success: false, message: 'Only iOS supported' });
    }
    
    // Support both string and object formats for backwards compatibility
    const initConfig = typeof config === 'string' 
      ? { appKey: config }
      : config;
    
    return CloudXSDK.initSDK(initConfig);
  }

  async isInitialized() {
    return CloudXSDK.isInitialized();
  }

  async getVersion() {
    if (Platform.OS !== 'ios') {
      return 'Unknown';
    }
    return CloudXSDK.getVersion();
  }

  async setLoggingEnabled(enabled) {
    if (Platform.OS !== 'ios') {
      return;
    }
    return CloudXSDK.setLoggingEnabled(enabled);
  }

  async setEnvironment(environment) {
    if (Platform.OS !== 'ios') {
      return;
    }
    return CloudXSDK.setEnvironment(environment);
  }

  // Privacy Methods - CCPA
  async setCCPAPrivacyString(ccpaString) {
    if (Platform.OS !== 'ios') return;
    return CloudXSDK.setCCPAPrivacyString(ccpaString);
  }

  async getCCPAPrivacyString() {
    if (Platform.OS !== 'ios') return null;
    return CloudXSDK.getCCPAPrivacyString();
  }

  async setIsDoNotSell(doNotSell) {
    if (Platform.OS !== 'ios') return;
    return CloudXSDK.setIsDoNotSell(doNotSell);
  }

  // Privacy Methods - GPP
  async setGPPString(gppString) {
    if (Platform.OS !== 'ios') return;
    return CloudXSDK.setGPPString(gppString);
  }

  async getGPPString() {
    if (Platform.OS !== 'ios') return null;
    return CloudXSDK.getGPPString();
  }

  async setGPPSectionIds(sectionIds) {
    if (Platform.OS !== 'ios') return;
    return CloudXSDK.setGPPSectionIds(sectionIds);
  }

  async getGPPSectionIds() {
    if (Platform.OS !== 'ios') return null;
    return CloudXSDK.getGPPSectionIds();
  }

  // Privacy Methods - GDPR
  async setIsUserConsent(hasConsent) {
    if (Platform.OS !== 'ios') return;
    return CloudXSDK.setIsUserConsent(hasConsent);
  }

  async getIsUserConsent() {
    if (Platform.OS !== 'ios') return false;
    return CloudXSDK.getIsUserConsent();
  }

  // Privacy Methods - COPPA
  async setIsAgeRestrictedUser(isAgeRestricted) {
    if (Platform.OS !== 'ios') return;
    return CloudXSDK.setIsAgeRestrictedUser(isAgeRestricted);
  }

  async getIsAgeRestrictedUser() {
    if (Platform.OS !== 'ios') return false;
    return CloudXSDK.getIsAgeRestrictedUser();
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
    if (Platform.OS !== 'ios') return;
    return CloudXSDK.setHashedUserID(hashedUserID);
  }

  async getUserID() {
    if (Platform.OS !== 'ios') return null;
    return CloudXSDK.getUserID();
  }

  async setUserID(userID) {
    if (Platform.OS !== 'ios') return;
    return CloudXSDK.setUserID(userID);
  }

  // User Targeting - Generic key-values
  async setTargetingKeyValue(key, value) {
    if (Platform.OS !== 'ios') return;
    return CloudXSDK.setTargetingKeyValue(key, value);
  }

  async setTargetingKeyValues(keyValues) {
    if (Platform.OS !== 'ios') return;
    return CloudXSDK.setTargetingKeyValues(keyValues);
  }

  // User Targeting - User-level (privacy-sensitive)
  async setUserKeyValue(key, value) {
    if (Platform.OS !== 'ios') return;
    return CloudXSDK.setUserKeyValue(key, value);
  }

  // User Targeting - App-level (persistent)
  async setAppKeyValue(key, value) {
    if (Platform.OS !== 'ios') return;
    return CloudXSDK.setAppKeyValue(key, value);
  }

  // User Targeting - Bidder-specific
  async setBidderKeyValue(bidder, key, value) {
    if (Platform.OS !== 'ios') return;
    return CloudXSDK.setBidderKeyValue(bidder, key, value);
  }

  // User Targeting - Clear all
  async clearAllTargeting() {
    if (Platform.OS !== 'ios') return;
    return CloudXSDK.clearAllTargeting();
  }

  // Banner Management
  async createBanner(config) {
    if (Platform.OS !== 'ios') return { success: false };
    return CloudXSDK.createBanner(config);
  }

  async loadBanner(config) {
    if (Platform.OS !== 'ios') return { success: false };
    return CloudXSDK.loadBanner(config);
  }

  async showBanner(config) {
    if (Platform.OS !== 'ios') return { success: false };
    return CloudXSDK.showBanner(config);
  }

  async hideBanner(config) {
    if (Platform.OS !== 'ios') return { success: false };
    return CloudXSDK.hideBanner(config);
  }

  async startAutoRefresh(config) {
    if (Platform.OS !== 'ios') return { success: false };
    return CloudXSDK.startAutoRefresh(config);
  }

  async stopAutoRefresh(config) {
    if (Platform.OS !== 'ios') return { success: false };
    return CloudXSDK.stopAutoRefresh(config);
  }

  // Interstitial Management
  async createInterstitial(config) {
    if (Platform.OS !== 'ios') return { success: false };
    return CloudXSDK.createInterstitial(config);
  }

  async loadInterstitial(config) {
    if (Platform.OS !== 'ios') return { success: false };
    return CloudXSDK.loadInterstitial(config);
  }

  async showInterstitial(config) {
    if (Platform.OS !== 'ios') return { success: false };
    return CloudXSDK.showInterstitial(config);
  }

  async isInterstitialReady(config) {
    if (Platform.OS !== 'ios') return false;
    return CloudXSDK.isInterstitialReady(config);
  }

  // Rewarded Management
  async createRewarded(config) {
    if (Platform.OS !== 'ios') return { success: false };
    return CloudXSDK.createRewarded(config);
  }

  async loadRewarded(config) {
    if (Platform.OS !== 'ios') return { success: false };
    return CloudXSDK.loadRewarded(config);
  }

  async showRewarded(config) {
    if (Platform.OS !== 'ios') return { success: false };
    return CloudXSDK.showRewarded(config);
  }

  async isRewardedReady(config) {
    if (Platform.OS !== 'ios') return false;
    return CloudXSDK.isRewardedReady(config);
  }

  // Generic Ad Management
  async destroyAd(config) {
    if (Platform.OS !== 'ios') return { success: false };
    return CloudXSDK.destroyAd(config);
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