import { Image, Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import { icons } from "@/constants";
import { formatDate, formatTime } from "@/lib/utils";
import { Ride } from "@/types/type";
import RideStatusBadge from "./RideStatusBadge";

const RideCard = ({ ride }: { ride: Ride }) => {
  const getStatusColor = () => {
    switch (ride.status?.toLowerCase()) {
      case "completed": return "#9D00FF";
      case "in_progress": return "#3b82f6";
      case "cancelled":
      case "rejected": return "#ef4444";
      default: return "#f59e0b";
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/(root)/ride-history/${ride.ride_id}` as any)}
      style={{ elevation: 12 }}
      className="mb-5 overflow-hidden rounded-[24px] shadow-lg shadow-neutral-200 border border-neutral-100 bg-white"
    >
      <View className="p-5">
        {/* Header: Date & Status */}
        <View className="flex-row items-center justify-between mb-5 gap-2">
          <View className="flex-1 flex-row items-center bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-100">
            <Image source={icons.calendar} className="w-3 h-3 text-neutral-400 mr-2" resizeMode="contain" />
            <Text className="text-[10px] font-JakartaBold text-neutral-500" numberOfLines={1}>
              {formatDate(ride.created_at)} • {formatTime(ride.ride_time)}
            </Text>
          </View>

          <View className="flex-row items-center shrink-0 ml-2">
            <View
              style={{ backgroundColor: getStatusColor() }}
              className="w-1.5 h-1.5 rounded-full mr-2"
            />
            <RideStatusBadge status={ride.status} />
          </View>
        </View>

        {/* Middle: Route Visualization */}
        <View className="flex-row items-start mb-6 px-1">
          <View className="items-center mr-4 mt-1.5">
            <View className="w-2.5 h-2.5 rounded-full border-2 border-[#9D00FF] bg-white" />
            <View className="w-[1px] h-10 border-l border-neutral-200 my-1" />
            <View className="w-2.5 h-2.5 rounded-sm bg-[#9D00FF]" />
          </View>

          <View className="flex-1 gap-y-5">
            <View>
              <Text className="text-[9px] font-JakartaBold text-neutral-400 uppercase tracking-wider mb-0.5">Pickup</Text>
              <Text className="text-[14px] font-JakartaSemiBold text-neutral-800" numberOfLines={1}>
                {ride.origin_address}
              </Text>
            </View>

            <View>
              <Text className="text-[9px] font-JakartaBold text-neutral-400 uppercase tracking-wider mb-0.5">Dropoff</Text>
              <Text className="text-[14px] font-JakartaSemiBold text-neutral-800" numberOfLines={1}>
                {ride.destination_address}
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View className="w-full h-[1px] bg-neutral-50 mb-5" />

        {/* Footer: Rider & Price */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 mr-3">
            <View className="w-10 h-10 rounded-xl bg-neutral-50 overflow-hidden border border-neutral-100">
              {ride.rider?.image ? (
                <Image source={{ uri: ride.rider.image }} className="w-full h-full" />
              ) : (
                <View className="bg-[#9D00FF]/5 w-full h-full items-center justify-center">
                  <Image source={icons.person} className="w-5 h-5" tintColor="#9D00FF" resizeMode="contain" />
                </View>
              )}
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[14px] font-JakartaBold text-neutral-900" numberOfLines={1}>
                {ride.rider?.name || "Rider"}
              </Text>
              <View className="flex-row items-center mt-0.5">
                <Text className="text-[10px] font-JakartaMedium text-neutral-400 mr-1.5">Rider</Text>
                {ride.rider?.rating != null ? (
                  <View className="flex-row items-center bg-[#9D00FF]/5 px-1.5 py-0.5 rounded-md">
                    <Text className="text-[9px] font-JakartaBold text-[#9D00FF]">{parseFloat(ride.rider.rating).toFixed(1)}</Text>
                    <Text className="text-[#9D00FF] ml-0.5 text-[7px]">★</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <View className="items-end shrink-0">
            <Text className="text-[18px] font-JakartaExtraBold text-[#9D00FF] tracking-tighter">
              ₦{ride.fare_price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </Text>
            {ride.ride_distance && (
              <Text className="text-[10px] font-JakartaBold text-neutral-300">
                {ride.ride_distance.toFixed(1)} km
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RideCard;
