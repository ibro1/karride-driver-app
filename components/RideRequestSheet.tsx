import React, { useMemo } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import CustomButton from "@/components/CustomButton";
import { icons } from "@/constants";

interface RideRequestSheetProps {
    request: {
        origin_address?: string;
        originAddress?: string;
        destination_address?: string;
        destinationAddress?: string;
        fare_price?: number;
        farePrice?: number;
        ride_time?: number;
        rideTime?: number;
        distance?: number;
        rideDistanceKm?: number;
    } | null;
    onAccept: () => void;
    onDecline: () => void;
    loading?: boolean;
    declineLoading?: boolean;
}

const RideRequestSheet = ({ request, onAccept, onDecline, loading, declineLoading }: RideRequestSheetProps) => {
    const snapPoints = useMemo(() => ["50%"], []);

    if (!request) return null;

    const origin = request.origin_address || request.originAddress;
    const destination = request.destination_address || request.destinationAddress;
    const price = request.fare_price || request.farePrice;
    const time = request.ride_time || request.rideTime;
    const distance = request.distance || request.rideDistanceKm || 0;

    return (
        <BottomSheet snapPoints={snapPoints} index={0} enablePanDownToClose={false}>
            <BottomSheetView className="flex-1 p-5">
                <Text className="text-xl font-JakartaBold mb-5 text-center">New Ride Request</Text>

                <View className="flex-row items-center mb-5">
                    <View className="flex-1">
                        <View className="flex-row items-center mb-3">
                            <Image source={icons.to} className="w-6 h-6 mr-3" />
                            <Text className="text-base font-JakartaMedium flex-1" numberOfLines={1}>
                                {origin}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Image source={icons.point} className="w-6 h-6 mr-3" />
                            <Text className="text-base font-JakartaMedium flex-1" numberOfLines={1}>
                                {destination}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="flex flex-row items-center justify-between w-full bg-general-600 rounded-2xl p-3 mb-5">
                    <View className="flex flex-col">
                        <Text className="text-gray-500 text-sm font-JakartaMedium">Est. Fare</Text>
                        <Text className="text-lg font-JakartaBold">₦{price}</Text>
                    </View>
                    <View className="flex flex-col">
                        <Text className="text-gray-500 text-sm font-JakartaMedium">Distance</Text>
                        <Text className="text-lg font-JakartaBold">{distance.toFixed(1)} km</Text>
                    </View>
                    <View className="flex flex-col">
                        <Text className="text-gray-500 text-sm font-JakartaMedium">Time</Text>
                        <Text className="text-lg font-JakartaBold">{Math.round(time || 0)} min</Text>
                    </View>
                </View>

                <View className="flex flex-row justify-between w-full pb-36">
                    <CustomButton
                        title="Decline"
                        onPress={onDecline}
                        isLoading={declineLoading}
                        className="flex-1 bg-red-500 mr-3"
                    />

                    <CustomButton
                        title="Accept"
                        onPress={onAccept}
                        isLoading={loading}
                        className="flex-1 bg-green-500"
                    />
                </View>
            </BottomSheetView>
        </BottomSheet>
    );
};

export default RideRequestSheet;
