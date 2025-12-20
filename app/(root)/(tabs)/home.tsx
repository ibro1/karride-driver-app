import { useEffect, useState, useRef } from "react";
import { View, Text, ActivityIndicator, Alert, TouchableOpacity, Image, Switch } from "react-native";
import { useAuth } from "@/lib/auth-context";
import * as Location from "expo-location";
import Map from "@/components/Map";
import { icons } from "@/constants";
import { updateDriverStatus, updateDriverLocation, getDriverProfile, acceptRide, updateRideStatus } from "@/lib/auth-api";
import RideRequestSheet from "@/components/RideRequestSheet";
import { router } from "expo-router";
import { useFetch } from "@/lib/fetch";

import { useLocationStore } from "@/store";
import { getSocket } from "@/lib/socket";
import SideMenu from "@/components/SideMenu";
import EarningsWidget from "@/components/EarningsWidget";

const DriverHome = () => {
    const { user, signOut } = useAuth();
    const { setUserLocation } = useLocationStore();
    const [loading, setLoading] = useState(true);
    const [hasPermission, setHasPermission] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [rideRequest, setRideRequest] = useState<any>(null);
    const [acceptingRide, setAcceptingRide] = useState(false);
    const [isMenuVisible, setMenuVisible] = useState(false);
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);

    const { data: earningsData, refetch: refetchEarnings } = useFetch<any>(`/api/driver/${user?.id}/earnings`);

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
                address: "Current Location",
            });
            setLoading(false);
        };

        requestLocation();
    }, []);

    useEffect(() => {
        const initDriverAndSocket = async () => {
            if (user) {
                try {
                    const response = await getDriverProfile(user.id);
                    console.log("Driver Profile Response:", JSON.stringify(response, null, 2));

                    if (response && response.driver) {
                        const driverId = response.driver.id;

                        // 1. Set online status
                        if (response.driver.status === 'online' || response.driver.status === 'busy') {
                            setIsOnline(true);
                        }

                        // 2. Setup Socket
                        const socket = getSocket();
                        socket.emit("join_driver_room", driverId);

                        socket.on("new_ride_request", (data) => {
                            setRideRequest(data);
                        });

                        // 3. Check for pending request
                        if (response.pendingRequest) {
                            setRideRequest(response.pendingRequest);
                        }

                        // 4. Redirect if active ride
                        if (response.activeRide) {
                            router.replace(`/(root)/ride/${response.activeRide.rideId}`);
                        }
                    }
                } catch (err) {
                    console.log("Error initializing driver:", err);
                }
            }
        };

        initDriverAndSocket();

        return () => {
            const socket = getSocket();
            socket.off("new_ride_request");
        };
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

    // Refetch earnings when screen comes into focus or periodically
    useEffect(() => {
        if (isOnline) {
            refetchEarnings();
        }
    }, [isOnline]);


    const toggleOnlineStatus = async () => {
        if (!location) {
            Alert.alert("Error", "Location not available");
            return;
        }
        setIsTogglingStatus(true);
        try {
            const newStatus = isOnline ? "offline" : "online";
            await updateDriverStatus(newStatus, location.coords.latitude, location.coords.longitude);
            setIsOnline(!isOnline);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update status");
        } finally {
            setIsTogglingStatus(false);
        }
    };

    const handleAcceptRide = async () => {
        if (!rideRequest || !user) return;

        setAcceptingRide(true);
        try {
            // 1. Call API to accept ride
            await acceptRide(rideRequest.rideId);

            // 2. Emit socket event
            const socket = getSocket();
            socket.emit("ride_accepted", {
                rideId: rideRequest.rideId,
                driverId: user.id,
            });

            // 3. Navigate to ride screen
            setRideRequest(null);
            router.push(`/(root)/ride/${rideRequest.rideId}`);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to accept ride");
        } finally {
            setAcceptingRide(false);
        }
    };

    const [decliningRide, setDecliningRide] = useState(false);

    const handleDeclineRide = async () => {
        if (!rideRequest || !user) return;
        setDecliningRide(true);
        try {
            // 1. Emit socket event for real-time update (Optimistic)
            const socket = getSocket();
            socket.emit("ride_rejected", {
                rideId: rideRequest.rideId,
            });

            // 2. Call API to reject ride
            await updateRideStatus(rideRequest.rideId, "rejected");

            setRideRequest(null);
        } catch (error) {
            console.error("Error rejecting ride:", error);
            Alert.alert("Error", "Failed to reject ride");
        } finally {
            setDecliningRide(false);
        }
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
            <SideMenu isVisible={isMenuVisible} onClose={() => setMenuVisible(false)} />

            {/* Header */}
            <View className="absolute top-14 left-0 right-0 z-10 flex-row justify-between items-center px-5 pointer-events-none">
                {/* Hamburger Menu */}
                <TouchableOpacity
                    onPress={() => setMenuVisible(true)}
                    className="bg-white p-3 rounded-full shadow-md pointer-events-auto"
                >
                    <Image source={icons.list} className="w-6 h-6" resizeMode="contain" tintColor="black" />
                </TouchableOpacity>

                {/* Online Toggle (Centered Button) */}
                <TouchableOpacity
                    onPress={toggleOnlineStatus}
                    disabled={isTogglingStatus}
                    className={`flex-row items-center justify-center rounded-full px-6 py-3 shadow-md pointer-events-auto ${isOnline ? "bg-green-500" : "bg-orange-500"} ${isTogglingStatus ? "opacity-70" : ""}`}
                >
                    {isTogglingStatus ? (
                        <ActivityIndicator size="small" color="#fff" className="mr-2" />
                    ) : (
                        <View className="w-2 h-2 rounded-full bg-white mr-2" />
                    )}
                    <Text className="text-white font-JakartaBold text-sm">
                        {isTogglingStatus ? "Updating..." : (isOnline ? "Go Offline" : "Go Online")}
                    </Text>
                </TouchableOpacity>

                {/* Empty View for Balance */}
                <View className="w-12" />
            </View>

            {/* Map Section */}
            <View className="flex-1">
                <Map isOnline={isOnline} />
            </View>

            {/* Bottom Widget */}
            <View className="bg-white pt-2 pb-[100px]">
                <EarningsWidget
                    earnings={earningsData?.today_earnings || 0}
                    ridesCount={earningsData?.today_rides || 0}
                />
            </View>

            <RideRequestSheet
                request={rideRequest}
                onAccept={handleAcceptRide}
                onDecline={handleDeclineRide}
                loading={acceptingRide}
                declineLoading={decliningRide}
            />
        </View>
    );
};

export default DriverHome;
