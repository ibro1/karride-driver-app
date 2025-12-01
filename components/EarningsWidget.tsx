import { View, Text, TouchableOpacity, Image } from "react-native";
import { icons } from "@/constants";
import { router } from "expo-router";

interface EarningsWidgetProps {
    earnings: number;
    ridesCount: number;
}

const EarningsWidget = ({ earnings, ridesCount }: EarningsWidgetProps) => {
    return (
        <View className="bg-white rounded-2xl p-5 shadow-sm shadow-neutral-300 mx-5 mb-5">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-JakartaBold text-neutral-800">
                    Today's Summary
                </Text>
                <TouchableOpacity
                    onPress={() => router.push("/(root)/earnings")}
                    className="flex-row items-center"
                >
                    <Text className="text-sm font-JakartaMedium text-primary-500 mr-1">
                        Details
                    </Text>
                    <Image source={icons.arrowDown} className="w-4 h-4 -rotate-90" tintColor="#0286FF" resizeMode="contain" />
                </TouchableOpacity>
            </View>

            <View className="flex-row justify-between items-center">
                <View className="items-center flex-1 border-r border-neutral-200">
                    <Text className="text-2xl font-JakartaBold text-neutral-800">
                        ₦{earnings.toFixed(2)}
                    </Text>
                    <Text className="text-sm font-JakartaMedium text-neutral-500">
                        Earnings
                    </Text>
                </View>

                <View className="items-center flex-1">
                    <Text className="text-2xl font-JakartaBold text-neutral-800">
                        {ridesCount}
                    </Text>
                    <Text className="text-sm font-JakartaMedium text-neutral-500">
                        Rides
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default EarningsWidget;
