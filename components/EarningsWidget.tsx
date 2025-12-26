import { View, Text, TouchableOpacity, Image } from "react-native";
import { icons } from "@/constants";
import { router } from "expo-router";

interface EarningsWidgetProps {
    earnings: number;
    ridesCount: number;
}

const EarningsWidget = ({ earnings, ridesCount }: EarningsWidgetProps) => {
    return (
        <View className="bg-white rounded-3xl p-6 shadow-sm shadow-neutral-200 mx-5 mb-6 border border-neutral-50">
            <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center">
                    <View className="w-1 h-4 bg-emerald-500 rounded-full mr-2" />
                    <Text className="text-lg font-JakartaBold text-gray-900">
                        Today's Summary
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.push("/(root)/earnings")}
                    className="bg-neutral-50 px-3 py-1.5 rounded-xl flex-row items-center"
                >
                    <Text className="text-xs font-JakartaBold text-blue-600 mr-1">
                        View Details
                    </Text>
                    <Image source={icons.arrowDown} className="w-3 h-3 -rotate-90" tintColor="#2563eb" resizeMode="contain" />
                </TouchableOpacity>
            </View>

            <View className="flex-row justify-between items-center">
                <View className="items-center flex-1 border-r border-neutral-100">
                    <Text className="text-2xl font-JakartaExtraBold text-emerald-600">
                        ₦{earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                    <Text className="text-[12px] font-JakartaMedium text-gray-400 mt-1 uppercase tracking-wider">
                        Earnings
                    </Text>
                </View>

                <View className="items-center flex-1">
                    <Text className="text-2xl font-JakartaExtraBold text-gray-900">
                        {ridesCount}
                    </Text>
                    <Text className="text-[12px] font-JakartaMedium text-gray-400 mt-1 uppercase tracking-wider">
                        Trips
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default EarningsWidget;
