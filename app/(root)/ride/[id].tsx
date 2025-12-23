import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { View, Text, ActivityIndicator, Image, Alert, TouchableOpacity, Linking } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";

import { icons, images } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { Ride } from "@/types/type";
import { updateRideStatus } from "@/lib/auth-api";
import { getSocket } from "@/lib/socket";
import SwipeButton from "@/components/SwipeButton";
import RideLayout from "@/components/RideLayout";
import Avatar from "@/components/Avatar";

const RideScreen = () => {
    const { id } = useLocalSearchParams();
    const { data: ride, loading, error } = useFetch<Ride>(`/api/rides/${id}`);
    const [status, setStatus] = useState<string>("accepted");
    const [driverLocation, setDriverLocation] = useState<Location.LocationObject | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        if (ride) {
            setStatus(ride.status || "accepted");
        }
    }, [ride]);

    useEffect(() => {
        const getLocation = async () => {
            const loc = await Location.getCurrentPositionAsync({});
            setDriverLocation(loc);
        };
        getLocation();

        const interval = setInterval(getLocation, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleStatusUpdate = async () => {
        if (isUpdating) return;
        setIsUpdating(true);

        let newStatus = "";
        let socketEvent = "";

        if (status === "accepted") {
            newStatus = "arrived";
            socketEvent = "ride_arrived";
        } else if (status === "arrived") {
            newStatus = "in_progress";
            socketEvent = "ride_started";
        } else if (status === "in_progress") {
            newStatus = "completed";
            socketEvent = "ride_completed";
        }

        if (!newStatus) {
            setIsUpdating(false);
            return;
        }

        try {
            await updateRideStatus(Number(id), newStatus as any);
            setStatus(newStatus);

            const socket = getSocket();
            socket.emit(socketEvent, { rideId: id });

            if (newStatus === "completed") {
                Alert.alert("Success", "Ride Completed!");
                router.replace("/(root)/(tabs)/home");
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update status");
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading || !ride) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0286FF" />
            </View>
        );
    }

    const getButtonText = () => {
        switch (status) {
            case "accepted": return "Swipe to Arrived";
            case "arrived": return "Swipe to Start Ride";
            case "in_progress": return "Swipe to Complete";
            default: return "Ride Completed";
        }
    };

    const getButtonColor = () => {
        switch (status) {
            case "accepted": return "#EAB308"; // yellow-500
            case "arrived": return "#3B82F6"; // blue-500
            case "in_progress": return "#22C55E"; // green-500
            default: return "#6B7280"; // gray-500
        }
    };

    return (
        <RideLayout title="Current Ride" snapPoints={["50%", "85%"]} map={
            (ride.origin_latitude && ride.origin_longitude && ride.destination_latitude && ride.destination_longitude) ? (
                <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={{ flex: 1 }}
                    mapPadding={{ top: 120, right: 20, bottom: 20, left: 20 }}
                    initialRegion={{
                        latitude: ride.origin_latitude,
                        longitude: ride.origin_longitude,
                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                    }}
                    showsUserLocation={true}
                >
                    <Marker
                        coordinate={{
                            latitude: ride.origin_latitude,
                            longitude: ride.origin_longitude,
                        }}
                        title="Pickup"
                        description={ride.origin_address}
                        image={icons.point}
                    />
                    <Marker
                        coordinate={{
                            latitude: ride.destination_latitude,
                            longitude: ride.destination_longitude,
                        }}
                        title="Destination"
                        description={ride.destination_address}
                        image={icons.to}
                    />

                    <MapViewDirections
                        origin={driverLocation ? {
                            latitude: driverLocation.coords.latitude,
                            longitude: driverLocation.coords.longitude,
                        } : {
                            latitude: ride.origin_latitude,
                            longitude: ride.origin_longitude,
                        }}
                        destination={status === 'in_progress' ? {
                            latitude: ride.destination_latitude,
                            longitude: ride.destination_longitude,
                        } : {
                            latitude: ride.origin_latitude,
                            longitude: ride.origin_longitude,
                        }}
                        apikey={process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY!}
                        strokeColor="#0286FF"
                        strokeWidth={4}
                    />
                </MapView>
            ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' }}>
                    <ActivityIndicator size="large" color="#0286FF" />
                    <Text style={{ marginTop: 10, fontSize: 14, color: '#6b7280' }}>Loading map...</Text>
                </View>
            )
        }>
            <View className="flex flex-col w-full items-center justify-center mt-5">
                <Text className="text-xl font-JakartaBold mb-4 text-green-500">
                    {status === 'accepted' ? 'Heading to Pickup' :
                        status === 'arrived' ? 'At Pickup Point' :
                            status === 'in_progress' ? 'Heading to Destination' :
                                'Ride Completed'}
                </Text>

                <View className="flex-row items-center justify-between bg-general-600 rounded-2xl p-4 mb-5 w-full">
                    <View className="items-center flex-row flex-1">
                        <Avatar
                            source={ride.rider?.image}
                            name={ride.rider?.name || "Rider"}
                            size={12}
                        />
                        <View className="ml-4 flex-1">
                            <Text className="text-lg font-JakartaSemiBold">{ride.rider?.name || "Rider"}</Text>
                            <Text className="text-gray-500">{ride.rider?.rating || "5.0"} ★</Text>
                        </View>
                    </View>
                    <View className="flex-row items-center ml-3 gap-3">
                        {/* Status Guard: Only show SOS if in progress, else Call */}
                        {status === 'in_progress' ? (
                            <TouchableOpacity
                                onPress={() => {
                                    Alert.alert(
                                        "Emergency SOS",
                                        "Are you sure you want to call emergency services?",
                                        [
                                            { text: "Cancel", style: "cancel" },
                                            {
                                                text: "Call 112",
                                                style: "destructive",
                                                onPress: () => Alert.alert("Calling 112...")
                                            }
                                        ]
                                    )
                                }}
                                className="bg-red-500 p-3 rounded-full justify-center items-center w-12 h-12"
                            >
                                <Text className="text-white font-bold text-xs">SOS</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={() => Linking.openURL(`tel:${ride.rider.phone_number}`)}
                                className="bg-success-500 p-3 rounded-full justify-center items-center w-12 h-12"
                            >
                                <Image source={icons.phone} className="w-6 h-6" tintColor="white" resizeMode="contain" />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={() => router.push(`/(root)/chat/${id}` as any)}
                            className="bg-accent-500 p-3 rounded-full justify-center items-center w-12 h-12"
                        >
                            <Image source={icons.chat} className="w-6 h-6" tintColor="white" resizeMode="contain" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="w-full mb-5">
                    <View className="flex-row items-center mb-3 border-b border-general-700 pb-2">
                        <Image source={icons.to} className="w-5 h-5 mr-2" />
                        <Text className="text-sm font-JakartaMedium flex-1" numberOfLines={1}>
                            {ride.origin_address}
                        </Text>
                    </View>
                    <View className="flex-row items-center">
                        <Image source={icons.point} className="w-5 h-5 mr-2" />
                        <Text className="text-sm font-JakartaMedium flex-1" numberOfLines={1}>
                            {ride.destination_address}
                        </Text>
                    </View>
                </View>

                <SwipeButton
                    title={getButtonText()}
                    onSwipeComplete={handleStatusUpdate}
                    loading={isUpdating}
                    disabled={isUpdating}
                    trackColor={getButtonColor()}
                    thumbColor="#fff"
                    thumbSize={50}
                    containerHeight={60}
                />
            </View>
        </RideLayout>
    );
};

export default RideScreen;
