import { useEffect, useState, useRef } from "react";
import { View, Text, ActivityIndicator, Alert, TouchableOpacity, Image, Switch, AppState } from "react-native";
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
import EarningsWidget from "@/components/EarningsWidget";
import Skeleton from "@/components/Skeleton";

const DriverHome = () => {
    const { user, signOut } = useAuth();
    const { setUserLocation } = useLocationStore();
    const [isInitializingLocation, setIsInitializingLocation] = useState(true);
    const [hasPermission, setHasPermission] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [rideRequest, setRideRequest] = useState<any>(null);
    const [acceptingRide, setAcceptingRide] = useState(false);
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);

    const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

    const { data: earningsData, loading: earningsLoading, refetch: refetchEarnings } = useFetch<any>(`/api/driver/${user?.id}/earnings`);

    useEffect(() => {
        const requestLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission to access location was denied");
                setIsInitializingLocation(false);
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
            setIsInitializingLocation(false);
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
                        setVerificationStatus(response.driver.verificationStatus || "pending");

                        // 1. Set online status
                        if (response.driver.status === 'online' || response.driver.status === 'busy') {
                            setIsOnline(true);
                        }

                        // 2. Setup Socket
                        const socket = getSocket();
                        const joinDriverRoom = () => {
                            console.log(`[DriverApp] Joining driver room: driver_${driverId} (Socket ID: ${socket.id})`);
                            socket.emit("join_driver_room", driverId);
                        };

                        if (socket.connected) joinDriverRoom();
                        socket.on("connect", joinDriverRoom);

                        socket.on("new_ride_request", (data) => {
                            setRideRequest(data);
                        });

                        socket.on("ride_status_updated", (data: { rideId: number, status: string }) => {
                            console.log("Driver App: Ride status updated", data);
                            setRideRequest((prev: any) => {
                                if (prev && prev.rideId === data.rideId && (data.status === 'cancelled' || data.status === 'rejected')) {
                                    Alert.alert("Ride Cancelled", "The rider has cancelled the request.");
                                    return null;
                                }
                                return prev;
                            });
                        });

                        socket.on("ride_cancelled", (data: { rideId: number }) => {
                            console.log("Driver App: Ride cancelled event", data);
                            setRideRequest((prev: any) => {
                                if (prev && prev.rideId === data.rideId) {
                                    Alert.alert("Ride Cancelled", "The rider has cancelled the request.");
                                    return null;
                                }
                                return prev;
                            });
                        });

                        socket.on("driver_verification_updated", (data: { status: string, message: string }) => {
                            console.log("Driver Verification Updated:", data);
                            setVerificationStatus(data.status);
                            Alert.alert("Account Update", data.message);
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

    // Handle AppState change to refresh data when coming to foreground
    useEffect(() => {
        const subscription = AppState.addEventListener("change", nextAppState => {
            if (nextAppState === "active") {
                console.log("App has come to the foreground!");
                // Re-init driver or refetch crucial data
                // We reuse initDriverAndSocket logic or parts of it
                if (user) {
                    getDriverProfile(user.id).then(response => {
                        if (response && response.driver) {
                            setVerificationStatus(response.driver.verificationStatus || "pending");
                            // Also check for pending rides again
                            if (response.pendingRequest) {
                                setRideRequest(response.pendingRequest);
                            }
                        }
                    });
                    refetchEarnings();
                }
            }
        });

        return () => {
            subscription.remove();
        };
    }, [user, refetchEarnings]);


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

        if (verificationStatus !== "verified") {
            Alert.alert("Account Restricted", "Your account is under review. You cannot go online until verified.");
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


    return (
        <View className="flex-1 bg-white">
            {/* Header Card with Branding and Online Toggle */}
            <View className="absolute top-12 left-4 right-4 z-10">
                <View className="bg-white rounded-3xl shadow-lg shadow-neutral-300 p-5">
                    {/* Top Row: Branding + Status Indicator */}
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                            <Text className="text-[#9D00FF] font-JakartaBold text-xl mb-1">KarRide</Text>
                            {isInitializingLocation ? (
                                <Skeleton width={150} height={16} borderRadius={4} />
                            ) : (
                                <Text className="text-neutral-600 font-JakartaMedium text-sm" numberOfLines={1}>
                                    Welcome, {user?.firstName || user?.name?.split(' ')[0] || 'Driver'} 👋
                                </Text>
                            )}
                        </View>

                        {/* Status Dot */}
                        <View className={`flex-row items-center px-3 py-1.5 rounded-full ${isOnline ? 'bg-green-100' : 'bg-neutral-100'}`}>
                            <View className={`w-2 h-2 rounded-full mr-1.5 ${isOnline ? 'bg-green-500' : 'bg-neutral-400'}`} />
                            <Text className={`font-JakartaSemiBold text-xs ${isOnline ? 'text-green-700' : 'text-neutral-500'}`}>
                                {isOnline ? 'Online' : 'Offline'}
                            </Text>
                        </View>
                    </View>

                    {/* Verification Warning */}
                    {verificationStatus && verificationStatus !== "verified" && (
                        <View className="bg-red-50 border border-red-200 p-3 rounded-xl mb-4">
                            <Text className="text-red-600 font-JakartaBold text-sm">⚠️ Account Under Review</Text>
                            <Text className="text-red-500 text-xs mt-0.5">
                                {verificationStatus === "rejected" ? "Your documents were rejected." : "We're verifying your documents."}
                            </Text>
                        </View>
                    )}

                    {/* Main Toggle Button */}
                    {isInitializingLocation ? (
                        <View className="h-14 bg-neutral-100 rounded-2xl items-center justify-center">
                            <ActivityIndicator size="small" color="#9D00FF" />
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={toggleOnlineStatus}
                            disabled={isTogglingStatus || (verificationStatus !== "verified")}
                            activeOpacity={0.8}
                            className={`h-14 rounded-2xl flex-row items-center justify-center ${verificationStatus !== "verified"
                                ? "bg-neutral-200"
                                : isOnline
                                    ? "bg-red-500"
                                    : "bg-[#9D00FF]"
                                } ${isTogglingStatus ? "opacity-70" : ""}`}
                        >
                            {isTogglingStatus ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Text className="text-white font-JakartaBold text-base mr-2">
                                        {verificationStatus !== "verified"
                                            ? "Cannot Go Online"
                                            : isOnline
                                                ? "Tap to Go Offline"
                                                : "Tap to Go Online"}
                                    </Text>
                                    <View className={`w-6 h-6 rounded-full items-center justify-center ${isOnline ? 'bg-red-400' : 'bg-white/20'}`}>
                                        <Text className="text-white text-xs">{isOnline ? '✕' : '→'}</Text>
                                    </View>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Helper Text */}
                    {!isInitializingLocation && verificationStatus === "verified" && (
                        <Text className="text-neutral-400 text-[10px] text-center mt-2 uppercase tracking-wide font-JakartaBold">
                            {isOnline ? "You're receiving ride requests" : "Go online to receive ride requests"}
                        </Text>
                    )}
                </View>
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
                    loading={earningsLoading}
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
