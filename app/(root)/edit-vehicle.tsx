import { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { useFetch } from "@/lib/fetch";
import Skeleton from "@/components/Skeleton";
import { icons } from "@/constants";

const EditVehicle = () => {
    const { data: profileData, loading: loadingData } = useFetch<any>("/api/driver/profile");

    const [form, setForm] = useState({
        make: "",
        model: "",
        year: "",
        color: "",
        plateNumber: "",
        carSeats: "",
    });
    const [carImage, setCarImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        console.log("EditVehicle: profileData changed", JSON.stringify(profileData, null, 2));
        if (profileData?.vehicle) {
            console.log("EditVehicle: Setting form with", profileData.vehicle);
            setForm({
                make: profileData.vehicle.make || "",
                model: profileData.vehicle.model || "",
                year: profileData.vehicle.year?.toString() || "",
                color: profileData.vehicle.color || "",
                plateNumber: profileData.vehicle.plateNumber || "",
                carSeats: profileData.vehicle.seats?.toString() || "",
            });
            setCarImage(profileData.vehicle.carImageUrl || null);
        }
    }, [profileData]);


    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Denied", "We need camera roll permissions to upload your car image");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setCarImage(result.assets[0].uri);
        }
    };

    const handleUpdate = async () => {
        if (!form.make || !form.model || !form.year || !form.color || !form.plateNumber || !form.carSeats) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const token = await import("expo-secure-store").then(s => s.getItemAsync("session_token"));

            // Upload car image if changed
            let carImageUrl = profileData?.vehicle?.carImageUrl;
            if (carImage && carImage !== profileData?.vehicle?.carImageUrl) {
                const uploadUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/upload`;
                const uploadResponse = await FileSystem.uploadAsync(uploadUrl, carImage, {
                    fieldName: "file",
                    httpMethod: "POST",
                    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (uploadResponse.status === 200) {
                    const uploadResult = JSON.parse(uploadResponse.body);
                    carImageUrl = uploadResult.url;
                }
            }

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/driver/vehicle`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...form,
                    year: parseInt(form.year),
                    carSeats: parseInt(form.carSeats),
                    carImageUrl,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to update vehicle");
            }

            Alert.alert("Success", "Vehicle updated successfully", [
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
                    <Text className="text-2xl font-JakartaBold my-5">Edit Vehicle</Text>

                    {[1, 2, 3, 4, 5].map((i) => (
                        <View key={i} className="mb-5">
                            <Skeleton width={100} height={20} style={{ marginBottom: 8 }} />
                            <Skeleton height={50} borderRadius={50} />
                        </View>
                    ))}

                    <Skeleton height={50} borderRadius={50} style={{ marginTop: 24 }} />
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 100 }}>
                <Text className="text-2xl font-JakartaBold my-5">Edit Vehicle</Text>

                {/* Car Image Upload */}
                <View className="mb-5">
                    <Text className="text-lg font-JakartaSemiBold mb-3">Car Image</Text>
                    <TouchableOpacity
                        onPress={pickImage}
                        className="bg-general-600 rounded-2xl p-4 items-center justify-center border-2 border-dashed border-gray-300"
                        style={{ height: 180 }}
                        disabled={isSubmitting}
                    >
                        {carImage ? (
                            <Image
                                source={{ uri: carImage }}
                                className="w-full h-full rounded-xl"
                                resizeMode="contain"
                            />
                        ) : (
                            <View className="items-center">
                                <Image source={icons.point} className="w-12 h-12 mb-2" tintColor="#9CA3AF" />
                                <Text className="text-gray-500 font-JakartaMedium">Tap to upload car image</Text>
                                <Text className="text-gray-400 text-sm mt-1">Recommended: 16:9 aspect ratio</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <InputField
                    label="Make"
                    placeholder="e.g. Toyota"
                    value={form.make}
                    onChangeText={(text) => setForm({ ...form, make: text })}
                    editable={!isSubmitting}
                />

                <InputField
                    label="Model"
                    placeholder="e.g. Camry"
                    value={form.model}
                    onChangeText={(text) => setForm({ ...form, model: text })}
                    editable={!isSubmitting}
                />

                <InputField
                    label="Year"
                    placeholder="e.g. 2020"
                    value={form.year}
                    onChangeText={(text) => setForm({ ...form, year: text })}
                    keyboardType="numeric"
                    editable={!isSubmitting}
                />

                <InputField
                    label="Color"
                    placeholder="e.g. Silver"
                    value={form.color}
                    onChangeText={(text) => setForm({ ...form, color: text })}
                    editable={!isSubmitting}
                />

                <InputField
                    label="Plate Number"
                    placeholder="Enter plate number"
                    value={form.plateNumber}
                    onChangeText={(text) => setForm({ ...form, plateNumber: text })}
                    editable={!isSubmitting}
                />

                <InputField
                    label="Car Seats"
                    placeholder="e.g. 4"
                    value={form.carSeats}
                    onChangeText={(text) => setForm({ ...form, carSeats: text })}
                    keyboardType="numeric"
                    editable={!isSubmitting}
                />

                <CustomButton
                    title="Save Changes"
                    onPress={handleUpdate}
                    className="mt-6"
                    isLoading={isSubmitting}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditVehicle;
