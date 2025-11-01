import React from 'react';
import { requireNativeComponent, Platform, View } from 'react-native';

const NativeCloudXBannerView = Platform.select({
  ios: requireNativeComponent('CloudXBannerView'),
  android: requireNativeComponent('CloudXBannerView'),
  default: null,
});

export const CloudXBannerView = (props) => {
  if (!NativeCloudXBannerView) {
    console.warn('CloudXBannerView is not supported on this platform');
    return <View {...props} />;
  }

  return <NativeCloudXBannerView {...props} />;
};

export default CloudXBannerView;

