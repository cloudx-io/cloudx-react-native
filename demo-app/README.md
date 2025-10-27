# CloudX React Native Demo App

Full-featured demo application showcasing CloudX SDK integration for React Native.

## Features

- ✅ SDK Initialization with environment selection (Dev, Staging, Production)
- ✅ Interstitial ad integration
- ✅ Rewarded ad integration with reward tracking
- ✅ Event logging with real-time log viewer
- ✅ Banner ad support (coming soon)
- ✅ MREC ad support (coming soon)
- ✅ TypeScript throughout
- ✅ Modern React Native patterns

## Setup

### Prerequisites

- Node.js >= 18
- React Native development environment set up
- iOS development tools (Xcode, CocoaPods)
- CloudXCore SDK (in cloudx-ios monorepo)

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Install iOS pods:
```bash
cd ios
pod install
cd ..
```

3. Run the app:
```bash
# iOS
npm run ios
# or
yarn ios
```

## Architecture

### Project Structure

```
demo-app/
├── App.tsx                 # Main app with init & navigation
├── src/
│   ├── config/
│   │   └── DemoConfig.ts   # Environment configurations
│   ├── utils/
│   │   └── DemoAppLogger.ts # Event logger
│   └── screens/
│       ├── InterstitialScreen.tsx  # Full-screen interstitial ads
│       ├── RewardedScreen.tsx      # Rewarded video ads
│       ├── LogsScreen.tsx          # Event log viewer
│       ├── BannerScreen.tsx        # Banner ads (placeholder)
│       └── MRECScreen.tsx          # MREC ads (placeholder)
├── ios/
│   ├── Podfile             # CocoaPods configuration
│   └── CloudXReactNativeDemo/
│       └── Info.plist      # App permissions & config
└── package.json            # Dependencies

```

### Key Components

**InitScreen**: Environment selection (Dev, Staging, Production) and SDK initialization.

**MainTabView**: Bottom tab navigation between different ad types.

**Ad Screens**: Interactive demos for each ad format with:
- Load/Show controls
- Status indicators
- Event handling
- Integration with DemoAppLogger

**LogsScreen**: Modal viewer for all ad events and interactions.

**DemoAppLogger**: Centralized logging system with:
- Real-time updates via subscription pattern
- Formatted timestamps
- Event filtering
- 500-event limit

## Usage

### 1. Initialize SDK

Launch the app and select an environment:
- **Init Dev**: Development environment with test ads
- **Init Staging**: Staging environment
- **Init Production**: Production environment

### 2. Navigate to Ad Type

Use the bottom tabs to navigate between:
- 📱 Banner (coming soon)
- ⬜ MREC (coming soon)
- 🖼️ Interstitial
- 🎁 Rewarded

### 3. Load & Show Ads

1. Tap "Load Interstitial" or "Load Rewarded"
2. Wait for ad to load (status indicator will turn green)
3. Tap "Show Interstitial" or "Show Rewarded"
4. Ad will display full-screen

### 4. View Logs

Tap "📋 Logs" in the header to view all ad events:
- Load success/failure
- Show success/failure
- Clicks
- Rewards earned
- Timestamps for debugging

## Configuration

### Environment Configs

Located in `src/config/DemoConfig.ts`:

```typescript
DemoConfig.iosDev = {
  name: 'Development',
  appKey: 'g0PdN9_0ilfIcuNXhBopl',
  hashedUserId: 'test-user-123',
  bannerPlacement: 'metaBanner',
  mrecPlacement: 'metaMREC',
  interstitialPlacement: 'metaInterstitial',
  rewardedPlacement: 'metaRewarded',
};
```

### Podfile Configuration

The `ios/Podfile` references:
- CloudX React Native SDK (local)
- CloudXCore SDK (from cloudx-ios monorepo)
- Optional: CloudXMetaAdapter

Update paths if your monorepo structure differs.

## Troubleshooting

### Pod Install Issues

```bash
cd ios
pod deintegrate
pod install
```

### Metro Bundler Issues

```bash
npm start -- --reset-cache
```

### Build Failures

1. Clean build:
```bash
cd ios
xcodebuild clean
```

2. Remove derived data:
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### SDK Not Initializing

- Check app key in `DemoConfig.ts`
- Verify CloudXCore SDK is linked in Podfile
- Check logs for error messages

## Next Steps

- [ ] Implement BannerScreen with CloudXBannerView component
- [ ] Implement MRECScreen with proper 300x250 sizing
- [ ] Add native ads support
- [ ] Enhance event payloads with revenue data
- [ ] Add comprehensive unit tests

## License

Elastic License 2.0 - See LICENSE file

