import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import {
    signInWithEmail,
    signUpWithEmail,
    signOutUser,
    getSession as getSessionAPI,
    verifyEmail as verifyEmailAPI,
    sendVerificationCode as sendVerificationCodeAPI,
} from "./auth-api";

interface User {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string;
    role?: string;
    gender?: boolean;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

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
                setUser(session.user);
            } else {
                console.log("No user in session");
            }
        } catch (error) {
            console.error("Failed to load session:", error);
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
