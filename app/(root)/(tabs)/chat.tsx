import { useState, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";

import { useUser } from "@/lib/auth-context";
import { icons, images } from "@/constants";
import { useFetch } from "@/lib/fetch";

interface Ride {
  ride_id: number;
  rider: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  status: string;
}

const Chat = () => {
  const { user } = useUser();
  const [activeRide, setActiveRide] = useState<Ride | null>(null);

  // Fetch driver's active ride
  const { data: activeRideData, loading, refetch } = useFetch<{ data: Ride }>(`/api/ride/active`);

  useEffect(() => {
    if (activeRideData?.data) {
      setActiveRide(activeRideData.data);
    } else {
      setActiveRide(null);
    }
  }, [activeRideData]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0286FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-200">
        <Text className="text-xl font-JakartaBold">Messages</Text>
      </View>

      {!activeRide ? (
        <View className="flex-1 justify-center items-center p-5">
          <Image
            source={images.message}
            alt="message"
            className="w-full h-40"
            resizeMode="contain"
          />
          <Text className="text-3xl font-JakartaBold mt-3">
            No Messages Yet
          </Text>
          <Text className="text-base mt-2 text-center px-7">
            Messages will appear here when you have an active ride
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          className="flex-row items-center p-4 border-b border-gray-100 active:bg-gray-50"
          onPress={() => router.push(`/(root)/chat/${activeRide.ride_id}` as any)}
        >
          <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center mr-4">
            {activeRide.rider?.image ? (
              <Image
                source={{ uri: activeRide.rider.image }}
                className="w-12 h-12 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <Image
                source={icons.person}
                className="w-6 h-6"
                tintColor="#6B7280"
                resizeMode="contain"
              />
            )}
          </View>
          <View className="flex-1">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-JakartaSemiBold">
                {activeRide.rider?.name || "Rider"}
              </Text>
              <View className="bg-green-100 px-2 py-1 rounded-full">
                <Text className="text-xs text-green-600 font-JakartaMedium">Active</Text>
              </View>
            </View>
            <Text className="text-gray-500 text-sm mt-1">
              Tap to open conversation
            </Text>
          </View>
          <Image
            source={icons.point}
            className="w-5 h-5 -rotate-90"
            tintColor="#D1D5DB"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default Chat;
