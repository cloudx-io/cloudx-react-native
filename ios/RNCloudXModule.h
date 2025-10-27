//
//  RNCloudXModule.h
//  react-native-cloudx-sdk
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <CloudXCore/CloudXCore.h>

@interface RNCloudXModule : RCTEventEmitter <RCTBridgeModule, CLXInterstitialDelegate, CLXRewardedDelegate, CLXBannerDelegate>

@property (nonatomic, strong) NSMutableDictionary<NSString *, CLXPublisherFullscreenAd *> *interstitials;
@property (nonatomic, strong) NSMutableDictionary<NSString *, CLXPublisherFullscreenAd *> *rewardeds;
@property (nonatomic, strong) NSMutableDictionary<NSString *, CLXBannerAdView *> *banners;

// Map ad instances to adIds for delegate callbacks
@property (nonatomic, strong) NSMapTable<id, NSString *> *adInstanceToAdId;

@end