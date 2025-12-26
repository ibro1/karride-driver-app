import { View, Text } from "react-native";
import { BlurView } from "expo-blur";
import { Ride } from "@/types/type";

interface RideSummaryStatsProps {
    rides: Ride[];
}

const RideSummaryStats = ({ rides }: RideSummaryStatsProps) => {
    const completedRides = rides.filter(r => r.status === 'completed');
    const totalEarnings = completedRides.reduce((acc, r) => acc + (r.fare_price || 0), 0);

    // Calculate avg rating
    const avgRating = "5.0";

    return (
        <View className="mb-8 overflow-hidden rounded-[32px] shadow-2xl shadow-emerald-500/10 border border-white/20">
            <BlurView intensity={80} tint="light" className="flex-row justify-between p-7 bg-white/40">
                <View className="items-center flex-1">
                    <Text className="text-gray-400 text-[10px] font-JakartaBold mb-1 uppercase tracking-widest">Trips</Text>
                    <Text className="text-2xl font-JakartaExtraBold text-gray-900">{completedRides.length}</Text>
                </View>

                <View className="w-[1px] h-10 bg-gray-200/50 self-center" />

                <View className="items-center flex-1">
                    <Text className="text-gray-400 text-[10px] font-JakartaBold mb-1 uppercase tracking-widest">Net Earned</Text>
                    <Text className="text-2xl font-JakartaExtraBold text-emerald-600">
                        ₦{totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </Text>
                </View>

                <View className="w-[1px] h-10 bg-gray-200/50 self-center" />

                <View className="items-center flex-1">
                    <Text className="text-gray-400 text-[10px] font-JakartaBold mb-1 uppercase tracking-widest">Rating</Text>
                    <View className="flex-row items-center">
                        <Text className="text-2xl font-JakartaExtraBold text-gray-900">{avgRating}</Text>
                        <Text className="text-amber-400 ml-1 text-base">★</Text>
                    </View>
                </View>
            </BlurView>
        </View>
    );
};

export default RideSummaryStats;
