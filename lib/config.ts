/**
 * Centralized environment configuration
 * Provides graceful fallbacks for missing environment variables
 */

function validateEnvVar(name: string, value: string | undefined, required: boolean = true, fallback: string = ""): string {
    if (!value || value.trim() === "" || value === "undefined") {
        if (required) {
            console.warn(
                `Missing environment variable: ${name}\n` +
                `Please set ${name} in your EAS Environment Variables or .env file.`
            );
        }
        return fallback;
    }
    return value;
}

// API Configuration
export const API_URL = validateEnvVar("EXPO_PUBLIC_API_URL", process.env.EXPO_PUBLIC_API_URL, true, "");

// Google Maps Configuration
export const GOOGLE_MAPS_API_KEY = validateEnvVar("EXPO_PUBLIC_GOOGLE_MAPS_API_KEY", process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY);

// Google OAuth Configuration
export const GOOGLE_WEB_CLIENT_ID = validateEnvVar("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID", process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
export const GOOGLE_ANDROID_CLIENT_ID = validateEnvVar("EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID", process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID, false);
export const GOOGLE_IOS_CLIENT_ID = validateEnvVar("EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID", process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, false);

// Expo Project Configuration (optional)
export const EXPO_PROJECT_ID = validateEnvVar("EXPO_PUBLIC_PROJECT_ID", process.env.EXPO_PUBLIC_PROJECT_ID, false);

// Validation helper to check all configs at app startup
export function validateConfig(): { isValid: boolean; missingVars: string[] } {
    const missingVars: string[] = [];

    if (!API_URL) {
        missingVars.push("EXPO_PUBLIC_API_URL");
    }

    if (missingVars.length > 0) {
        console.warn(
            `Missing environment variables: ${missingVars.join(", ")}\n` +
            `The app will use fallback values or may have limited functionality.`
        );
        return { isValid: false, missingVars };
    }

    return { isValid: true, missingVars: [] };
}
