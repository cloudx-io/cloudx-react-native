# CloudX React Native SDK

A React Native wrapper for the CloudX native SDKs, providing a comprehensive solution for programmatic advertising with full privacy compliance support.

## Features

- **Full SDK Integration**: Complete wrapper for CloudX Core SDK
- **Cross-Platform Ready**: iOS support (Android coming soon)
- **All Ad Types**: Banner, Interstitial, Rewarded, Native, and MREC ads
- **Privacy Compliance**: Built-in CCPA, GDPR, COPPA, and GPP support
- **Event System**: React Native event emitter pattern for ad lifecycle management
- **Error Handling**: Comprehensive error handling with detailed error codes
- **Type Safety**: Full TypeScript support with complete type definitions
- **React Hooks**: Custom hooks for seamless React integration
- **Modern Patterns**: Follows React Native 0.70+ best practices

## Installation

```bash
npm install cloudx-react-native
# or
yarn add cloudx-react-native
```

### iOS Setup

1. Add to your `Podfile`:

```ruby
# CloudX Core SDK
pod 'CloudXCore'

# Optional: CloudX Adapters
pod 'CloudXMetaAdapter'
```

2. Install pods:

```bash
cd ios && pod install
```

3. Add required permissions to `Info.plist`:

```xml
<key>NSUserTrackingUsageDescription</key>
<string>This app uses tracking to provide personalized ads and better user experience.</string>

<key>SKAdNetworkItems</key>
<array>
  <!-- Add your SKAdNetwork IDs -->
</array>
```

### Android Setup

> ⚠️ **Android support coming soon**

---

## Quick Start

### 1. Initialize the SDK

```javascript
import CloudXSDK from 'cloudx-react-native';

// Basic initialization
const result = await CloudXSDK.initialize('YOUR_APP_KEY');

if (result.success) {
  console.log('CloudX SDK initialized successfully');
} else {
  console.error('Failed to initialize CloudX SDK:', result.message);
}

// Initialize with hashed user ID (optional)
await CloudXSDK.initialize({
  appKey: 'YOUR_APP_KEY',
  hashedUserID: 'hashed-user-id-here',
});

// Check if initialized
const isInitialized = await CloudXSDK.isInitialized();
```

### 2. Using React Hooks (Recommended)

```jsx
import { useCloudXInterstitial, useCloudXRewarded } from 'cloudx-react-native';

function GameOverScreen() {
  const interstitial = useCloudXInterstitial({
    placement: 'game-over-interstitial',
    adId: 'interstitial-1',
    onLoaded: (ad) => console.log('Interstitial ready:', ad.placementName),
    onFailed: (error) => console.error('Failed to load:', error),
    onShown: (ad) => console.log('Interstitial shown'),
    onClosed: (ad) => console.log('Interstitial closed'),
    onRevenuePaid: (ad) => console.log('Revenue:', ad.revenue, ad.currency),
  });

  return (
    <View>
      <Button
        title="Show Interstitial"
        onPress={() => interstitial.show()}
        disabled={!interstitial.isReady || interstitial.isLoading}
      />
      {interstitial.isLoading && <ActivityIndicator />}
    </View>
  );
}
```

### 3. Banner Ads (Component)

```jsx
import { CloudXBannerView, BannerSizes } from 'cloudx-react-native';

function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Your Content Here</Text>
      
      <CloudXBannerView
        placement="home-banner"
        adId="banner-1"
        bannerSize={BannerSizes.BANNER}
        autoRefresh={true}
        refreshInterval={30000}
        onAdLoaded={(event) => console.log('Banner loaded:', event.ad)}
        onAdFailedToLoad={(event) => console.error('Banner failed:', event.error)}
        onAdImpression={(event) => trackImpression(event.ad)}
        onRevenuePaid={(event) => trackRevenue(event.ad)}
        style={styles.banner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: 320,
    height: 50,
    marginVertical: 10,
  },
});
```

---

## API Reference

### SDK Initialization

#### `initialize(appKey: string | InitOptions): Promise<InitResult>`

Initialize the CloudX SDK. Must be called before using any other SDK methods.

```javascript
// Simple initialization
const result = await CloudXSDK.initialize('YOUR_APP_KEY');

// Advanced initialization
const result = await CloudXSDK.initialize({
  appKey: 'YOUR_APP_KEY',
  hashedUserID: 'optional-hashed-user-id',
});

// result = { success: boolean, message?: string }
```

#### `isInitialized(): Promise<boolean>`

Check if the SDK has been initialized.

```javascript
const initialized = await CloudXSDK.isInitialized();
```

#### `getVersion(): Promise<string>`

Get the CloudX SDK version.

```javascript
const version = await CloudXSDK.getVersion();
console.log('CloudX SDK version:', version);
```

#### `setLoggingEnabled(enabled: boolean): Promise<void>`

Enable or disable verbose SDK logging (useful for debugging).

```javascript
// Enable logging in development
if (__DEV__) {
  await CloudXSDK.setLoggingEnabled(true);
}
```

#### `setEnvironment(environment: 'dev' | 'staging' | 'production'): Promise<void>`

Set the SDK environment. Must be called **before** `initialize()`.

```javascript
await CloudXSDK.setEnvironment('staging');
await CloudXSDK.initialize('YOUR_APP_KEY');
```

---

## Privacy & Compliance

### CCPA (California Consumer Privacy Act)

```javascript
// Set CCPA privacy string (format: "1YNN")
// "1" = version
// "Y/N" = opt-out of sale
// "Y/N" = opt-out of sharing
// "Y/N" = limited service provider
await CloudXSDK.setCCPAPrivacyString('1YNN');

// Get current CCPA string
const ccpaString = await CloudXSDK.getCCPAPrivacyString();

// Set "Do Not Sell" preference
await CloudXSDK.setIsDoNotSell(true);
```

### GDPR (General Data Protection Regulation)

> ⚠️ **Note**: GDPR is not yet fully supported by CloudX servers. Please contact CloudX if you need GDPR support. CCPA is fully supported.

```javascript
// Set user consent
await CloudXSDK.setIsUserConsent(true);

// Get consent status
const hasConsent = await CloudXSDK.getIsUserConsent();
```

### COPPA (Children's Online Privacy Protection Act)

```javascript
// Set age-restricted user flag
await CloudXSDK.setIsAgeRestrictedUser(true);

// Get age-restricted status
const isAgeRestricted = await CloudXSDK.getIsAgeRestrictedUser();
```

### GPP (Global Privacy Platform)

IAB's Global Privacy Platform for comprehensive privacy management across multiple jurisdictions.

```javascript
// Set GPP consent string
await CloudXSDK.setGPPString('DBACNYA~CPXxRfAPXxRfAAfKABENB...');

// Set GPP section IDs
// Example: [7, 8] for US-National (7) and US-CA/California (8)
await CloudXSDK.setGPPSectionIds([7, 8]);

// Get GPP values
const gppString = await CloudXSDK.getGPPString();
const gppSectionIds = await CloudXSDK.getGPPSectionIds();
```

### Privacy Summary

```javascript
// Complete privacy setup example
async function setupPrivacyCompliance(userConsent: UserConsentData) {
  // CCPA
  if (userConsent.jurisdiction === 'california') {
    await CloudXSDK.setCCPAPrivacyString('1YNN');
    await CloudXSDK.setIsDoNotSell(userConsent.doNotSell);
  }
  
  // GDPR
  if (userConsent.jurisdiction === 'eu') {
    await CloudXSDK.setIsUserConsent(userConsent.hasConsent);
  }
  
  // COPPA
  if (userConsent.isChild) {
    await CloudXSDK.setIsAgeRestrictedUser(true);
  }
  
  // GPP (Recommended for new implementations)
  if (userConsent.gppString) {
    await CloudXSDK.setGPPString(userConsent.gppString);
    await CloudXSDK.setGPPSectionIds(userConsent.gppSectionIds);
  }
}
```

---

## User Targeting

### Hashed User ID

```javascript
// Set hashed user ID for targeting
await CloudXSDK.setHashedUserID('hashed-email-or-user-id');

// Get current user ID
const userId = await CloudXSDK.getUserID();

// Clear user ID
await CloudXSDK.setUserID(null);
```

### Generic Key-Value Targeting

```javascript
// Set single key-value pair
await CloudXSDK.setTargetingKeyValue('age', '25');

// Set multiple key-values (more efficient)
await CloudXSDK.setTargetingKeyValues({
  gender: 'male',
  location: 'US',
  interests: 'gaming',
  level: '42',
});
```

### User-Level Targeting

User-level key-values are **cleared automatically** when privacy regulations require removing personal data (COPPA, GDPR).

```javascript
// User-specific targeting (privacy-sensitive)
await CloudXSDK.setUserKeyValue('age', '25');
await CloudXSDK.setUserKeyValue('interests', 'gaming');
await CloudXSDK.setUserKeyValue('subscription', 'premium');
```

### App-Level Targeting

App-level key-values are **NOT affected** by privacy regulations and persist across privacy changes.

```javascript
// App-specific targeting (persistent)
await CloudXSDK.setAppKeyValue('app_version', '1.2.0');
await CloudXSDK.setAppKeyValue('build_type', 'release');
await CloudXSDK.setAppKeyValue('theme', 'dark');
```

### Bidder-Specific Targeting

```javascript
// Set targeting for specific bidder/network
await CloudXSDK.setBidderKeyValue('meta', 'placement_id', 'abc123');
await CloudXSDK.setBidderKeyValue('admob', 'app_id', 'ca-app-pub-xxx');
```

### Clear Targeting

```javascript
// Clear all targeting key-values
await CloudXSDK.clearAllTargeting();
```

---

## Banner Ads

### Using BannerView Component (Recommended)

```jsx
import { CloudXBannerView, BannerSizes } from 'cloudx-react-native';

function MyComponent() {
  return (
    <CloudXBannerView
      // Required
      placement="banner-placement"
      adId="banner-1"
      
      // Optional
      bannerSize={BannerSizes.BANNER} // BANNER, MREC, LEADERBOARD
      autoRefresh={true}
      refreshInterval={30000} // milliseconds
      
      // Event callbacks
      onAdLoaded={(event) => console.log('Banner loaded:', event.ad)}
      onAdFailedToLoad={(event) => console.error('Failed:', event.error)}
      onAdShown={(event) => console.log('Banner shown')}
      onAdImpression={(event) => console.log('Impression tracked')}
      onAdClicked={(event) => console.log('Banner clicked')}
      onAdExpanded={(event) => console.log('Banner expanded')}
      onAdCollapsed={(event) => console.log('Banner collapsed')}
      onRevenuePaid={(event) => console.log('Revenue:', event.ad.revenue)}
      
      // Styling
      style={{ width: 320, height: 50 }}
    />
  );
}
```

### Using Custom Hook

```jsx
import { useCloudXBanner } from 'cloudx-react-native';

function MyComponent() {
  const banner = useCloudXBanner({
    placement: 'banner-placement',
    adId: 'banner-1',
    bannerSize: BannerSizes.BANNER,
    autoRefresh: true,
    onLoaded: (ad) => console.log('Banner ready'),
    onRevenuePaid: (ad) => trackRevenue(ad),
  });

  return (
    <View>
      {banner.render({ style: styles.banner })}
      {banner.isLoading && <ActivityIndicator />}
    </View>
  );
}
```

### Imperative API

```javascript
// Create banner
await CloudXSDK.createBanner({
  placement: 'banner-placement',
  adId: 'banner-1',
  bannerSize: BannerSizes.BANNER,
});

// Load banner
await CloudXSDK.loadBanner({ adId: 'banner-1' });

// Show banner (if hidden)
await CloudXSDK.showBanner({ adId: 'banner-1' });

// Hide banner (keeps it loaded)
await CloudXSDK.hideBanner({ adId: 'banner-1' });

// Auto-refresh control
await CloudXSDK.startAutoRefresh({ adId: 'banner-1' });
await CloudXSDK.stopAutoRefresh({ adId: 'banner-1' });

// Destroy banner (cleanup)
await CloudXSDK.destroyAd({ adId: 'banner-1' });
```

### Banner Sizes

```javascript
export const BannerSizes = {
  BANNER: 'BANNER',           // 320x50
  MREC: 'MREC',              // 300x250
  LEADERBOARD: 'LEADERBOARD', // 728x90
};
```

---

## Interstitial Ads

### Using React Hook (Recommended)

```jsx
import { useCloudXInterstitial } from 'cloudx-react-native';

function GameOverScreen() {
  const interstitial = useCloudXInterstitial({
    placement: 'game-over-interstitial',
    adId: 'interstitial-1',
    
    // Event callbacks
    onLoaded: (ad) => {
      console.log('Interstitial ready:', ad.placementName);
      setAdReady(true);
    },
    onFailedToLoad: (error) => {
      console.error('Failed to load:', error);
    },
    onShown: (ad) => {
      console.log('Interstitial shown');
      pauseGame();
    },
    onFailedToShow: (error) => {
      console.error('Failed to show:', error);
    },
    onImpression: (ad) => {
      console.log('Impression tracked:', ad.revenue);
    },
    onClosed: (ad) => {
      console.log('Interstitial closed');
      resumeGame();
    },
    onClicked: (ad) => {
      console.log('Interstitial clicked');
    },
    onRevenuePaid: (ad) => {
      console.log('Revenue:', ad.revenue, ad.currency);
      trackRevenue(ad);
    },
  });

  useEffect(() => {
    // Auto-load on mount
    interstitial.load();
    
    // Cleanup on unmount
    return () => {
      interstitial.destroy();
    };
  }, []);

  return (
    <View>
      <Text>Game Over!</Text>
      <Button
        title="Continue (Watch Ad)"
        onPress={() => interstitial.show()}
        disabled={!interstitial.isReady || interstitial.isShowing}
      />
      {interstitial.isLoading && <ActivityIndicator />}
    </View>
  );
}
```

### Imperative API

```javascript
// Create interstitial
await CloudXSDK.createInterstitial({
  placement: 'interstitial-placement',
  adId: 'interstitial-1',
});

// Load interstitial
await CloudXSDK.loadInterstitial({ adId: 'interstitial-1' });

// Check if ready
const isReady = await CloudXSDK.isInterstitialReady({ adId: 'interstitial-1' });

// Show interstitial
if (isReady) {
  await CloudXSDK.showInterstitial({ adId: 'interstitial-1' });
}

// Destroy when done
await CloudXSDK.destroyAd({ adId: 'interstitial-1' });
```

---

## Rewarded Ads

### Using React Hook (Recommended)

```jsx
import { useCloudXRewarded } from 'cloudx-react-native';

function RewardButton() {
  const rewarded = useCloudXRewarded({
    placement: 'extra-lives-rewarded',
    adId: 'rewarded-1',
    
    onLoaded: (ad) => console.log('Rewarded ad ready'),
    onFailedToLoad: (error) => console.error('Failed:', error),
    onShown: (ad) => console.log('Showing rewarded ad'),
    onRewardEarned: (ad) => {
      console.log('🎉 User earned reward!');
      grantExtraLife();
    },
    onVideoStarted: (ad) => console.log('Video started'),
    onVideoCompleted: (ad) => console.log('Video completed'),
    onClosed: (ad) => console.log('Rewarded ad closed'),
    onRevenuePaid: (ad) => trackRevenue(ad),
  });

  useEffect(() => {
    rewarded.load();
    return () => rewarded.destroy();
  }, []);

  return (
    <Button
      title="Watch Ad for Extra Life"
      onPress={() => rewarded.show()}
      disabled={!rewarded.isReady}
    />
  );
}
```

### Imperative API

```javascript
// Create rewarded ad
await CloudXSDK.createRewarded({
  placement: 'rewarded-placement',
  adId: 'rewarded-1',
});

// Load rewarded ad
await CloudXSDK.loadRewarded({ adId: 'rewarded-1' });

// Check if ready
const isReady = await CloudXSDK.isRewardedReady({ adId: 'rewarded-1' });

// Show rewarded ad
if (isReady) {
  await CloudXSDK.showRewarded({ adId: 'rewarded-1' });
}

// Listen for reward event
const listener = CloudXSDK.addEventListener(
  CloudXEventTypes.REWARD_EARNED,
  (event) => {
    if (event.ad.adId === 'rewarded-1') {
      console.log('User earned reward!');
      grantReward();
    }
  }
);

// Clean up
listener.remove();
await CloudXSDK.destroyAd({ adId: 'rewarded-1' });
```

---

## Native Ads

### Using React Hook (Recommended)

```jsx
import { useCloudXNative } from 'cloudx-react-native';

function FeedItemAd({ index }) {
  const nativeAd = useCloudXNative({
    placement: 'feed-native',
    adId: `native-${index}`,
    
    onLoaded: (ad) => {
      console.log('Native ad loaded:', ad.assets);
    },
    onFailedToLoad: (error) => console.error('Failed:', error),
    onImpression: (ad) => trackImpression(ad),
    onClicked: (ad) => console.log('Native ad clicked'),
    onRevenuePaid: (ad) => trackRevenue(ad),
  });

  useEffect(() => {
    nativeAd.load();
    return () => nativeAd.destroy();
  }, []);

  if (!nativeAd.isLoaded || !nativeAd.assets) {
    return null;
  }

  return (
    <View style={styles.nativeAd}>
      {nativeAd.assets.iconUrl && (
        <Image source={{ uri: nativeAd.assets.iconUrl }} style={styles.icon} />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{nativeAd.assets.title}</Text>
        <Text style={styles.body}>{nativeAd.assets.body}</Text>
        {nativeAd.assets.callToAction && (
          <TouchableOpacity
            style={styles.cta}
            onPress={() => nativeAd.click()}
          >
            <Text style={styles.ctaText}>{nativeAd.assets.callToAction}</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.adBadge}>Ad</Text>
    </View>
  );
}
```

### Imperative API

```javascript
// Create native ad
await CloudXSDK.createNative({
  placement: 'native-placement',
  adId: 'native-1',
});

// Load native ad
await CloudXSDK.loadNative({ adId: 'native-1' });

// Get native ad assets
const assets = await CloudXSDK.getNativeAdAssets({ adId: 'native-1' });
// assets = {
//   title: string,
//   body: string,
//   callToAction: string,
//   iconUrl: string,
//   imageUrl: string,
//   starRating: number,
//   advertiser: string,
// }

// Register view for impression tracking
await CloudXSDK.registerNativeAdView({ adId: 'native-1' });

// Track click
await CloudXSDK.trackNativeAdClick({ adId: 'native-1' });

// Destroy
await CloudXSDK.destroyAd({ adId: 'native-1' });
```

---

## MREC Ads

MREC (Medium Rectangle) ads are 300x250 banner ads commonly used in content feeds.

### Using Component

```jsx
import { CloudXBannerView, BannerSizes } from 'cloudx-react-native';

function ContentFeed() {
  return (
    <ScrollView>
      <Article />
      <Article />
      
      {/* MREC ad between content */}
      <CloudXBannerView
        placement="feed-mrec"
        adId="mrec-1"
        bannerSize={BannerSizes.MREC}
        autoRefresh={true}
        onAdLoaded={(event) => console.log('MREC loaded')}
        onRevenuePaid={(event) => trackRevenue(event.ad)}
        style={{ width: 300, height: 250, alignSelf: 'center' }}
      />
      
      <Article />
      <Article />
    </ScrollView>
  );
}
```

---

## Event Handling

### Event Types

```javascript
import { CloudXEventTypes } from 'cloudx-react-native';

// Banner Events
CloudXEventTypes.BANNER_LOADED
CloudXEventTypes.BANNER_FAILED_TO_LOAD
CloudXEventTypes.BANNER_SHOWN
CloudXEventTypes.BANNER_FAILED_TO_SHOW
CloudXEventTypes.BANNER_HIDDEN
CloudXEventTypes.BANNER_CLICKED
CloudXEventTypes.BANNER_IMPRESSION
CloudXEventTypes.BANNER_EXPANDED
CloudXEventTypes.BANNER_COLLAPSED
CloudXEventTypes.BANNER_REVENUE_PAID

// Interstitial Events
CloudXEventTypes.INTERSTITIAL_LOADED
CloudXEventTypes.INTERSTITIAL_FAILED_TO_LOAD
CloudXEventTypes.INTERSTITIAL_SHOWN
CloudXEventTypes.INTERSTITIAL_FAILED_TO_SHOW
CloudXEventTypes.INTERSTITIAL_CLOSED
CloudXEventTypes.INTERSTITIAL_CLICKED
CloudXEventTypes.INTERSTITIAL_IMPRESSION
CloudXEventTypes.INTERSTITIAL_CLOSED_BY_USER
CloudXEventTypes.INTERSTITIAL_REVENUE_PAID

// Rewarded Events
CloudXEventTypes.REWARDED_LOADED
CloudXEventTypes.REWARDED_FAILED_TO_LOAD
CloudXEventTypes.REWARDED_SHOWN
CloudXEventTypes.REWARDED_FAILED_TO_SHOW
CloudXEventTypes.REWARDED_CLOSED
CloudXEventTypes.REWARDED_CLICKED
CloudXEventTypes.REWARDED_IMPRESSION
CloudXEventTypes.REWARDED_CLOSED_BY_USER
CloudXEventTypes.REWARDED_REVENUE_PAID
CloudXEventTypes.REWARD_EARNED
CloudXEventTypes.REWARDED_VIDEO_STARTED
CloudXEventTypes.REWARDED_VIDEO_COMPLETED

// Native Events
CloudXEventTypes.NATIVE_LOADED
CloudXEventTypes.NATIVE_FAILED_TO_LOAD
CloudXEventTypes.NATIVE_SHOWN
CloudXEventTypes.NATIVE_CLICKED
CloudXEventTypes.NATIVE_IMPRESSION
CloudXEventTypes.NATIVE_REVENUE_PAID
```

### Using Event Emitter

```javascript
import CloudXSDK, { CloudXEventTypes } from 'cloudx-react-native';

// Add listener
const listener = CloudXSDK.addEventListener(
  CloudXEventTypes.INTERSTITIAL_LOADED,
  (event) => {
    console.log('Ad loaded:', event.ad.adId);
    console.log('Placement:', event.ad.placementName);
  }
);

// Remove specific listener
listener.remove();

// Remove all listeners for an event
CloudXSDK.removeAllListeners(CloudXEventTypes.INTERSTITIAL_LOADED);

// Remove all listeners
CloudXSDK.removeAllListeners();
```

### Event Payload

All events receive a payload with the following structure:

```typescript
interface CloudXAdEvent {
  ad?: CloudXAd;
  error?: string;
  timestamp: number;
}

interface CloudXAd {
  adId: string;
  placementName: string;
  adType: 'banner' | 'interstitial' | 'rewarded' | 'native' | 'mrec';
  revenue?: number;
  currency?: string;
  network?: string;
  creativeId?: string;
  lineItemId?: string;
}
```

### Using with React

```jsx
import { useEffect } from 'react';
import CloudXSDK, { CloudXEventTypes } from 'cloudx-react-native';

function MyComponent() {
  useEffect(() => {
    const listener = CloudXSDK.addEventListener(
      CloudXEventTypes.INTERSTITIAL_LOADED,
      handleInterstitialLoaded
    );

    return () => {
      listener.remove(); // Cleanup on unmount
    };
  }, []);

  const handleInterstitialLoaded = (event) => {
    console.log('Interstitial ready:', event.ad);
  };

  return <View>...</View>;
}
```

---

## Error Handling

### Error Codes

```javascript
// Common error codes
const ErrorCodes = {
  NO_FILL: 'NO_FILL',                     // No ad available
  TIMEOUT: 'TIMEOUT',                     // Request timed out
  NETWORK_ERROR: 'NETWORK_ERROR',         // Network issue
  INVALID_PLACEMENT: 'INVALID_PLACEMENT', // Placement not configured
  SDK_NOT_INITIALIZED: 'SDK_NOT_INITIALIZED', // Must initialize first
  AD_NOT_READY: 'AD_NOT_READY',          // Ad not loaded yet
  AD_ALREADY_SHOWN: 'AD_ALREADY_SHOWN',  // Ad already displayed
  INVALID_AD_ID: 'INVALID_AD_ID',        // Ad ID not found
};
```

### Handling Errors

```javascript
// Try-catch for async methods
try {
  await CloudXSDK.loadInterstitial({ adId: 'interstitial-1' });
} catch (error) {
  if (error.code === 'NO_FILL') {
    console.log('No ad available, continue without ad');
  } else if (error.code === 'NETWORK_ERROR') {
    console.log('Network error, retry later');
    setTimeout(() => retry(), 5000);
  } else {
    console.error('Unexpected error:', error);
  }
}

// Error events
CloudXSDK.addEventListener(
  CloudXEventTypes.INTERSTITIAL_FAILED_TO_LOAD,
  (event) => {
    console.error('Failed to load ad:', event.error);
    
    // Handle specific errors
    switch (event.error) {
      case 'NO_FILL':
        // Show alternative content
        break;
      case 'TIMEOUT':
        // Retry with longer timeout
        break;
      default:
        // Generic error handling
    }
  }
);
```

### Best Practices

```javascript
async function showInterstitialSafely(adId: string) {
  try {
    // Check if SDK is initialized
    const initialized = await CloudXSDK.isInitialized();
    if (!initialized) {
      throw new Error('SDK not initialized');
    }

    // Check if ad is ready
    const isReady = await CloudXSDK.isInterstitialReady({ adId });
    if (!isReady) {
      console.log('Ad not ready, loading...');
      await CloudXSDK.loadInterstitial({ adId });
      // Wait for load event before showing
      return;
    }

    // Show the ad
    await CloudXSDK.showInterstitial({ adId });
  } catch (error) {
    console.error('Error showing interstitial:', error);
    // Continue app flow without ad
  }
}
```

---

## Advanced Usage

### Multiple Ad Instances

```javascript
// Create multiple instances of the same placement
await CloudXSDK.createInterstitial({
  placement: 'level-complete',
  adId: 'level-1-interstitial',
});

await CloudXSDK.createInterstitial({
  placement: 'level-complete',
  adId: 'level-2-interstitial',
});

// Each instance is managed independently
await CloudXSDK.loadInterstitial({ adId: 'level-1-interstitial' });
await CloudXSDK.loadInterstitial({ adId: 'level-2-interstitial' });
```

### Preloading Ads

```javascript
// Preload ads early for better UX
async function preloadAds() {
  // Preload interstitial
  await CloudXSDK.createInterstitial({
    placement: 'game-over',
    adId: 'preloaded-interstitial',
  });
  await CloudXSDK.loadInterstitial({ adId: 'preloaded-interstitial' });

  // Preload rewarded
  await CloudXSDK.createRewarded({
    placement: 'extra-life',
    adId: 'preloaded-rewarded',
  });
  await CloudXSDK.loadRewarded({ adId: 'preloaded-rewarded' });
}

// Call during app initialization or loading screens
useEffect(() => {
  preloadAds();
}, []);
```

### Ad Frequency Capping

```javascript
// Implement your own frequency capping
class AdFrequencyCapper {
  constructor(maxAdsPerHour = 5) {
    this.maxAdsPerHour = maxAdsPerHour;
    this.adTimestamps = [];
  }

  canShowAd() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.adTimestamps = this.adTimestamps.filter(ts => ts > oneHourAgo);
    return this.adTimestamps.length < this.maxAdsPerHour;
  }

  recordAdShown() {
    this.adTimestamps.push(Date.now());
  }
}

const frequencyCapper = new AdFrequencyCapper(5);

async function showInterstitialWithCapping(adId: string) {
  if (!frequencyCapper.canShowAd()) {
    console.log('Ad frequency cap reached');
    return;
  }

  try {
    await CloudXSDK.showInterstitial({ adId });
    frequencyCapper.recordAdShown();
  } catch (error) {
    console.error('Failed to show ad:', error);
  }
}
```

### Revenue Tracking

```javascript
// Track revenue from all ad types
CloudXSDK.addEventListener(
  CloudXEventTypes.INTERSTITIAL_REVENUE_PAID,
  (event) => trackRevenue(event.ad)
);

CloudXSDK.addEventListener(
  CloudXEventTypes.REWARDED_REVENUE_PAID,
  (event) => trackRevenue(event.ad)
);

CloudXSDK.addEventListener(
  CloudXEventTypes.BANNER_REVENUE_PAID,
  (event) => trackRevenue(event.ad)
);

function trackRevenue(ad: CloudXAd) {
  if (ad.revenue && ad.currency) {
    // Send to analytics
    Analytics.logRevenue({
      amount: ad.revenue,
      currency: ad.currency,
      adNetwork: ad.network,
      adType: ad.adType,
      placement: ad.placementName,
    });

    console.log(
      `💰 Revenue: ${ad.currency} ${ad.revenue} from ${ad.network}`
    );
  }
}
```

---

## React Hooks API

### useCloudXInterstitial

```typescript
interface UseInterstitialOptions {
  placement: string;
  adId: string;
  onLoaded?: (ad: CloudXAd) => void;
  onFailedToLoad?: (error: string) => void;
  onShown?: (ad: CloudXAd) => void;
  onFailedToShow?: (error: string) => void;
  onClosed?: (ad: CloudXAd) => void;
  onClicked?: (ad: CloudXAd) => void;
  onImpression?: (ad: CloudXAd) => void;
  onRevenuePaid?: (ad: CloudXAd) => void;
  autoLoad?: boolean; // Default: false
}

interface UseInterstitialResult {
  isReady: boolean;
  isLoading: boolean;
  isShowing: boolean;
  error: string | null;
  load: () => Promise<void>;
  show: () => Promise<void>;
  destroy: () => Promise<void>;
}

const interstitial = useCloudXInterstitial(options);
```

### useCloudXRewarded

```typescript
interface UseRewardedOptions extends UseInterstitialOptions {
  onRewardEarned?: (ad: CloudXAd) => void;
  onVideoStarted?: (ad: CloudXAd) => void;
  onVideoCompleted?: (ad: CloudXAd) => void;
}

interface UseRewardedResult extends UseInterstitialResult {
  // Same as interstitial
}

const rewarded = useCloudXRewarded(options);
```

### useCloudXBanner

```typescript
interface UseBannerOptions {
  placement: string;
  adId: string;
  bannerSize?: BannerSize;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onLoaded?: (ad: CloudXAd) => void;
  onFailedToLoad?: (error: string) => void;
  onShown?: (ad: CloudXAd) => void;
  onImpression?: (ad: CloudXAd) => void;
  onClicked?: (ad: CloudXAd) => void;
  onRevenuePaid?: (ad: CloudXAd) => void;
}

interface UseBannerResult {
  isLoaded: boolean;
  isVisible: boolean;
  error: string | null;
  render: (props?: ViewProps) => React.ReactElement;
  show: () => Promise<void>;
  hide: () => Promise<void>;
  destroy: () => Promise<void>;
}

const banner = useCloudXBanner(options);
```

### useCloudXNative

```typescript
interface UseNativeOptions {
  placement: string;
  adId: string;
  onLoaded?: (ad: CloudXAd) => void;
  onFailedToLoad?: (error: string) => void;
  onImpression?: (ad: CloudXAd) => void;
  onClicked?: (ad: CloudXAd) => void;
  onRevenuePaid?: (ad: CloudXAd) => void;
}

interface UseNativeResult {
  isLoaded: boolean;
  assets: NativeAdAssets | null;
  error: string | null;
  load: () => Promise<void>;
  click: () => Promise<void>;
  destroy: () => Promise<void>;
}

const nativeAd = useCloudXNative(options);
```

---

## TypeScript Support

The SDK is fully typed with TypeScript definitions included.

```typescript
import CloudXSDK, {
  CloudXAd,
  CloudXAdEvent,
  CloudXEventTypes,
  BannerSizes,
  CloudXBannerView,
  useCloudXInterstitial,
  useCloudXRewarded,
  useCloudXBanner,
  useCloudXNative,
} from 'cloudx-react-native';

// All types are exported and fully documented
```

---

## Platform Support

| Platform | Status | Minimum Version |
|----------|--------|-----------------|
| iOS | ✅ Supported | iOS 14.0+ |
| Android | 🚧 Coming Soon | API 21+ (Android 5.0+) |

### Requirements

#### iOS
- iOS 14.0 or higher
- CocoaPods
- Xcode 13.0+

#### Android (Coming Soon)
- Android API 21 (Android 5.0) or higher
- Gradle 8.0+
- Kotlin 1.8+

#### React Native
- React Native 0.70+
- React 18.0+
- TypeScript 4.5+ (optional but recommended)

---

## Implementation Status

### ✅ Implemented
- Basic SDK initialization
- Banner ads (component-based)
- Interstitial ads (basic)
- Rewarded ads (basic)
- Event emitter system
- TypeScript definitions

### 🚧 In Development
- React hooks (useCloudXInterstitial, useCloudXRewarded, etc.)
- Privacy & compliance APIs (GPP, CCPA strings)
- User targeting APIs
- Native ad support
- MREC ad support
- Auto-refresh functionality
- Ad lifecycle management (destroy, hide, etc.)
- Android support

### 📋 Planned
- Ad mediation adapters
- Enhanced error handling
- React Native New Architecture support
- Expo config plugin
- Advanced targeting options

---

## Migration Guide

### From AdMob

```javascript
// AdMob
import { InterstitialAd } from '@react-native-google-mobile-ads/admob';

const interstitial = InterstitialAd.createForAdRequest(adUnitId);
interstitial.load();
interstitial.show();

// CloudX
import { useCloudXInterstitial } from 'cloudx-react-native';

const interstitial = useCloudXInterstitial({
  placement: 'your-placement',
  adId: 'interstitial-1',
  autoLoad: true,
});
interstitial.show();
```

### From Meta Audience Network

```javascript
// Meta
import { InterstitialAdManager } from 'react-native-fbads';

InterstitialAdManager.showAd(placementId)
  .then(() => console.log('Shown'))
  .catch(() => console.log('Failed'));

// CloudX
const interstitial = useCloudXInterstitial({
  placement: 'your-placement',
  adId: 'interstitial-1',
});
await interstitial.load();
await interstitial.show();
```

---

## Troubleshooting

### SDK Not Initializing

```javascript
// Make sure to await initialization
const result = await CloudXSDK.initialize('YOUR_APP_KEY');
if (!result.success) {
  console.error('Initialization failed:', result.message);
}

// Check iOS setup
// 1. Verify CloudXCore pod is installed
// 2. Run `pod install` in ios/ directory
// 3. Check Info.plist has required permissions
```

### Ads Not Loading

```javascript
// 1. Check SDK is initialized
const initialized = await CloudXSDK.isInitialized();

// 2. Enable logging to see detailed errors
await CloudXSDK.setLoggingEnabled(true);

// 3. Check placement is configured in CloudX dashboard

// 4. Verify network connectivity

// 5. Check for error events
CloudXSDK.addEventListener(
  CloudXEventTypes.INTERSTITIAL_FAILED_TO_LOAD,
  (event) => console.error('Load error:', event.error)
);
```

### Memory Leaks

```javascript
// Always destroy ads when done
useEffect(() => {
  return () => {
    CloudXSDK.destroyAd({ adId: 'my-ad' });
  };
}, []);

// Remove event listeners
useEffect(() => {
  const listener = CloudXSDK.addEventListener(...);
  return () => listener.remove();
}, []);
```

---

## Examples

Complete example application is available in the [example/](example/) directory.

```bash
# Run example app
cd example
npm install
cd ios && pod install && cd ..
npm run ios
```

---

## Documentation

- **[SDK Audit](SDK_AUDIT.md)**: Detailed comparison with Flutter SDK and implementation roadmap
- **[API Reference](https://docs.cloudx.io/react-native)**: Complete API documentation
- **[iOS Integration Guide](https://docs.cloudx.io/ios)**: CloudX iOS SDK documentation

---

## Support

For technical support and questions:

- 📧 **Email**: support@cloudx.io
- 🐛 **Issues**: [GitHub Issues](https://github.com/cloudx-io/cloudx-react-native/issues)
- 📚 **Docs**: [docs.cloudx.io](https://docs.cloudx.io)

---

## License

This project is licensed under the Elastic License 2.0 - see the [LICENSE](LICENSE) file for details.

---

## Changelog

See [RELEASES](https://github.com/cloudx-io/cloudx-react-native/releases) for detailed changelog and version history.
