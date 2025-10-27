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

        id<CLXBanner> banner = [[CloudXCore shared] createBannerWithPlacement:placement
                                                                       delegate:self];
        if (banner) {
            self.banners[adId] = banner;
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
        id<CLXBanner> banner = self.banners[adId];
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
        id<CLXBanner> banner = self.banners[adId];
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
        id<CLXBanner> banner = self.banners[adId];
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
        id<CLXBanner> banner = self.banners[adId];
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
        id<CLXBanner> banner = self.banners[adId];
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

        id<CLXInterstitial> interstitial = [[CloudXCore shared] createInterstitialWithPlacement:placement
                                                                                        delegate:self];
        if (interstitial) {
            self.interstitials[adId] = interstitial;
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
        id<CLXInterstitial> interstitial = self.interstitials[adId];
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
        id<CLXInterstitial> interstitial = self.interstitials[adId];
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
    id<CLXInterstitial> interstitial = self.interstitials[adId];
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

        id<CLXRewarded> rewarded = [[CloudXCore shared] createRewardedWithPlacement:placement
                                                                            delegate:self];
        if (rewarded) {
            self.rewardeds[adId] = rewarded;
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
        id<CLXRewarded> rewarded = self.rewardeds[adId];
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
        id<CLXRewarded> rewarded = self.rewardeds[adId];
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
    id<CLXRewarded> rewarded = self.rewardeds[adId];
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
            id<CLXBanner> banner = self.banners[adId];
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

#pragma mark - CLXBannerDelegate

- (void)bannerDidLoad:(id<CLXBanner>)banner {
    NSString *adId = [self getAdIdForBanner:banner];
    [self sendEventWithName:@"onBannerLoaded" body:@{@"adId": adId ?: @""}];
}

- (void)banner:(id<CLXBanner>)banner didFailToLoadWithError:(NSError *)error {
    NSString *adId = [self getAdIdForBanner:banner];
    [self sendEventWithName:@"onBannerFailedToLoad"
                       body:@{
                           @"adId": adId ?: @"",
                           @"error": error.localizedDescription ?: @""
                       }];
}

- (void)bannerDidShow:(id<CLXBanner>)banner {
    NSString *adId = [self getAdIdForBanner:banner];
    [self sendEventWithName:@"onBannerShown" body:@{@"adId": adId ?: @""}];
}

- (void)bannerDidClick:(id<CLXBanner>)banner {
    NSString *adId = [self getAdIdForBanner:banner];
    [self sendEventWithName:@"onBannerClicked" body:@{@"adId": adId ?: @""}];
}

#pragma mark - CLXInterstitialDelegate

- (void)interstitialDidLoad:(id<CLXInterstitial>)interstitial {
    NSString *adId = [self getAdIdForInterstitial:interstitial];
    [self sendEventWithName:@"onInterstitialLoaded" body:@{@"adId": adId ?: @""}];
}

- (void)interstitial:(id<CLXInterstitial>)interstitial didFailToLoadWithError:(NSError *)error {
    NSString *adId = [self getAdIdForInterstitial:interstitial];
    [self sendEventWithName:@"onInterstitialFailedToLoad"
                       body:@{
                           @"adId": adId ?: @"",
                           @"error": error.localizedDescription ?: @""
                       }];
}

- (void)interstitialDidShow:(id<CLXInterstitial>)interstitial {
    NSString *adId = [self getAdIdForInterstitial:interstitial];
    [self sendEventWithName:@"onInterstitialShown" body:@{@"adId": adId ?: @""}];
}

- (void)interstitial:(id<CLXInterstitial>)interstitial didFailToShowWithError:(NSError *)error {
    NSString *adId = [self getAdIdForInterstitial:interstitial];
    [self sendEventWithName:@"onInterstitialFailedToShow"
                       body:@{
                           @"adId": adId ?: @"",
                           @"error": error.localizedDescription ?: @""
                       }];
}

- (void)interstitialDidClose:(id<CLXInterstitial>)interstitial {
    NSString *adId = [self getAdIdForInterstitial:interstitial];
    [self sendEventWithName:@"onInterstitialClosed" body:@{@"adId": adId ?: @""}];
}

- (void)interstitialDidClick:(id<CLXInterstitial>)interstitial {
    NSString *adId = [self getAdIdForInterstitial:interstitial];
    [self sendEventWithName:@"onInterstitialClicked" body:@{@"adId": adId ?: @""}];
}

#pragma mark - CLXRewardedDelegate

- (void)rewardedDidLoad:(id<CLXRewarded>)rewarded {
    NSString *adId = [self getAdIdForRewarded:rewarded];
    [self sendEventWithName:@"onRewardedLoaded" body:@{@"adId": adId ?: @""}];
}

- (void)rewarded:(id<CLXRewarded>)rewarded didFailToLoadWithError:(NSError *)error {
    NSString *adId = [self getAdIdForRewarded:rewarded];
    [self sendEventWithName:@"onRewardedFailedToLoad"
                       body:@{
                           @"adId": adId ?: @"",
                           @"error": error.localizedDescription ?: @""
                       }];
}

- (void)rewardedDidShow:(id<CLXRewarded>)rewarded {
    NSString *adId = [self getAdIdForRewarded:rewarded];
    [self sendEventWithName:@"onRewardedShown" body:@{@"adId": adId ?: @""}];
}

- (void)rewarded:(id<CLXRewarded>)rewarded didFailToShowWithError:(NSError *)error {
    NSString *adId = [self getAdIdForRewarded:rewarded];
    [self sendEventWithName:@"onRewardedFailedToShow"
                       body:@{
                           @"adId": adId ?: @"",
                           @"error": error.localizedDescription ?: @""
                       }];
}

- (void)rewardedDidClose:(id<CLXRewarded>)rewarded {
    NSString *adId = [self getAdIdForRewarded:rewarded];
    [self sendEventWithName:@"onRewardedClosed" body:@{@"adId": adId ?: @""}];
}

- (void)rewardedDidClick:(id<CLXRewarded>)rewarded {
    NSString *adId = [self getAdIdForRewarded:rewarded];
    [self sendEventWithName:@"onRewardedClicked" body:@{@"adId": adId ?: @""}];
}

- (void)rewardedDidEarnReward:(id<CLXRewarded>)rewarded {
    NSString *adId = [self getAdIdForRewarded:rewarded];
    [self sendEventWithName:@"onRewardEarned" body:@{@"adId": adId ?: @""}];
}

#pragma mark - Helper Methods

- (NSString *)getAdIdForBanner:(id<CLXBanner>)banner {
    for (NSString *key in self.banners) {
        if (self.banners[key] == banner) {
            return key;
        }
    }
    return nil;
}

- (NSString *)getAdIdForInterstitial:(id<CLXInterstitial>)interstitial {
    for (NSString *key in self.interstitials) {
        if (self.interstitials[key] == interstitial) {
            return key;
        }
    }
    return nil;
}

- (NSString *)getAdIdForRewarded:(id<CLXRewarded>)rewarded {
    for (NSString *key in self.rewardeds) {
        if (self.rewardeds[key] == rewarded) {
            return key;
        }
    }
    return nil;
}

@end