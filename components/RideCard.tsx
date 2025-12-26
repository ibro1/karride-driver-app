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
      case "completed": return "#10b981";
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
      style={{ elevation: 20 }}
      className="mb-6 overflow-hidden rounded-[32px] shadow-2xl shadow-neutral-900/40 border border-white/40"
    >
      < BlurView intensity={60} tint="light" className="p-6 bg-white/70" >
        {/* Header: Date & Status Glow */}
        < View className="flex-row items-center justify-between mb-6 gap-2" >
          <View className="flex-1 flex-row items-center bg-white/50 px-3 py-2 rounded-2xl border border-white/20">
            <Image source={icons.calendar} className="w-3.5 h-3.5 text-gray-400 mr-2" resizeMode="contain" />
            <Text className="text-[11px] font-JakartaBold text-gray-500" numberOfLines={1}>
              {formatDate(ride.created_at)} • {formatTime(ride.ride_time)}
            </Text>
          </View>

          <View className="flex-row items-center shrink-0">
            <View
              style={{ backgroundColor: getStatusColor() }}
              className="w-2 h-2 rounded-full mr-2 shadow-lg"
            />
            <RideStatusBadge status={ride.status} />
          </View>
        </View >

        {/* Middle: Premium Route Visualization */}
        < View className="flex-row items-start mb-8 px-1" >
          <View className="items-center mr-5 mt-1.5">
            <View className="w-3 h-3 rounded-full border-2 border-emerald-500 bg-white shadow-sm" />
            <View className="w-[1px] h-12 border-l border-dashed border-gray-300 my-1" />
            <View className="w-3 h-3 rounded-md bg-emerald-600 shadow-emerald-400/50 shadow-lg" />
          </View>

          <View className="flex-1 gap-y-6">
            <View>
              <Text className="text-[10px] font-JakartaBold text-gray-400 uppercase tracking-widest mb-1">Pickup</Text>
              <Text className="text-[15px] font-JakartaSemiBold text-gray-800" numberOfLines={1}>
                {ride.origin_address}
              </Text>
            </View>

            <View>
              <Text className="text-[10px] font-JakartaBold text-gray-400 uppercase tracking-widest mb-1">Dropoff</Text>
              <Text className="text-[15px] font-JakartaSemiBold text-gray-800" numberOfLines={1}>
                {ride.destination_address}
              </Text>
            </View>
          </View>
        </View >

        {/* Divider - Ultra Soft */}
        < View className="w-full h-[1px] bg-gray-100/50 mb-6" />

        {/* Footer: Rider & High-Precision Price */}
        < View className="flex-row items-center justify-between" >
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden border border-white/50 shadow-sm">
              {ride.rider?.image ? (
                <Image source={{ uri: ride.rider.image }} className="w-full h-full" />
              ) : (
                <View className="bg-emerald-50 w-full h-full items-center justify-center">
                  <Image source={icons.person} className="w-7 h-7" tintColor="#10b981" resizeMode="contain" />
                </View>
              )}
            </View>
            <View>
              <Text className="text-[15px] font-JakartaBold text-gray-900">{ride.rider?.name || "Rider"}</Text>
              <Text className="text-[11px] font-JakartaMedium text-gray-400">Rider</Text>
            </View>
          </View>

          <View className="items-end">
            <Text className="text-[22px] font-JakartaExtraBold text-emerald-600 tracking-tighter">
              ₦{ride.fare_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            {ride.ride_distance && (
              <Text className="text-[11px] font-JakartaBold text-gray-300">
                {ride.ride_distance.toFixed(1)} km
              </Text>
            )}
          </View>
        </View >
      </BlurView >
    </TouchableOpacity >
  );
};

export default RideCard;
