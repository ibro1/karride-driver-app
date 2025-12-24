import { router } from "expo-router";
import { useCallback, useState, useRef } from "react";
import { Alert, Image, ScrollView, Text, View, TouchableOpacity, FlatList } from "react-native";
import { ReactNativeModal } from "react-native-modal";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { icons, images } from "@/constants";
import { useAuth } from "@/lib/auth-context";
import { firebaseConfig } from "../../lib/firebase";

const countries = [
  { code: "NG", name: "Nigeria", dial_code: "+234", flag: "🇳🇬" },
  { code: "US", name: "United States", dial_code: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dial_code: "+44", flag: "🇬🇧" },
  { code: "GH", name: "Ghana", dial_code: "+233", flag: "🇬🇭" },
  { code: "ZA", name: "South Africa", dial_code: "+27", flag: "🇿🇦" },
  { code: "KE", name: "Kenya", dial_code: "+254", flag: "🇰🇪" },
  { code: "CA", name: "Canada", dial_code: "+1", flag: "🇨🇦" },
];

const SignIn = () => {
  const { sendOtp, isLoaded } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recaptchaVerifier = useRef(null);

  const [form, setForm] = useState({
    phone: "",
    countryCode: "+234",
    countryFlag: "🇳🇬",
  });

  const [isCountryPickerVisible, setCountryPickerVisible] = useState(false);

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;
    if (!form.phone) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }

    setIsSubmitting(true);

    try {
      // Remove leading zero if present
      let phoneNumber = form.phone;
      if (phoneNumber.startsWith("0")) {
        phoneNumber = phoneNumber.substring(1);
      }

      const fullPhone = `${form.countryCode}${phoneNumber}`;
      // Pass verifier to sendOtp
      await sendOtp(fullPhone, recaptchaVerifier.current);

      router.push({
        pathname: "/(auth)/verification",
        params: { phone: fullPhone }
      });
    } catch (err: any) {
      console.error("Sign in error:", err);
      Alert.alert("Error", err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [isLoaded, form, sendOtp]);

  const renderCountryItem = ({ item }: { item: typeof countries[0] }) => (
    <TouchableOpacity
      className="flex-row items-center p-3 border-b border-gray-100"
      onPress={() => {
        setForm({ ...form, countryCode: item.dial_code, countryFlag: item.flag });
        setCountryPickerVisible(false);
      }}
    >
      <Text className="text-2xl mr-3">{item.flag}</Text>
      <Text className="text-base font-JakartaMedium flex-1 text-black">{item.name}</Text>
      <Text className="text-base text-gray-500">{item.dial_code}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Welcome Driver 👋
          </Text>
        </View>

        <View className="p-5">
          <Text className="text-lg font-JakartaSemiBold mb-3">Phone Number</Text>
          <InputField
            label=""
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(value) => setForm({ ...form, phone: value })}
            prefix={
              <TouchableOpacity
                onPress={() => setCountryPickerVisible(true)}
                className="flex-row items-center mr-2 px-2 py-1 bg-neutral-100 rounded-md"
              >
                <Text className="text-lg mr-1">{form.countryFlag}</Text>
                <Text className="text-base font-JakartaMedium text-neutral-700">{form.countryCode}</Text>
                <Image source={icons.arrowDown} className="w-3 h-3 ml-1" resizeMode="contain" />
              </TouchableOpacity>
            }
          />

          <CustomButton
            title="Continue"
            onPress={onSignInPress}
            className="mt-6"
            isLoading={isSubmitting}
          />

          <ReactNativeModal
            isVisible={isCountryPickerVisible}
            onBackdropPress={() => setCountryPickerVisible(false)}
            onBackButtonPress={() => setCountryPickerVisible(false)}
            style={{ margin: 0, justifyContent: "flex-end" }}
          >
            <View className="bg-white rounded-t-3xl h-[60%] p-5">
              <Text className="text-xl font-JakartaBold mb-4 text-center">Select Country</Text>
              <FlatList
                data={countries}
                keyExtractor={(item) => item.code}
                renderItem={renderCountryItem}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </ReactNativeModal>

          <FirebaseRecaptchaVerifierModal
            ref={recaptchaVerifier}
            firebaseConfig={firebaseConfig}
          />

        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;
