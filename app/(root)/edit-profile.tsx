import { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity, Image, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { useFetch } from "@/lib/fetch";
import { useUser } from "@/lib/auth-context";
import Skeleton from "@/components/Skeleton";
import { icons } from "@/constants";
import { cleanUrl } from "@/lib/utils";

const EditProfile = () => {
    const { user } = useUser();
    const { data: profileData, loading: loadingData } = useFetch<any>("/api/driver/profile");

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        profileImageUrl: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (profileData?.driver) {
            setForm({
                firstName: profileData.driver.firstName || "",
                lastName: profileData.driver.lastName || "",
                phone: profileData.driver.phone || "",
                email: user?.email || "",
                profileImageUrl: cleanUrl(profileData.driver.profileImageUrl) || "",
            });
        }
    }, [profileData, user]);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            await handleUpload(result.assets[0].uri);
        }
    };

    const handleUpload = async (uri: string) => {
        setUploading(true);
        try {
            const token = await SecureStore.getItemAsync("session_token");
            const uploadUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/upload`;

            const formData = new FormData();
            formData.append("file", {
                uri: uri,
                name: `profile-${Date.now()}.jpg`,
                type: "image/jpeg",
            } as any);

            const response = await fetch(uploadUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = "Upload failed";
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || errorMessage;
                } catch (e) {
                    // ignore parse error logic
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            setForm(prev => ({ ...prev, profileImageUrl: result.url }));
        } catch (error: any) {
            Alert.alert("Error", "Failed to upload image: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleUpdate = async () => {
        if (!form.firstName || !form.lastName) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        Alert.alert(
            "Confirm Changes",
            "Updating your profile will require a new verification process. You will be temporarily unapproved and offline until the review is complete. Do you want to proceed?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Proceed",
                    style: "destructive",
                    onPress: async () => {
                        setIsSubmitting(true);
                        try {
                            const token = await SecureStore.getItemAsync("session_token");
                            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/driver/profile`, {
                                method: "PATCH",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                    firstName: form.firstName,
                                    lastName: form.lastName,
                                    profileImageUrl: form.profileImageUrl,
                                }),
                            });

                            const result = await response.json();

                            if (!response.ok) {
                                throw new Error(result.error || "Failed to update profile");
                            }

                            Alert.alert("Success", "Profile updated. Your account is now under review.", [
                                { text: "OK", onPress: () => router.back() }
                            ]);
                        } catch (error: any) {
                            Alert.alert("Error", error.message);
                        } finally {
                            setIsSubmitting(false);
                        }
                    }
                }
            ]
        );
    };

    if (loadingData) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <Stack.Screen options={{ headerShown: false }} />
                <ScrollView className="px-5">
                    <View className="flex-row items-center my-5">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <Image source={icons.backArrow} className="w-6 h-6" resizeMode="contain" />
                        </TouchableOpacity>
                        <Text className="text-2xl font-JakartaBold">Edit Profile</Text>
                    </View>
                    <View className="items-center mb-5">
                        <Skeleton width={100} height={100} borderRadius={50} />
                    </View>
                    <View className="mb-5">
                        <Skeleton width={100} height={20} style={{ marginBottom: 8 }} />
                        <Skeleton height={50} borderRadius={50} />
                    </View>
                    <View className="mb-5">
                        <Skeleton width={100} height={20} style={{ marginBottom: 8 }} />
                        <Skeleton height={50} borderRadius={50} />
                    </View>
                    <Skeleton height={50} borderRadius={50} style={{ marginTop: 24 }} />
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="flex-row items-center my-5">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Image source={icons.backArrow} className="w-6 h-6" resizeMode="contain" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-JakartaBold">Edit Profile</Text>
                </View>

                <View className="items-center mb-10">
                    <View className="relative">
                        <Image
                            source={form.profileImageUrl ? { uri: form.profileImageUrl } : icons.profile}
                            className="w-28 h-28 rounded-full border-4 border-white shadow-xl bg-neutral-100"
                        />
                        <TouchableOpacity
                            onPress={handlePickImage}
                            disabled={uploading}
                            className="absolute bottom-1 right-1 bg-[#9D00FF] p-2.5 rounded-full border-4 border-white shadow-md"
                        >
                            <Image source={icons.point} className="w-4 h-4" tintColor="white" resizeMode="contain" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={handlePickImage} disabled={uploading}>
                        <Text className="text-sm font-JakartaBold text-[#9D00FF] mt-4">
                            {uploading ? "Uploading..." : "Change Photo"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="gap-5 px-1">
                    <InputField
                        label="First Name"
                        placeholder="Enter your first name"
                        value={form.firstName}
                        onChangeText={(text) => setForm({ ...form, firstName: text })}
                        editable={!isSubmitting}
                        labelStyle="ml-1"
                    />

                    <InputField
                        label="Last Name"
                        placeholder="Enter your last name"
                        value={form.lastName}
                        onChangeText={(text) => setForm({ ...form, lastName: text })}
                        editable={!isSubmitting}
                        labelStyle="ml-1"
                    />

                    <InputField
                        label="Email Address"
                        placeholder="email@example.com"
                        value={form.email}
                        editable={false}
                        containerStyle="bg-neutral-50 opacity-60 border-neutral-100"
                        labelStyle="ml-1"
                    />

                    <InputField
                        label="Phone Number"
                        placeholder="+234..."
                        value={form.phone}
                        editable={false}
                        containerStyle="bg-neutral-50 opacity-60 border-neutral-100"
                        labelStyle="ml-1"
                    />
                </View>

                <CustomButton
                    title="Save Changes"
                    onPress={handleUpdate}
                    className="mt-12 shadow-lg shadow-purple-200"
                    isLoading={isSubmitting || uploading}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditProfile;
