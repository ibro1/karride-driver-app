import 'dotenv/config';

export default {
    expo: {
        name: "KarRide Driver",
        slug: "karride-driver",
        owner: "netlinko",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icons/icon.png",
        scheme: "ng.karride.driver",
        userInterfaceStyle: "automatic",
        splash: {
            image: "./assets/icons/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#020402"
        },
        updates: {
            url: "https://u.expo.dev/bb5677ce-a44c-4a45-8071-ca1673c4a918",
            fallbackToCacheTimeout: 0
        },
        runtimeVersion: {
            policy: "appVersion"
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: "ng.karride.driver",
            icons: {
                dark: "./assets/icons/ios-dark.png",
                light: "./assets/icons/ios-dark.png"
            }
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/icons/adaptive-icon.png",
                backgroundColor: "#020402"
            },
            package: "ng.karride.driver",
            config: {
                googleMaps: {
                    apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "REPLACE_WITH_YOUR_GOOGLE_MAPS_API_KEY"
                }
            },
            softwareKeyboardLayoutMode: "pan"
        },
        web: {
            bundler: "metro",
            output: "server",
            favicon: "./assets/images/favicon.png"
        },
        plugins: [
            [
                "expo-router",
                {
                    "origin": "https://karride.ng/"
                }
            ],
            [
                "expo-build-properties",
                {
                    "android": {
                        "usesCleartextTraffic": true,
                        "kotlinVersion": "1.9.0"

                    }
                }
            ],
            "expo-dev-client"
        ],
        experiments: {
            typedRoutes: true
        },
        extra: {
            router: {
                "origin": "https://karride.ng/"
            },
            eas: {
                projectId: "bb5677ce-a44c-4a45-8071-ca1673c4a918"
            }
        }
    }
};
