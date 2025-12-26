import { View } from "react-native";
import Skeleton from "./Skeleton";

const RideCardSkeleton = () => {
    return (
        <View className="flex flex-col bg-white rounded-2xl shadow-sm shadow-neutral-200 mb-4 p-4 border-l-4 border-gray-200">
            {/* Header */}
            <View className="flex flex-row items-center justify-between w-full mb-4">
                <Skeleton width={120} height={16} borderRadius={8} />
                <Skeleton width={60} height={24} borderRadius={12} />
            </View>

            {/* Middle */}
            <View className="flex flex-row items-center w-full mb-4">
                <View className="flex-1 gap-y-3">
                    <View className="flex-row items-center gap-x-2">
                        <Skeleton width={20} height={20} borderRadius={10} />
                        <Skeleton width="80%" height={14} borderRadius={7} />
                    </View>
                    <View className="flex-row items-center gap-x-2">
                        <Skeleton width={20} height={20} borderRadius={10} />
                        <Skeleton width="70%" height={14} borderRadius={7} />
                    </View>
                </View>
            </View>

            {/* Divider */}
            <View className="w-full h-[1px] bg-neutral-100 mb-4" />

            {/* Footer */}
            <View className="flex flex-row items-center justify-between w-full">
                <View className="flex flex-row items-center gap-x-3">
                    <Skeleton width={40} height={40} borderRadius={20} />
                    <View className="gap-y-1">
                        <Skeleton width={80} height={14} borderRadius={7} />
                        <Skeleton width={40} height={10} borderRadius={5} />
                    </View>
                </View>
                <View className="items-end gap-y-1">
                    <Skeleton width={70} height={20} borderRadius={10} />
                    <Skeleton width={40} height={10} borderRadius={5} />
                </View>
            </View>
        </View>
    );
};

export default RideCardSkeleton;
