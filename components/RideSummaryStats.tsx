import { View, Text } from "react-native";
import { BlurView } from "expo-blur";
import { Ride } from "@/types/type";

interface RideSummaryStatsProps {
    rides: Ride[];
}

const RideSummaryStats = ({ rides }: RideSummaryStatsProps) => {
    const completedRides = rides.filter(r => r.status === 'completed');
    const totalEarnings = completedRides.reduce((acc, r) => acc + (r.fare_price || 0), 0);

    // Calculate average rider rating from completed rides
    const ridesWithRatings = completedRides.filter(r => r.rider?.rating != null);
    const avgRating = ridesWithRatings.length > 0
        ? (ridesWithRatings.reduce((acc, r) => acc + (parseFloat(r.rider?.rating || '0')), 0) / ridesWithRatings.length).toFixed(1)
        : 'N/A';

    return (
        <View className="mb-8 overflow-hidden rounded-[32px] shadow-xl shadow-neutral-200 border border-neutral-100 bg-white">
            <View className="flex-row justify-between p-6">
                <View className="items-center flex-1">
                    <Text className="text-neutral-400 text-[9px] font-JakartaBold mb-1 uppercase tracking-wider">Trips</Text>
                    <Text className="text-xl font-JakartaExtraBold text-neutral-900">{completedRides.length}</Text>
                </View>

                <View className="w-[1px] h-8 bg-neutral-100 self-center" />

                <View className="items-center flex-2 px-2">
                    <Text className="text-neutral-400 text-[9px] font-JakartaBold mb-1 uppercase tracking-wider text-center">Net Earned</Text>
                    <Text
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        className="text-xl font-JakartaExtraBold text-[#9D00FF]"
                    >
                        ₦{totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </Text>
                </View>

                <View className="w-[1px] h-8 bg-neutral-100 self-center" />

                <View className="items-center flex-1">
                    <Text className="text-neutral-400 text-[9px] font-JakartaBold mb-1 uppercase tracking-wider">Rating</Text>
                    <View className="flex-row items-center">
                        <Text className="text-xl font-JakartaExtraBold text-neutral-900">{avgRating}</Text>
                        <Text className="text-amber-400 ml-1 text-base">★</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default RideSummaryStats;
