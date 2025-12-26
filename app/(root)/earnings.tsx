import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { icons } from "@/constants";
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
              {/* Summary Card - Modern Premium Look */}
              <View className="bg-slate-900 rounded-[32px] p-7 shadow-xl mb-8 overflow-hidden relative">
                {/* Decorative Pattern / Glow */}
                <View className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl" />

                <Text className="text-blue-400 text-xs font-JakartaBold mb-1 uppercase tracking-widest">Available Balance</Text>
                <Text className="text-white text-4xl font-JakartaExtraBold mb-6">
                  ₦{earningsData?.total_earnings?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                </Text>

                <View className="flex-row gap-4 mb-6">
                  <View className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10">
                    <Text className="text-white/40 text-[10px] font-JakartaBold uppercase tracking-tighter">Today</Text>
                    <Text className="text-white text-lg font-JakartaBold">
                      ₦{earningsData?.today_earnings?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                    </Text>
                  </View>
                  <View className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10">
                    <Text className="text-white/40 text-[10px] font-JakartaBold uppercase tracking-tighter">Trips</Text>
                    <Text className="text-white text-lg font-JakartaBold">
                      {earningsData?.today_rides || 0}
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => router.push("/(root)/wallet/withdraw" as any)}
                    className="flex-1 bg-blue-600 py-4 rounded-2xl items-center shadow-lg shadow-blue-900/40"
                  >
                    <Text className="text-white font-JakartaBold text-sm">Cash Out</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push("/(root)/wallet/add-bank")}
                    className="w-14 h-14 bg-white/10 rounded-2xl items-center justify-center border border-white/10"
                  >
                    <Image source={icons.profile} className="w-5 h-5" tintColor="white" />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="flex-row items-center justify-between mb-4 px-1">
                <Text className="text-lg font-JakartaExtraBold text-gray-900">Recent Transactions</Text>
                <TouchableOpacity>
                  <Text className="text-xs font-JakartaBold text-blue-600">See All</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-row items-center bg-white p-4 rounded-2xl mb-4 shadow-sm shadow-neutral-100 border-l-4 border-emerald-500"
            >
              <View className="w-10 h-10 rounded-xl bg-emerald-50 items-center justify-center mr-4">
                <Image source={icons.to} className="w-4 h-4" tintColor="#10b981" />
              </View>

              <View className="flex-1">
                <Text className="text-sm font-JakartaBold text-gray-900 mb-0.5" numberOfLines={1}>
                  Trip Completion #{item.rideId}
                </Text>
                <Text className="text-[11px] font-JakartaMedium text-gray-400">
                  {formatDate(item.createdAt)} • {formatTime(item.rideTime)}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-base font-JakartaExtraBold text-emerald-600">
                  +₦{(item.driverPayout ?? item.farePrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <View className="bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
                  <Text className="text-[9px] font-JakartaBold text-emerald-600 uppercase tracking-tighter">
                    {item.paymentStatus || "Paid"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View className="items-center py-20">
              <Image source={images.noResult} className="w-20 h-20 opacity-20 mb-4" resizeMode="contain" />
              <Text className="text-gray-400 font-JakartaMedium">No recent transactions</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default Earnings;
