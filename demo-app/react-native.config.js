module.exports = {
  dependencies: {
    // Exclude cloudx-react-native from autolinking since we're using local path in Podfile
    'cloudx-react-native': {
      platforms: {
        ios: null,
        android: null,
      },
    },
  },
};


