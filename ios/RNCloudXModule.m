//
//  RNCloudXModule.m
//  react-native-cloudx-sdk
//

#import "RNCloudXModule.h"
#import <React/RCTLog.h>
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>

@implementation RNCloudXModule

RCT_EXPORT_MODULE(CloudXSDK);

- (instancetype)init {
    if (self = [super init]) {
        _interstitials = [NSMutableDictionary new];
        _rewardeds = [NSMutableDictionary new];
        _banners = [NSMutableDictionary new];
        _adInstanceToAdId = [NSMapTable mapTableWithKeyOptions:NSPointerFunctionsWeakMemory
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
        
        if (!appKey) {
            reject(@"INVALID_PARAMS", @"appKey is required", nil);
            return;
        }
        
        if (hashedUserID) {
            [[CloudXCore shared] provideUserDetailsWithHashedUserID:hashedUserID];
        }
        
        [[CloudXCore shared] initSDKWithAppKey:appKey completion:^(BOOL success, NSError * _Nullable error) {
            if (success) {
                RCTLogInfo(@"CloudX SDK initialized successfully");
                resolve(@{
                    @"success": @YES,
                    @"message": @"SDK initialized successfully"
                });
            } else {
                RCTLogError(@"CloudX SDK initialization failed: %@", error.localizedDescription);
                reject(@"INIT_FAILED",
                       error.localizedDescription ?: @"SDK initialization failed",
                       error);
            }
        }];
    });
}

RCT_EXPORT_METHOD(isInitialized:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    BOOL initialized = [[CloudXCore shared] isInitialized];
    resolve(@(initialized));
}

RCT_EXPORT_METHOD(getVersion:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *version = [[CloudXCore shared] getSDKVersion];
    resolve(version ?: @"Unknown");
}

RCT_EXPORT_METHOD(setLoggingEnabled:(BOOL)enabled) {
    [[CloudXCore shared] setVerboseLogging:enabled];
}

RCT_EXPORT_METHOD(setEnvironment:(NSString *)environment) {
    [[CloudXCore shared] setEnvironment:environment];
}

#pragma mark - Privacy Methods

// CCPA
RCT_EXPORT_METHOD(setCCPAPrivacyString:(NSString *)ccpaString) {
    [[CloudXCore shared] setCCPAPrivacyString:ccpaString];
}

RCT_EXPORT_METHOD(getCCPAPrivacyString:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *ccpaString = [[CloudXCore shared] getCCPAPrivacyString];
    resolve(ccpaString ?: [NSNull null]);
}

RCT_EXPORT_METHOD(setIsDoNotSell:(BOOL)doNotSell) {
    [[CloudXCore shared] setIsDoNotSell:doNotSell];
}

// GPP (Global Privacy Platform)
RCT_EXPORT_METHOD(setGPPString:(NSString *)gppString) {
    [[CloudXCore shared] setGPPString:gppString];
}

RCT_EXPORT_METHOD(getGPPString:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *gppString = [[CloudXCore shared] getGPPString];
    resolve(gppString ?: [NSNull null]);
}

RCT_EXPORT_METHOD(setGPPSectionIds:(NSArray<NSNumber *> *)sectionIds) {
    [[CloudXCore shared] setGPPSid:sectionIds];
}

RCT_EXPORT_METHOD(getGPPSectionIds:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSArray *sectionIds = [[CloudXCore shared] getGPPSid];
    resolve(sectionIds ?: [NSNull null]);
}

// GDPR
RCT_EXPORT_METHOD(setIsUserConsent:(BOOL)hasConsent) {
    [[CloudXCore shared] setIsUserConsent:hasConsent];
}

RCT_EXPORT_METHOD(getIsUserConsent:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    BOOL hasConsent = [[CloudXCore shared] getIsUserConsent];
    resolve(@(hasConsent));
}

// COPPA
RCT_EXPORT_METHOD(setIsAgeRestrictedUser:(BOOL)isAgeRestricted) {
    [[CloudXCore shared] setIsAgeRestrictedUser:isAgeRestricted];
}

RCT_EXPORT_METHOD(getIsAgeRestrictedUser:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    BOOL isAgeRestricted = [[CloudXCore shared] getIsAgeRestrictedUser];
    resolve(@(isAgeRestricted));
}

// Legacy methods (deprecated but kept for backwards compatibility)
RCT_EXPORT_METHOD(setPrivacyConsent:(BOOL)consent) {
    [[CloudXCore shared] setIsUserConsent:consent];
}

RCT_EXPORT_METHOD(setDoNotSell:(BOOL)doNotSell) {
    [[CloudXCore shared] setIsDoNotSell:doNotSell];
}

RCT_EXPORT_METHOD(setCOPPAApplies:(BOOL)coppaApplies) {
    [[CloudXCore shared] setIsAgeRestrictedUser:coppaApplies];
}

RCT_EXPORT_METHOD(setGDPRApplies:(BOOL)gdprApplies) {
    [[CloudXCore shared] setIsUserConsent:gdprApplies];
}

#pragma mark - User Targeting Methods

// User ID
RCT_EXPORT_METHOD(setHashedUserID:(NSString *)hashedUserID) {
    [[CloudXCore shared] provideUserDetailsWithHashedUserID:hashedUserID];
}

RCT_EXPORT_METHOD(getUserID:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *userID = [[CloudXCore shared] userID];
    resolve(userID ?: [NSNull null]);
}

RCT_EXPORT_METHOD(setUserID:(NSString *)userID) {
    [[CloudXCore shared] setUserID:userID];
}

// Generic key-value targeting
RCT_EXPORT_METHOD(setTargetingKeyValue:(NSString *)key
                  value:(NSString *)value) {
    [[CloudXCore shared] useHashedKeyValue:key value:value];
}

RCT_EXPORT_METHOD(setTargetingKeyValues:(NSDictionary *)keyValues) {
    [[CloudXCore shared] useKeyValues:keyValues];
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
    [[CloudXCore shared] useBidderKeyValue:bidder key:key value:value];
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
        if (![[CloudXCore shared] isInitialized]) {
            reject(@"NOT_INITIALIZED", @"SDK not initialized", nil);
            return;
        }

        NSString *placement = config[@"placement"];
        NSString *adId = config[@"adId"];
        
        if (!placement || !adId) {
            reject(@"INVALID_PARAMS", @"placement and adId are required", nil);
            return;
        }

        CLXBannerAdView *banner = [[CloudXCore shared] createBannerWithPlacement:placement
                                                                   viewController:nil
                                                                         delegate:self
                                                                             tmax:nil];
        if (banner) {
            self.banners[adId] = banner;
            [self.adInstanceToAdId setObject:adId forKey:banner];
            resolve(@{@"success": @YES, @"adId": adId});
        } else {
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

        [banner show];
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

        [banner hide];
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
        if (![[CloudXCore shared] isInitialized]) {
            reject(@"NOT_INITIALIZED", @"SDK not initialized", nil);
            return;
        }

        NSString *placement = config[@"placement"];
        NSString *adId = config[@"adId"];
        
        if (!placement || !adId) {
            reject(@"INVALID_PARAMS", @"placement and adId are required", nil);
            return;
        }

        CLXPublisherFullscreenAd *interstitial = [[CloudXCore shared] createInterstitialWithPlacement:placement
                                                                                          delegate:self];
        if (interstitial) {
            self.interstitials[adId] = interstitial;
            [self.adInstanceToAdId setObject:adId forKey:interstitial];
            resolve(@{@"success": @YES, @"adId": adId});
        } else {
            reject(@"CREATE_FAILED", @"Failed to create interstitial", nil);
        }
    });
}

RCT_EXPORT_METHOD(loadInterstitial:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        NSString *adId = config[@"adId"];
        CLXPublisherFullscreenAd *interstitial = self.interstitials[adId];
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
        CLXPublisherFullscreenAd *interstitial = self.interstitials[adId];
        if (!interstitial) {
            reject(@"NOT_FOUND", @"Interstitial not found. Create it first.", nil);
            return;
        }

        if (![interstitial isReady]) {
            reject(@"NOT_READY", @"Interstitial not ready to show", nil);
            return;
        }

        UIViewController *rootViewController = RCTPresentedViewController();
        [interstitial showFromRootViewController:rootViewController];
        resolve(@{@"success": @YES});
    });
}

RCT_EXPORT_METHOD(isInterstitialReady:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *adId = config[@"adId"];
    CLXPublisherFullscreenAd *interstitial = self.interstitials[adId];
    BOOL ready = interstitial ? [interstitial isReady] : NO;
    resolve(@(ready));
}

#pragma mark - Rewarded Methods

RCT_EXPORT_METHOD(createRewarded:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (![[CloudXCore shared] isInitialized]) {
            reject(@"NOT_INITIALIZED", @"SDK not initialized", nil);
            return;
        }

        NSString *placement = config[@"placement"];
        NSString *adId = config[@"adId"];
        
        if (!placement || !adId) {
            reject(@"INVALID_PARAMS", @"placement and adId are required", nil);
            return;
        }

        CLXPublisherFullscreenAd *rewarded = [[CloudXCore shared] createRewardedWithPlacement:placement
                                                                                    delegate:self];
        if (rewarded) {
            self.rewardeds[adId] = rewarded;
            [self.adInstanceToAdId setObject:adId forKey:rewarded];
            resolve(@{@"success": @YES, @"adId": adId});
        } else {
            reject(@"CREATE_FAILED", @"Failed to create rewarded", nil);
        }
    });
}

RCT_EXPORT_METHOD(loadRewarded:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        NSString *adId = config[@"adId"];
        CLXPublisherFullscreenAd *rewarded = self.rewardeds[adId];
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
        CLXPublisherFullscreenAd *rewarded = self.rewardeds[adId];
        if (!rewarded) {
            reject(@"NOT_FOUND", @"Rewarded not found. Create it first.", nil);
            return;
        }

        if (![rewarded isReady]) {
            reject(@"NOT_READY", @"Rewarded not ready to show", nil);
            return;
        }

        UIViewController *rootViewController = RCTPresentedViewController();
        [rewarded showFromRootViewController:rootViewController];
        resolve(@{@"success": @YES});
    });
}

RCT_EXPORT_METHOD(isRewardedReady:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *adId = config[@"adId"];
    CLXPublisherFullscreenAd *rewarded = self.rewardeds[adId];
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
            [banner hide];
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
    // Try to find which type of ad this is
    NSString *adId = [self findAdIdForCLXAd:ad inDictionary:self.banners];
    if (adId) {
        [self sendEventWithName:@"onBannerLoaded" body:[self adDataFromCLXAd:ad withAdId:adId]];
        return;
    }
    
    adId = [self findAdIdForCLXAd:ad inDictionary:self.interstitials];
    if (adId) {
        [self sendEventWithName:@"onInterstitialLoaded" body:[self adDataFromCLXAd:ad withAdId:adId]];
        return;
    }
    
    adId = [self findAdIdForCLXAd:ad inDictionary:self.rewardeds];
    if (adId) {
        [self sendEventWithName:@"onRewardedLoaded" body:[self adDataFromCLXAd:ad withAdId:adId]];
    }
}

- (void)failToLoadWithAd:(CLXAd *)ad error:(NSError *)error {
    NSString *adId = [self findAdIdForCLXAd:ad inDictionary:self.banners];
    if (adId) {
        NSMutableDictionary *eventData = [[self adDataFromCLXAd:ad withAdId:adId] mutableCopy];
        eventData[@"error"] = error.localizedDescription ?: @"";
        [self sendEventWithName:@"onBannerFailedToLoad" body:eventData];
        return;
    }
    
    adId = [self findAdIdForCLXAd:ad inDictionary:self.interstitials];
    if (adId) {
        NSMutableDictionary *eventData = [[self adDataFromCLXAd:ad withAdId:adId] mutableCopy];
        eventData[@"error"] = error.localizedDescription ?: @"";
        [self sendEventWithName:@"onInterstitialFailedToLoad" body:eventData];
        return;
    }
    
    adId = [self findAdIdForCLXAd:ad inDictionary:self.rewardeds];
    if (adId) {
        NSMutableDictionary *eventData = [[self adDataFromCLXAd:ad withAdId:adId] mutableCopy];
        eventData[@"error"] = error.localizedDescription ?: @"";
        [self sendEventWithName:@"onRewardedFailedToLoad" body:eventData];
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

- (void)closedByUserActionWithAd:(CLXAd *)ad {
    NSString *adId = [self findAdIdForCLXAd:ad inDictionary:self.banners];
    if (adId) {
        [self sendEventWithName:@"onBannerClosedByUser" body:[self adDataFromCLXAd:ad withAdId:adId]];
        return;
    }
    
    adId = [self findAdIdForCLXAd:ad inDictionary:self.interstitials];
    if (adId) {
        [self sendEventWithName:@"onInterstitialClosedByUser" body:[self adDataFromCLXAd:ad withAdId:adId]];
        return;
    }
    
    adId = [self findAdIdForCLXAd:ad inDictionary:self.rewardeds];
    if (adId) {
        [self sendEventWithName:@"onRewardedClosedByUser" body:[self adDataFromCLXAd:ad withAdId:adId]];
    }
}

#pragma mark - CLXRewardedDelegate (Rewarded-specific)

- (void)userRewarded:(CLXAd *)ad {
    NSString *adId = [self findAdIdForCLXAd:ad inDictionary:self.rewardeds];
    if (adId) {
        [self sendEventWithName:@"onRewardEarned" body:[self adDataFromCLXAd:ad withAdId:adId]];
    }
}

- (void)rewardedVideoStarted:(CLXAd *)ad {
    NSString *adId = [self findAdIdForCLXAd:ad inDictionary:self.rewardeds];
    if (adId) {
        [self sendEventWithName:@"onRewardedVideoStarted" body:[self adDataFromCLXAd:ad withAdId:adId]];
    }
}

- (void)rewardedVideoCompleted:(CLXAd *)ad {
    NSString *adId = [self findAdIdForCLXAd:ad inDictionary:self.rewardeds];
    if (adId) {
        [self sendEventWithName:@"onRewardedVideoCompleted" body:[self adDataFromCLXAd:ad withAdId:adId]];
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

- (NSString *)getAdIdForInterstitial:(CLXPublisherFullscreenAd *)interstitial {
    for (NSString *key in self.interstitials) {
        if (self.interstitials[key] == interstitial) {
            return key;
        }
    }
    return nil;
}

- (NSString *)getAdIdForRewarded:(CLXPublisherFullscreenAd *)rewarded {
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
            return adId;
        }
    }
    
    // Fallback: For backward compatibility, return first adId if only one ad exists
    // This handles cases where ad tracking might fail but single ad per placement is used
    return dict.count == 1 ? dict.allKeys.firstObject : nil;
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