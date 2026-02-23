import { useLocalSearchParams, router } from "expo-router";
import React, { useCallback, useState, useEffect, useRef } from "react";
import { Alert, Text, View, TextInput, TouchableOpacity, Platform, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import { icons, images } from "@/constants";
import { useAuth } from "@/lib/auth-context";

const CODE_LENGTH = 6;

const Verification = () => {
    const { phone } = useLocalSearchParams();
    const { verifyOtp, isLoaded } = useAuth();

    const [code, setCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);
    const inputRef = useRef<TextInput>(null);

    // Focus input on mount
    useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    }, []);

    const onVerifyPress = useCallback(async () => {
        if (!isLoaded || !phone) return;
        if (isSubmitting) return;

        if (code.length < CODE_LENGTH) {
            Alert.alert("Error", "Please enter a valid OTP");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await verifyOtp(phone as string, code);

            if (response.success) {
                const isNew = response.isNewUser;
                setIsNewUser(!!isNew);

                if (isNew) {
                    setShowSuccessModal(true);
                } else {
                    router.replace("/(root)/(tabs)/home");
                }
            } else {
                Alert.alert("Error", response.error || "Verification failed");
                setCode("");
                inputRef.current?.focus();
            }
        } catch (err: any) {
            Alert.alert("Error", err.message || "Invalid code");
        } finally {
            setIsSubmitting(false);
        }
    }, [isLoaded, phone, code, verifyOtp, isSubmitting]);

    // Auto submit when 6 digits are typed
    useEffect(() => {
        if (code.length === CODE_LENGTH) {
            onVerifyPress();
        }
    }, [code, onVerifyPress]);

    const handleContainerPress = () => {
        inputRef.current?.focus();
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between", padding: 24 }}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
                extraScrollHeight={Platform.OS === "ios" ? 20 : 0}
            >
                <View className="flex-1 mt-6">
                    <Text className="text-4xl text-black font-JakartaExtraBold mb-3 tracking-tight">
                        Verify your{"\n"}number
                    </Text>
                    <Text className="text-lg text-gray-500 font-Jakarta mb-10 leading-7">
                        Enter the {CODE_LENGTH}-digit code sent to {phone}
                    </Text>

                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={handleContainerPress}
                        className="flex-row w-full justify-between items-center h-16 relative"
                    >
                        {[...Array(CODE_LENGTH)].map((_, index) => {
                            const isFocused = code.length === index;
                            const isFilled = code.length > index;
                            const digit = code[index] || "";

                            return (
                                <View
                                    key={index}
                                    className={`w-[14%] aspect-square rounded-2xl justify-center items-center border-[1.5px] ${isFocused
                                        ? "border-primary-500 bg-primary-100/30"
                                        : isFilled
                                            ? "border-neutral-200 bg-white"
                                            : "border-neutral-100 bg-neutral-50"
                                        }`}
                                >
                                    <Text className="text-2xl font-JakartaExtraBold text-black">{digit}</Text>
                                    {isFocused && (
                                        <View className="absolute bottom-2 w-4 h-0.5 bg-primary-500 rounded-full animate-pulse" />
                                    )}
                                </View>
                            );
                        })}

                        <TextInput
                            ref={inputRef}
                            className="absolute w-full h-full opacity-0"
                            value={code}
                            onChangeText={(text) => setCode(text.replace(/[^0-9]/g, "").slice(0, CODE_LENGTH))}
                            keyboardType="number-pad"
                            textContentType="oneTimeCode"
                            autoComplete="sms-otp"
                            caretHidden
                        />
                    </TouchableOpacity>
                </View>

                <View className="pb-4 pt-6">
                    <CustomButton
                        title="Verify Code"
                        onPress={onVerifyPress}
                        className="h-14 shadow-md shadow-neutral-400/30"
                        isLoading={isSubmitting}
                    />
                </View>
            </KeyboardAwareScrollView>

            <ReactNativeModal
                isVisible={showSuccessModal}
                animationIn="zoomIn"
                animationOut="zoomOut"
                backdropOpacity={0.4}
                useNativeDriver
            >
                <View className="bg-white px-8 py-10 rounded-3xl mx-4 items-center">
                    <View className="bg-green-100 w-24 h-24 rounded-full justify-center items-center mb-6">
                        <Image
                            source={images.check}
                            className="w-14 h-14"
                            resizeMode="contain"
                        />
                    </View>
                    <Text className="text-3xl font-JakartaExtraBold text-black text-center tracking-tight mb-3">
                        Verified!
                    </Text>
                    <Text className="text-base text-gray-500 font-Jakarta text-center leading-6 mb-8 px-2">
                        Your account has been successfully verified. Welcome to the team!
                    </Text>
                    <CustomButton
                        title="Dive In"
                        onPress={() => {
                            setShowSuccessModal(false);
                            if (isNewUser) {
                                router.replace("/(auth)/onboarding");
                            } else {
                                router.replace("/(root)/(tabs)/home");
                            }
                        }}
                        className="w-full h-14 shadow-lg shadow-neutral-400/30"
                    />
                </View>
            </ReactNativeModal>
        </SafeAreaView>
    );
};

export default Verification;
