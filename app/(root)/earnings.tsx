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
          <ActivityIndicator size="large" color="#0286FF" />
        </View>
      ) : (
        <FlatList
          data={earningsData?.recent_rides || []}
          keyExtractor={(item) => item.rideId?.toString() || Math.random().toString()}
          contentContainerStyle={{ padding: 20 }}
          ListHeaderComponent={() => (
            <View className="mb-6">
              {/* Summary Card */}
              <View className="bg-[#0286FF] rounded-2xl p-6 shadow-md mb-6">
                <Text className="text-white text-lg font-JakartaMedium mb-2">Total Earnings</Text>
                <Text className="text-white text-4xl font-JakartaBold mb-4">
                  ₦{earningsData?.total_earnings?.toFixed(2) || "0.00"}
                </Text>
                
                <View className="flex-row justify-between bg-white/20 rounded-xl p-4">
                  <View>
                    <Text className="text-white/80 text-sm font-JakartaMedium">Today</Text>
                    <Text className="text-white text-xl font-JakartaBold">
                      ₦{earningsData?.today_earnings?.toFixed(2) || "0.00"}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-white/80 text-sm font-JakartaMedium">Rides</Text>
                    <Text className="text-white text-xl font-JakartaBold">
                      {earningsData?.today_rides || 0}
                    </Text>
                  </View>
                </View>
              </View>

              <Text className="text-lg font-JakartaBold text-neutral-800 mb-4">Recent Transactions</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View className="flex-row justify-between items-center bg-white p-4 rounded-xl border border-neutral-100 mb-3 shadow-sm">
              <View className="flex-1">
                <Text className="text-base font-JakartaBold text-neutral-800 mb-1">
                  Ride #{item.rideId}
                </Text>
                <Text className="text-sm text-neutral-500">
                  {formatDate(item.createdAt)} • {formatTime(item.rideTime)}
                </Text>
                <Text className="text-xs text-neutral-400 mt-1" numberOfLines={1}>
                  {item.destinationAddress}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-lg font-JakartaBold text-green-500">
                  +₦{item.farePrice?.toFixed(2)}
                </Text>
                <Text className="text-xs text-neutral-400 capitalize">
                  {item.paymentStatus}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <View className="items-center py-10">
              <Text className="text-neutral-500">No recent transactions</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default Earnings;
