export default {
    expo: {
      name: "pet-organizer",
      slug: "pet-organizer",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/images/icon.png",
      scheme: "myapp", // ✅ Keeps the deep linking scheme
      userInterfaceStyle: "automatic",
      newArchEnabled: true, // ✅ Ensures new architecture is explicitly enabled
  
      ios: {
        supportsTablet: true,
        bundleIdentifier: "com.group26.petorganizer",
      },
  
      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/images/adaptive-icon.png",
          backgroundColor: "#ffffff",
        },
        package: "com.group26.petorganizer",
      },
  
      web: {
        bundler: "metro",
        output: "static",
        favicon: "./assets/images/favicon.png",
      },
  
      plugins: [
        "expo-router",
        [
          "expo-splash-screen",
          {
            image: "./assets/images/splash-icon.png",
            imageWidth: 200,
            resizeMode: "contain",
            backgroundColor: "#ffffff",
          },
        ],
      ],
  
      experiments: {
        typedRoutes: true,
      },
  
      extra: {
        router: {
          origin: false,
        },
        eas: {
          projectId: "9bcac7ee-a2c0-428a-9fa0-180a419f1934",
        },
      },
  
      owner: "suubie40-org",
    },
  };