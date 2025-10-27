/**
 * CloudX SDK for React Native
 * TypeScript definitions
 */

import { ViewProps, EmitterSubscription } from 'react-native';

export interface CloudXInitResult {
  success: boolean;
  message?: string;
}

export interface CloudXInitConfig {
  appKey: string;
  hashedUserID?: string;
}

export interface CloudXAdEvent {
  adId: string;
  error?: string;
}

export interface CloudXAdConfig {
  placement: string;
  adId: string;
}

export interface CloudXBannerProps extends ViewProps {
  placement: string;
  bannerSize?: 'BANNER' | 'MREC' | 'LEADERBOARD';
  onAdLoaded?: (event: CloudXAdEvent) => void;
  onAdFailedToLoad?: (event: CloudXAdEvent) => void;
  onAdClicked?: (event: CloudXAdEvent) => void;
  onAdOpened?: (event: CloudXAdEvent) => void;
  onAdClosed?: (event: CloudXAdEvent) => void;
}

export type CloudXEventType =
  | 'onBannerLoaded'
  | 'onBannerFailedToLoad'
  | 'onBannerShown'
  | 'onBannerFailedToShow'
  | 'onBannerHidden'
  | 'onBannerClicked'
  | 'onBannerImpression'
  | 'onBannerRevenuePaid'
  | 'onInterstitialLoaded'
  | 'onInterstitialFailedToLoad'
  | 'onInterstitialShown'
  | 'onInterstitialFailedToShow'
  | 'onInterstitialClosed'
  | 'onInterstitialClicked'
  | 'onInterstitialImpression'
  | 'onInterstitialRevenuePaid'
  | 'onRewardedLoaded'
  | 'onRewardedFailedToLoad'
  | 'onRewardedShown'
  | 'onRewardedFailedToShow'
  | 'onRewardedClosed'
  | 'onRewardedClicked'
  | 'onRewardedImpression'
  | 'onRewardedRevenuePaid'
  | 'onRewardEarned';

declare class CloudX {
  // SDK Initialization
  initialize(config: string | CloudXInitConfig): Promise<CloudXInitResult>;
  isInitialized(): Promise<boolean>;
  getVersion(): Promise<string>;
  setLoggingEnabled(enabled: boolean): Promise<void>;
  setEnvironment(environment: 'dev' | 'staging' | 'production'): Promise<void>;

  // Privacy Methods - CCPA
  setCCPAPrivacyString(ccpaString: string): Promise<void>;
  getCCPAPrivacyString(): Promise<string | null>;
  setIsDoNotSell(doNotSell: boolean): Promise<void>;

  // Privacy Methods - GPP
  setGPPString(gppString: string): Promise<void>;
  getGPPString(): Promise<string | null>;
  setGPPSectionIds(sectionIds: number[]): Promise<void>;
  getGPPSectionIds(): Promise<number[] | null>;

  // Privacy Methods - GDPR
  setIsUserConsent(hasConsent: boolean): Promise<void>;
  getIsUserConsent(): Promise<boolean>;

  // Privacy Methods - COPPA
  setIsAgeRestrictedUser(isAgeRestricted: boolean): Promise<void>;
  getIsAgeRestrictedUser(): Promise<boolean>;

  // Legacy methods (deprecated)
  setPrivacyConsent(consent: boolean): void;
  setDoNotSell(doNotSell: boolean): void;
  setCOPPAApplies(coppaApplies: boolean): void;
  setGDPRApplies(gdprApplies: boolean): void;

  // User Targeting - User ID
  setHashedUserID(hashedUserID: string): Promise<void>;
  getUserID(): Promise<string | null>;
  setUserID(userID: string | null): Promise<void>;

  // User Targeting - Generic key-values
  setTargetingKeyValue(key: string, value: string): Promise<void>;
  setTargetingKeyValues(keyValues: Record<string, string>): Promise<void>;

  // User Targeting - User-level (privacy-sensitive)
  setUserKeyValue(key: string, value: string): Promise<void>;

  // User Targeting - App-level (persistent)
  setAppKeyValue(key: string, value: string): Promise<void>;

  // User Targeting - Bidder-specific
  setBidderKeyValue(bidder: string, key: string, value: string): Promise<void>;

  // User Targeting - Clear all
  clearAllTargeting(): Promise<void>;

  // Banner Management
  createBanner(config: CloudXAdConfig): Promise<{ success: boolean; adId: string }>;
  loadBanner(config: { adId: string }): Promise<{ success: boolean }>;
  showBanner(config: { adId: string }): Promise<{ success: boolean }>;
  hideBanner(config: { adId: string }): Promise<{ success: boolean }>;
  startAutoRefresh(config: { adId: string }): Promise<{ success: boolean }>;
  stopAutoRefresh(config: { adId: string }): Promise<{ success: boolean }>;

  // Interstitial Management
  createInterstitial(config: CloudXAdConfig): Promise<{ success: boolean; adId: string }>;
  loadInterstitial(config: { adId: string }): Promise<{ success: boolean }>;
  showInterstitial(config: { adId: string }): Promise<{ success: boolean }>;
  isInterstitialReady(config: { adId: string }): Promise<boolean>;

  // Rewarded Management
  createRewarded(config: CloudXAdConfig): Promise<{ success: boolean; adId: string }>;
  loadRewarded(config: { adId: string }): Promise<{ success: boolean }>;
  showRewarded(config: { adId: string }): Promise<{ success: boolean }>;
  isRewardedReady(config: { adId: string }): Promise<boolean>;

  // Generic Ad Management
  destroyAd(config: { adId: string }): Promise<{ success: boolean }>;

  // Event Management
  addEventListener(eventType: CloudXEventType, handler: (event: CloudXAdEvent) => void): EmitterSubscription;
  removeEventListener(eventType: CloudXEventType, handler: (event: CloudXAdEvent) => void): void;
  removeAllEventListeners(eventType?: CloudXEventType): void;

  // Convenience event methods
  onInterstitialLoaded(placement: string, handler: (event: CloudXAdEvent) => void): EmitterSubscription;
  onInterstitialFailedToLoad(placement: string, handler: (event: CloudXAdEvent) => void): EmitterSubscription;
  onRewardEarned(placement: string, handler: (event: CloudXAdEvent) => void): EmitterSubscription;
}

export const CloudXSDKManager: CloudX;

export const CloudXEventTypes: {
  BANNER_LOADED: 'onBannerLoaded';
  BANNER_FAILED_TO_LOAD: 'onBannerFailedToLoad';
  BANNER_SHOWN: 'onBannerShown';
  BANNER_FAILED_TO_SHOW: 'onBannerFailedToShow';
  BANNER_HIDDEN: 'onBannerHidden';
  BANNER_CLICKED: 'onBannerClicked';
  BANNER_IMPRESSION: 'onBannerImpression';
  BANNER_REVENUE_PAID: 'onBannerRevenuePaid';
  INTERSTITIAL_LOADED: 'onInterstitialLoaded';
  INTERSTITIAL_FAILED_TO_LOAD: 'onInterstitialFailedToLoad';
  INTERSTITIAL_SHOWN: 'onInterstitialShown';
  INTERSTITIAL_FAILED_TO_SHOW: 'onInterstitialFailedToShow';
  INTERSTITIAL_CLOSED: 'onInterstitialClosed';
  INTERSTITIAL_CLICKED: 'onInterstitialClicked';
  INTERSTITIAL_IMPRESSION: 'onInterstitialImpression';
  INTERSTITIAL_REVENUE_PAID: 'onInterstitialRevenuePaid';
  REWARDED_LOADED: 'onRewardedLoaded';
  REWARDED_FAILED_TO_LOAD: 'onRewardedFailedToLoad';
  REWARDED_SHOWN: 'onRewardedShown';
  REWARDED_FAILED_TO_SHOW: 'onRewardedFailedToShow';
  REWARDED_CLOSED: 'onRewardedClosed';
  REWARDED_CLICKED: 'onRewardedClicked';
  REWARDED_IMPRESSION: 'onRewardedImpression';
  REWARDED_REVENUE_PAID: 'onRewardedRevenuePaid';
  REWARD_EARNED: 'onRewardEarned';
};

export const BannerSizes: {
  BANNER: 'BANNER';
  MREC: 'MREC';
  LEADERBOARD: 'LEADERBOARD';
};

export const CloudXBannerView: React.FC<CloudXBannerProps>;

// React Hooks
export {
  useCloudXInterstitial,
  useCloudXRewarded,
  useCloudXBanner,
  CloudXInterstitialHook,
  CloudXRewardedHook,
  CloudXBannerHook,
  CloudXBannerHookOptions,
} from './hooks';

export default CloudXSDKManager;