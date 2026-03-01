/**
 * Centralized environment configuration
 * Validates required environment variables at startup
 * Throws error if critical vars are missing (fail-fast principle)
 */

function getEnvVar(name: string, required: boolean = true): string {
  const value = process.env[name];
  
  if (required && (!value || value.trim() === "")) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
      `Please check your .env file and ensure ${name} is set.\n` +
      `See .env.example for reference.`
    );
  }
  
  return value || "";
}

// API Configuration
export const API_URL = getEnvVar("EXPO_PUBLIC_API_URL");

// Google Maps Configuration
export const GOOGLE_MAPS_API_KEY = getEnvVar("EXPO_PUBLIC_GOOGLE_MAPS_API_KEY");

// Google OAuth Configuration
export const GOOGLE_WEB_CLIENT_ID = getEnvVar("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID");
export const GOOGLE_ANDROID_CLIENT_ID = getEnvVar("EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID", false);
export const GOOGLE_IOS_CLIENT_ID = getEnvVar("EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID", false);

// Validation helper to check all configs at app startup
export function validateConfig(): void {
  // This function is called to trigger validation early
  console.log("✅ Environment configuration validated");
}
