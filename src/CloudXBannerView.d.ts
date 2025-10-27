import { ViewStyle } from 'react-native';
import { CloudXAdEvent } from './index';

export interface CloudXBannerViewProps {
  /**
   * Ad placement ID
   */
  placement: string;
  
  /**
   * Unique ad instance ID
   */
  adId: string;
  
  /**
   * Banner size - 'BANNER' (320x50) or 'MREC' (300x250)
   * @default 'BANNER'
   */
  bannerSize?: 'BANNER' | 'MREC';
  
  /**
   * Called when ad loads successfully
   */
  onAdLoaded?: (event: CloudXAdEvent) => void;
  
  /**
   * Called when ad fails to load
   */
  onAdFailedToLoad?: (event: CloudXAdEvent) => void;
  
  /**
   * Called when ad is shown
   */
  onAdShown?: (event: CloudXAdEvent) => void;
  
  /**
   * Called when ad is clicked
   */
  onAdClicked?: (event: CloudXAdEvent) => void;
  
  /**
   * Called when ad is hidden
   */
  onAdHidden?: (event: CloudXAdEvent) => void;
  
  /**
   * View style
   */
  style?: ViewStyle;
}

/**
 * Native banner/MREC ad component
 * 
 * Automatically creates, loads, and displays banner or MREC ads.
 * Uses CloudXCore's CLXBannerAdView under the hood.
 * 
 * @example
 * ```tsx
 * <CloudXBannerView
 *   placement="banner-placement-1"
 *   adId="banner-1"
 *   bannerSize="BANNER"
 *   onAdLoaded={(event) => console.log('Banner loaded', event)}
 *   onAdFailedToLoad={(event) => console.error('Banner failed', event)}
 *   style={{ width: 320, height: 50 }}
 * />
 * ```
 */
export declare const CloudXBannerView: React.FC<CloudXBannerViewProps>;

export default CloudXBannerView;

