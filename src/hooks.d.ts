/**
 * Type definitions for CloudX React Hooks
 */

export interface CloudXInterstitialHook {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  load: () => Promise<void>;
  show: () => Promise<void>;
  destroy: () => Promise<void>;
}

export interface CloudXRewardedHook {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  rewardEarned: boolean;
  load: () => Promise<void>;
  show: () => Promise<void>;
  destroy: () => Promise<void>;
}

export interface CloudXBannerHook {
  isLoaded: boolean;
  isLoading: boolean;
  isVisible: boolean;
  error: string | null;
  load: () => Promise<void>;
  show: () => Promise<void>;
  hide: () => Promise<void>;
  destroy: () => Promise<void>;
}

export interface CloudXBannerHookOptions {
  autoLoad?: boolean;
  autoRefresh?: boolean;
}

/**
 * React Hook for managing interstitial ads
 * 
 * @param placement - The ad placement ID
 * @param adId - Unique identifier for this ad instance
 * @returns Interstitial ad state and controls
 * 
 * @example
 * ```typescript
 * const { isLoaded, isLoading, load, show, destroy, error } = useCloudXInterstitial('home_screen', 'interstitial_1');
 * 
 * useEffect(() => {
 *   load();
 * }, [load]);
 * 
 * const handleShowAd = async () => {
 *   if (isLoaded) {
 *     await show();
 *   }
 * };
 * ```
 */
export function useCloudXInterstitial(
  placement: string,
  adId: string
): CloudXInterstitialHook;

/**
 * React Hook for managing rewarded ads
 * 
 * @param placement - The ad placement ID
 * @param adId - Unique identifier for this ad instance
 * @returns Rewarded ad state and controls
 * 
 * @example
 * ```typescript
 * const { isLoaded, isLoading, load, show, rewardEarned } = useCloudXRewarded('rewarded_video', 'rewarded_1');
 * 
 * useEffect(() => {
 *   if (rewardEarned) {
 *     console.log('User earned reward!');
 *     grantReward();
 *   }
 * }, [rewardEarned]);
 * ```
 */
export function useCloudXRewarded(
  placement: string,
  adId: string
): CloudXRewardedHook;

/**
 * React Hook for managing banner ads
 * 
 * @param placement - The ad placement ID
 * @param adId - Unique identifier for this ad instance
 * @param options - Banner options (autoLoad, autoRefresh)
 * @returns Banner ad state and controls
 * 
 * @example
 * ```typescript
 * const { isLoaded, isVisible, load, show, hide } = useCloudXBanner(
 *   'banner_home',
 *   'banner_1',
 *   { autoLoad: true, autoRefresh: false }
 * );
 * ```
 */
export function useCloudXBanner(
  placement: string,
  adId: string,
  options?: CloudXBannerHookOptions
): CloudXBannerHook;

