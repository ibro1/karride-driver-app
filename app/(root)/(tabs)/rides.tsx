import { useUser } from "@/lib/auth-context";
import { ActivityIndicator, FlatList, Image, Text, View, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useMemo } from "react";

import RideCard from "@/components/RideCard";
import RideCardSkeleton from "@/components/RideCardSkeleton";
import RideSummaryStats from "@/components/RideSummaryStats";
import { images } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { Ride } from "@/types/type";
import { formatDate } from "@/lib/utils";

const Rides = () => {
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: recentRides,
    loading,
    refetch,
  } = useFetch<Ride[]>(`/api/driver/${user?.id}/rides`);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Group rides by date
  const groupedRides = useMemo(() => {
    if (!recentRides) return [];

    const groups: { title: string; data: Ride[] }[] = [];
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

    recentRides.forEach((ride) => {
      const rideDate = new Date(ride.created_at).toLocaleDateString();
      let title = formatDate(ride.created_at);

      if (rideDate === today) title = "Today";
      else if (rideDate === yesterday) title = "Yesterday";

      const existingGroup = groups.find((g) => g.title === title);
      if (existingGroup) {
        existingGroup.data.push(ride);
      } else {
        groups.push({ title, data: [ride] });
      }
    });

    return groups;
  }, [recentRides]);

  // Flattened data with section headers for FlatList
  const flatData = useMemo(() => {
    const data: (string | Ride)[] = [];
    groupedRides.forEach((group) => {
      data.push(group.title);
      data.push(...group.data);
    });
    return data;
  }, [groupedRides]);

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <FlatList
        data={loading ? [1, 2, 3] : flatData}
        renderItem={({ item, index }) => {
          if (loading) return <RideCardSkeleton />;
          if (typeof item === "string") {
            return (
              <Text className="text-sm font-JakartaBold text-gray-400 mt-6 mb-3 uppercase tracking-widest">
                {item}
              </Text>
            );
          }
          return <RideCard ride={item} />;
        }}
        keyExtractor={(item, index) => index.toString()}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />
        }
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center mt-20">
            {!loading && (
              <>
                <Image
                  source={images.noResult}
                  className="w-40 h-40 opacity-50"
                  alt="No rides found"
                  resizeMode="contain"
                />
                <Text className="text-gray-400 font-JakartaMedium mt-2">No service activity found yet</Text>
              </>
            )}
          </View>
        )}
        ListHeaderComponent={
          <View className="pt-6 pb-2">
            <View className="flex-row items-center justify-between mb-6">
              <View>
                <Text className="text-3xl font-JakartaExtraBold text-gray-900">Trip History</Text>
                <Text className="text-gray-500 font-JakartaMedium mt-0.5">Overview of your service performance</Text>
              </View>
            </View>

            {recentRides && recentRides.length > 0 && (
              <RideSummaryStats rides={recentRides} />
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Rides;
