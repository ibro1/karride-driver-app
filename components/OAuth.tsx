import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { useEffect, useState } from "react";
import { Alert, Image, View, Platform } from "react-native";
import { router } from "expo-router";
import CustomButton from "@/components/CustomButton";
import { icons } from "@/constants";
import { signInWithGoogle, signInWithApple } from "@/lib/auth-api";
import { useAuth } from "@/lib/auth-context";

const OAuth = () => {
    const { refreshSession } = useAuth();
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isAppleLoading, setIsAppleLoading] = useState(false);

    useEffect(() => {
        // Configure Google Sign-In
        GoogleSignin.configure({
            webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, // Ensure this is set if backend verification is needed for web client
            iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
            scopes: ['profile', 'email'],
        });
    }, []);

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            if (userInfo.idToken) {
                const result = await signInWithGoogle(userInfo.idToken);
                if (result.success) {
                    await refreshSession();
                    router.replace("/(root)/(tabs)/home");
                } else {
                    Alert.alert("Sign In Failed", result.error || "Could not sign in.");
                    // Sign out if backend auth fails so user can try again
                    await GoogleSignin.signOut();
                }
            } else {
                Alert.alert("Error", "No ID Token returned from Google.");
            }
        } catch (error: any) {
            // statusCodes.SIGN_IN_CANCELLED etc are available if needed
            console.error("Google Sign-In error:", error);
            if (error.code !== 'SIGN_IN_CANCELLED') {
                Alert.alert("Error", error.message || "Failed to sign in with Google.");
            }
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleAppleSignIn = async () => {
        setIsAppleLoading(true);
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            const { identityToken, fullName, email } = credential;

            if (identityToken) {
                const result = await signInWithApple(identityToken, {
                    name: fullName ? `${fullName.givenName} ${fullName.familyName}` : undefined,
                    email: email || undefined,
                });
                if (result.success) {
                    await refreshSession();
                    router.replace("/(root)/(tabs)/home");
                } else {
                    Alert.alert("Sign In Failed", result.error || "Could not sign in.");
                }
            }
        } catch (error: any) {
            if (error.code === 'ERR_REQUEST_CANCELED') {
                // handle that the user canceled the sign-in flow
                console.log("Apple sign in cancelled");
            } else {
                // handle other errors
                Alert.alert("Error", error.message || "Apple Sign-In failed.");
            }
        } finally {
            setIsAppleLoading(false);
        }
    };

    return (
        <View>
            <CustomButton
                title="Continue with Google"
                className="mt-5 w-full shadow-none"
                IconLeft={() => (
                    <Image source={icons.google} resizeMode="contain" className="w-5 h-5 mx-2" />
                )}
                bgVariant="outline"
                textVariant="primary"
                onPress={handleGoogleSignIn}
                isLoading={isGoogleLoading}
            />

            {Platform.OS === "ios" && (
                <View className="mt-4">
                    <AppleAuthentication.AppleAuthenticationButton
                        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                        cornerRadius={5}
                        style={{ width: "100%", height: 50 }}
                        onPress={handleAppleSignIn}
                    />
                </View>
            )}
        </View>
    );
};

export default OAuth;
