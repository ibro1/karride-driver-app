import { View, Text } from "react-native";

interface RideStatusBadgeProps {
    status: string;
}

const RideStatusBadge = ({ status }: RideStatusBadgeProps) => {
    const getStatusStyles = () => {
        switch (status?.toLowerCase()) {
            case "completed":
                return {
                    bg: "bg-emerald-100",
                    text: "text-emerald-700",
                    dot: "bg-emerald-500",
                    label: "Completed",
                };
            case "in_progress":
                return {
                    bg: "bg-blue-100",
                    text: "text-blue-700",
                    dot: "bg-blue-500",
                    label: "In Progress",
                };
            case "cancelled":
                return {
                    bg: "bg-red-100",
                    text: "text-red-700",
                    dot: "bg-red-500",
                    label: "Cancelled",
                };
            case "rejected":
                return {
                    bg: "bg-red-100",
                    text: "text-red-700",
                    dot: "bg-red-500",
                    label: "Rejected",
                };
            case "pending":
            case "requested":
                return {
                    bg: "bg-amber-100",
                    text: "text-amber-700",
                    dot: "bg-amber-500",
                    label: "Requested",
                };
            default:
                return {
                    bg: "bg-amber-100",
                    text: "text-amber-700",
                    dot: "bg-amber-500",
                    label: status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending",
                };
        }
    };

    const styles = getStatusStyles();

    return (
        <View className={`flex-row items-center px-3 py-1 rounded-full shrink-0 ${styles.bg}`}>
            <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${styles.dot}`} />
            <Text className={`text-[11px] font-JakartaBold capitalize ${styles.text}`}>
                {styles.label}
            </Text>
        </View>
    );
};

export default RideStatusBadge;
