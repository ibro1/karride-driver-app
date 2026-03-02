import { fetchAPI } from "./fetch";

/**
 * Get driver onboarding status
 */
export const getOnboardingStatus = async () => {
    try {
        return await fetchAPI("/api/driver/onboarding/status", {
            method: "GET",
        });
    } catch (error: any) {
        console.error("[Onboarding API] getOnboardingStatus error:", error.message);
        throw new Error("Unable to load onboarding status. Please try again.");
    }
};

/**
 * Save step 1: City selection
 */
export const saveStep1city = async (city: string) => {
    try {
        return await fetchAPI("/api/driver/onboarding/step-1", {
            method: "POST",
            body: JSON.stringify({ city }),
        });
    } catch (error: any) {
        console.error("[Onboarding API] saveStep1city error:", error.message);
        throw new Error("Unable to save city. Please try again.");
    }
};

/**
 * Save step 2: Profile information
 */
export const saveStep2Profile = async (data: any) => {
    try {
        return await fetchAPI("/api/driver/onboarding/step-2", {
            method: "POST",
            body: JSON.stringify(data),
        });
    } catch (error: any) {
        console.error("[Onboarding API] saveStep2Profile error:", error.message);
        throw new Error("Unable to save profile. Please try again.");
    }
};

/**
 * Save step 3: Vehicle information
 */
export const saveStep3Vehicle = async (data: any) => {
    try {
        return await fetchAPI("/api/driver/onboarding/step-3", {
            method: "POST",
            body: JSON.stringify(data),
        });
    } catch (error: any) {
        console.error("[Onboarding API] saveStep3Vehicle error:", error.message);
        throw new Error("Unable to save vehicle information. Please try again.");
    }
};

/**
 * Complete the onboarding process
 */
export const completeOnboarding = async () => {
    try {
        return await fetchAPI("/api/driver/onboarding/complete", {
            method: "POST",
        });
    } catch (error: any) {
        console.error("[Onboarding API] completeOnboarding error:", error.message);
        throw new Error("Unable to complete onboarding. Please try again.");
    }
};
