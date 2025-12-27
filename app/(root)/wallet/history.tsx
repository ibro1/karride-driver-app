import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { icons, images } from "@/constants";
const noResultImage = images.noResult;
import { useFetch } from "@/lib/fetch";
import { formatDate } from "@/lib/utils";

const PayoutHistory = () => {
    const { data: historyData, loading, error } = useFetch<any>("/api/driver/transactions");
    const transactions = historyData?.data || [];

    const formatTimeOfDay = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'success': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'failed': return 'text-red-600 bg-red-100';
            default: return 'text-neutral-500 bg-neutral-100';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center px-5 py-4 border-b border-neutral-100">
                <TouchableOpacity onPress={() => router.back()}>
                    <Image source={icons.backArrow} className="w-6 h-6" resizeMode="contain" />
                </TouchableOpacity>
                <Text className="text-xl font-JakartaBold text-neutral-800 ml-4">Payout History</Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#059669" />
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={() => (
                        <View className="items-center py-10">
                            <Image source={noResultImage} className="w-40 h-40" resizeMode="contain" />
                            <Text className="text-neutral-500 font-JakartaMedium mt-4">No payout history yet.</Text>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <View className="flex-row justify-between items-center bg-white p-4 rounded-xl border border-neutral-100 mb-3 shadow-sm">
                            <View className="flex-1 mr-4">
                                <Text className="text-base font-JakartaBold text-neutral-800 mb-1">
                                    {item.type === 'withdrawal' ? 'Cash Out' : 'Trip Earned'}
                                </Text>
                                <Text className="text-xs text-neutral-500 mb-1">
                                    {formatDate(item.createdAt)} • {formatTimeOfDay(item.createdAt)}
                                </Text>
                                <Text className="text-xs text-neutral-400" numberOfLines={1}>
                                    {item.description || (item.type === 'withdrawal' ? 'Bank Transfer' : 'Ride Income')}
                                </Text>
                            </View>
                            <View className="items-end">
                                <Text className="text-lg font-JakartaBold text-neutral-800 mb-1">
                                    {item.type === 'withdrawal' ? '-' : '+'}₦{item.amount?.toFixed(2)}
                                </Text>
                                <View className={`px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                                    <Text className={`text-[10px] font-JakartaBold capitalize ${getStatusColor(item.status).split(' ')[0]}`}>
                                        {item.type === 'withdrawal' ? item.status : 'Settled'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

export default PayoutHistory;
