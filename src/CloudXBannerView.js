import React from 'react';
import { requireNativeComponent, Platform, View } from 'react-native';

const NativeCloudXBannerView = Platform.OS === 'ios'
  ? requireNativeComponent('CloudXBannerView')
  : null;

export const CloudXBannerView = (props) => {
  if (Platform.OS !== 'ios') {
    console.warn('CloudXBannerView is only supported on iOS');
    return <View {...props} />;
  }

  return <NativeCloudXBannerView {...props} />;
};

export default CloudXBannerView;

