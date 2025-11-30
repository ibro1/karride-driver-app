import { useEffect, useState, useRef } from "react";
import { View, Text, ActivityIndicator, Alert, TouchableOpacity, Image, Switch } from "react-native";
import { useAuth } from "@/lib/auth-context";
import * as Location from "expo-location";
import Map from "@/components/Map";
import { icons } from "@/constants";
import { updateDriverStatus, updateDriverLocation, getDriverProfile } from "@/lib/auth-api";
import RideRequestSheet from "@/components/RideRequestSheet";

import { useLocationStore } from "@/store";
import { getSocket } from "@/lib/socket";

const DriverHome = () => {
    const { user, signOut } = useAuth();
    const { setUserLocation } = useLocationStore();
    const [loading, setLoading] = useState(true);
    const [hasPermission, setHasPermission] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [rideRequest, setRideRequest] = useState<any>(null);

    useEffect(() => {
        const requestLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission to access location was denied");
                return;
            }
            setHasPermission(true);
            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                address: "Current Location", // You might want to reverse geocode this
            });
            setLoading(false);
        };

        requestLocation();
    }, []);

    useEffect(() => {
        const initDriver = async () => {
            if (user) {
                try {
                    const response = await getDriverProfile(user.id);
                    if (response && response.driver && response.driver.status === 'online') {
                        setIsOnline(true);
                    }
                } catch (err) {
                    console.log("Error fetching driver profile", err);
                }
            }
        }
        initDriver();
    }, [user]);

    // Socket listener for ride requests
    useEffect(() => {
        const socket = getSocket();
        if (user?.id) {
            socket.emit("join_driver_room", user.id);

            socket.on("new_ride_request", (data) => {
                setRideRequest(data);
            });
        }
        return () => {
            socket.off("new_ride_request");
        }
    }, [user]);

    // Periodic location update if online
    useEffect(() => {
        let interval: NodeJS.Timeout;
        const socket = getSocket();

        if (isOnline && hasPermission) {
            interval = setInterval(async () => {
                const loc = await Location.getCurrentPositionAsync({});
                setLocation(loc);
                updateDriverLocation(loc.coords.latitude, loc.coords.longitude);

                // Emit socket update
                socket.emit("driver_location_broadcast", {
                    driverId: user?.id,
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                });
            }, 10000); // Update every 10s
        }
        return () => clearInterval(interval);
    }, [isOnline, hasPermission, user]);

    const toggleOnlineStatus = async () => {
        if (!location) {
            Alert.alert("Error", "Location not available");
            return;
        }
        try {
            const newStatus = isOnline ? "offline" : "online";
            await updateDriverStatus(newStatus, location.coords.latitude, location.coords.longitude);
            setIsOnline(!isOnline);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update status");
        }
    };

    const handleAcceptRide = () => {
        // Logic to accept ride (API call + socket emit)
        // For now just close sheet and navigate
        setRideRequest(null);
        // router.push(`/(root)/ride/${rideRequest.rideId}`);
        Alert.alert("Success", "Ride Accepted!");
    };

    const handleDeclineRide = () => {
        setRideRequest(null);
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0286FF" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <View className="flex-1">
                <Map isOnline={isOnline} />
            </View>

            <View className="absolute top-14 right-5 z-10">
                <TouchableOpacity
                    onPress={signOut}
                    className="bg-white p-3 rounded-full shadow-md"
                >
                    <Image source={icons.out} className="w-6 h-6" resizeMode="contain" />
                </TouchableOpacity>
            </View>

            <View className="absolute top-14 left-5 z-10 bg-white px-4 py-2 rounded-full shadow-md flex-row items-center">
                <View className={`w-3 h-3 rounded-full mr-2 ${isOnline ? "bg-green-500" : "bg-red-500"}`} />
                <Text className="font-JakartaSemiBold mr-3">{isOnline ? "Online" : "Offline"}</Text>
                <Switch
                    value={isOnline}
                    onValueChange={toggleOnlineStatus}
                    trackColor={{ false: "#767577", true: "#34C759" }}
                    thumbColor={isOnline ? "#FFFFFF" : "#f4f3f4"}
                />
            </View>

            <View className="absolute bottom-10 left-5 right-5">
                <TouchableOpacity
                    onPress={toggleOnlineStatus}
                    className={`w-full p-4 rounded-full shadow-lg flex-row justify-center items-center ${isOnline ? "bg-red-500" : "bg-green-500"}`}
                >
                    <Text className="text-white font-bold text-lg">
                        {isOnline ? "Go Offline" : "Go Online"}
                    </Text>
                </TouchableOpacity>
            </View>

            <RideRequestSheet
                request={rideRequest}
                onAccept={handleAcceptRide}
                onDecline={handleDeclineRide}
            />
        </View>
    );
};

export default DriverHome;
