import { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert, Image, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Stack } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { useFetch } from "@/lib/fetch";
import Skeleton from "@/components/Skeleton";
import { icons } from "@/constants";
import { cleanUrl } from "@/lib/utils";

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
        if (profileData?.vehicle) {
            setForm({
                make: profileData.vehicle.make || "",
                model: profileData.vehicle.model || "",
                year: profileData.vehicle.year?.toString() || "",
                color: profileData.vehicle.color || "",
                plateNumber: profileData.vehicle.plateNumber || "",
                carSeats: profileData.vehicle.seats?.toString() || "",
            });
            setCarImage(cleanUrl(profileData.vehicle.vehicleImageUrl));
        }

        if (profileData?.documents) {
            const docs = (profileData.documents || []).reduce((acc: any, doc: any) => {
                acc[doc.type] = cleanUrl(doc.url);
                return acc;
            }, {});
            // Check for profile license url too?
            if (profileData.driver?.licenseUrl) docs['license'] = cleanUrl(profileData.driver.licenseUrl);
            setDocuments(docs);

            const statuses = (profileData.documents || []).reduce((acc: any, doc: any) => {
                acc[doc.type] = { status: doc.status, reason: doc.rejectionReason };
                return acc;
            }, {});
            setDocStatuses(statuses);
        }
    }, [profileData]);

    const [documents, setDocuments] = useState<{ [key: string]: string }>({});
    const [docStatuses, setDocStatuses] = useState<{ [key: string]: { status: string, reason?: string } }>({});
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

    const city = profileData?.driver?.city || "State";
    const isLagos = city.toLowerCase().includes("lagos");

    const documentTypes = [
        { key: "license", label: "Driver's License / ID Card" },
        { key: "vehicle_image", label: "Vehicle Exterior Photo" },
        { key: "insurance", label: "Vehicle Insurance Check" },
        { key: "roadworthiness", label: "Road Worthiness Certificate" },
        {
            key: "hackney_permit",
            label: isLagos ? "Lagos State Hackney Permit" : `${city} Hackney Permit / Papers`
        },
        { key: "ownership_proof", label: "Proof of Ownership" },
    ];

    const pickDocument = async (type: string) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setDocuments(prev => ({ ...prev, [type]: result.assets[0].uri }));
            setDocStatuses(prev => ({ ...prev, [type]: { status: 'new_upload' } }));
        }
    };

    const handleDocumentUpload = async (docKey: string) => {
        setUploadingDoc(docKey);
        try {
            const token = await SecureStore.getItemAsync("session_token");
            let url = documents[docKey];

            // 1. Upload File
            // Re-use logic from handleUpdate or import uploadFile
            // duplicating for speed/context here as handleUpdate logic is a bit manual
            if (url && !url.startsWith("http")) {
                const uploadUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/upload`;
                const formData = new FormData();
                const filename = url.split('/').pop() || 'image.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                formData.append('file', {
                    uri: Platform.OS === 'android' ? url : url.replace('file://', ''),
                    name: filename,
                    type: type,
                } as any);

                const uploadRes = await fetch(uploadUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error("Upload failed");
                const uploadData = await uploadRes.json();
                url = uploadData.url;
            }

            // 2. Save Document via Onboarding API (re-using it as it handles upsert)
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/driver/onboarding/documents`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    city: city, // Required by schema
                    documents: [{ type: docKey, url }]
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Save failed");
            }

            Alert.alert("Success", "Document updated successfully");

            // Update status to pending/uploaded
            setDocStatuses(prev => ({ ...prev, [docKey]: { status: 'pending' } }));
            // Update url to remote url
            setDocuments(prev => ({ ...prev, [docKey]: url }));

        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setUploadingDoc(null);
        }
    };


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

        Alert.alert(
            "Confirm Changes",
            "Updating your vehicle details will require a new verification process. You will be temporarily unapproved and offline until the review is complete. Do you want to proceed?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Proceed",
                    style: "destructive",
                    onPress: async () => {
                        setIsSubmitting(true);
                        try {
                            const token = await SecureStore.getItemAsync("session_token");

                            let finalCarImageUrl = profileData?.vehicle?.vehicleImageUrl;

                            // Upload car image if changed
                            if (carImage && carImage !== profileData?.vehicle?.vehicleImageUrl) {
                                console.log("Starting image upload...");
                                const uploadUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/upload`;

                                // Prepare FormData
                                const formData = new FormData();
                                const filename = carImage.split('/').pop() || 'image.jpg';
                                const match = /\.(\w+)$/.exec(filename);
                                const type = match ? `image/${match[1]}` : 'image/jpeg';

                                formData.append('file', {
                                    uri: Platform.OS === 'android' ? carImage : carImage.replace('file://', ''),
                                    name: filename,
                                    type: type,
                                } as any);

                                // Use fetch for upload
                                const uploadResponse = await fetch(uploadUrl, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Accept': 'application/json',
                                    },
                                    body: formData,
                                });

                                console.log("Upload status:", uploadResponse.status);

                                if (uploadResponse.ok) {
                                    const uploadResult = await uploadResponse.json();
                                    finalCarImageUrl = uploadResult.url;
                                    console.log("Image upload success:", finalCarImageUrl);
                                } else {
                                    const errorText = await uploadResponse.text();
                                    console.error("Upload failed response:", errorText);

                                    let errorMessage = "Image upload failed";
                                    try {
                                        const errorJson = JSON.parse(errorText);
                                        errorMessage = errorJson.error || errorMessage;
                                    } catch (e) {
                                        if (uploadResponse.status === 500) errorMessage = "Server error during upload";
                                    }

                                    throw new Error(errorMessage);
                                }
                            }

                            console.log("Saving vehicle data:", { ...form, finalCarImageUrl });

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
                                    carImageUrl: finalCarImageUrl,
                                }),
                            });

                            const result = await response.json();

                            if (!response.ok) {
                                throw new Error(result.error || "Failed to update vehicle");
                            }

                            Alert.alert("Success", "Vehicle details updated. Your account is now under review.", [
                                { text: "OK", onPress: () => router.back() }
                            ]);
                        } catch (error: any) {
                            console.error("Update error:", error);
                            Alert.alert("Error", error.message || "An unexpected error occurred");
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
                        <Text className="text-2xl font-JakartaBold">Edit Vehicle</Text>
                    </View>

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
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="flex-row items-center my-5">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Image source={icons.backArrow} className="w-6 h-6" resizeMode="contain" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-JakartaBold">Edit Vehicle</Text>
                </View>

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
                    labelStyle="ml-1"
                />

                <InputField
                    label="Model"
                    placeholder="e.g. Camry"
                    value={form.model}
                    onChangeText={(text) => setForm({ ...form, model: text })}
                    editable={!isSubmitting}
                    labelStyle="ml-1"
                />

                <InputField
                    label="Year"
                    placeholder="e.g. 2020"
                    value={form.year}
                    onChangeText={(text) => setForm({ ...form, year: text })}
                    keyboardType="numeric"
                    editable={!isSubmitting}
                    labelStyle="ml-1"
                />

                <InputField
                    label="Color"
                    placeholder="e.g. Silver"
                    value={form.color}
                    onChangeText={(text) => setForm({ ...form, color: text })}
                    editable={!isSubmitting}
                    labelStyle="ml-1"
                />

                <InputField
                    label="Plate Number"
                    placeholder="Enter plate number"
                    value={form.plateNumber}
                    onChangeText={(text) => setForm({ ...form, plateNumber: text })}
                    editable={!isSubmitting}
                    labelStyle="ml-1"
                />

                <InputField
                    label="Car Seats"
                    placeholder="e.g. 4"
                    value={form.carSeats}
                    onChangeText={(text) => setForm({ ...form, carSeats: text })}
                    keyboardType="numeric"
                    editable={!isSubmitting}
                    labelStyle="ml-1"
                />

                <CustomButton
                    title="Save Vehicle Details"
                    onPress={handleUpdate}
                    className="mt-6"
                    isLoading={isSubmitting}
                />

                <View className="h-[1px] bg-gray-200 my-8" />

                <Text className="text-xl font-JakartaBold mb-5">Documents</Text>

                {documentTypes.map((doc) => {
                    const statusInfo = docStatuses[doc.key];
                    const isRejected = statusInfo?.status === 'rejected';
                    const isNewUpload = statusInfo?.status === 'new_upload';

                    return (
                        <View key={doc.key} className="bg-neutral-100 p-4 rounded-xl mb-3 border border-neutral-200">
                            <View className="flex-row items-center justify-between">
                                <Text className="font-JakartaMedium text-base flex-1">{doc.label}</Text>
                                <TouchableOpacity
                                    onPress={() => pickDocument(doc.key)}
                                    className={`px-4 py-2 rounded-full ${isRejected ? "bg-red-100 border border-red-300" :
                                        (documents[doc.key] && !isNewUpload) ? "bg-green-100" :
                                            isNewUpload ? "bg-blue-100" : "bg-white border border-neutral-300"
                                        }`}
                                >
                                    <Text className={`${isRejected ? "text-red-700 font-bold" :
                                        (documents[doc.key] && !isNewUpload) ? "text-green-700 font-bold" :
                                            isNewUpload ? "text-blue-700 font-bold" : "text-black"
                                        }`}>
                                        {isRejected ? "Re-upload" :
                                            isNewUpload ? "Selected" :
                                                documents[doc.key] ? "Uploaded ✓" : "Upload"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            {isRejected && statusInfo?.reason && (
                                <Text className="text-red-500 text-sm mt-2 ml-1">
                                    Reason: {statusInfo.reason}
                                </Text>
                            )}
                            {isNewUpload && (
                                <View className="mt-2 flex-row justify-end">
                                    <TouchableOpacity
                                        onPress={() => handleDocumentUpload(doc.key)}
                                        disabled={uploadingDoc === doc.key}
                                        className="bg-primary-500 px-4 py-2 rounded-lg"
                                    >
                                        <Text className="text-white font-bold text-sm">
                                            {uploadingDoc === doc.key ? "Uploading..." : "Save Update"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    );
                })}

                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditVehicle;
