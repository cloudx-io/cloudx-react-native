//
//  RNCloudXBannerView.m
//  cloudx-react-native
//

#import "RNCloudXBannerView.h"
#import "NSError+CloudXDemo.h"
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

- (void)setShouldLoad:(BOOL)shouldLoad {
    _shouldLoad = shouldLoad;
}

- (void)didSetProps:(NSArray<NSString *> *)changedProps {
    // This is called AFTER all props are set in the update cycle
    // Check if we should create and load the ad now that all props are available
    if (self.shouldLoad && !self.hasCreatedAd && self.placement && self.adId) {
        [self createAndLoadBanner];
    }
}

- (void)createAndLoadBanner {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (self.hasCreatedAd) {
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
    
    // Send event to React Native
    if (self.onAdFailedToLoad) {
        self.onAdFailedToLoad(@{
            @"adId": self.adId ?: @"",
            @"error": error.localizedDescription ?: @"Unknown error"
        });
    }
    
    // Show alert dialog like Objective-C demo app
    dispatch_async(dispatch_get_main_queue(), ^{
        NSString *errorMessage = error ? [error detailedDemoDescription] : @"Unknown error occurred";
        NSString *adType = [self.bannerSize isEqualToString:@"MREC"] ? @"MREC" : @"Banner";
        [self showAlertWithTitle:[NSString stringWithFormat:@"%@ Ad Load Failed", adType] message:errorMessage];
    });
}

- (void)didShowWithAd:(CLXAd *)ad {
    RCTLogInfo(@"[CloudXBannerView] Banner shown");
    if (self.onAdShown) {
        self.onAdShown(@{@"adId": self.adId ?: @""});
    }
}

- (void)failToShowWithAd:(CLXAd *)ad error:(NSError *)error {
    RCTLogError(@"[CloudXBannerView] Banner failed to show: %@", error.localizedDescription);
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


- (void)didExpandAd:(CLXAd *)ad {
    RCTLogInfo(@"[CloudXBannerView] Banner expanded");
}

- (void)didCollapseAd:(CLXAd *)ad {
    RCTLogInfo(@"[CloudXBannerView] Banner collapsed");
}

#pragma mark - Alert Helper

- (void)showAlertWithTitle:(NSString *)title message:(NSString *)message {
    UIViewController *viewController = [self reactViewController];
    if (!viewController) {
        RCTLogError(@"[CloudXBannerView] Cannot show alert - no view controller");
        return;
    }
    
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:title
                                                                   message:message
                                                            preferredStyle:UIAlertControllerStyleAlert];
    
    [alert addAction:[UIAlertAction actionWithTitle:@"OK"
                                              style:UIAlertActionStyleDefault
                                            handler:nil]];
    
    [viewController presentViewController:alert animated:YES completion:nil];
}

@end
