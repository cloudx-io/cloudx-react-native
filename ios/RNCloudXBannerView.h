//
//  RNCloudXBannerView.h
//  cloudx-react-native
//

#import <React/RCTView.h>
#import <CloudXCore/CloudXCore.h>

@interface RNCloudXBannerView : RCTView <CLXBannerDelegate>

@property (nonatomic, copy) NSString *placement;
@property (nonatomic, copy) NSString *adId;
@property (nonatomic, copy) NSString *bannerSize;
@property (nonatomic, assign) BOOL shouldLoad;

@property (nonatomic, copy) RCTDirectEventBlock onAdLoaded;
@property (nonatomic, copy) RCTDirectEventBlock onAdFailedToLoad;
@property (nonatomic, copy) RCTDirectEventBlock onAdShown;
@property (nonatomic, copy) RCTDirectEventBlock onAdFailedToShow;
@property (nonatomic, copy) RCTDirectEventBlock onAdClicked;
@property (nonatomic, copy) RCTDirectEventBlock onAdHidden;
@property (nonatomic, copy) RCTDirectEventBlock onAdImpression;
@property (nonatomic, copy) RCTDirectEventBlock onAdRevenuePaid;
@property (nonatomic, copy) RCTDirectEventBlock onAdExpanded;
@property (nonatomic, copy) RCTDirectEventBlock onAdCollapsed;

@end
