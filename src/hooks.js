/**
 * React Hooks for CloudX SDK
 * 
 * Provides modern React hooks for managing ad lifecycle and events
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { CloudXSDKManager, CloudXEventTypes } from './index';

/**
 * Hook for managing interstitial ads
 * 
 * @param {string} placement - The ad placement ID
 * @param {string} adId - Unique identifier for this ad instance
 * @returns {Object} Interstitial ad state and controls
 * 
 * @example
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
 */
export function useCloudXInterstitial(placement, adId) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const createdRef = useRef(false);

  // Create ad instance
  useEffect(() => {
    if (!createdRef.current) {
      CloudXSDKManager.createInterstitial({ placement, adId })
        .then(() => {
          createdRef.current = true;
        })
        .catch((err) => {
          setError(err.message || 'Failed to create interstitial');
        });
    }

    return () => {
      if (createdRef.current) {
        CloudXSDKManager.destroyAd({ adId }).catch(() => {});
        createdRef.current = false;
      }
    };
  }, [placement, adId]);

  // Event listeners
  useEffect(() => {
    const onLoaded = CloudXSDKManager.addEventListener(
      CloudXEventTypes.INTERSTITIAL_LOADED,
      (event) => {
        if (event.adId === adId) {
          setIsLoaded(true);
          setIsLoading(false);
          setError(null);
        }
      }
    );

    const onFailedToLoad = CloudXSDKManager.addEventListener(
      CloudXEventTypes.INTERSTITIAL_FAILED_TO_LOAD,
      (event) => {
        if (event.adId === adId) {
          setIsLoaded(false);
          setIsLoading(false);
          setError(event.error || 'Failed to load');
        }
      }
    );

    const onClosed = CloudXSDKManager.addEventListener(
      CloudXEventTypes.INTERSTITIAL_CLOSED,
      (event) => {
        if (event.adId === adId) {
          setIsLoaded(false);
        }
      }
    );

    return () => {
      onLoaded.remove();
      onFailedToLoad.remove();
      onClosed.remove();
    };
  }, [adId]);

  const load = useCallback(async () => {
    if (!createdRef.current) {
      setError('Ad not created yet');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await CloudXSDKManager.loadInterstitial({ adId });
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Failed to load');
      throw err;
    }
  }, [adId]);

  const show = useCallback(async () => {
    if (!isLoaded) {
      const error = new Error('Ad not loaded');
      setError(error.message);
      throw error;
    }

    try {
      await CloudXSDKManager.showInterstitial({ adId });
    } catch (err) {
      setError(err.message || 'Failed to show');
      throw err;
    }
  }, [adId, isLoaded]);

  const destroy = useCallback(async () => {
    if (createdRef.current) {
      await CloudXSDKManager.destroyAd({ adId });
      createdRef.current = false;
      setIsLoaded(false);
      setIsLoading(false);
      setError(null);
    }
  }, [adId]);

  return {
    isLoaded,
    isLoading,
    error,
    load,
    show,
    destroy,
  };
}

/**
 * Hook for managing rewarded ads
 * 
 * @param {string} placement - The ad placement ID
 * @param {string} adId - Unique identifier for this ad instance
 * @returns {Object} Rewarded ad state and controls
 * 
 * @example
 * const { isLoaded, isLoading, load, show, destroy, error, rewardEarned } = useCloudXRewarded('rewarded_video', 'rewarded_1');
 * 
 * useEffect(() => {
 *   if (rewardEarned) {
 *     console.log('User earned reward!');
 *     grantReward();
 *   }
 * }, [rewardEarned]);
 */
export function useCloudXRewarded(placement, adId) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rewardEarned, setRewardEarned] = useState(false);
  const createdRef = useRef(false);

  // Create ad instance
  useEffect(() => {
    if (!createdRef.current) {
      CloudXSDKManager.createRewarded({ placement, adId })
        .then(() => {
          createdRef.current = true;
        })
        .catch((err) => {
          setError(err.message || 'Failed to create rewarded');
        });
    }

    return () => {
      if (createdRef.current) {
        CloudXSDKManager.destroyAd({ adId }).catch(() => {});
        createdRef.current = false;
      }
    };
  }, [placement, adId]);

  // Event listeners
  useEffect(() => {
    const onLoaded = CloudXSDKManager.addEventListener(
      CloudXEventTypes.REWARDED_LOADED,
      (event) => {
        if (event.adId === adId) {
          setIsLoaded(true);
          setIsLoading(false);
          setError(null);
        }
      }
    );

    const onFailedToLoad = CloudXSDKManager.addEventListener(
      CloudXEventTypes.REWARDED_FAILED_TO_LOAD,
      (event) => {
        if (event.adId === adId) {
          setIsLoaded(false);
          setIsLoading(false);
          setError(event.error || 'Failed to load');
        }
      }
    );

    const onClosed = CloudXSDKManager.addEventListener(
      CloudXEventTypes.REWARDED_CLOSED,
      (event) => {
        if (event.adId === adId) {
          setIsLoaded(false);
        }
      }
    );

    const onRewardEarned = CloudXSDKManager.addEventListener(
      CloudXEventTypes.REWARD_EARNED,
      (event) => {
        if (event.adId === adId) {
          setRewardEarned(true);
        }
      }
    );

    return () => {
      onLoaded.remove();
      onFailedToLoad.remove();
      onClosed.remove();
      onRewardEarned.remove();
    };
  }, [adId]);

  const load = useCallback(async () => {
    if (!createdRef.current) {
      setError('Ad not created yet');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setRewardEarned(false);
    
    try {
      await CloudXSDKManager.loadRewarded({ adId });
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Failed to load');
      throw err;
    }
  }, [adId]);

  const show = useCallback(async () => {
    if (!isLoaded) {
      const error = new Error('Ad not loaded');
      setError(error.message);
      throw error;
    }

    try {
      await CloudXSDKManager.showRewarded({ adId });
    } catch (err) {
      setError(err.message || 'Failed to show');
      throw err;
    }
  }, [adId, isLoaded]);

  const destroy = useCallback(async () => {
    if (createdRef.current) {
      await CloudXSDKManager.destroyAd({ adId });
      createdRef.current = false;
      setIsLoaded(false);
      setIsLoading(false);
      setError(null);
      setRewardEarned(false);
    }
  }, [adId]);

  return {
    isLoaded,
    isLoading,
    error,
    rewardEarned,
    load,
    show,
    destroy,
  };
}

/**
 * Hook for managing banner ads
 * 
 * @param {string} placement - The ad placement ID
 * @param {string} adId - Unique identifier for this ad instance
 * @param {Object} options - Banner options
 * @param {boolean} options.autoLoad - Automatically load on mount (default: true)
 * @param {boolean} options.autoRefresh - Enable auto-refresh (default: false)
 * @returns {Object} Banner ad state and controls
 * 
 * @example
 * const { isLoaded, isVisible, load, show, hide, destroy } = useCloudXBanner('banner_home', 'banner_1', { autoLoad: true });
 */
export function useCloudXBanner(placement, adId, options = {}) {
  const { autoLoad = true, autoRefresh = false } = options;
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(null);
  const createdRef = useRef(false);

  // Create ad instance
  useEffect(() => {
    if (!createdRef.current) {
      CloudXSDKManager.createBanner({ placement, adId })
        .then(() => {
          createdRef.current = true;
          if (autoLoad) {
            CloudXSDKManager.loadBanner({ adId }).catch(() => {});
          }
        })
        .catch((err) => {
          setError(err.message || 'Failed to create banner');
        });
    }

    return () => {
      if (createdRef.current) {
        CloudXSDKManager.stopAutoRefresh({ adId }).catch(() => {});
        CloudXSDKManager.destroyAd({ adId }).catch(() => {});
        createdRef.current = false;
      }
    };
  }, [placement, adId, autoLoad]);

  // Auto-refresh management
  useEffect(() => {
    if (createdRef.current && autoRefresh && isLoaded) {
      CloudXSDKManager.startAutoRefresh({ adId }).catch(() => {});
    } else if (createdRef.current && !autoRefresh) {
      CloudXSDKManager.stopAutoRefresh({ adId }).catch(() => {});
    }
  }, [adId, autoRefresh, isLoaded]);

  // Event listeners
  useEffect(() => {
    const onLoaded = CloudXSDKManager.addEventListener(
      CloudXEventTypes.BANNER_LOADED,
      (event) => {
        if (event.adId === adId) {
          setIsLoaded(true);
          setIsLoading(false);
          setError(null);
        }
      }
    );

    const onFailedToLoad = CloudXSDKManager.addEventListener(
      CloudXEventTypes.BANNER_FAILED_TO_LOAD,
      (event) => {
        if (event.adId === adId) {
          setIsLoaded(false);
          setIsLoading(false);
          setError(event.error || 'Failed to load');
        }
      }
    );

    const onShown = CloudXSDKManager.addEventListener(
      CloudXEventTypes.BANNER_SHOWN,
      (event) => {
        if (event.adId === adId) {
          setIsVisible(true);
        }
      }
    );

    const onHidden = CloudXSDKManager.addEventListener(
      CloudXEventTypes.BANNER_HIDDEN,
      (event) => {
        if (event.adId === adId) {
          setIsVisible(false);
        }
      }
    );

    return () => {
      onLoaded.remove();
      onFailedToLoad.remove();
      onShown.remove();
      onHidden.remove();
    };
  }, [adId]);

  const load = useCallback(async () => {
    if (!createdRef.current) {
      setError('Ad not created yet');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await CloudXSDKManager.loadBanner({ adId });
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Failed to load');
      throw err;
    }
  }, [adId]);

  const show = useCallback(async () => {
    if (!createdRef.current) {
      setError('Ad not created yet');
      return;
    }

    try {
      await CloudXSDKManager.showBanner({ adId });
    } catch (err) {
      setError(err.message || 'Failed to show');
      throw err;
    }
  }, [adId]);

  const hide = useCallback(async () => {
    if (!createdRef.current) {
      setError('Ad not created yet');
      return;
    }

    try {
      await CloudXSDKManager.hideBanner({ adId });
    } catch (err) {
      setError(err.message || 'Failed to hide');
      throw err;
    }
  }, [adId]);

  const destroy = useCallback(async () => {
    if (createdRef.current) {
      await CloudXSDKManager.stopAutoRefresh({ adId }).catch(() => {});
      await CloudXSDKManager.destroyAd({ adId });
      createdRef.current = false;
      setIsLoaded(false);
      setIsLoading(false);
      setIsVisible(false);
      setError(null);
    }
  }, [adId]);

  return {
    isLoaded,
    isLoading,
    isVisible,
    error,
    load,
    show,
    hide,
    destroy,
  };
}

