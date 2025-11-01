package com.cloudxreactnative

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import io.cloudx.sdk.*
import java.lang.ref.WeakReference

/**
 * CloudXReactNativeModule - Main React Native bridge for CloudX Android SDK
 */
class CloudXReactNativeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val reactContextRef: WeakReference<ReactApplicationContext> = WeakReference(reactContext)
    
    // Storage for ad instances
    private val adInstances = mutableMapOf<String, Any>()
    
    // Store initialization server setting before init is called
    private var initializationServer: CloudXInitializationServer = CloudXInitializationServer.Production

    companion object {
        private const val TAG = "CloudXReactNative"
        private const val MODULE_NAME = "CloudXReactNative"
    }

    override fun getName(): String = MODULE_NAME

    override fun initialize() {
        super.initialize()
        Log.d(TAG, "CloudX React Native module initialized")
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        Log.d(TAG, "CloudX React Native module destroyed")
        
        // Clean up all ad instances
        adInstances.values.forEach { instance ->
            when (instance) {
                is CloudXInterstitialAd -> instance.destroy()
                is CloudXRewardedInterstitialAd -> instance.destroy()
                is CloudXAdView -> instance.destroy()
            }
        }
        adInstances.clear()
    }

    // ============================================================================
    // MARK: - SDK Initialization
    // ============================================================================

    @ReactMethod
    fun initializeSDK(appKey: String, promise: Promise) {
        Log.d(TAG, "Initializing CloudX SDK with appKey: $appKey, server: $initializationServer")

        val initParams = CloudXInitializationParams(
            appKey = appKey,
            initServer = initializationServer
        )

        CloudX.initialize(initParams, object : CloudXInitializationListener {
            override fun onInitialized() {
                Log.d(TAG, "CloudX SDK initialized successfully")
                promise.resolve(true)
            }

            override fun onInitializationFailed(cloudXError: CloudXError) {
                Log.e(TAG, "CloudX SDK initialization failed: ${cloudXError.effectiveMessage}")
                promise.reject(
                    cloudXError.code.name,
                    cloudXError.effectiveMessage,
                    null
                )
            }
        })
    }

    @ReactMethod
    fun setEnvironment(environment: String) {
        Log.d(TAG, "setEnvironment called with: $environment")
        
        initializationServer = when (environment.lowercase()) {
            "dev", "development" -> CloudXInitializationServer.Development
            "staging" -> CloudXInitializationServer.Staging
            "production", "prod" -> CloudXInitializationServer.Production
            else -> {
                Log.w(TAG, "Unknown environment: $environment, defaulting to Production")
                CloudXInitializationServer.Production
            }
        }
        
        Log.d(TAG, "Environment set to: $initializationServer")
    }

    @ReactMethod
    fun setLoggingEnabled(enabled: Boolean) {
        CloudX.setLoggingEnabled(enabled)
        Log.d(TAG, "Logging enabled set to: $enabled")
    }

    @ReactMethod
    fun setMinLogLevel(logLevel: String) {
        val level = when (logLevel.uppercase()) {
            "VERBOSE" -> CloudXLogLevel.VERBOSE
            "DEBUG" -> CloudXLogLevel.DEBUG
            "INFO" -> CloudXLogLevel.INFO
            "WARN" -> CloudXLogLevel.WARN
            "ERROR" -> CloudXLogLevel.ERROR
            else -> {
                Log.w(TAG, "Unknown log level: $logLevel, defaulting to DEBUG")
                CloudXLogLevel.DEBUG
            }
        }
        CloudX.setMinLogLevel(level)
        Log.d(TAG, "Min log level set to: $level")
    }

    // ============================================================================
    // MARK: - Privacy & Compliance
    // ============================================================================

    @ReactMethod
    fun setIsUserConsent(isUserConsent: Boolean) {
        CloudX.setPrivacy(CloudXPrivacy(isUserConsent = isUserConsent))
        Log.d(TAG, "User consent set to: $isUserConsent")
    }

    @ReactMethod
    fun setIsAgeRestrictedUser(isAgeRestrictedUser: Boolean) {
        CloudX.setPrivacy(CloudXPrivacy(isAgeRestrictedUser = isAgeRestrictedUser))
        Log.d(TAG, "Age restricted user set to: $isAgeRestrictedUser")
    }

    // ============================================================================
    // MARK: - Targeting
    // ============================================================================

    @ReactMethod
    fun setHashedUserId(userId: String) {
        CloudX.setHashedUserId(userId)
        Log.d(TAG, "Hashed user ID set")
    }

    @ReactMethod
    fun setUserKeyValue(key: String, value: String) {
        CloudX.setUserKeyValue(key, value)
        Log.d(TAG, "User key-value set: $key = $value")
    }

    @ReactMethod
    fun setAppKeyValue(key: String, value: String) {
        CloudX.setAppKeyValue(key, value)
        Log.d(TAG, "App key-value set: $key = $value")
    }

    @ReactMethod
    fun clearAllKeyValues() {
        CloudX.clearAllKeyValues()
        Log.d(TAG, "All key-values cleared")
    }

    // ============================================================================
    // MARK: - Ad Creation (Interstitial & Rewarded)
    // ============================================================================

    @ReactMethod
    fun createInterstitial(placement: String, adId: String, promise: Promise) {
        Log.d(TAG, "Creating interstitial for placement: $placement, adId: $adId")
        
        try {
            val interstitialAd = CloudX.createInterstitial(placement)
            interstitialAd.listener = createInterstitialListener(adId)
            interstitialAd.revenueListener = createRevenueListener(adId)
            adInstances[adId] = interstitialAd
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to create interstitial", e)
            promise.reject("AD_CREATION_FAILED", "Failed to create interstitial: ${e.message}", e)
        }
    }

    @ReactMethod
    fun createRewarded(placement: String, adId: String, promise: Promise) {
        Log.d(TAG, "Creating rewarded for placement: $placement, adId: $adId")
        
        try {
            val rewardedAd = CloudX.createRewardedInterstitial(placement)
            rewardedAd.listener = createRewardedListener(adId)
            rewardedAd.revenueListener = createRevenueListener(adId)
            adInstances[adId] = rewardedAd
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to create rewarded ad", e)
            promise.reject("AD_CREATION_FAILED", "Failed to create rewarded ad: ${e.message}", e)
        }
    }

    // ============================================================================
    // MARK: - Ad Operations (Interstitial & Rewarded)
    // ============================================================================

    @ReactMethod
    fun loadInterstitial(adId: String, promise: Promise) {
        val adInstance = adInstances[adId]
        
        if (adInstance == null) {
            promise.reject("AD_NOT_FOUND", "Ad instance not found for adId: $adId", null)
            return
        }
        
        when (adInstance) {
            is CloudXInterstitialAd -> {
                adInstance.load()
                promise.resolve(true)
            }
            else -> promise.reject("INVALID_AD_TYPE", "Ad is not an interstitial", null)
        }
    }

    @ReactMethod
    fun showInterstitial(adId: String, promise: Promise) {
        val adInstance = adInstances[adId]
        
        if (adInstance == null) {
            promise.reject("AD_NOT_FOUND", "Ad instance not found for adId: $adId", null)
            return
        }
        
        when (adInstance) {
            is CloudXInterstitialAd -> {
                adInstance.show()
                promise.resolve(true)
            }
            else -> promise.reject("INVALID_AD_TYPE", "Ad is not an interstitial", null)
        }
    }

    @ReactMethod
    fun isInterstitialReady(adId: String, promise: Promise) {
        val adInstance = adInstances[adId]
        
        when (adInstance) {
            is CloudXInterstitialAd -> promise.resolve(adInstance.isAdReady)
            else -> promise.resolve(false)
        }
    }

    @ReactMethod
    fun loadRewarded(adId: String, promise: Promise) {
        val adInstance = adInstances[adId]
        
        if (adInstance == null) {
            promise.reject("AD_NOT_FOUND", "Ad instance not found for adId: $adId", null)
            return
        }
        
        when (adInstance) {
            is CloudXRewardedInterstitialAd -> {
                adInstance.load()
                promise.resolve(true)
            }
            else -> promise.reject("INVALID_AD_TYPE", "Ad is not a rewarded ad", null)
        }
    }

    @ReactMethod
    fun showRewarded(adId: String, promise: Promise) {
        val adInstance = adInstances[adId]
        
        if (adInstance == null) {
            promise.reject("AD_NOT_FOUND", "Ad instance not found for adId: $adId", null)
            return
        }
        
        when (adInstance) {
            is CloudXRewardedInterstitialAd -> {
                adInstance.show()
                promise.resolve(true)
            }
            else -> promise.reject("INVALID_AD_TYPE", "Ad is not a rewarded ad", null)
        }
    }

    @ReactMethod
    fun isRewardedReady(adId: String, promise: Promise) {
        val adInstance = adInstances[adId]
        
        when (adInstance) {
            is CloudXRewardedInterstitialAd -> promise.resolve(adInstance.isAdReady)
            else -> promise.resolve(false)
        }
    }

    @ReactMethod
    fun destroyAd(adId: String) {
        val adInstance = adInstances[adId]
        when (adInstance) {
            is CloudXInterstitialAd -> adInstance.destroy()
            is CloudXRewardedInterstitialAd -> adInstance.destroy()
            is CloudXAdView -> adInstance.destroy()
        }
        adInstances.remove(adId)
        Log.d(TAG, "Ad destroyed: $adId")
    }

    // ============================================================================
    // MARK: - Event Helpers
    // ============================================================================

    /**
     * Serialize CloudXAd to WritableMap for React Native
     */
    private fun serializeCloudXAd(ad: CloudXAd?): WritableMap {
        val map = Arguments.createMap()
        
        if (ad != null) {
            map.putString("placementName", ad.placementName)
            map.putString("placementId", ad.placementId)
            map.putString("bidder", ad.bidderName)
            map.putString("externalPlacementId", ad.externalPlacementId)
            map.putDouble("revenue", ad.revenue)
        }
        
        return map
    }

    private fun sendEventToReactNative(eventName: String, adId: String, data: WritableMap? = null) {
        val eventData = Arguments.createMap()
        eventData.putString("event", eventName)
        eventData.putString("adId", adId)
        if (data != null) {
            eventData.putMap("data", data)
        }
        
        reactContextRef.get()
            ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit("CloudXAdEvent", eventData)
    }

    // ============================================================================
    // MARK: - Listener Factories
    // ============================================================================

    private fun createInterstitialListener(adId: String): CloudXInterstitialListener {
        return object : CloudXInterstitialListener {
            override fun onAdLoaded(cloudXAd: CloudXAd) {
                Log.d(TAG, "Interstitial loaded: $adId")
                val data = Arguments.createMap()
                data.putMap("ad", serializeCloudXAd(cloudXAd))
                sendEventToReactNative("onAdLoaded", adId, data)
            }

            override fun onAdDisplayed(cloudXAd: CloudXAd) {
                Log.d(TAG, "Interstitial displayed: $adId")
                val data = Arguments.createMap()
                data.putMap("ad", serializeCloudXAd(cloudXAd))
                sendEventToReactNative("onAdDisplayed", adId, data)
            }

            override fun onAdHidden(cloudXAd: CloudXAd) {
                Log.d(TAG, "Interstitial hidden: $adId")
                val data = Arguments.createMap()
                data.putMap("ad", serializeCloudXAd(cloudXAd))
                sendEventToReactNative("onAdHidden", adId, data)
            }

            override fun onAdClicked(cloudXAd: CloudXAd) {
                Log.d(TAG, "Interstitial clicked: $adId")
                val data = Arguments.createMap()
                data.putMap("ad", serializeCloudXAd(cloudXAd))
                sendEventToReactNative("onAdClicked", adId, data)
            }

            override fun onAdLoadFailed(cloudXError: CloudXError) {
                Log.e(TAG, "Interstitial load failed: $adId - ${cloudXError.effectiveMessage}")
                val data = Arguments.createMap()
                data.putString("error", cloudXError.effectiveMessage)
                data.putString("errorCode", cloudXError.code.name)
                sendEventToReactNative("onAdLoadFailed", adId, data)
            }

            override fun onAdDisplayFailed(cloudXError: CloudXError) {
                Log.e(TAG, "Interstitial display failed: $adId - ${cloudXError.effectiveMessage}")
                val data = Arguments.createMap()
                data.putString("error", cloudXError.effectiveMessage)
                data.putString("errorCode", cloudXError.code.name)
                sendEventToReactNative("onAdDisplayFailed", adId, data)
            }
        }
    }

    private fun createRewardedListener(adId: String): CloudXRewardedInterstitialListener {
        return object : CloudXRewardedInterstitialListener {
            override fun onAdLoaded(cloudXAd: CloudXAd) {
                Log.d(TAG, "Rewarded loaded: $adId")
                val data = Arguments.createMap()
                data.putMap("ad", serializeCloudXAd(cloudXAd))
                sendEventToReactNative("onAdLoaded", adId, data)
            }

            override fun onAdDisplayed(cloudXAd: CloudXAd) {
                Log.d(TAG, "Rewarded displayed: $adId")
                val data = Arguments.createMap()
                data.putMap("ad", serializeCloudXAd(cloudXAd))
                sendEventToReactNative("onAdDisplayed", adId, data)
            }

            override fun onAdHidden(cloudXAd: CloudXAd) {
                Log.d(TAG, "Rewarded hidden: $adId")
                val data = Arguments.createMap()
                data.putMap("ad", serializeCloudXAd(cloudXAd))
                sendEventToReactNative("onAdHidden", adId, data)
            }

            override fun onAdClicked(cloudXAd: CloudXAd) {
                Log.d(TAG, "Rewarded clicked: $adId")
                val data = Arguments.createMap()
                data.putMap("ad", serializeCloudXAd(cloudXAd))
                sendEventToReactNative("onAdClicked", adId, data)
            }

            override fun onAdLoadFailed(cloudXError: CloudXError) {
                Log.e(TAG, "Rewarded load failed: $adId - ${cloudXError.effectiveMessage}")
                val data = Arguments.createMap()
                data.putString("error", cloudXError.effectiveMessage)
                data.putString("errorCode", cloudXError.code.name)
                sendEventToReactNative("onAdLoadFailed", adId, data)
            }

            override fun onAdDisplayFailed(cloudXError: CloudXError) {
                Log.e(TAG, "Rewarded display failed: $adId - ${cloudXError.effectiveMessage}")
                val data = Arguments.createMap()
                data.putString("error", cloudXError.effectiveMessage)
                data.putString("errorCode", cloudXError.code.name)
                sendEventToReactNative("onAdDisplayFailed", adId, data)
            }

            override fun onUserRewarded(cloudXAd: CloudXAd) {
                Log.d(TAG, "User rewarded: $adId")
                val data = Arguments.createMap()
                data.putMap("ad", serializeCloudXAd(cloudXAd))
                sendEventToReactNative("onUserRewarded", adId, data)
            }
        }
    }

    private fun createRevenueListener(adId: String): CloudXAdRevenueListener {
        return object : CloudXAdRevenueListener {
            override fun onAdRevenuePaid(cloudXAd: CloudXAd) {
                Log.d(TAG, "Revenue paid: $adId")
                val data = Arguments.createMap()
                data.putMap("ad", serializeCloudXAd(cloudXAd))
                sendEventToReactNative("onAdRevenuePaid", adId, data)
            }
        }
    }
}

