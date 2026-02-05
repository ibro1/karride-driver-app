import { useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { icons, images } from "@/constants";
const noResultImage = images.noResult;
import { useFetch } from "@/lib/fetch";
import { useUser } from "@/lib/auth-context";
import { formatDate, formatTime } from "@/lib/utils";

import { EarningsItemSkeleton } from "@/components/EarningsSkeleton";
import Skeleton from "@/components/Skeleton";

const Earnings = () => {
  const { user } = useUser();
  const { data: earningsData, loading, error, refetch } = useFetch<any>(`/api/driver/${user?.id}/earnings`);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  // Use dummy data for skeleton loaders when loading
  const listData = loading
    ? [1, 2, 3, 4, 5] // Dummy items for skeleton list
    : (earningsData?.recent_rides || []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-3 border-b border-neutral-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Image source={icons.backArrow} className="w-6 h-6" resizeMode="contain" />
        </TouchableOpacity>
        <Text className="text-xl font-JakartaBold text-neutral-800">Earnings</Text>
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item, index) => loading ? `skeleton-${index}` : (item.rideId?.toString() || Math.random().toString())}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View className="mb-6">
            {/* Summary Card - Premium KarRide Purple Look */}
            <View className="bg-[#9D00FF] rounded-[36px] p-8 shadow-2xl shadow-purple-200 overflow-hidden relative">
              {/* Decorative Pattern / Glass Glow */}
              <View className="absolute -top-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
              <View className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl" />

              <Text className="text-purple-100 text-[10px] font-JakartaBold mb-1 uppercase tracking-[2px]">Available Balance</Text>

              {loading ? (
                <View className="mb-8 mt-2">
                  <Skeleton width={200} height={40} borderRadius={12} style={{ backgroundColor: "#ffffff20", opacity: 0.5 }} />
                </View>
              ) : (
                <Text className="text-white text-5xl font-JakartaExtraBold mb-8">
                  ₦{earningsData?.available_balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                </Text>
              )}

              <View className="flex-row gap-3 mb-8">
                <View className="flex-1 bg-white/10 rounded-[24px] p-3 border border-white/20">
                  <Text className="text-purple-50 text-[9px] font-JakartaBold uppercase tracking-tighter mb-1">Total</Text>
                  {loading ? (
                    <Skeleton width={80} height={20} borderRadius={6} style={{ backgroundColor: "#ffffff20", opacity: 0.5 }} />
                  ) : (
                    <Text className="text-white text-lg font-JakartaBold" numberOfLines={1}>
                      ₦{earningsData?.today_earnings?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || "0"}
                    </Text>
                  )}
                </View>

                <View className="flex-1 bg-white/10 rounded-[24px] p-3 border border-white/20">
                  <Text className="text-purple-50 text-[9px] font-JakartaBold uppercase tracking-tighter mb-1">Cash</Text>
                  {loading ? (
                    <Skeleton width={80} height={20} borderRadius={6} style={{ backgroundColor: "#ffffff20", opacity: 0.5 }} />
                  ) : (
                    <Text className="text-white text-lg font-JakartaBold" numberOfLines={1}>
                      ₦{earningsData?.today_cash?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || "0"}
                    </Text>
                  )}
                </View>

                <View className="w-20 bg-white/10 rounded-[24px] p-3 border border-white/20 items-center">
                  <Text className="text-purple-50 text-[9px] font-JakartaBold uppercase tracking-tighter mb-1">Trips</Text>
                  {loading ? (
                    <Skeleton width={20} height={20} borderRadius={6} style={{ backgroundColor: "#ffffff20", opacity: 0.5 }} />
                  ) : (
                    <Text className="text-white text-lg font-JakartaBold">
                      {earningsData?.today_rides || 0}
                    </Text>
                  )}
                </View>
              </View>

              <View className="flex-row gap-4">
                <TouchableOpacity
                  onPress={() => router.push("/(root)/wallet/withdraw" as any)}
                  className="flex-1 bg-white py-4 rounded-2xl items-center shadow-lg shadow-purple-900/10"
                >
                  <Text className="text-[#9D00FF] font-JakartaBold text-lg">Cash Out</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/(root)/wallet/add-bank")}
                  className="flex-1 bg-[#9D00FF]/10 py-4 rounded-2xl items-center border border-white/20"
                >
                  <Text className="text-white font-JakartaBold text-lg">Bank Info</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mt-10 flex-row items-center justify-between mb-4 px-1">
              <Text className="text-2xl font-JakartaExtraBold text-neutral-900">Recent Trips</Text>
              {!loading && (
                <TouchableOpacity onPress={() => router.push("/(tabs)/rides")}>
                  <Text className="text-sm font-JakartaBold text-[#9D00FF]">See All</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        renderItem={({ item }) => loading ? (
          <EarningsItemSkeleton />
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push(`/(root)/ride-history/${item.rideId}` as any)}
            className="flex-row items-center bg-white p-5 rounded-[24px] mb-4 shadow-sm border border-neutral-100"
          >
            <View className="w-12 h-12 rounded-2xl bg-purple-50 items-center justify-center mr-4">
              <Image source={icons.to} className="w-5 h-5" tintColor="#9D00FF" />
            </View>

            <View className="flex-1">
              <Text className="text-[15px] font-JakartaBold text-neutral-900 mb-0.5" numberOfLines={1}>
                Ride #{item.rideId}
              </Text>
              <Text className="text-xs font-JakartaMedium text-neutral-400">
                {formatDate(item.createdAt)}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-lg font-JakartaExtraBold text-[#9D00FF]">
                +₦{(item.driverPayout ?? item.farePrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <View className="bg-purple-50 px-2.5 py-1 rounded-lg mt-1 border border-purple-100">
                <Text className="text-[9px] font-JakartaExtraBold text-[#9D00FF] uppercase tracking-widest">
                  Earned
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => !loading && (
          <View className="items-center py-20">
            <Image source={noResultImage} className="w-40 h-40 opacity-20 mb-4" resizeMode="contain" />
            <Text className="text-gray-400 font-JakartaMedium text-lg text-center">No service earnings yet</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Earnings;
