import { View } from "react-native";
import Skeleton from "./Skeleton";

export const SummaryCardSkeleton = () => (
    <View className="bg-emerald-600/10 rounded-[36px] p-8 border border-emerald-100 mb-6">
        <View className="mb-2">
            <Skeleton width={120} height={12} borderRadius={6} style={{ backgroundColor: "#10b981", opacity: 0.2 }} />
        </View>
        <View className="mb-8">
            <Skeleton width={200} height={48} borderRadius={12} style={{ backgroundColor: "#10b981", opacity: 0.2 }} />
        </View>

        <View className="flex-row gap-4 mb-8">
            <View className="flex-1 bg-emerald-50 rounded-[24px] p-4 border border-emerald-100">
                <View className="mb-1">
                    <Skeleton width={40} height={10} borderRadius={5} />
                </View>
                <Skeleton width={80} height={24} borderRadius={8} />
            </View>
            <View className="flex-1 bg-emerald-50 rounded-[24px] p-4 border border-emerald-100">
                <View className="mb-1">
                    <Skeleton width={40} height={10} borderRadius={5} />
                </View>
                <Skeleton width={40} height={24} borderRadius={8} />
            </View>
        </View>

        <View className="flex-row gap-4">
            <View className="flex-1 bg-white h-14 rounded-2xl items-center justify-center opacity-50">
                <Skeleton width={80} height={20} borderRadius={10} />
            </View>
            <View className="flex-1 bg-emerald-500 h-14 rounded-2xl items-center justify-center opacity-50">
                <Skeleton width={80} height={20} borderRadius={10} />
            </View>
        </View>
    </View>
);

export const EarningsItemSkeleton = () => (
    <View className="flex-row items-center bg-white p-5 rounded-[24px] mb-4 border border-gray-50 shadow-sm">
        <View className="w-12 h-12 rounded-2xl bg-neutral-50 items-center justify-center mr-4">
            <Skeleton width={24} height={24} borderRadius={6} />
        </View>

        <View className="flex-1">
            <View className="mb-2">
                <Skeleton width={120} height={16} borderRadius={8} />
            </View>
            <Skeleton width={80} height={12} borderRadius={6} />
        </View>

        <View className="items-end">
            <View className="mb-2">
                <Skeleton width={70} height={20} borderRadius={10} />
            </View>
            <Skeleton width={50} height={14} borderRadius={7} />
        </View>
    </View>
);
