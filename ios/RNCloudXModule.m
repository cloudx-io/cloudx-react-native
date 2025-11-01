//
//  RNCloudXModule.m
//  react-native-cloudx-sdk
//

#import "RNCloudXModule.h"
#import <React/RCTLog.h>
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>
#import <CloudXCore/CLXLogger.h>

@interface RNCloudXModule ()
@property (nonatomic, strong) CLXLogger *logger;
@end

@implementation RNCloudXModule

RCT_EXPORT_MODULE(CloudXSDK);

- (instancetype)init {
    if (self = [super init]) {
        self.logger = [[CLXLogger alloc] initWithCategory:@"CloudX-ReactNative"];
        [self.logger info:@"RNCloudXModule initialized"];
        
        self.interstitials = [NSMutableDictionary new];
        self.rewardeds = [NSMutableDictionary new];
        self.banners = [NSMutableDictionary new];
        self.adInstanceToAdId = [NSMapTable mapTableWithKeyOptions:NSPointerFunctionsWeakMemory
                                                   valueOptions:NSPointerFunctionsStrongMemory];
    }
    return self;
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[
        // Banner events
        @"onBannerLoaded",
        @"onBannerFailedToLoad",
        @"onBannerShown",
        @"onBannerFailedToShow",
        @"onBannerHidden",
        @"onBannerClicked",
        @"onBannerImpression",
        @"onBannerRevenuePaid",
        // Interstitial events
        @"onInterstitialLoaded",
        @"onInterstitialFailedToLoad",
        @"onInterstitialShown",
        @"onInterstitialFailedToShow",
        @"onInterstitialClosed",
        @"onInterstitialClicked",
        @"onInterstitialImpression",
        @"onInterstitialRevenuePaid",
        // Rewarded events
        @"onRewardedLoaded",
        @"onRewardedFailedToLoad",
        @"onRewardedShown",
        @"onRewardedFailedToShow",
        @"onRewardedClosed",
        @"onRewardedClicked",
        @"onRewardedImpression",
        @"onRewardedRevenuePaid",
        @"onRewardEarned"
    ];
}

#pragma mark - SDK Initialization

RCT_EXPORT_METHOD(initSDK:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        NSString *appKey = config[@"appKey"];
        NSString *hashedUserID = config[@"hashedUserID"];
        
        [self.logger info:[NSString stringWithFormat:@"initSDK called with appKey: %@, hashedUserID: %@", appKey, hashedUserID ?: @"(none)"]];
        
        if (!appKey) {
            [self.logger error:@"initSDK failed: appKey is required"];
            reject(@"INVALID_PARAMS", @"appKey is required", nil);
            return;
        }
        
        if (hashedUserID) {
            [self.logger debug:[NSString stringWithFormat:@"Setting hashedUserID: %@", hashedUserID]];
            [[CloudXCore shared] setHashedUserID:hashedUserID];
        }
        
        [self.logger info:@"Calling CloudXCore initializeSDKWithAppKey..."];
        [[CloudXCore shared] initializeSDKWithAppKey:appKey completion:^(BOOL success, NSError * _Nullable error) {
            if (success) {
                [self.logger info:@"✅ CloudX SDK initialized successfully"];
                RCTLogInfo(@"CloudX SDK initialized successfully");
                resolve(@{
                    @"success": @YES,
                    @"message": @"SDK initialized successfully"
                });
            } else {
                [self.logger error:[NSString stringWithFormat:@"❌ CloudX SDK initialization failed: %@", error.localizedDescription]];
                RCTLogError(@"CloudX SDK initialization failed: %@", error.localizedDescription);
                reject(@"INIT_FAILED",
                       error.localizedDescription ?: @"SDK initialization failed",
                       error);
            }
        }];
    });
}

RCT_EXPORT_METHOD(getVersion:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *version = [[CloudXCore shared] sdkVersion];
    resolve(version ?: @"Unknown");
}

RCT_EXPORT_METHOD(setLoggingEnabled:(BOOL)enabled) {
    [CloudXCore setLoggingEnabled:enabled];
}

RCT_EXPORT_METHOD(setEnvironment:(NSString *)environment) {
    // Environment setting is no longer supported in CloudXCore
    // This method is kept for backwards compatibility but does nothing
}

#pragma mark - Privacy Methods

// CCPA
RCT_EXPORT_METHOD(setCCPAPrivacyString:(NSString *)ccpaString) {
    [CloudXCore setCCPAPrivacyString:ccpaString];
}

RCT_EXPORT_METHOD(getCCPAPrivacyString:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    // CloudXCore doesn't provide a getter for CCPA privacy string
    resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setIsDoNotSell:(BOOL)doNotSell) {
    [CloudXCore setIsDoNotSell:doNotSell];
}

// GDPR
RCT_EXPORT_METHOD(setIsUserConsent:(BOOL)hasConsent) {
    [CloudXCore setIsUserConsent:hasConsent];
}

RCT_EXPORT_METHOD(getIsUserConsent:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    // CloudXCore doesn't provide a getter for user consent
    resolve(@(NO));
}

// COPPA
RCT_EXPORT_METHOD(setIsAgeRestrictedUser:(BOOL)isAgeRestricted) {
    [CloudXCore setIsAgeRestrictedUser:isAgeRestricted];
}

RCT_EXPORT_METHOD(getIsAgeRestrictedUser:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    // CloudXCore doesn't provide a getter for age restricted status
    resolve(@(NO));
}

// Legacy methods (deprecated but kept for backwards compatibility)
RCT_EXPORT_METHOD(setPrivacyConsent:(BOOL)consent) {
    [CloudXCore setIsUserConsent:consent];
}

RCT_EXPORT_METHOD(setDoNotSell:(BOOL)doNotSell) {
    [CloudXCore setIsDoNotSell:doNotSell];
}

RCT_EXPORT_METHOD(setCOPPAApplies:(BOOL)coppaApplies) {
    [CloudXCore setIsAgeRestrictedUser:coppaApplies];
}

RCT_EXPORT_METHOD(setGDPRApplies:(BOOL)gdprApplies) {
    [CloudXCore setIsUserConsent:gdprApplies];
}

#pragma mark - User Targeting Methods

// User ID
RCT_EXPORT_METHOD(setHashedUserID:(NSString *)hashedUserID) {
    [[CloudXCore shared] setHashedUserID:hashedUserID];
}

RCT_EXPORT_METHOD(setUserID:(NSString *)userID) {
    // setUserID is no longer supported - use setHashedUserID instead
    // This method is kept for backwards compatibility but does nothing
}

// Generic key-value targeting
RCT_EXPORT_METHOD(setTargetingKeyValue:(NSString *)key
                  value:(NSString *)value) {
    [[CloudXCore shared] setHashedKeyValue:key value:value];
}

RCT_EXPORT_METHOD(setTargetingKeyValues:(NSDictionary *)keyValues) {
    [[CloudXCore shared] setKeyValueDictionary:keyValues];
}

// User-level targeting (privacy-sensitive)
RCT_EXPORT_METHOD(setUserKeyValue:(NSString *)key
                  value:(NSString *)value) {
    [[CloudXCore shared] setUserKeyValue:key value:value];
}

// App-level targeting (persistent)
RCT_EXPORT_METHOD(setAppKeyValue:(NSString *)key
                  value:(NSString *)value) {
    [[CloudXCore shared] setAppKeyValue:key value:value];
}

// Bidder-specific targeting
RCT_EXPORT_METHOD(setBidderKeyValue:(NSString *)bidder
                  key:(NSString *)key
                  value:(NSString *)value) {
    [[CloudXCore shared] setBidderKeyValue:bidder key:key value:value];
}

// Clear all targeting
RCT_EXPORT_METHOD(clearAllTargeting) {
    [[CloudXCore shared] clearAllKeyValues];
}

#pragma mark - Banner Methods

RCT_EXPORT_METHOD(createBanner:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        NSString *placement = config[@"placement"];
        NSString *adId = config[@"adId"];
        
        if (!placement || !adId) {
            reject(@"INVALID_PARAMS", @"placement and adId are required", nil);
            return;
        }

        UIViewController *viewController = RCTPresentedViewController();
        if (!viewController) {
            reject(@"NO_VIEW_CONTROLLER", @"No view controller available", nil);
            return;
        }

        [self.logger info:[NSString stringWithFormat:@"Creating banner - adId: %@, placement: %@", adId, placement]];
        
        CLXBannerAdView *banner = [[CloudXCore shared] createBannerWithPlacement:placement
                                                                  viewController:viewController
                                                                        delegate:self
                                                                            tmax:nil];
        if (banner) {
            self.banners[adId] = banner;
            [self.adInstanceToAdId setObject:adId forKey:banner];
            [self.logger info:[NSString stringWithFormat:@"✅ Banner created successfully - adId: %@", adId]];
            resolve(@{@"success": @YES, @"adId": adId});
        } else {
            [self.logger error:[NSString stringWithFormat:@"❌ Failed to create banner - adId: %@, placement: %@", adId, placement]];
            reject(@"CREATE_FAILED", @"Failed to create banner", nil);
        }
    });
}

RCT_EXPORT_METHOD(loadBanner:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        NSString *adId = config[@"adId"];
        CLXBannerAdView *banner = self.banners[adId];
        if (!banner) {
            reject(@"NOT_FOUND", @"Banner not found. Create it first.", nil);
            return;
        }

        [banner load];
        resolve(@{@"success": @YES});
    });
}

RCT_EXPORT_METHOD(showBanner:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        NSString *adId = config[@"adId"];
        CLXBannerAdView *banner = self.banners[adId];
        if (!banner) {
            reject(@"NOT_FOUND", @"Banner not found", nil);
            return;
        }

        banner.hidden = NO;
        resolve(@{@"success": @YES});
    });
}

RCT_EXPORT_METHOD(hideBanner:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        NSString *adId = config[@"adId"];
        CLXBannerAdView *banner = self.banners[adId];
        if (!banner) {
            reject(@"NOT_FOUND", @"Banner not found", nil);
            return;
        }

        banner.hidden = YES;
        resolve(@{@"success": @YES});
    });
}

RCT_EXPORT_METHOD(startAutoRefresh:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        NSString *adId = config[@"adId"];
        CLXBannerAdView *banner = self.banners[adId];
        if (!banner) {
            reject(@"NOT_FOUND", @"Banner not found", nil);
            return;
        }

        [banner startAutoRefresh];
        resolve(@{@"success": @YES});
    });
}

RCT_EXPORT_METHOD(stopAutoRefresh:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        NSString *adId = config[@"adId"];
        CLXBannerAdView *banner = self.banners[adId];
        if (!banner) {
            reject(@"NOT_FOUND", @"Banner not found", nil);
            return;
        }

        [banner stopAutoRefresh];
        resolve(@{@"success": @YES});
    });
}

#pragma mark - Interstitial Methods

RCT_EXPORT_METHOD(createInterstitial:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        NSString *placement = config[@"placement"];
        NSString *adId = config[@"adId"];
        
        if (!placement || !adId) {
            reject(@"INVALID_PARAMS", @"placement and adId are required", nil);
            return;
        }

        [self.logger info:[NSString stringWithFormat:@"Creating interstitial - adId: %@, placement: %@", adId, placement]];
        
        CLXInterstitial *interstitial = [[CloudXCore shared] createInterstitialWithPlacement:placement
                                                                                   delegate:self];
        if (interstitial) {
            self.interstitials[adId] = interstitial;
            [self.adInstanceToAdId setObject:adId forKey:interstitial];
            [self.logger info:[NSString stringWithFormat:@"✅ Interstitial created successfully - adId: %@", adId]];
            resolve(@{@"success": @YES, @"adId": adId});
        } else {
            [self.logger error:[NSString stringWithFormat:@"❌ Failed to create interstitial - adId: %@, placement: %@", adId, placement]];
            reject(@"CREATE_FAILED", @"Failed to create interstitial", nil);
        }
    });
}

RCT_EXPORT_METHOD(loadInterstitial:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        NSString *adId = config[@"adId"];
        CLXInterstitial *interstitial = self.interstitials[adId];
        if (!interstitial) {
            reject(@"NOT_FOUND", @"Interstitial not found. Create it first.", nil);
            return;
        }

        [interstitial load];
        resolve(@{@"success": @YES});
    });
}

RCT_EXPORT_METHOD(showInterstitial:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        NSString *adId = config[@"adId"];
        CLXInterstitial *interstitial = self.interstitials[adId];
        if (!interstitial) {
            reject(@"NOT_FOUND", @"Interstitial not found. Create it first.", nil);
            return;
        }

        if (![interstitial isReady]) {
            reject(@"NOT_READY", @"Interstitial not ready to show", nil);
            return;
        }

        UIViewController *rootViewController = RCTPresentedViewController();
        [interstitial showFromViewController:rootViewController];
        resolve(@{@"success": @YES});
    });
}

RCT_EXPORT_METHOD(isInterstitialReady:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *adId = config[@"adId"];
    CLXInterstitial *interstitial = self.interstitials[adId];
    BOOL ready = interstitial ? [interstitial isReady] : NO;
    resolve(@(ready));
}

#pragma mark - Rewarded Methods

RCT_EXPORT_METHOD(createRewarded:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        NSString *placement = config[@"placement"];
        NSString *adId = config[@"adId"];
        
        if (!placement || !adId) {
            reject(@"INVALID_PARAMS", @"placement and adId are required", nil);
            return;
        }

        [self.logger info:[NSString stringWithFormat:@"Creating rewarded - adId: %@, placement: %@", adId, placement]];
        
        CLXRewarded *rewarded = [[CloudXCore shared] createRewardedWithPlacement:placement
                                                                     delegate:self];
        if (rewarded) {
            self.rewardeds[adId] = rewarded;
            [self.adInstanceToAdId setObject:adId forKey:rewarded];
            [self.logger info:[NSString stringWithFormat:@"✅ Rewarded created successfully - adId: %@", adId]];
            resolve(@{@"success": @YES, @"adId": adId});
        } else {
            [self.logger error:[NSString stringWithFormat:@"❌ Failed to create rewarded - adId: %@, placement: %@", adId, placement]];
            reject(@"CREATE_FAILED", @"Failed to create rewarded", nil);
        }
    });
}

RCT_EXPORT_METHOD(loadRewarded:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        NSString *adId = config[@"adId"];
        CLXRewarded *rewarded = self.rewardeds[adId];
        if (!rewarded) {
            reject(@"NOT_FOUND", @"Rewarded not found. Create it first.", nil);
            return;
        }

        [rewarded load];
        resolve(@{@"success": @YES});
    });
}

RCT_EXPORT_METHOD(showRewarded:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        NSString *adId = config[@"adId"];
        CLXRewarded *rewarded = self.rewardeds[adId];
        if (!rewarded) {
            reject(@"NOT_FOUND", @"Rewarded not found. Create it first.", nil);
            return;
        }

        if (![rewarded isReady]) {
            reject(@"NOT_READY", @"Rewarded not ready to show", nil);
            return;
        }

        UIViewController *rootViewController = RCTPresentedViewController();
        [rewarded showFromViewController:rootViewController];
        resolve(@{@"success": @YES});
    });
}

RCT_EXPORT_METHOD(isRewardedReady:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *adId = config[@"adId"];
    CLXRewarded *rewarded = self.rewardeds[adId];
    BOOL ready = rewarded ? [rewarded isReady] : NO;
    resolve(@(ready));
}

#pragma mark - Generic Ad Methods

RCT_EXPORT_METHOD(destroyAd:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        NSString *adId = config[@"adId"];
        if (!adId) {
            reject(@"INVALID_PARAMS", @"adId is required", nil);
            return;
        }

        // Try to find and destroy in all ad type dictionaries
        BOOL found = NO;
        
        if (self.banners[adId]) {
            CLXBannerAdView *banner = self.banners[adId];
            [banner stopAutoRefresh];
            [banner destroy];
            [self.banners removeObjectForKey:adId];
            found = YES;
        }
        
        if (self.interstitials[adId]) {
            [self.interstitials removeObjectForKey:adId];
            found = YES;
        }
        
        if (self.rewardeds[adId]) {
            [self.rewardeds removeObjectForKey:adId];
            found = YES;
        }

        if (found) {
            resolve(@{@"success": @YES});
        } else {
            reject(@"NOT_FOUND", @"Ad not found", nil);
        }
    });
}

#pragma mark - CLXAdDelegate (Common for Banner, Interstitial, Rewarded)

- (void)didLoadWithAd:(CLXAd *)ad {
    [self.logger debug:[NSString stringWithFormat:@"didLoadWithAd - placementId: %@", ad.placementId]];
    
    // Try to find which type of ad this is
    NSString *adId = [self findAdIdForCLXAd:ad inDictionary:self.banners];
    if (adId) {
        [self.logger info:[NSString stringWithFormat:@"✅ Banner loaded - adId: %@, placement: %@", adId, ad.placementId]];
        [self sendEventWithName:@"onBannerLoaded" body:[self adDataFromCLXAd:ad withAdId:adId]];
        return;
    }
    
    adId = [self findAdIdForCLXAd:ad inDictionary:self.interstitials];
    if (adId) {
        [self.logger info:[NSString stringWithFormat:@"✅ Interstitial loaded - adId: %@, placement: %@", adId, ad.placementId]];
        [self sendEventWithName:@"onInterstitialLoaded" body:[self adDataFromCLXAd:ad withAdId:adId]];
        return;
    }
    
    adId = [self findAdIdForCLXAd:ad inDictionary:self.rewardeds];
    if (adId) {
        [self.logger info:[NSString stringWithFormat:@"✅ Rewarded loaded - adId: %@, placement: %@", adId, ad.placementId]];
        [self sendEventWithName:@"onRewardedLoaded" body:[self adDataFromCLXAd:ad withAdId:adId]];
    }
    
    if (!adId) {
        [self.logger error:[NSString stringWithFormat:@"❌ Could not resolve adId for placement: %@", ad.placementId]];
    }
}

- (void)failToLoadWithAd:(CLXAd *)ad error:(NSError *)error {
    [self.logger debug:[NSString stringWithFormat:@"failToLoadWithAd - placementId: %@, error: %@", ad.placementId, error.localizedDescription]];
    
    NSString *adId = [self findAdIdForCLXAd:ad inDictionary:self.banners];
    if (adId) {
        [self.logger error:[NSString stringWithFormat:@"❌ Banner failed to load - adId: %@, placement: %@, error: %@", adId, ad.placementId, error.localizedDescription]];
        NSMutableDictionary *eventData = [[self adDataFromCLXAd:ad withAdId:adId] mutableCopy];
        eventData[@"error"] = error.localizedDescription ?: @"";
        [self sendEventWithName:@"onBannerFailedToLoad" body:eventData];
        return;
    }
    
    adId = [self findAdIdForCLXAd:ad inDictionary:self.interstitials];
    if (adId) {
        [self.logger error:[NSString stringWithFormat:@"❌ Interstitial failed to load - adId: %@, placement: %@, error: %@", adId, ad.placementId, error.localizedDescription]];
        NSMutableDictionary *eventData = [[self adDataFromCLXAd:ad withAdId:adId] mutableCopy];
        eventData[@"error"] = error.localizedDescription ?: @"";
        [self sendEventWithName:@"onInterstitialFailedToLoad" body:eventData];
        return;
    }
    
    adId = [self findAdIdForCLXAd:ad inDictionary:self.rewardeds];
    if (adId) {
        [self.logger error:[NSString stringWithFormat:@"❌ Rewarded failed to load - adId: %@, placement: %@, error: %@", adId, ad.placementId, error.localizedDescription]];
        NSMutableDictionary *eventData = [[self adDataFromCLXAd:ad withAdId:adId] mutableCopy];
        eventData[@"error"] = error.localizedDescription ?: @"";
        [self sendEventWithName:@"onRewardedFailedToLoad" body:eventData];
    }
    
    if (!adId) {
        [self.logger error:[NSString stringWithFormat:@"❌ Could not resolve adId for failed placement: %@", ad.placementId]];
    }
}

- (void)didShowWithAd:(CLXAd *)ad {
    NSString *adId = [self findAdIdForCLXAd:ad inDictionary:self.banners];
    if (adId) {
        [self sendEventWithName:@"onBannerShown" body:[self adDataFromCLXAd:ad withAdId:adId]];
        return;
    }
    
    adId = [self findAdIdForCLXAd:ad inDictionary:self.interstitials];
    if (adId) {
        [self sendEventWithName:@"onInterstitialShown" body:[self adDataFromCLXAd:ad withAdId:adId]];
        return;
    }
    
    adId = [self findAdIdForCLXAd:ad inDictionary:self.rewardeds];
    if (adId) {
        [self sendEventWithName:@"onRewardedShown" body:[self adDataFromCLXAd:ad withAdId:adId]];
    }
}

- (void)failToShowWithAd:(CLXAd *)ad error:(NSError *)error {
    NSString *adId = [self findAdIdForCLXAd:ad inDictionary:self.interstitials];
    if (adId) {
        NSMutableDictionary *eventData = [[self adDataFromCLXAd:ad withAdId:adId] mutableCopy];
        eventData[@"error"] = error.localizedDescription ?: @"";
        [self sendEventWithName:@"onInterstitialFailedToShow" body:eventData];
        return;
    }
    
    adId = [self findAdIdForCLXAd:ad inDictionary:self.rewardeds];
    if (adId) {
        NSMutableDictionary *eventData = [[self adDataFromCLXAd:ad withAdId:adId] mutableCopy];
        eventData[@"error"] = error.localizedDescription ?: @"";
        [self sendEventWithName:@"onRewardedFailedToShow" body:eventData];
    }
}

- (void)didHideWithAd:(CLXAd *)ad {
    NSString *adId = [self findAdIdForCLXAd:ad inDictionary:self.banners];
    if (adId) {
        [self sendEventWithName:@"onBannerHidden" body:[self adDataFromCLXAd:ad withAdId:adId]];
        return;
    }
    
    adId = [self findAdIdForCLXAd:ad inDictionary:self.interstitials];
    if (adId) {
        [self sendEventWithName:@"onInterstitialClosed" body:[self adDataFromCLXAd:ad withAdId:adId]];
        return;
    }
    
    adId = [self findAdIdForCLXAd:ad inDictionary:self.rewardeds];
    if (adId) {
        [self sendEventWithName:@"onRewardedClosed" body:[self adDataFromCLXAd:ad withAdId:adId]];
    }
}

- (void)didClickWithAd:(CLXAd *)ad {
    NSString *adId = [self findAdIdForCLXAd:ad inDictionary:self.banners];
    if (adId) {
        [self sendEventWithName:@"onBannerClicked" body:[self adDataFromCLXAd:ad withAdId:adId]];
        return;
    }
    
    adId = [self findAdIdForCLXAd:ad inDictionary:self.interstitials];
    if (adId) {
        [self sendEventWithName:@"onInterstitialClicked" body:[self adDataFromCLXAd:ad withAdId:adId]];
        return;
    }
    
    adId = [self findAdIdForCLXAd:ad inDictionary:self.rewardeds];
    if (adId) {
        [self sendEventWithName:@"onRewardedClicked" body:[self adDataFromCLXAd:ad withAdId:adId]];
    }
}

- (void)impressionOn:(CLXAd *)ad {
    NSString *adId = [self findAdIdForCLXAd:ad inDictionary:self.banners];
    if (adId) {
        [self sendEventWithName:@"onBannerImpression" body:[self adDataFromCLXAd:ad withAdId:adId]];
        return;
    }
    
    adId = [self findAdIdForCLXAd:ad inDictionary:self.interstitials];
    if (adId) {
        [self sendEventWithName:@"onInterstitialImpression" body:[self adDataFromCLXAd:ad withAdId:adId]];
        return;
    }
    
    adId = [self findAdIdForCLXAd:ad inDictionary:self.rewardeds];
    if (adId) {
        [self sendEventWithName:@"onRewardedImpression" body:[self adDataFromCLXAd:ad withAdId:adId]];
    }
}

- (void)revenuePaid:(CLXAd *)ad {
    NSString *adId = [self findAdIdForCLXAd:ad inDictionary:self.banners];
    if (adId) {
        [self sendEventWithName:@"onBannerRevenuePaid" body:[self adDataFromCLXAd:ad withAdId:adId]];
        return;
    }
    
    adId = [self findAdIdForCLXAd:ad inDictionary:self.interstitials];
    if (adId) {
        [self sendEventWithName:@"onInterstitialRevenuePaid" body:[self adDataFromCLXAd:ad withAdId:adId]];
        return;
    }
    
    adId = [self findAdIdForCLXAd:ad inDictionary:self.rewardeds];
    if (adId) {
        [self sendEventWithName:@"onRewardedRevenuePaid" body:[self adDataFromCLXAd:ad withAdId:adId]];
    }
}

#pragma mark - CLXRewardedDelegate (Rewarded-specific)

- (void)userRewarded:(CLXAd *)ad {
    NSString *adId = [self findAdIdForCLXAd:ad inDictionary:self.rewardeds];
    if (adId) {
        [self sendEventWithName:@"onRewardEarned" body:[self adDataFromCLXAd:ad withAdId:adId]];
    }
}

#pragma mark - CLXBannerDelegate (Banner-specific)

- (void)didExpandAd:(CLXAd *)ad {
    NSString *adId = [self findAdIdForCLXAd:ad inDictionary:self.banners];
    if (adId) {
        [self sendEventWithName:@"onBannerExpanded" body:[self adDataFromCLXAd:ad withAdId:adId]];
    }
}

- (void)didCollapseAd:(CLXAd *)ad {
    NSString *adId = [self findAdIdForCLXAd:ad inDictionary:self.banners];
    if (adId) {
        [self sendEventWithName:@"onBannerCollapsed" body:[self adDataFromCLXAd:ad withAdId:adId]];
    }
}

#pragma mark - Helper Methods

- (NSString *)getAdIdForBanner:(CLXBannerAdView *)banner {
    for (NSString *key in self.banners) {
        if (self.banners[key] == banner) {
            return key;
        }
    }
    return nil;
}

- (NSString *)getAdIdForInterstitial:(CLXInterstitial *)interstitial {
    for (NSString *key in self.interstitials) {
        if (self.interstitials[key] == interstitial) {
            return key;
        }
    }
    return nil;
}

- (NSString *)getAdIdForRewarded:(CLXRewarded *)rewarded {
    for (NSString *key in self.rewardeds) {
        if (self.rewardeds[key] == rewarded) {
            return key;
        }
    }
    return nil;
}

// Helper to find adId from CLXAd placement
- (NSString *)findAdIdForCLXAd:(CLXAd *)ad inDictionary:(NSDictionary *)dict {
    NSString *placementName = ad.placementName;
    if (!placementName) return nil;
    
    for (NSString *adId in dict) {
        id adInstance = dict[adId];
        NSString *storedAdId = [self.adInstanceToAdId objectForKey:adInstance];
        if ([storedAdId isEqualToString:adId]) {
            // For now, match by placement name (assumes one ad per placement)
            // TODO: Better matching if CloudXCore provides instance reference
            return adId;
        }
    }
    
    // Fallback: return any adId (for single ad case)
    return dict.allKeys.firstObject;
}

// Helper to convert CLXAd to dictionary
- (NSDictionary *)adDataFromCLXAd:(CLXAd *)ad withAdId:(NSString *)adId {
    NSMutableDictionary *adData = [NSMutableDictionary dictionaryWithDictionary:@{
        @"adId": adId ?: @""
    }];
    
    if (ad) {
        NSMutableDictionary *adInfo = [NSMutableDictionary dictionary];
        if (ad.placementName) adInfo[@"placementName"] = ad.placementName;
        if (ad.placementId) adInfo[@"placementId"] = ad.placementId;
        if (ad.bidder) adInfo[@"network"] = ad.bidder;
        if (ad.revenue) adInfo[@"revenue"] = @([ad.revenue doubleValue]);
        if (ad.externalPlacementId) adInfo[@"externalPlacementId"] = ad.externalPlacementId;
        
        if (adInfo.count > 0) {
            adData[@"ad"] = adInfo;
        }
    }
    
    return adData;
}

@end