//
//  RNCloudXBannerView.h
//  react-native-cloudx-sdk
//

#import <React/RCTViewManager.h>
#import <CloudXCore/CloudXCore.h>

@interface RNCloudXBannerView : UIView <CLXBannerDelegate>

@property (nonatomic, strong) id<CLXBanner> banner;
@property (nonatomic, copy) NSString *placement;
@property (nonatomic, copy) NSString *bannerSize;
@property (nonatomic, copy) RCTBubblingEventBlock onAdLoaded;
@property (nonatomic, copy) RCTBubblingEventBlock onAdFailedToLoad;
@property (nonatomic, copy) RCTBubblingEventBlock onAdClicked;
@property (nonatomic, copy) RCTBubblingEventBlock onAdOpened;
@property (nonatomic, copy) RCTBubblingEventBlock onAdClosed;

- (void)loadAd;
- (void)destroy;

@end

@interface RNCloudXBannerViewManager : RCTViewManager
@end