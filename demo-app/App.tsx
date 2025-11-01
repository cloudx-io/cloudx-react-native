/**
 * CloudX React Native Demo App
 * Main entry point with initialization and navigation
 */

import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CloudXSDKManager } from 'cloudx-react-native';
import { DemoConfig, DemoEnvironmentConfig } from './src/config/DemoConfig';

// Import screens
import BannerScreen from './src/screens/BannerScreen';
import MRECScreen from './src/screens/MRECScreen';
import InterstitialScreen from './src/screens/InterstitialScreen';
import RewardedScreen from './src/screens/RewardedScreen';
import LogsScreen from './src/screens/LogsScreen';

const Tab = createBottomTabNavigator();

/**
 * Main Demo App
 */
function App(): React.JSX.Element {
  const [isSDKInitialized, setIsSDKInitialized] = useState(false);
  const [currentEnvironment, setCurrentEnvironment] = useState<DemoEnvironmentConfig | null>(null);

  if (!isSDKInitialized) {
    return (
      <InitScreen
        onInitialized={(config) => {
          setCurrentEnvironment(config);
          setIsSDKInitialized(true);
        }}
      />
    );
  }

  return (
    <NavigationContainer>
      <MainTabView environment={currentEnvironment!} />
    </NavigationContainer>
  );
}

/**
 * Initialization Screen
 * Allows user to select environment and initialize SDK
 */
interface InitScreenProps {
  onInitialized: (config: DemoEnvironmentConfig) => void;
}

function InitScreen({ onInitialized }: InitScreenProps): React.JSX.Element {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<DemoEnvironmentConfig | null>(null);
  const [initSuccess, setInitSuccess] = useState(false);

  const initializeSDK = async (config: DemoEnvironmentConfig) => {
    setIsInitializing(true);
    setInitError(null);
    setSelectedConfig(config);

    try {
      // Set environment
      await CloudXSDKManager.setEnvironment(config.name.toLowerCase());
      
      // Enable verbose logging
      await CloudXSDKManager.setLoggingEnabled(true);

      // Initialize SDK
      const result = await CloudXSDKManager.initialize({
        appKey: config.appKey,
        hashedUserID: config.hashedUserId,
      });

      if (result.success) {
        setInitSuccess(true);
        setIsInitializing(false);
      } else {
        setInitError('Failed to initialize CloudX SDK.');
        setIsInitializing(false);
      }
    } catch (error) {
      setInitError(`Error: ${error}`);
      setIsInitializing(false);
    }
  };

  const getEnvironmentForPlatform = (
    iosConfig: DemoEnvironmentConfig,
    androidConfig: DemoEnvironmentConfig
  ): DemoEnvironmentConfig => {
    return Platform.OS === 'ios' ? iosConfig : androidConfig;
  };

  return (
    <SafeAreaView style={styles.initContainer}>
      <View style={styles.initContent}>
        {/* Status Indicator */}
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: initSuccess
                ? '#4CAF50'
                : initError
                ? '#F44336'
                : '#9E9E9E',
            },
          ]}
        />

        {/* Status Text */}
        <Text
          style={[
            styles.statusText,
            {
              color: initSuccess
                ? '#4CAF50'
                : initError
                ? '#F44336'
                : '#000000',
            },
          ]}>
          {initSuccess
            ? `SDK Initialized (${selectedConfig?.name ?? ''})`
            : initError || 'SDK Not Initialized'}
        </Text>

        {/* Environment Buttons */}
        <View style={styles.buttonContainer}>
          <EnvironmentButton
            label="Init Staging"
            config={getEnvironmentForPlatform(
              DemoConfig.iosStaging,
              DemoConfig.androidStaging
            )}
            color="#66B3E6"
            isInitializing={isInitializing}
            isInitialized={initSuccess}
            onPress={initializeSDK}
            isCurrentlyInitializing={
              isInitializing && selectedConfig === getEnvironmentForPlatform(
                DemoConfig.iosStaging,
                DemoConfig.androidStaging
              )
            }
          />

          <EnvironmentButton
            label="Init Dev"
            config={getEnvironmentForPlatform(
              DemoConfig.iosDev,
              DemoConfig.androidDev
            )}
            color="#2196F3"
            isInitializing={isInitializing}
            isInitialized={initSuccess}
            onPress={initializeSDK}
            isCurrentlyInitializing={
              isInitializing && selectedConfig === getEnvironmentForPlatform(
                DemoConfig.iosDev,
                DemoConfig.androidDev
              )
            }
          />

          <EnvironmentButton
            label="Init Production"
            config={getEnvironmentForPlatform(
              DemoConfig.iosProduction,
              DemoConfig.androidProduction
            )}
            color="#33B34D"
            isInitializing={isInitializing}
            isInitialized={initSuccess}
            onPress={initializeSDK}
            isCurrentlyInitializing={
              isInitializing && selectedConfig === getEnvironmentForPlatform(
                DemoConfig.iosProduction,
                DemoConfig.androidProduction
              )
            }
            forceDisabled={__DEV__}
            disabledMessage="Production requires Release build"
          />
        </View>

        {/* Continue Button (shown after initialization) */}
        {initSuccess && selectedConfig && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => onInitialized(selectedConfig)}>
            <Text style={styles.continueButtonText}>Continue to Demo</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

/**
 * Environment Button Component
 */
interface EnvironmentButtonProps {
  label: string;
  config: DemoEnvironmentConfig;
  color: string;
  isInitializing: boolean;
  isInitialized: boolean;
  onPress: (config: DemoEnvironmentConfig) => void;
  isCurrentlyInitializing: boolean;
  forceDisabled?: boolean;
  disabledMessage?: string;
}

function EnvironmentButton({
  label,
  config,
  color,
  isInitializing,
  isInitialized,
  onPress,
  isCurrentlyInitializing,
  forceDisabled = false,
  disabledMessage,
}: EnvironmentButtonProps): React.JSX.Element {
  const disabled = isInitializing || isInitialized || forceDisabled;

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.envButton,
          { backgroundColor: disabled ? `${color}80` : color },
        ]}
        onPress={() => onPress(config)}
        disabled={disabled}>
        {isCurrentlyInitializing ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.envButtonText}>{label}</Text>
        )}
      </TouchableOpacity>
      {forceDisabled && disabledMessage && (
        <Text style={styles.disabledMessage}>{disabledMessage}</Text>
      )}
    </View>
  );
}

/**
 * Main Tab Navigation View
 */
interface MainTabViewProps {
  environment: DemoEnvironmentConfig;
}

function MainTabView({ environment }: MainTabViewProps): React.JSX.Element {
  const [logsVisible, setLogsVisible] = React.useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: '#757575',
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: '#E0E0E0',
          },
          headerRight: () => (
            <TouchableOpacity
              style={styles.logsButton}
              onPress={() => setLogsVisible(true)}>
              <Text style={styles.logsButtonText}>📋 Logs</Text>
            </TouchableOpacity>
          ),
        }}>
      <Tab.Screen
        name="Banner"
        options={{ tabBarIcon: () => <Text>📱</Text> }}>
        {() => <BannerScreen environment={environment} />}
      </Tab.Screen>
      <Tab.Screen
        name="MREC"
        options={{ tabBarIcon: () => <Text>⬜</Text> }}>
        {() => <MRECScreen environment={environment} />}
      </Tab.Screen>
      <Tab.Screen
        name="Interstitial"
        options={{ tabBarIcon: () => <Text>🖼️</Text> }}>
        {() => <InterstitialScreen environment={environment} />}
      </Tab.Screen>
      <Tab.Screen
        name="Rewarded"
        options={{ tabBarIcon: () => <Text>🎁</Text> }}>
        {() => <RewardedScreen environment={environment} />}
      </Tab.Screen>
      </Tab.Navigator>

      {/* Logs Modal */}
      <LogsScreen
        visible={logsVisible}
        onClose={() => setLogsVisible(false)}
      />
    </>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  initContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  initContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 16,
  },
  envButton: {
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  envButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    marginTop: 48,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logsButton: {
    paddingHorizontal: 16,
  },
  logsButtonText: {
    fontSize: 14,
    color: '#2196F3',
  },
  disabledMessage: {
    marginTop: 4,
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
});

export default App;

