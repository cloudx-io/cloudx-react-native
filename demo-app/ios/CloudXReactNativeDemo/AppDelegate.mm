#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <AppTrackingTransparency/AppTrackingTransparency.h>
#import <AdSupport/AdSupport.h>
#import <CloudXCore/CloudXCore.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSLog(@"🚀 [AppDelegate] application:didFinishLaunchingWithOptions: called");
  
  // DEMO APP ONLY: Enable VERBOSE CloudXCore logging to see EVERYTHING
  [CLXLogger setGlobalLogLevel:CLXLogLevelDebug];
  NSLog(@"📝 [AppDelegate] CloudXCore log level set to DEBUG - full bid responses will be logged");
  
  // DEMO APP ONLY: Force test mode for all bid requests
  [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"CLXCore_Internal_ForceTestMode"];
  [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"CLXMetaTestModeEnabled"];
  [[NSUserDefaults standardUserDefaults] synchronize];
  NSLog(@"🧪 [AppDelegate] Meta test mode UserDefaults set: %d", [[NSUserDefaults standardUserDefaults] boolForKey:@"CLXMetaTestModeEnabled"]);
  
  self.moduleName = @"CloudXReactNativeDemo";
  self.initialProps = @{};

  // Request ATT BEFORE calling super - React Native new arch may interfere with dispatch_after
  NSLog(@"🔔 [AppDelegate] About to request tracking permission...");
  [self requestTrackingPermission];

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
  NSLog(@"🔔 [AppDelegate] applicationDidBecomeActive called");
  // Backup: Request ATT again in case it wasn't shown yet
  [self requestTrackingPermission];
}

- (void)requestTrackingPermission
{
  if (@available(iOS 14, *)) {
    // Check current status first
    ATTrackingManagerAuthorizationStatus currentStatus = [ATTrackingManager trackingAuthorizationStatus];
    
    NSLog(@"📊 [ATT] Current tracking authorization status: %ld", (long)currentStatus);
    
    switch (currentStatus) {
      case ATTrackingManagerAuthorizationStatusNotDetermined:
        NSLog(@"🔔 [ATT] Status not determined - requesting permission...");
        [ATTrackingManager requestTrackingAuthorizationWithCompletionHandler:^(ATTrackingManagerAuthorizationStatus status) {
          switch (status) {
            case ATTrackingManagerAuthorizationStatusAuthorized:
              NSLog(@"✅ [ATT] Tracking permission GRANTED");
              break;
            case ATTrackingManagerAuthorizationStatusDenied:
              NSLog(@"❌ [ATT] Tracking permission DENIED");
              break;
            case ATTrackingManagerAuthorizationStatusRestricted:
              NSLog(@"⚠️ [ATT] Tracking permission RESTRICTED");
              break;
            case ATTrackingManagerAuthorizationStatusNotDetermined:
              NSLog(@"❓ [ATT] Tracking permission NOT DETERMINED (still)");
              break;
          }
        }];
        break;
        
      case ATTrackingManagerAuthorizationStatusAuthorized:
        NSLog(@"✅ [ATT] Already AUTHORIZED");
        break;
        
      case ATTrackingManagerAuthorizationStatusDenied:
        NSLog(@"❌ [ATT] Previously DENIED - ads may not work properly");
        NSLog(@"💡 [ATT] To fix: Delete app and reinstall, or go to Settings > Privacy > Tracking");
        break;
        
      case ATTrackingManagerAuthorizationStatusRestricted:
        NSLog(@"⚠️ [ATT] RESTRICTED by device settings");
        break;
    }
  } else {
    NSLog(@"📱 [ATT] iOS version < 14, ATT not required");
  }
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end

