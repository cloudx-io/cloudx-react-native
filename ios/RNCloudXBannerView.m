//
//  RNCloudXBannerView.m
//  cloudx-react-native
//

#import "RNCloudXBannerView.h"
#import <React/RCTLog.h>

@interface RNCloudXBannerView ()
@property (nonatomic, strong) CLXBannerAdView *bannerAdView;
@property (nonatomic, assign) BOOL hasCreatedAd;
@end

@implementation RNCloudXBannerView

- (instancetype)init {
    if (self = [super init]) {
        _hasCreatedAd = NO;
        self.backgroundColor = [UIColor clearColor];
    }
    return self;
}

- (void)dealloc {
    if (_bannerAdView) {
        [_bannerAdView destroy];
        _bannerAdView = nil;
    }
}

- (void)didSetProps:(NSArray<NSString *> *)changedProps {
    [super didSetProps:changedProps];
    
    // Only create the ad once we have all required props
    if (!self.hasCreatedAd && self.placement && self.adId) {
        [self createAndLoadBanner];
    }
}

- (void)createAndLoadBanner {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (self.hasCreatedAd) {
            return;
        }
        
        if (![[CloudXCore shared] isInitialized]) {
            RCTLogError(@"[CloudXBannerView] SDK not initialized");
            if (self.onAdFailedToLoad) {
                self.onAdFailedToLoad(@{
                    @"adId": self.adId ?: @"",
                    @"error": @"SDK not initialized"
                });
            }
            return;
        }
        
        UIViewController *viewController = [self reactViewController];
        if (!viewController) {
            RCTLogError(@"[CloudXBannerView] No view controller found");
            if (self.onAdFailedToLoad) {
                self.onAdFailedToLoad(@{
                    @"adId": self.adId ?: @"",
                    @"error": @"No view controller"
                });
            }
            return;
        }
        
        // Determine if this is a banner or MREC
        BOOL isMREC = [self.bannerSize isEqualToString:@"MREC"];
        
        if (isMREC) {
            self.bannerAdView = [[CloudXCore shared] createMRECWithPlacement:self.placement
                                                              viewController:viewController
                                                                    delegate:self];
        } else {
            self.bannerAdView = [[CloudXCore shared] createBannerWithPlacement:self.placement
                                                                viewController:viewController
                                                                      delegate:self
                                                                          tmax:nil];
        }
        
        if (self.bannerAdView) {
            self.hasCreatedAd = YES;
            
            // Add as subview
            self.bannerAdView.translatesAutoresizingMaskIntoConstraints = NO;
            [self addSubview:self.bannerAdView];
            
            // Setup constraints
            [NSLayoutConstraint activateConstraints:@[
                [self.bannerAdView.topAnchor constraintEqualToAnchor:self.topAnchor],
                [self.bannerAdView.leftAnchor constraintEqualToAnchor:self.leftAnchor],
                [self.bannerAdView.rightAnchor constraintEqualToAnchor:self.rightAnchor],
                [self.bannerAdView.bottomAnchor constraintEqualToAnchor:self.bottomAnchor]
            ]];
            
            // Load the ad
            [self.bannerAdView load];
            
            RCTLogInfo(@"[CloudXBannerView] Created and loading %@ for placement: %@", isMREC ? @"MREC" : @"banner", self.placement);
        } else {
            RCTLogError(@"[CloudXBannerView] Failed to create banner");
            if (self.onAdFailedToLoad) {
                self.onAdFailedToLoad(@{
                    @"adId": self.adId ?: @"",
                    @"error": @"Failed to create banner"
                });
            }
        }
    });
}

#pragma mark - Helper

- (UIViewController *)reactViewController {
    UIResponder *responder = self;
    while (responder) {
        if ([responder isKindOfClass:[UIViewController class]]) {
            return (UIViewController *)responder;
        }
        responder = [responder nextResponder];
    }
    return nil;
}

#pragma mark - CLXBannerDelegate

- (void)didLoadWithAd:(CLXAd *)ad {
    RCTLogInfo(@"[CloudXBannerView] Banner loaded");
    if (self.onAdLoaded) {
        NSMutableDictionary *eventData = [NSMutableDictionary dictionaryWithDictionary:@{
            @"adId": self.adId ?: @""
        }];
        
        if (ad) {
            NSMutableDictionary *adInfo = [NSMutableDictionary dictionary];
            if (ad.placementName) adInfo[@"placementName"] = ad.placementName;
            if (ad.placementId) adInfo[@"placementId"] = ad.placementId;
            if (ad.bidder) adInfo[@"network"] = ad.bidder;
            if (ad.revenue) adInfo[@"revenue"] = @([ad.revenue doubleValue]);
            if (ad.externalPlacementId) adInfo[@"externalPlacementId"] = ad.externalPlacementId;
            
            if (adInfo.count > 0) {
                eventData[@"ad"] = adInfo;
            }
        }
        
        self.onAdLoaded(eventData);
    }
}

- (void)failToLoadWithAd:(CLXAd *)ad error:(NSError *)error {
    RCTLogError(@"[CloudXBannerView] Banner failed to load: %@", error.localizedDescription);
    if (self.onAdFailedToLoad) {
        self.onAdFailedToLoad(@{
            @"adId": self.adId ?: @"",
            @"error": error.localizedDescription ?: @"Unknown error"
        });
    }
}

- (void)didShowWithAd:(CLXAd *)ad {
    RCTLogInfo(@"[CloudXBannerView] Banner shown");
    if (self.onAdShown) {
        self.onAdShown(@{@"adId": self.adId ?: @""});
    }
}

- (void)didClickWithAd:(CLXAd *)ad {
    RCTLogInfo(@"[CloudXBannerView] Banner clicked");
    if (self.onAdClicked) {
        self.onAdClicked(@{@"adId": self.adId ?: @""});
    }
}

- (void)didHideWithAd:(CLXAd *)ad {
    RCTLogInfo(@"[CloudXBannerView] Banner hidden");
    if (self.onAdHidden) {
        self.onAdHidden(@{@"adId": self.adId ?: @""});
    }
}

// Optional delegate methods
- (void)impressionOn:(CLXAd *)ad {
    RCTLogInfo(@"[CloudXBannerView] Banner impression");
}

- (void)revenuePaid:(CLXAd *)ad {
    RCTLogInfo(@"[CloudXBannerView] Banner revenue paid: %@", ad.revenue);
}

- (void)closedByUserActionWithAd:(CLXAd *)ad {
    RCTLogInfo(@"[CloudXBannerView] Banner closed by user");
}

- (void)didExpandAd:(CLXAd *)ad {
    RCTLogInfo(@"[CloudXBannerView] Banner expanded");
}

- (void)didCollapseAd:(CLXAd *)ad {
    RCTLogInfo(@"[CloudXBannerView] Banner collapsed");
}

@end
