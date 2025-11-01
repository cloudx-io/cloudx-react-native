//
// NSError+CloudXDemo.m
// cloudx-react-native
//
// Category for providing detailed, user-friendly error descriptions in the demo app
//

#import "NSError+CloudXDemo.h"

@implementation NSError (CloudXDemo)

- (NSString *)detailedDemoDescription {
    if (!self) {
        return @"Unknown error occurred";
    }
    
    NSMutableString *description = [NSMutableString string];
    
    // Main error description
    [description appendFormat:@"%@\n\n", self.localizedDescription];
    
    // Error details
    [description appendString:@"Technical Details:\n"];
    [description appendFormat:@"Meta Error Code: %ld\n", (long)self.code];
    [description appendFormat:@"Domain: %@", self.domain];
    
    // Add additional helpful info from userInfo
    NSDictionary *userInfo = self.userInfo;
    
    // Failure reason if available
    NSString *failureReason = userInfo[NSLocalizedFailureReasonErrorKey];
    if (failureReason.length > 0) {
        [description appendFormat:@"\n\nReason: %@", failureReason];
    }
    
    // Recovery suggestion if available
    NSString *recoverySuggestion = userInfo[NSLocalizedRecoverySuggestionErrorKey];
    if (recoverySuggestion.length > 0) {
        [description appendFormat:@"\n\nSuggested Action:\n%@", recoverySuggestion];
    }
    
    return [description copy];
}

@end

