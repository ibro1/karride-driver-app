import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { icons, images } from "@/constants";
const noResultImage = images.noResult;
import { useFetch } from "@/lib/fetch";
import { useUser } from "@/lib/auth-context";
import { formatDate, formatTime } from "@/lib/utils";

const Earnings = () => {
  const { user } = useUser();
  const { data: earningsData, loading, error } = useFetch<any>(`/api/driver/${user?.id}/earnings`);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-3 border-b border-neutral-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Image source={icons.backArrow} className="w-6 h-6" resizeMode="contain" />
        </TouchableOpacity>
        <Text className="text-xl font-JakartaBold text-neutral-800">Earnings</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0369a1" />
        </View>
      ) : (
        <FlatList
          data={earningsData?.recent_rides || []}
          keyExtractor={(item) => item.rideId?.toString() || Math.random().toString()}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          ListHeaderComponent={() => (
            <View className="mb-6">
              {/* Summary Card - Premium Emerald Look */}
              <View className="bg-emerald-600 rounded-[36px] p-8 shadow-2xl shadow-emerald-200 overflow-hidden relative">
                {/* Decorative Pattern / Glass Glow */}
                <View className="absolute -top-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
                <View className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl" />

                <Text className="text-emerald-100 text-xs font-JakartaBold mb-1 uppercase tracking-widest">Available Balance</Text>
                <Text className="text-white text-5xl font-JakartaExtraBold mb-8">
                  ₦{earningsData?.total_earnings?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                </Text>

                <View className="flex-row gap-4 mb-8">
                  <View className="flex-1 bg-white/10 rounded-[24px] p-4 border border-white/20">
                    <Text className="text-emerald-100 text-[10px] font-JakartaBold uppercase tracking-tighter mb-1">Today</Text>
                    <Text className="text-white text-xl font-JakartaBold">
                      ₦{earningsData?.today_earnings?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                    </Text>
                  </View>
                  <View className="flex-1 bg-white/10 rounded-[24px] p-4 border border-white/20">
                    <Text className="text-emerald-100 text-[10px] font-JakartaBold uppercase tracking-tighter mb-1">Trips</Text>
                    <Text className="text-white text-xl font-JakartaBold">
                      {earningsData?.today_rides || 0}
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-4">
                  <TouchableOpacity
                    onPress={() => router.push("/(root)/wallet/withdraw" as any)}
                    className="flex-1 bg-white py-4 rounded-2xl items-center shadow-lg shadow-emerald-900/10"
                  >
                    <Text className="text-emerald-600 font-JakartaBold text-lg">Cash Out</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push("/(root)/wallet/add-bank")}
                    className="flex-1 bg-emerald-500 py-4 rounded-2xl items-center border border-emerald-400"
                  >
                    <Text className="text-white font-JakartaBold text-lg">Bank Info</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mt-10 flex-row items-center justify-between mb-4 px-1">
                <Text className="text-2xl font-JakartaExtraBold text-gray-900">Recent Trips</Text>
                <TouchableOpacity onPress={() => router.push("/(root)/ride-history" as any)}>
                  <Text className="text-sm font-JakartaBold text-emerald-600">See All</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push(`/(root)/ride-history/${item.rideId}` as any)}
              style={{ elevation: 5 }}
              className="flex-row items-center bg-white p-5 rounded-[24px] mb-4 shadow-xl shadow-neutral-300/50 border border-gray-100"
            >
              <View className="w-12 h-12 rounded-2xl bg-emerald-50 items-center justify-center mr-4">
                <Image source={icons.to} className="w-5 h-5" tintColor="#10b981" />
              </View>

              <View className="flex-1">
                <Text className="text-[15px] font-JakartaBold text-gray-900 mb-0.5" numberOfLines={1}>
                  Ride #{item.rideId}
                </Text>
                <Text className="text-xs font-JakartaMedium text-gray-400">
                  {formatDate(item.createdAt)}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-lg font-JakartaExtraBold text-emerald-600">
                  +₦{(item.driverPayout ?? item.farePrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <View className="bg-emerald-50 px-2 py-0.5 rounded-lg mt-1 border border-emerald-100">
                  <Text className="text-[9px] font-JakartaBold text-emerald-600 uppercase tracking-widest">
                    {item.paymentStatus || "Paid"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View className="items-center py-20">
              <Image source={noResultImage} className="w-40 h-40 opacity-20 mb-4" resizeMode="contain" />
              <Text className="text-gray-400 font-JakartaMedium text-lg text-center">No service earnings yet</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default Earnings;
