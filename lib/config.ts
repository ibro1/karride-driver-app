/**
 * Centralized environment configuration
 * Provides graceful fallbacks for missing environment variables
 * Logs warnings in development instead of crashing
 */

// Debug: Log all EXPO_PUBLIC_ environment variables
console.log("[CONFIG_DEBUG] Loading config...");
const expoEnvKeys = Object.keys(process.env).filter(k => k.includes('EXPO_PUBLIC'));
console.log(`[CONFIG_DEBUG] EXPO_PUBLIC_ keys found: ${expoEnvKeys.join(', ')}`);
expoEnvKeys.forEach(key => {
    console.log(`[CONFIG_DEBUG] ${key} = "${process.env[key]}"`);
});

function getEnvVar(name: string, required: boolean = true, fallback: string = ""): string {
    // Access process.env directly by property name
    const value = process.env[name as keyof typeof process.env] as string | undefined;

    console.log(`[CONFIG_DEBUG] getEnvVar("${name}") = "${value}"`);

    if (!value || value.trim() === "" || value === "undefined") {
        if (required) {
            // Log warning instead of crashing
            console.warn(
                `⚠️  Missing environment variable: ${name}\n` +
                `Please set ${name} in your EAS Environment Variables or .env file.`
            );
        }
        return fallback;
    }

    return value;
}

// API Configuration - Read directly from process.env
const rawApiUrl = process.env.EXPO_PUBLIC_API_URL;
console.log(`[CONFIG_DEBUG] Direct access - process.env.EXPO_PUBLIC_API_URL = "${rawApiUrl}"`);

export const API_URL = rawApiUrl && rawApiUrl !== "undefined" ? rawApiUrl : "";
console.log(`[CONFIG_DEBUG] API_URL = "${API_URL}"`);

// Google Maps Configuration
export const GOOGLE_MAPS_API_KEY = getEnvVar("EXPO_PUBLIC_GOOGLE_MAPS_API_KEY");

// Google OAuth Configuration
export const GOOGLE_WEB_CLIENT_ID = getEnvVar("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID");
export const GOOGLE_ANDROID_CLIENT_ID = getEnvVar("EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID", false);
export const GOOGLE_IOS_CLIENT_ID = getEnvVar("EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID", false);

// Expo Project Configuration
export const EXPO_PROJECT_ID = getEnvVar("EXPO_PUBLIC_PROJECT_ID", false);

// Validation helper to check all configs at app startup
export function validateConfig(): { isValid: boolean; missingVars: string[] } {
    const missingVars: string[] = [];

    if (!API_URL) {
        missingVars.push("EXPO_PUBLIC_API_URL");
    }

    if (missingVars.length > 0) {
        console.warn(
            `⚠️  Missing environment variables: ${missingVars.join(", ")}\n` +
            `The app will use fallback values or may have limited functionality.`
        );
        return { isValid: false, missingVars };
    }

    console.log("✅ Environment configuration validated");
    return { isValid: true, missingVars: [] };
}
