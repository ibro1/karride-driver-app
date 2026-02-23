import { router } from "expo-router";
import React, { useCallback, useState, useRef, useMemo } from "react";
import FirebaseRecaptchaVerifierModal from "@/components/FirebaseRecaptchaVerifierModal";
import { firebaseConfig } from "@/lib/firebase";
import {
  Alert,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  Keyboard,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import CustomButton from "@/components/CustomButton";
import { icons } from "@/constants";
import { useAuth } from "@/lib/auth-context";

const countries = [
  { code: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "+1", flag: "🇺🇸", name: "United States" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+254", flag: "🇰🇪", name: "Kenya" },
  { code: "+233", flag: "🇬🇭", name: "Ghana" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+250", flag: "🇷🇼", name: "Rwanda" },
  { code: "+256", flag: "🇺🇬", name: "Uganda" },
  { code: "+255", flag: "🇹🇿", name: "Tanzania" },
  { code: "+225", flag: "🇨🇮", name: "Côte d'Ivoire" },
];

const SignIn = () => {
  const { sendOtp, isLoaded } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState("");
  const recaptchaVerifier = useRef(null);

  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["60%", "90%"], []);

  const handleOpenPress = useCallback(() => {
    Keyboard.dismiss();
    bottomSheetModalRef.current?.present();
  }, []);

  const handleClosePress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} opacity={0.5} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    []
  );

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;
    if (isSubmitting) return;

    let cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.startsWith("0")) cleanPhone = cleanPhone.substring(1);

    if (!cleanPhone || cleanPhone.length < 9 || cleanPhone.length > 11) {
      Alert.alert("Error", "Please enter a valid phone number (9-11 digits)");
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedPhone = `${selectedCountry.code}${cleanPhone}`;

      console.log("\n====================================================");
      console.log(">>> 📱 [DRIVER] SENDING OTP TO:", formattedPhone);
      console.log("====================================================\n");

      await sendOtp(formattedPhone, recaptchaVerifier.current);

      router.push({ pathname: "/(auth)/verification", params: { phone: formattedPhone } });
    } catch (err: any) {
      console.error("Sign in error:", err);
      Alert.alert("Error", err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [isLoaded, phone, sendOtp, selectedCountry]);

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
            Welcome{"\n"}Partner 👋
          </Text>
          <Text className="text-lg text-gray-500 font-Jakarta mb-10 leading-7">
            Enter your phone number to continue mapping your success.
          </Text>

          <View className="flex-row items-center w-full h-16 bg-neutral-100 rounded-2xl px-5 border border-neutral-100 focus:border-primary-500">
            <TouchableOpacity onPress={handleOpenPress} className="flex-row items-center mr-3 h-full">
              <Text className="text-3xl mr-2">{selectedCountry.flag}</Text>
              <Text className="text-lg font-JakartaSemiBold text-black">{selectedCountry.code}</Text>
              <Image source={icons.arrowDown} className="w-4 h-4 ml-2 opacity-40" resizeMode="contain" />
            </TouchableOpacity>

            <View className="w-[1px] h-8 bg-neutral-300 mx-2" />

            <TextInput
              className="flex-1 text-xl font-JakartaSemiBold text-black h-full ml-2 pb-1"
              placeholder="0801 234 5678"
              placeholderTextColor="#A0A0A0"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              returnKeyType="done"
              onSubmitEditing={onSignInPress}
              autoFocus
            />
          </View>
        </View>

        <View className="pb-4 pt-6">
          <CustomButton
            title="Continue"
            onPress={onSignInPress}
            isLoading={isSubmitting}
            className="h-14 shadow-md shadow-neutral-400/30"
          />
        </View>
      </KeyboardAwareScrollView>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: "#E5E5E5", width: 40, height: 5 }}
        backgroundStyle={{ borderRadius: 32 }}
      >
        <View className="flex-1 px-6 pt-2 pb-8">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-JakartaBold text-black tracking-tight">Select Country</Text>
            <TouchableOpacity onPress={handleClosePress} className="p-2 bg-neutral-100 rounded-full">
              <Text className="text-sm font-JakartaSemiBold text-neutral-600">Close</Text>
            </TouchableOpacity>
          </View>

          <BottomSheetFlatList
            data={countries}
            keyExtractor={(item) => item.name}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center p-4 mb-2 bg-neutral-50 rounded-2xl active:bg-neutral-100"
                onPress={() => {
                  setSelectedCountry(item);
                  handleClosePress();
                }}
              >
                <Text className="text-3xl mr-4">{item.flag}</Text>
                <View className="flex-1">
                  <Text className="text-lg font-JakartaSemiBold text-black">{item.name}</Text>
                  <Text className="text-sm text-gray-500 font-JakartaMedium">{item.code}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </BottomSheetModal>

      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
      />
    </SafeAreaView>
  );
};

export default SignIn;
