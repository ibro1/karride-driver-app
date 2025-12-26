import { useLocalSearchParams, router } from "expo-router";
import { View, Text, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons, images } from "@/constants";
import { useFetch, fetchAPI } from "@/lib/fetch";
import Skeleton from "@/components/Skeleton";
import { Ride } from "@/types/type";
import { formatDate, formatTime } from "@/lib/utils";

const DriverRideHistoryDetails = () => {
    const { id, autoRate } = useLocalSearchParams();
    const { data: ride, loading, error, refetch } = useFetch<Ride>(`/api/rides/${id}`);
    const [isModalVisible, setModalVisible] = useState(autoRate === "true");
    const [selectedRating, setSelectedRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const submitRating = async () => {
        if (selectedRating === 0) {
            Alert.alert("Error", "Please select a rating");
            return;
        }
        setSubmitting(true);
        try {
            await fetchAPI(`/api/rides/${id}/rate`, {
                method: "POST",
                body: JSON.stringify({ rating: selectedRating, type: "user" }),
            });
            Alert.alert("Success", "Rider rated successfully!");
            setModalVisible(false);
            refetch();
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to submit rating");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white px-5">
                <View className="flex-row items-center justify-between my-5">
                    <Skeleton width={150} height={30} />
                    <Skeleton width={40} height={40} borderRadius={20} />
                </View>
                <Skeleton height={200} borderRadius={16} style={{ marginBottom: 20 }} />
                <View className="bg-white rounded-xl shadow-sm shadow-neutral-300 p-4 border border-gray-100 mb-5 gap-3">
                    <View className="flex-row justify-between">
                        <Skeleton width={100} height={20} />
                        <Skeleton width={60} height={20} borderRadius={10} />
                    </View>
                    <Skeleton width="100%" height={20} />
                    <Skeleton width="100%" height={20} />
                </View>
                <Skeleton width={80} height={24} style={{ marginBottom: 12 }} />
                <View className="flex-row items-center gap-4 bg-gray-50 p-4 rounded-xl">
                    <Skeleton width={56} height={56} borderRadius={28} />
                    <View className="gap-2 flex-1">
                        <Skeleton width={120} height={20} />
                        <Skeleton width={80} height={16} />
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    if (!ride) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <Text>Error: Ride not found</Text>
            </SafeAreaView>
        );
    }

    console.log("RIDE_DATA:", JSON.stringify(ride, null, 2));

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="px-5">
                {/* Header */}
                <View className="flex-row items-center justify-between my-5">
                    <View>
                        <Text className="text-2xl font-JakartaBold">Trip Details</Text>
                        <Text className="text-sm font-JakartaSemiBold text-green-600">Status: Completed</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.replace("/(root)/(tabs)/home")} className="w-10 h-10 bg-gray-100 rounded-full justify-center items-center">
                        <Image source={icons.backArrow} className="w-6 h-6" resizeMode="contain" />
                    </TouchableOpacity>
                </View>

                {/* Map Snapshot */}
                <View className="w-full h-[200px] rounded-2xl overflow-hidden mb-5 shadow-sm shadow-neutral-300">
                    <Image
                        source={{
                            uri: `https://maps.googleapis.com/maps/api/staticmap?center=${ride.destination_latitude},${ride.destination_longitude}&zoom=13&size=600x400&markers=color:green|${ride.origin_latitude},${ride.origin_longitude}&markers=color:red|${ride.destination_latitude},${ride.destination_longitude}&path=color:0x0000ff|weight:5|${ride.origin_latitude},${ride.origin_longitude}|${ride.destination_latitude},${ride.destination_longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`,
                        }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                </View>

                {/* Ride Info Card */}
                <View className="bg-white rounded-xl shadow-sm shadow-neutral-300 p-4 border border-gray-100 mb-5">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-2">
                            <Image source={icons.calendar} className="w-5 h-5 text-gray-500" />
                            <Text className="text-md font-JakartaBold">{formatDate(ride.created_at)}</Text>
                        </View>
                        <View className={`px-3 py-1 rounded-full ${ride.payment_status === 'paid' ? 'bg-green-100' : 'bg-red-100'}`}>
                            <Text className={`text-xs capitalize font-JakartaBold ${ride.payment_status === 'paid' ? 'text-green-700' : 'text-red-700'}`}>
                                {ride.payment_status}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-gray-500 font-JakartaMedium">Duration</Text>
                        <Text className="font-JakartaBold">{formatTime(ride.ride_time)}</Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-gray-500 font-JakartaMedium">Distance</Text>
                        {ride.ride_distance != null ? (
                            <Text className="font-JakartaBold">{ride.ride_distance.toFixed(1)} km</Text>
                        ) : (
                            <Text className="font-JakartaBold">-</Text>
                        )}
                    </View>
                </View>

                {/* Rider Info (For Driver) */}
                <Text className="text-lg font-JakartaBold mb-3">Rider</Text>
                <View className="flex-row items-center bg-gray-50 p-4 rounded-xl mb-5">
                    {ride.rider?.image && ride.rider.image !== "null" ? (
                        <Image source={{ uri: ride.rider.image }} className="w-14 h-14 rounded-full mr-4" />
                    ) : (
                        <View className="w-14 h-14 bg-gray-200 rounded-full mr-4 items-center justify-center">
                            <Image source={icons.person} className="w-8 h-8 text-gray-500" resizeMode="contain" />
                        </View>
                    )}

                    <View className="flex-1">
                        <Text className="text-lg font-JakartaSemiBold">{ride.rider?.name || "Rider"}</Text>
                        <View className="flex-row items-center gap-1">
                            <Image source={icons.star} className="w-4 h-4" />
                            <Text className="text-gray-500">{(ride.rider?.rating_count || 0) > 0 ? ride.rider?.rating : "New"}</Text>
                        </View>
                    </View>
                </View>

                {/* Earnings Breakdown (For Driver) */}
                <Text className="text-lg font-JakartaBold mb-3">Earnings Breakdown</Text>
                <View className="bg-gray-50 p-4 rounded-xl mb-5">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-500">Gross Fare</Text>
                        <Text className="font-JakartaMedium">₦{ride.fare_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-500">App Commission</Text>
                        <Text className="font-JakartaMedium text-red-500">- ₦{(ride.fare_price * 0.1).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                    </View>
                    <View className="w-full h-[1px] bg-gray-200 my-2" />
                    <View className="flex-row justify-between">
                        <Text className="text-lg font-JakartaBold">Net Earnings</Text>
                        <Text className="text-lg font-JakartaExtraBold text-[#0CC25F]">₦{(ride.fare_price * 0.9).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                    </View>
                </View>

                {/* Actions */}
                <View className="flex-row gap-4 mb-10">
                    <TouchableOpacity
                        className="flex-1 bg-general-100 py-4 rounded-full items-center"
                        onPress={() => router.push("/(root)/support" as any)}
                    >
                        <Text className="font-JakartaBold text-gray-900">Report Issue</Text>
                    </TouchableOpacity>

                    {/* Rate Rider Button (Only if not rated) */}
                    {!ride.user_rating && (
                        <TouchableOpacity
                            className="flex-1 bg-[#0286FF] py-4 rounded-full items-center"
                            onPress={() => {
                                setSelectedRating(0);
                                setModalVisible(true);
                            }}
                        >
                            <Text className="font-JakartaBold text-white">Rate Rider</Text>
                        </TouchableOpacity>
                    )}
                    {ride.user_rating && (
                        <View className="flex-1 bg-green-100 py-4 rounded-full items-center">
                            <Text className="font-JakartaBold text-green-700">Rated: {ride.user_rating} ★</Text>
                        </View>
                    )}
                </View>

                {/* Rating Modal */}
                <Modal
                    transparent={true}
                    visible={isModalVisible}
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View className="flex-1 justify-end bg-black/50">
                        <View className="bg-white p-5 rounded-t-3xl">
                            <Text className="text-xl font-JakartaBold mb-5 text-center">Rate {ride.rider?.name || 'Rider'}</Text>

                            <View className="flex-row justify-center gap-4 mb-8">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity key={star} onPress={() => setSelectedRating(star)}>
                                        <Image
                                            source={icons.star}
                                            className={`w-12 h-12`}
                                            style={{ tintColor: selectedRating >= star ? '#FFD700' : '#E0E0E0' }}
                                            resizeMode="contain"
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                onPress={submitRating}
                                className={`w-full py-4 rounded-full flex-row justify-center items-center ${submitting ? 'bg-gray-300' : 'bg-[#0286FF]'}`}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-xl text-white font-JakartaBold">Submit Rating</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="mt-4 mb-2">
                                <Text className="text-center text-gray-500 font-JakartaMedium">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </ScrollView>
        </SafeAreaView>
    );
};

export default DriverRideHistoryDetails;
