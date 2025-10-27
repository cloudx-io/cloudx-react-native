//
//  RNCloudXModule.h
//  react-native-cloudx-sdk
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <CloudXCore/CloudXCore.h>

@interface RNCloudXModule : RCTEventEmitter <RCTBridgeModule, CLXInterstitialDelegate, CLXRewardedDelegate>

@property (nonatomic, strong) NSMutableDictionary<NSString *, id<CLXInterstitial>> *interstitials;
@property (nonatomic, strong) NSMutableDictionary<NSString *, id<CLXRewarded>> *rewardeds;

@end