import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface AuthResponse {
    user: any;
    session: {
        token: string;
        expiresAt: string;
    };
}

interface ErrorResponse {
    error: string;
    message?: string;
}

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
    email: string,
    password: string,
): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/api/auth/sign-in/email`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Origin": "myapp://",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    if (!response.ok) {
        const error: ErrorResponse = await response.json();
        throw new Error(error.message || error.error || "Sign in failed");
    }

    const data = await response.json();
    console.log("Sign in response data:", data);

    // Store session token
    const token = data.session?.token || data.token;
    if (token) {
        console.log("Saving session token:", token);
        await SecureStore.setItemAsync("session_token", token);
    } else {
        console.log("No session token in sign in response");
    }

    return data;
};

/**
 * Sign up with email, password, name, and gender
 */
export const signUpWithEmail = async (
    email: string,
    password: string,
    name: string,
    gender: boolean,
): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Origin": "myapp://",
        },
        body: JSON.stringify({
            email,
            password,
            name,
            gender,
        }),
    });

    if (!response.ok) {
        const error: ErrorResponse = await response.json();
        throw new Error(error.message || error.error || "Sign up failed");
    }

    const data = await response.json();
    console.log("Sign up response data:", data);

    // Store session token if provided
    const token = data.session?.token || data.token;
    if (token) {
        console.log("Saving session token:", token);
        await SecureStore.setItemAsync("session_token", token);
    } else {
        console.log("No session token in sign up response");
    }

    return data;
};

/**
 * Verify email with code
 */
export const verifyEmail = async (email: string, code: string): Promise<any> => {
    const response = await fetch(`${API_URL}/api/auth/email-otp/verify-email`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Origin": "myapp://",
        },
        body: JSON.stringify({
            email,
            otp: code,
        }),
    });

    if (!response.ok) {
        const error: ErrorResponse = await response.json();
        throw new Error(error.message || error.error || "Verification failed");
    }

    return await response.json();
};

/**
 * Send verification code (resend)
 */
export const sendVerificationCode = async (email: string): Promise<any> => {
    const response = await fetch(`${API_URL}/api/auth/email-otp/send-verification-otp`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Origin": "myapp://",
        },
        body: JSON.stringify({
            email,
            type: "email-verification",
        }),
    });

    if (!response.ok) {
        const error: ErrorResponse = await response.json();
        throw new Error(error.message || error.error || "Failed to send verification code");
    }

    return await response.json();
};

/**
 * Sign out - clear session
 */
export const signOutUser = async (): Promise<void> => {
    const token = await SecureStore.getItemAsync("session_token");

    if (token) {
        try {
            await fetch(`${API_URL}/api/auth/sign-out`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    "Origin": "myapp://",
                },
            });
        } catch (error) {
            console.error("Sign out API error:", error);
        }
    }

    // Always clear local session
    await SecureStore.deleteItemAsync("session_token");
};

/**
 * Get current session
 */
export const getSession = async (): Promise<any> => {
    const token = await SecureStore.getItemAsync("session_token");
    console.log("getSession: Token from SecureStore:", token ? "Exists" : "Null");

    if (!token) {
        return null;
    }

    try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "Origin": "myapp://",
            },
        });

        console.log("getSession: Response status:", response.status);

        if (!response.ok) {
            // Session expired or invalid
            console.log("getSession: Session invalid, deleting token");
            await SecureStore.deleteItemAsync("session_token");
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error("Get session error:", error);
        return null;
    }
};

/**
 * Register as a driver
 */
export const registerDriver = async (
    firstName: string,
    lastName: string,
    phone: string,
    licenseNumber: string,
    vehicleType: string,
    vehicleMake: string,
    vehicleModel: string,
    vehicleYear: number,
    vehicleColor: string,
    vehiclePlateNumber: string,
    vehicleSeats: number
): Promise<any> => {
    const token = await SecureStore.getItemAsync("session_token");
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/api/driver/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            phone,
            license_number: licenseNumber,
            vehicle_type: vehicleType,
            vehicle_make: vehicleMake,
            vehicle_model: vehicleModel,
            vehicle_year: vehicleYear,
            vehicle_color: vehicleColor,
            vehicle_plate_number: vehiclePlateNumber,
            vehicle_seats: vehicleSeats,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || "Failed to register driver");
    }

    return await response.json();
};

/**
 * Get driver profile
 */
export const getDriverProfile = async (userId?: string): Promise<any> => {
    const token = await SecureStore.getItemAsync("session_token");
    if (!token) return null;

    const response = await fetch(`${API_URL}/api/driver/status`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        return null;
    }

    return await response.json();
};

/**
 * Update driver status (online/offline)
 */
export const updateDriverStatus = async (
    status: "online" | "offline" | "busy",
    latitude: number,
    longitude: number
): Promise<any> => {
    const token = await SecureStore.getItemAsync("session_token");
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/api/driver/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            status,
            latitude,
            longitude,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to update status");
    }

    return await response.json();
};

/**
 * Update driver location
 */
export const updateDriverLocation = async (
    latitude: number,
    longitude: number
): Promise<any> => {
    const token = await SecureStore.getItemAsync("session_token");
    if (!token) return; // Silent fail

    try {
        await fetch(`${API_URL}/api/driver/location`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                latitude,
                longitude,
            }),
        });
    } catch (error) {
        console.error("Location update error:", error);
    }
};

/**
 * Accept a ride request
 */
export const acceptRide = async (rideId: number): Promise<any> => {
    const token = await SecureStore.getItemAsync("session_token");
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/api/rides/${rideId}/accept`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || "Failed to accept ride");
    }

    return await response.json();
};

/**
 * Update ride status
 */
export const updateRideStatus = async (
    rideId: number,
    status: "arrived" | "in_progress" | "completed" | "cancelled"
): Promise<any> => {
    const token = await SecureStore.getItemAsync("session_token");
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/api/rides/${rideId}/update-status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            status,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || "Failed to update ride status");
    }

    return await response.json();
};

/**
 * Sign in with Google (OAuth)
 */
export const signInWithGoogle = async (idToken: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/api/auth/callback/google`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Origin": "myapp://",
        },
        body: JSON.stringify({
            idToken,
        }),
    });

    if (!response.ok) {
        const error: ErrorResponse = await response.json();
        throw new Error(error.message || error.error || "Google sign in failed");
    }

    const data = await response.json();

    // Store session token
    const token = data.session?.token || data.token;
    if (token) {
        await SecureStore.setItemAsync("session_token", token);
    }

    return data;
};
