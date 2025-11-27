import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";
import { useAuth } from "@/lib/auth-context";

const SignUp = () => {
  const { signUp, verifyEmail, sendVerificationCode, isLoaded } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    gender: false, // false = male, true = female
  });
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setIsSubmitting(true);
    try {
      await signUp(form.email, form.password, form.name, form.gender);
      setVerification({
        ...verification,
        state: "pending",
      });
    } catch (err: any) {
      console.error("Sign up error:", err);
      if (err.message.includes("already exists") || err.message.includes("User already exists")) {
        try {
          await sendVerificationCode(form.email);
          setVerification({
            ...verification,
            state: "pending",
          });
          Alert.alert("Account Exists", "An account with this email already exists. We've sent a new verification code.");
        } catch (resendErr: any) {
          Alert.alert("Error", "Account exists but failed to send verification code. Please log in.");
        }
      } else {
        Alert.alert("Error", err.message || "Sign up failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    setIsSubmitting(true);
    try {
      await verifyEmail(form.email, verification.code);
      setVerification({
        ...verification,
        state: "success",
      });
    } catch (err: any) {
      console.error("Verification error:", err);
      setVerification({
        ...verification,
        error: err.message || "Verification failed. Please try again.",
        state: "failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Create Your Account
          </Text>
        </View>
        <View className="p-5">
          <InputField
            label="Name"
            placeholder="Enter name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setForm({ ...form, name: value })}
          />
          <InputField
            label="Email"
            placeholder="Enter email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField
            label="Password"
            placeholder="Enter password"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          {/* Gender Selection */}
          <View className="mt-4">
            <Text className="text-lg font-JakartaSemiBold mb-3">Gender</Text>
            <View className="flex-row gap-3">
              <CustomButton
                title="Male"
                onPress={() => setForm({ ...form, gender: false })}
                className={`flex-1 ${!form.gender ? "bg-primary-500" : "bg-gray-200"}`}
                textVariant={!form.gender ? "default" : "primary"}
              />
              <CustomButton
                title="Female"
                onPress={() => setForm({ ...form, gender: true })}
                className={`flex-1 ${form.gender ? "bg-primary-500" : "bg-gray-200"}`}
                textVariant={form.gender ? "default" : "primary"}
              />
            </View>
          </View>

          <CustomButton
            title="Sign Up"
            onPress={onSignUpPress}
            className="mt-6"
            isLoading={isSubmitting}
          />
          <OAuth />
          <Link
            href="/sign-in"
            className="text-lg text-center text-general-200 mt-10"
          >
            Already have an account?{" "}
            <Text className="text-primary-500">Log In</Text>
          </Link>
        </View>
        <ReactNativeModal
          isVisible={verification.state === "pending" || verification.state === "failed"}
          onModalHide={() => {
            if (verification.state === "success") {
              setShowSuccessModal(true);
            }
          }}
        >
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Text className="font-JakartaExtraBold text-2xl mb-2">
              Verification
            </Text>
            <Text className="font-Jakarta mb-5">
              We've sent a verification code to {form.email}.
            </Text>
            <InputField
              label={"Code"}
              icon={icons.lock}
              placeholder={"12345"}
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) =>
                setVerification({ ...verification, code })
              }
            />
            {verification.error && (
              <Text className="text-red-500 text-sm mt-1">
                {verification.error}
              </Text>
            )}
            <CustomButton
              title="Verify Email"
              onPress={onPressVerify}
              className="mt-5 bg-success-500"
              isLoading={isSubmitting}
            />
          </View>
        </ReactNativeModal>
        <ReactNativeModal isVisible={showSuccessModal}>
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Image
              source={images.check}
              className="w-[110px] h-[110px] mx-auto my-5"
            />
            <Text className="text-3xl font-JakartaBold text-center">
              Verified
            </Text>
            <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
              You have successfully verified your account.
            </Text>
            <CustomButton
              title="Browse Home"
              onPress={() => router.push(`/(root)/(tabs)/home`)}
              className="mt-5"
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};
export default SignUp;
