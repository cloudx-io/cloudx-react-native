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
    }
    return self;
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[
        @"onInterstitialLoaded",
        @"onInterstitialFailedToLoad",
        @"onInterstitialShown",
        @"onInterstitialFailedToShow",
        @"onInterstitialClosed",
        @"onInterstitialClicked",
        @"onRewardedLoaded",
        @"onRewardedFailedToLoad",
        @"onRewardedShown",
        @"onRewardedFailedToShow",
        @"onRewardedClosed",
        @"onRewardedClicked",
        @"onRewardEarned"
    ];
}

#pragma mark - SDK Initialization

RCT_EXPORT_METHOD(initSDK:(NSString *)appKey
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
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

#pragma mark - Privacy Methods

RCT_EXPORT_METHOD(setPrivacyConsent:(BOOL)consent) {
    [[CloudXCore shared] setPrivacyConsent:consent];
}

RCT_EXPORT_METHOD(setDoNotSell:(BOOL)doNotSell) {
    [[CloudXCore shared] setDoNotSell:doNotSell];
}

RCT_EXPORT_METHOD(setCOPPAApplies:(BOOL)coppaApplies) {
    [[CloudXCore shared] setCOPPAApplies:coppaApplies];
}

RCT_EXPORT_METHOD(setGDPRApplies:(BOOL)gdprApplies) {
    [[CloudXCore shared] setGDPRApplies:gdprApplies];
}

#pragma mark - Interstitial Methods

RCT_EXPORT_METHOD(createInterstitial:(NSString *)placement
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (![[CloudXCore shared] isInitialized]) {
            reject(@"NOT_INITIALIZED", @"SDK not initialized", nil);
            return;
        }

        id<CLXInterstitial> interstitial = [[CloudXCore shared] createInterstitialWithPlacement:placement
                                                                                        delegate:self];
        if (interstitial) {
            self.interstitials[placement] = interstitial;
            resolve(@{
                @"success": @YES,
                @"placement": placement
            });
        } else {
            reject(@"CREATE_FAILED", @"Failed to create interstitial", nil);
        }
    });
}

RCT_EXPORT_METHOD(loadInterstitial:(NSString *)placement
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        id<CLXInterstitial> interstitial = self.interstitials[placement];
        if (!interstitial) {
            reject(@"NOT_FOUND", @"Interstitial not found. Create it first.", nil);
            return;
        }

        [interstitial load];
        resolve(@{@"success": @YES});
    });
}

RCT_EXPORT_METHOD(showInterstitial:(NSString *)placement
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        id<CLXInterstitial> interstitial = self.interstitials[placement];
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

RCT_EXPORT_METHOD(isInterstitialReady:(NSString *)placement
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    id<CLXInterstitial> interstitial = self.interstitials[placement];
    BOOL ready = interstitial ? [interstitial isReady] : NO;
    resolve(@(ready));
}

#pragma mark - Rewarded Methods

RCT_EXPORT_METHOD(createRewarded:(NSString *)placement
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (![[CloudXCore shared] isInitialized]) {
            reject(@"NOT_INITIALIZED", @"SDK not initialized", nil);
            return;
        }

        id<CLXRewarded> rewarded = [[CloudXCore shared] createRewardedWithPlacement:placement
                                                                            delegate:self];
        if (rewarded) {
            self.rewardeds[placement] = rewarded;
            resolve(@{
                @"success": @YES,
                @"placement": placement
            });
        } else {
            reject(@"CREATE_FAILED", @"Failed to create rewarded", nil);
        }
    });
}

RCT_EXPORT_METHOD(loadRewarded:(NSString *)placement
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        id<CLXRewarded> rewarded = self.rewardeds[placement];
        if (!rewarded) {
            reject(@"NOT_FOUND", @"Rewarded not found. Create it first.", nil);
            return;
        }

        [rewarded load];
        resolve(@{@"success": @YES});
    });
}

RCT_EXPORT_METHOD(showRewarded:(NSString *)placement
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        id<CLXRewarded> rewarded = self.rewardeds[placement];
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

#pragma mark - CLXInterstitialDelegate

- (void)interstitialDidLoad:(id<CLXInterstitial>)interstitial {
    NSString *placement = [self getPlacementForInterstitial:interstitial];
    [self sendEventWithName:@"onInterstitialLoaded" body:@{@"placement": placement ?: @""}];
}

- (void)interstitial:(id<CLXInterstitial>)interstitial didFailToLoadWithError:(NSError *)error {
    NSString *placement = [self getPlacementForInterstitial:interstitial];
    [self sendEventWithName:@"onInterstitialFailedToLoad"
                       body:@{
                           @"placement": placement ?: @"",
                           @"error": error.localizedDescription ?: @""
                       }];
}

- (void)interstitialDidShow:(id<CLXInterstitial>)interstitial {
    NSString *placement = [self getPlacementForInterstitial:interstitial];
    [self sendEventWithName:@"onInterstitialShown" body:@{@"placement": placement ?: @""}];
}

- (void)interstitial:(id<CLXInterstitial>)interstitial didFailToShowWithError:(NSError *)error {
    NSString *placement = [self getPlacementForInterstitial:interstitial];
    [self sendEventWithName:@"onInterstitialFailedToShow"
                       body:@{
                           @"placement": placement ?: @"",
                           @"error": error.localizedDescription ?: @""
                       }];
}

- (void)interstitialDidClose:(id<CLXInterstitial>)interstitial {
    NSString *placement = [self getPlacementForInterstitial:interstitial];
    [self sendEventWithName:@"onInterstitialClosed" body:@{@"placement": placement ?: @""}];
}

- (void)interstitialDidClick:(id<CLXInterstitial>)interstitial {
    NSString *placement = [self getPlacementForInterstitial:interstitial];
    [self sendEventWithName:@"onInterstitialClicked" body:@{@"placement": placement ?: @""}];
}

#pragma mark - CLXRewardedDelegate

- (void)rewardedDidLoad:(id<CLXRewarded>)rewarded {
    NSString *placement = [self getPlacementForRewarded:rewarded];
    [self sendEventWithName:@"onRewardedLoaded" body:@{@"placement": placement ?: @""}];
}

- (void)rewarded:(id<CLXRewarded>)rewarded didFailToLoadWithError:(NSError *)error {
    NSString *placement = [self getPlacementForRewarded:rewarded];
    [self sendEventWithName:@"onRewardedFailedToLoad"
                       body:@{
                           @"placement": placement ?: @"",
                           @"error": error.localizedDescription ?: @""
                       }];
}

- (void)rewardedDidShow:(id<CLXRewarded>)rewarded {
    NSString *placement = [self getPlacementForRewarded:rewarded];
    [self sendEventWithName:@"onRewardedShown" body:@{@"placement": placement ?: @""}];
}

- (void)rewarded:(id<CLXRewarded>)rewarded didFailToShowWithError:(NSError *)error {
    NSString *placement = [self getPlacementForRewarded:rewarded];
    [self sendEventWithName:@"onRewardedFailedToShow"
                       body:@{
                           @"placement": placement ?: @"",
                           @"error": error.localizedDescription ?: @""
                       }];
}

- (void)rewardedDidClose:(id<CLXRewarded>)rewarded {
    NSString *placement = [self getPlacementForRewarded:rewarded];
    [self sendEventWithName:@"onRewardedClosed" body:@{@"placement": placement ?: @""}];
}

- (void)rewardedDidClick:(id<CLXRewarded>)rewarded {
    NSString *placement = [self getPlacementForRewarded:rewarded];
    [self sendEventWithName:@"onRewardedClicked" body:@{@"placement": placement ?: @""}];
}

- (void)rewardedDidEarnReward:(id<CLXRewarded>)rewarded {
    NSString *placement = [self getPlacementForRewarded:rewarded];
    [self sendEventWithName:@"onRewardEarned" body:@{@"placement": placement ?: @""}];
}

#pragma mark - Helper Methods

- (NSString *)getPlacementForInterstitial:(id<CLXInterstitial>)interstitial {
    for (NSString *key in self.interstitials) {
        if (self.interstitials[key] == interstitial) {
            return key;
        }
    }
    return nil;
}

- (NSString *)getPlacementForRewarded:(id<CLXRewarded>)rewarded {
    for (NSString *key in self.rewardeds) {
        if (self.rewardeds[key] == rewarded) {
            return key;
        }
    }
    return nil;
}

@end