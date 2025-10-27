# CloudX React Native SDK

A React Native wrapper for the CloudX iOS SDK, providing easy integration of CloudX ads in your React Native applications.

## Features

- 🎯 Banner ads (standard, MREC, leaderboard)
- 📺 Interstitial ads
- 🎁 Rewarded video ads
- 🔒 Privacy compliance (GDPR, COPPA, CCPA)
- 📊 Complete event tracking
- 💪 TypeScript support

## Installation

```bash
npm install cloudx-react-native
# or
yarn add cloudx-react-native
```

### iOS Setup

1. Add to your `Podfile`:

```ruby
pod 'CloudXCore', :path => '../node_modules/cloudx-react-native/ios'
pod 'CloudXMetaAdapter' # If using Meta ads
```

2. Run `cd ios && pod install`

3. Add required permissions to `Info.plist`:

```xml
<key>NSUserTrackingUsageDescription</key>
<string>This app uses tracking to provide personalized ads.</string>
```

## Quick Start

```javascript
import CloudXSDK, { CloudXBannerView, BannerSizes } from 'cloudx-react-native';

// Initialize SDK
await CloudXSDK.initialize('YOUR_APP_KEY');

// Show a banner
<CloudXBannerView
  placement="banner-placement"
  bannerSize={BannerSizes.BANNER}
  onAdLoaded={() => console.log('Banner loaded')}
  onAdFailedToLoad={(e) => console.log('Banner failed:', e.error)}
/>

// Show interstitial
await CloudXSDK.createInterstitial('interstitial-placement');
await CloudXSDK.loadInterstitial('interstitial-placement');
await CloudXSDK.showInterstitial('interstitial-placement');
```

## API Reference

### Initialization

```javascript
CloudXSDK.initialize(appKey: string): Promise<{success: boolean}>
CloudXSDK.isInitialized(): Promise<boolean>
```

### Privacy

```javascript
CloudXSDK.setPrivacyConsent(consent: boolean): void
CloudXSDK.setDoNotSell(doNotSell: boolean): void
CloudXSDK.setCOPPAApplies(coppaApplies: boolean): void
CloudXSDK.setGDPRApplies(gdprApplies: boolean): void
```

### Banner Ads

```jsx
<CloudXBannerView
  placement="your-placement"
  bannerSize={BannerSizes.BANNER} // BANNER, MREC, or LEADERBOARD
  onAdLoaded={(event) => {}}
  onAdFailedToLoad={(event) => {}}
  onAdClicked={(event) => {}}
  style={{ width: 320, height: 50 }}
/>
```

### Interstitial Ads

```javascript
// Create and load
await CloudXSDK.createInterstitial(placement);
await CloudXSDK.loadInterstitial(placement);

// Check if ready
const ready = await CloudXSDK.isInterstitialReady(placement);

// Show
await CloudXSDK.showInterstitial(placement);
```

### Rewarded Ads

```javascript
// Create and load
await CloudXSDK.createRewarded(placement);
await CloudXSDK.loadRewarded(placement);

// Show
await CloudXSDK.showRewarded(placement);

// Listen for reward
CloudXSDK.addEventListener('onRewardEarned', (event) => {
  console.log('User earned reward!');
});
```

### Event Handling

```javascript
import { CloudXEventTypes } from 'cloudx-react-native';

// Add listener
const listener = CloudXSDK.addEventListener(
  CloudXEventTypes.INTERSTITIAL_LOADED,
  (event) => console.log('Loaded:', event.placement)
);

// Remove listener
listener.remove();
```

Available events:
- `onInterstitialLoaded`
- `onInterstitialFailedToLoad`
- `onInterstitialShown`
- `onInterstitialClosed`
- `onInterstitialClicked`
- `onRewardedLoaded`
- `onRewardedFailedToLoad`
- `onRewardedShown`
- `onRewardedClosed`
- `onRewardedClicked`
- `onRewardEarned`

## Complete Example

See the [example/App.js](example/App.js) file for a complete implementation.

## Platform Support

Currently supports **iOS only**. Android support coming soon.

## License

MIT