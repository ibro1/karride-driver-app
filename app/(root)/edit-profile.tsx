import { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { useFetch } from "@/lib/fetch";
import { useUser } from "@/lib/auth-context";
import Skeleton from "@/components/Skeleton";
import { icons } from "@/constants";

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
                profileImageUrl: profileData.driver.profileImageUrl || "",
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
            const token = await import("expo-secure-store").then(s => s.getItemAsync("session_token"));

            const formData = new FormData();
            formData.append("file", {
                uri,
                name: "profile.jpg",
                type: "image/jpeg",
            } as any);

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/upload`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Upload failed");
            }

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

        setIsSubmitting(true);
        try {
            const token = await import("expo-secure-store").then(s => s.getItemAsync("session_token"));
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

            Alert.alert("Success", "Profile updated successfully", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingData) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <ScrollView className="px-5">
                    <Text className="text-2xl font-JakartaBold my-5">Edit Profile</Text>
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
            <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 100 }}>
                <Text className="text-2xl font-JakartaBold my-5">Edit Profile</Text>

                <View className="items-center mb-6">
                    <View className="relative">
                        <Image
                            source={form.profileImageUrl ? { uri: form.profileImageUrl } : icons.profile}
                            className="w-24 h-24 rounded-full border-4 border-white shadow-sm bg-neutral-100"
                        />
                        <TouchableOpacity
                            onPress={handlePickImage}
                            disabled={uploading}
                            className="absolute bottom-0 right-0 bg-[#0286FF] p-2 rounded-full border-2 border-white"
                        >
                            <Image source={icons.camera || icons.point} className="w-4 h-4" tintColor="white" resizeMode="contain" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-sm font-JakartaMedium text-[#0286FF] mt-2">
                        {uploading ? "Uploading..." : "Change Photo"}
                    </Text>
                </View>

                <InputField
                    label="First Name"
                    placeholder="Enter first name"
                    value={form.firstName}
                    onChangeText={(text) => setForm({ ...form, firstName: text })}
                    editable={!isSubmitting}
                />

                <InputField
                    label="Last Name"
                    placeholder="Enter last name"
                    value={form.lastName}
                    onChangeText={(text) => setForm({ ...form, lastName: text })}
                    editable={!isSubmitting}
                />

                <InputField
                    label="Email"
                    placeholder="Email address"
                    value={form.email}
                    editable={false}
                    containerStyle="bg-neutral-100 opacity-50"
                />

                <InputField
                    label="Phone Number"
                    placeholder="Enter phone number"
                    value={form.phone}
                    editable={false}
                    containerStyle="bg-neutral-100 opacity-50"
                />

                <CustomButton
                    title="Save Changes"
                    onPress={handleUpdate}
                    className="mt-6"
                    isLoading={isSubmitting || uploading}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditProfile;
