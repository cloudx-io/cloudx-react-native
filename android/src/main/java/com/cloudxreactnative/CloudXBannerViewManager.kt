package com.cloudxreactnative

import android.util.Log
import android.view.View
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.events.RCTEventEmitter
import io.cloudx.sdk.*

/**
 * CloudXBannerViewManager - React Native ViewManager for Banner and MREC ads
 */
class CloudXBannerViewManager : SimpleViewManager<CloudXAdView>() {

    companion object {
        private const val TAG = "CloudXBannerViewManager"
        private const val REACT_CLASS = "CloudXBannerView"
    }

    override fun getName(): String = REACT_CLASS

    override fun createViewInstance(reactContext: ThemedReactContext): CloudXAdView {
        Log.d(TAG, "Creating CloudXAdView instance")
        // Create a banner by default, will be replaced based on props
        return CloudX.createBanner("temp")
    }

    @ReactProp(name = "placement")
    fun setPlacement(view: CloudXAdView, placement: String?) {
        Log.d(TAG, "setPlacement: $placement")
        // Placement is handled in didSetProps logic
    }

    @ReactProp(name = "adId")
    fun setAdId(view: CloudXAdView, adId: String?) {
        Log.d(TAG, "setAdId: $adId")
        // AdId is stored as tag for event emission
        view.tag = adId
    }

    @ReactProp(name = "adType")
    fun setAdType(view: CloudXAdView, adType: String?) {
        Log.d(TAG, "setAdType: $adType")
        // AdType is handled in didSetProps logic
    }

    @ReactProp(name = "shouldLoad")
    fun setShouldLoad(view: CloudXAdView, shouldLoad: Boolean) {
        Log.d(TAG, "setShouldLoad: $shouldLoad")
        
        if (shouldLoad) {
            // Load the banner
            view.load()
            Log.d(TAG, "Banner load() called")
        }
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
        return MapBuilder.builder<String, Any>()
            .put("onAdLoaded", MapBuilder.of("registrationName", "onAdLoaded"))
            .put("onAdFailedToLoad", MapBuilder.of("registrationName", "onAdFailedToLoad"))
            .put("onAdClicked", MapBuilder.of("registrationName", "onAdClicked"))
            .put("onAdFailedToShow", MapBuilder.of("registrationName", "onAdFailedToShow"))
            .put("onAdImpression", MapBuilder.of("registrationName", "onAdImpression"))
            .put("onAdRevenuePaid", MapBuilder.of("registrationName", "onAdRevenuePaid"))
            .put("onAdExpanded", MapBuilder.of("registrationName", "onAdExpanded"))
            .put("onAdCollapsed", MapBuilder.of("registrationName", "onAdCollapsed"))
            .build()
    }

    override fun addEventEmitters(reactContext: ThemedReactContext, view: CloudXAdView) {
        super.addEventEmitters(reactContext, view)
        
        val adId = view.tag as? String ?: "unknown"
        
        // Set up listener for ad events
        view.listener = object : CloudXAdViewListener {
            override fun onAdLoaded(cloudXAd: CloudXAd) {
                Log.d(TAG, "Ad loaded: $adId")
                val eventData = Arguments.createMap()
                val adData = Arguments.createMap()
                adData.putString("placementName", cloudXAd.placementName)
                adData.putString("placementId", cloudXAd.placementId)
                adData.putString("bidder", cloudXAd.bidderName)
                adData.putString("externalPlacementId", cloudXAd.externalPlacementId)
                adData.putDouble("revenue", cloudXAd.revenue)
                eventData.putMap("ad", adData)
                
                reactContext.getJSModule(RCTEventEmitter::class.java)
                    .receiveEvent(view.id, "onAdLoaded", eventData)
            }

            override fun onAdDisplayed(cloudXAd: CloudXAd) {
                Log.d(TAG, "Ad displayed (impression): $adId")
                val eventData = Arguments.createMap()
                val adData = Arguments.createMap()
                adData.putString("placementName", cloudXAd.placementName)
                adData.putString("placementId", cloudXAd.placementId)
                adData.putString("bidder", cloudXAd.bidderName)
                adData.putString("externalPlacementId", cloudXAd.externalPlacementId)
                adData.putDouble("revenue", cloudXAd.revenue)
                eventData.putMap("ad", adData)
                
                reactContext.getJSModule(RCTEventEmitter::class.java)
                    .receiveEvent(view.id, "onAdImpression", eventData)
            }

            override fun onAdHidden(cloudXAd: CloudXAd) {
                Log.d(TAG, "Ad hidden: $adId")
                // Not exposed to React Native for banner ads
            }

            override fun onAdClicked(cloudXAd: CloudXAd) {
                Log.d(TAG, "Ad clicked: $adId")
                val eventData = Arguments.createMap()
                val adData = Arguments.createMap()
                adData.putString("placementName", cloudXAd.placementName)
                adData.putString("placementId", cloudXAd.placementId)
                adData.putString("bidder", cloudXAd.bidderName)
                adData.putString("externalPlacementId", cloudXAd.externalPlacementId)
                adData.putDouble("revenue", cloudXAd.revenue)
                eventData.putMap("ad", adData)
                
                reactContext.getJSModule(RCTEventEmitter::class.java)
                    .receiveEvent(view.id, "onAdClicked", eventData)
            }

            override fun onAdLoadFailed(cloudXError: CloudXError) {
                Log.e(TAG, "Ad load failed: $adId - ${cloudXError.effectiveMessage}")
                val eventData = Arguments.createMap()
                eventData.putString("error", cloudXError.effectiveMessage)
                eventData.putString("errorCode", cloudXError.code.name)
                
                reactContext.getJSModule(RCTEventEmitter::class.java)
                    .receiveEvent(view.id, "onAdFailedToLoad", eventData)
            }

            override fun onAdDisplayFailed(cloudXError: CloudXError) {
                Log.e(TAG, "Ad display failed: $adId - ${cloudXError.effectiveMessage}")
                val eventData = Arguments.createMap()
                eventData.putString("error", cloudXError.effectiveMessage)
                eventData.putString("errorCode", cloudXError.code.name)
                
                reactContext.getJSModule(RCTEventEmitter::class.java)
                    .receiveEvent(view.id, "onAdFailedToShow", eventData)
            }

            override fun onAdExpanded(cloudXAd: CloudXAd) {
                Log.d(TAG, "Ad expanded: $adId")
                val eventData = Arguments.createMap()
                val adData = Arguments.createMap()
                adData.putString("placementName", cloudXAd.placementName)
                adData.putString("placementId", cloudXAd.placementId)
                adData.putString("bidder", cloudXAd.bidderName)
                adData.putString("externalPlacementId", cloudXAd.externalPlacementId)
                adData.putDouble("revenue", cloudXAd.revenue)
                eventData.putMap("ad", adData)
                
                reactContext.getJSModule(RCTEventEmitter::class.java)
                    .receiveEvent(view.id, "onAdExpanded", eventData)
            }

            override fun onAdCollapsed(cloudXAd: CloudXAd) {
                Log.d(TAG, "Ad collapsed: $adId")
                val eventData = Arguments.createMap()
                val adData = Arguments.createMap()
                adData.putString("placementName", cloudXAd.placementName)
                adData.putString("placementId", cloudXAd.placementId)
                adData.putString("bidder", cloudXAd.bidderName)
                adData.putString("externalPlacementId", cloudXAd.externalPlacementId)
                adData.putDouble("revenue", cloudXAd.revenue)
                eventData.putMap("ad", adData)
                
                reactContext.getJSModule(RCTEventEmitter::class.java)
                    .receiveEvent(view.id, "onAdCollapsed", eventData)
            }
        }

        // Set up revenue listener
        // Note: CloudXAdView doesn't have a revenueListener property in the Android SDK
        // Revenue is included in the onAdDisplayed callback (impression)
        // But we'll check if there's a way to get revenue separately
        Log.d(TAG, "Ad listeners configured for adId: $adId")
    }

    override fun onDropViewInstance(view: CloudXAdView) {
        super.onDropViewInstance(view)
        Log.d(TAG, "Dropping view instance, destroying ad")
        view.destroy()
    }
}

