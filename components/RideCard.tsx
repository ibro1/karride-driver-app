import { Image, Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";

import { icons } from "@/constants";
import { formatDate, formatTime } from "@/lib/utils";
import { Ride } from "@/types/type";

const RideCard = ({ ride }: { ride: Ride }) => {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/(root)/ride-history/${ride.ride_id}` as any)}
      className="flex flex-col items-center justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 mb-3 p-3"
    >
      {/* 1. Header: Date & Status */}
      <View className="flex flex-row items-center justify-between w-full mb-3">
        <View className="flex flex-row items-center gap-1">
          <Image source={icons.calendar} className="w-4 h-4 text-gray-500" resizeMode="contain" />
          <Text className="text-sm font-JakartaBold text-gray-800">
            {formatDate(ride.created_at)} • {formatTime(ride.ride_time)}
          </Text>
        </View>

        <View className={`px-2 py-1 rounded-full ${ride.payment_status === 'paid' ? 'bg-green-100' : 'bg-red-100'}`}>
          <Text className={`text-xs capitalize font-JakartaBold ${ride.payment_status === 'paid' ? 'text-green-700' : 'text-red-700'}`}>
            {ride.payment_status}
          </Text>
        </View>
      </View>

      {/* 2. Middle: Map & Route Details */}
      <View className="flex flex-row items-center justify-between w-full mb-4">
        <Image
          source={{
            uri: `https://maps.googleapis.com/maps/api/staticmap?center=${ride.destination_latitude},${ride.destination_longitude}&zoom=14&size=600x400&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`,
          }}
          className="w-[80px] h-[80px] rounded-lg mr-3"
        />

        <View className="flex flex-col flex-1 gap-y-2">
          <View className="flex flex-row items-center gap-x-2">
            <Image source={icons.to} className="w-4 h-4" />
            <Text className="text-xs font-JakartaMedium text-gray-600 flex-1" numberOfLines={1}>
              {ride.origin_address}
            </Text>
          </View>

          <View className="flex flex-row items-center gap-x-2">
            <Image source={icons.point} className="w-4 h-4" />
            <Text className="text-xs font-JakartaMedium text-gray-600 flex-1" numberOfLines={1}>
              {ride.destination_address}
            </Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View className="w-full h-[1px] bg-general-100 mb-3" />

      {/* 3. Footer: Rider & Price */}
      <View className="flex flex-row items-center justify-between w-full">
        <View className="flex flex-row items-center gap-2">
          {/* Fallback for rider image */}
          {ride.rider?.image ? (
            <Image source={{ uri: ride.rider.image }} className="w-10 h-10 rounded-full" />
          ) : (
            <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
              <Image source={icons.person} className="w-6 h-6 text-gray-500" resizeMode="contain" />
            </View>
          )}

          <View>
            <Text className="text-sm font-JakartaSemiBold text-gray-900">{ride.rider?.name || "Rider"}</Text>
            {/* Drivers verify Rider? Maybe simple text or verify badge? Skipping rating for now as schema varies */}
            <Text className="text-xs font-JakartaRegular text-gray-500">Rider</Text>
          </View>
        </View>

        <View className="flex flex-col items-end">
          <Text className="text-lg font-JakartaExtraBold text-[#0CC25F]">
            ₦{ride.fare_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          {ride.ride_distance ? (
            <Text className="text-xs font-JakartaMedium text-gray-500">
              {ride.ride_distance.toFixed(1)} km
            </Text>
          ) : (
            <Text className="text-xs font-JakartaMedium text-gray-500">
              {/* Fallback if no distance yet */}
              0.0 km
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RideCard;
