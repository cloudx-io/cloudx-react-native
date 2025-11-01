/**
 * Demo App Configuration
 * Environment-specific configurations for testing CloudX SDK
 */

export interface DemoEnvironmentConfig {
  name: string;
  appKey: string;
  hashedUserId: string;
  bannerPlacement: string;
  mrecPlacement: string;
  interstitialPlacement: string;
  nativePlacement: string;
  rewardedPlacement: string;
}

export class DemoConfig {
  // iOS Configurations
  static readonly iosDev: DemoEnvironmentConfig = {
    name: 'Development',
    appKey: 'g0PdN9_0ilfIcuNXhBopl',
    hashedUserId: 'test-user-123',
    bannerPlacement: 'metaBanner',
    mrecPlacement: 'metaMREC',
    interstitialPlacement: 'metaInterstitial',
    nativePlacement: 'metaNative',
    rewardedPlacement: 'metaRewarded',
  };

  static readonly iosStaging: DemoEnvironmentConfig = {
    name: 'Staging',
    appKey: 'A7ovaBRCcAL8lapKtoZmm',
    hashedUserId: 'test-user-123-staging',
    bannerPlacement: 'objcDemo-banner-1',
    mrecPlacement: 'objcDemo-mrec-1',
    interstitialPlacement: 'objcDemo-interstitial-1',
    nativePlacement: '-',
    rewardedPlacement: '-',
  };

  static readonly iosProduction: DemoEnvironmentConfig = {
    name: 'Production',
    appKey: 'ZFyiqxXWTOGYclwHElLbM',
    hashedUserId: 'prod-user-123',
    bannerPlacement: 'flutter-demo-banner-1',
    mrecPlacement: 'flutter-demo-mrec-1',
    interstitialPlacement: 'flutter-demo-interstitial-1',
    nativePlacement: '-',
    rewardedPlacement: '-',
  };

  // Android Configurations (for future use)
  static readonly androidDev: DemoEnvironmentConfig = {
    name: 'Development',
    appKey: 'g0PdN9_0ilfIcuNXhBopl', // TODO: Replace with actual Android dev app key
    hashedUserId: 'test-user-123',
    bannerPlacement: 'metaBanner',
    mrecPlacement: 'metaMREC',
    interstitialPlacement: 'metaInterstitial',
    nativePlacement: 'metaNative',
    rewardedPlacement: 'metaRewarded',
  };

  static readonly androidStaging: DemoEnvironmentConfig = {
    name: 'Staging',
    appKey: 'A7ovaBRCcAL8lapKtoZmm', // TODO: Replace with actual Android staging app key
    hashedUserId: 'test-user-123-staging',
    bannerPlacement: 'objcDemo-banner-1',
    mrecPlacement: 'objcDemo-mrec-1',
    interstitialPlacement: 'objcDemo-interstitial-1',
    nativePlacement: '-',
    rewardedPlacement: '-',
  };

  static readonly androidProduction: DemoEnvironmentConfig = {
    name: 'Production',
    appKey: 'Le01Sy3tmPjg8dlN0750r',
    hashedUserId: 'prod-user-123',
    bannerPlacement: 'flutter-demo-banner-1',
    mrecPlacement: 'flutter-demo-mrec-1',
    interstitialPlacement: 'flutter-demo-interstitial-1',
    nativePlacement: '-',
    rewardedPlacement: '-',
  };
}

