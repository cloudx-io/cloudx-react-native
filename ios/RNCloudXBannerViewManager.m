//
//  RNCloudXBannerViewManager.m
//  cloudx-react-native
//

#import "RNCloudXBannerViewManager.h"
#import "RNCloudXBannerView.h"
#import <React/RCTUIManager.h>

@implementation RNCloudXBannerViewManager

RCT_EXPORT_MODULE(CloudXBannerView)

- (UIView *)view {
    return [[RNCloudXBannerView alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(placement, NSString)
RCT_EXPORT_VIEW_PROPERTY(adId, NSString)
RCT_EXPORT_VIEW_PROPERTY(bannerSize, NSString)
RCT_EXPORT_VIEW_PROPERTY(shouldLoad, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onAdLoaded, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdFailedToLoad, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdShown, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdFailedToShow, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdClicked, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdHidden, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdImpression, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdRevenuePaid, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdExpanded, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdCollapsed, RCTDirectEventBlock)

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

@end

