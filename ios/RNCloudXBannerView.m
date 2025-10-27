//
//  RNCloudXBannerView.m
//  react-native-cloudx-sdk
//

#import "RNCloudXBannerView.h"
#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#import <React/UIView+React.h>

@implementation RNCloudXBannerView

- (instancetype)init {
    if (self = [super init]) {
        self.backgroundColor = [UIColor clearColor];
    }
    return self;
}

- (void)setPlacement:(NSString *)placement {
    if (![_placement isEqualToString:placement]) {
        _placement = placement;
        [self loadAd];
    }
}

- (void)setBannerSize:(NSString *)bannerSize {
    _bannerSize = bannerSize;
    // Update size if needed
    [self updateBannerSize];
}

- (void)updateBannerSize {
    // Map string sizes to actual dimensions
    CGSize size = CGSizeMake(320, 50); // Default banner

    if ([self.bannerSize isEqualToString:@"BANNER"]) {
        size = CGSizeMake(320, 50);
    } else if ([self.bannerSize isEqualToString:@"MREC"]) {
        size = CGSizeMake(300, 250);
    } else if ([self.bannerSize isEqualToString:@"LEADERBOARD"]) {
        size = CGSizeMake(728, 90);
    }

    // Update frame
    CGRect frame = self.frame;
    frame.size = size;
    self.frame = frame;
}

- (void)loadAd {
    if (!self.placement || self.placement.length == 0) {
        RCTLogWarn(@"CloudX Banner: No placement set");
        return;
    }

    if (![[CloudXCore shared] isInitialized]) {
        RCTLogWarn(@"CloudX SDK not initialized");
        if (self.onAdFailedToLoad) {
            self.onAdFailedToLoad(@{
                @"error": @"SDK not initialized"
            });
        }
        return;
    }

    dispatch_async(dispatch_get_main_queue(), ^{
        [self destroy]; // Clean up any existing banner

        // Get the view controller
        UIViewController *viewController = RCTPresentedViewController();

        // Determine banner type
        CLXBannerType bannerType = CLXBannerTypeStandardBanner;
        if ([self.bannerSize isEqualToString:@"MREC"]) {
            bannerType = CLXBannerTypeMREC;
        }

        // Create the banner based on type
        if (bannerType == CLXBannerTypeMREC) {
            self.banner = [[CloudXCore shared] createMRECWithPlacement:self.placement
                                                       viewController:viewController
                                                             delegate:self];
        } else {
            self.banner = [[CloudXCore shared] createBannerWithPlacement:self.placement
                                                          viewController:viewController
                                                                 delegate:self];
        }

        if (self.banner) {
            // Add the banner view
            UIView *bannerView = [self.banner getView];
            if (bannerView) {
                [self addSubview:bannerView];

                // Set up constraints
                bannerView.translatesAutoresizingMaskIntoConstraints = NO;
                [NSLayoutConstraint activateConstraints:@[
                    [bannerView.topAnchor constraintEqualToAnchor:self.topAnchor],
                    [bannerView.leadingAnchor constraintEqualToAnchor:self.leadingAnchor],
                    [bannerView.trailingAnchor constraintEqualToAnchor:self.trailingAnchor],
                    [bannerView.bottomAnchor constraintEqualToAnchor:self.bottomAnchor]
                ]];

                // Load the ad
                [self.banner load];
            }
        } else {
            RCTLogError(@"Failed to create CloudX banner");
            if (self.onAdFailedToLoad) {
                self.onAdFailedToLoad(@{
                    @"error": @"Failed to create banner"
                });
            }
        }
    });
}

- (void)destroy {
    if (self.banner) {
        [self.banner destroy];
        self.banner = nil;

        // Remove all subviews
        for (UIView *subview in self.subviews) {
            [subview removeFromSuperview];
        }
    }
}

- (void)dealloc {
    [self destroy];
}

#pragma mark - CLXBannerDelegate

- (void)bannerDidLoad:(id<CLXBanner>)banner {
    RCTLogInfo(@"CloudX Banner loaded");
    if (self.onAdLoaded) {
        self.onAdLoaded(@{@"placement": self.placement ?: @""});
    }
}

- (void)banner:(id<CLXBanner>)banner didFailToLoadWithError:(NSError *)error {
    RCTLogError(@"CloudX Banner failed to load: %@", error.localizedDescription);
    if (self.onAdFailedToLoad) {
        self.onAdFailedToLoad(@{
            @"placement": self.placement ?: @"",
            @"error": error.localizedDescription ?: @""
        });
    }
}

- (void)bannerWasClicked:(id<CLXBanner>)banner {
    RCTLogInfo(@"CloudX Banner clicked");
    if (self.onAdClicked) {
        self.onAdClicked(@{@"placement": self.placement ?: @""});
    }
}

- (void)bannerWillPresentScreen:(id<CLXBanner>)banner {
    if (self.onAdOpened) {
        self.onAdOpened(@{@"placement": self.placement ?: @""});
    }
}

- (void)bannerDidDismissScreen:(id<CLXBanner>)banner {
    if (self.onAdClosed) {
        self.onAdClosed(@{@"placement": self.placement ?: @""});
    }
}

@end

@implementation RNCloudXBannerViewManager

RCT_EXPORT_MODULE(CloudXBannerView)

- (UIView *)view {
    return [[RNCloudXBannerView alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(placement, NSString)
RCT_EXPORT_VIEW_PROPERTY(bannerSize, NSString)
RCT_EXPORT_VIEW_PROPERTY(onAdLoaded, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdFailedToLoad, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdClicked, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdOpened, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdClosed, RCTBubblingEventBlock)

RCT_EXPORT_METHOD(loadAd:(nonnull NSNumber *)reactTag) {
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        RNCloudXBannerView *view = (RNCloudXBannerView *)viewRegistry[reactTag];
        if ([view isKindOfClass:[RNCloudXBannerView class]]) {
            [view loadAd];
        }
    }];
}

RCT_EXPORT_METHOD(destroy:(nonnull NSNumber *)reactTag) {
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        RNCloudXBannerView *view = (RNCloudXBannerView *)viewRegistry[reactTag];
        if ([view isKindOfClass:[RNCloudXBannerView class]]) {
            [view destroy];
        }
    }];
}

@end