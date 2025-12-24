import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import {
    signInWithEmail,
    signUpWithEmail,
    signOutUser,
    getSession as getSessionAPI,
    verifyEmail as verifyEmailAPI,
    sendVerificationCode as sendVerificationCodeAPI,
    sendOtp as sendOtpAPI,
    verifyOtp as verifyOtpAPI,
} from "./auth-api";
import { signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth } from "./firebase";

interface User {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string;
    role?: string;
    gender?: boolean;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    isLoaded: boolean;
    isSignedIn: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (
        email: string,
        password: string,
        name: string,
        gender: boolean,
        phoneNumber: string,
        city: string,
    ) => Promise<void>;
    signOut: () => Promise<void>;
    verifyEmail: (email: string, code: string) => Promise<void>;
    sendVerificationCode: (email: string) => Promise<void>;
    refreshSession: () => Promise<void>;
    sendOtp: (phone: string, verifier?: any) => Promise<void>;
    verifyOtp: (phone: string, code: string, idToken?: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [verificationId, setVerificationId] = useState<ConfirmationResult | null>(null);

    // Load session on mount
    useEffect(() => {
        loadSession();
    }, []);

    const loadSession = async () => {
        try {
            console.log("Loading session...");
            const session = await getSessionAPI();
            console.log("Session loaded:", session);
            if (session?.user) {
                console.log("Setting user:", session.user);
                setUser(session.user);
            } else {
                console.log("No user in session");
                setUser(null);
            }
        } catch (error) {
            console.error("Failed to load session:", error);
            setUser(null);
        } finally {
            setIsLoaded(true);
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const response = await signInWithEmail(email, password);
            setUser(response.user);
        } catch (error) {
            throw error;
        }
    };

    const signUp = async (
        email: string,
        password: string,
        name: string,
        gender: boolean,
        phoneNumber: string,
        city: string,
    ) => {
        try {
            const response = await signUpWithEmail(email, password, name, gender, phoneNumber, city);
            // Don't set user yet - wait for email verification
            // setUser(response.user);
        } catch (error) {
            throw error;
        }
    };

    const verifyEmail = async (email: string, code: string) => {
        try {
            const response = await verifyEmailAPI(email, code);
            if (response.user) {
                setUser(response.user);
            }
        } catch (error) {
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await signOutUser();
            setUser(null);
        } catch (error) {
            console.error("Sign out error:", error);
            // Clear user anyway
            setUser(null);
        }
    };

    const refreshSession = async () => {
        await loadSession();
    };

    const sendVerificationCode = async (email: string) => {
        try {
            await sendVerificationCodeAPI(email);
        } catch (error) {
            throw error;
        }
    };

    const sendOtp = async (phone: string, verifier?: any) => {
        try {
            const result = await sendOtpAPI(phone);
            // Check if backend signaled to use Firebase
            if (result.useFirebase) {
                if (!verifier) {
                    throw new Error("Recaptcha Verifier is required for Firebase SMS");
                }
                console.log("Initiating Firebase SMS...");
                const confirmation = await signInWithPhoneNumber(auth, phone, verifier);
                setVerificationId(confirmation);
                console.log("Firebase SMS sent successfully");
            }
        } catch (error) {
            throw error;
        }
    };

    const verifyOtp = async (phone: string, code: string, idToken?: string) => {
        // If idToken is explicitly passed, use it. Otherwise, look for local firebase confirmation.
        let finalIdToken = idToken;

        if (!finalIdToken && verificationId) {
            try {
                console.log("Verifying with Firebase...");
                const credential = await verificationId.confirm(code);
                if (credential.user) {
                    finalIdToken = await credential.user.getIdToken();
                }
            } catch (error) {
                console.error("Firebase Confirm Error:", error);
                throw new Error("Invalid code");
            }
        }

        try {
            const response = await verifyOtpAPI(phone, code, finalIdToken);
            setUser(response.session?.user || response.user);
            if (response.session) setVerificationId(null);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        isLoaded,
        isSignedIn: !!user,
        signIn,
        signUp,
        signOut,
        verifyEmail,
        sendVerificationCode,
        refreshSession,
        sendOtp,
        verifyOtp,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const useUser = () => {
    const context = useAuth();
    return { ...context, logout: context.signOut };
};
