import { useState, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { useUser } from "@/lib/auth-context";

const faqs = [
    { id: 1, question: "How do I request a refund?", answer: "Go to your ride history, select the ride, and tap 'Report Issue'." },
    { id: 2, question: "Why is my account pending?", answer: "We are verifying your documents. This usually takes 24-48 hours." },
    { id: 3, question: "Can I change my payment method?", answer: "Yes, you can update it in your Wallet settings." },
];

const SupportHome = () => {
    const { user } = useUser();
    const { data: ticketsData, loading, error, refetch } = useFetch<any>("/api/support/list");
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    useFocusEffect(
        useCallback(() => {
            console.log("SupportHome focused, refetching tickets...");
            refetch();
        }, [refetch])
    );

    useEffect(() => {
        if (ticketsData) console.log("Tickets Data:", JSON.stringify(ticketsData, null, 2));
        if (loading) console.log("Loading tickets...");
        if (error) console.error("SupportHome Fetch Error:", error);
    }, [ticketsData, loading, error]);

    const renderTicket = ({ item }: { item: any }) => (
        <TouchableOpacity
            className="bg-white p-4 rounded-xl border border-neutral-100 mb-3"
            onPress={() => router.push(`/(root)/support/chat/${item.id}` as any)}
        >
            <View className="flex-row justify-between items-center mb-2">
                <Text className="font-JakartaBold text-neutral-800 text-base">{item.category}</Text>
                <View className={`px-2 py-1 rounded-full ${item.status === 'resolved' ? 'bg-green-100' : 'bg-blue-100'}`}>
                    <Text className={`text-xs capitalize font-JakartaMedium ${item.status === 'resolved' ? 'text-green-600' : 'text-blue-600'}`}>
                        {item.status}
                    </Text>
                </View>
            </View>
            <Text className="text-neutral-500 text-sm" numberOfLines={1}>{item.subject}</Text>
            <Text className="text-neutral-400 text-xs mt-2">{new Date(item.createdAt).toLocaleDateString()}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-neutral-50">
            {/* Custom Header Matching RideLayout */}
            <View className="flex flex-row items-center justify-start px-5 py-4 bg-white shadow-sm z-10">
                <TouchableOpacity onPress={() => router.back()}>
                    <View className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center">
                        <Image
                            source={icons.backArrow}
                            resizeMode="contain"
                            className="w-6 h-6"
                        />
                    </View>
                </TouchableOpacity>
                <Text className="text-xl font-JakartaSemiBold ml-5">
                    Help & Support
                </Text>
            </View>

            <ScrollView className="flex-1 px-5 pt-5">
                {/* FAQ Section */}
                <Text className="text-lg font-JakartaBold mb-3">Frequently Asked Questions</Text>
                <View className="mb-6">
                    {faqs.map((faq) => (
                        <TouchableOpacity
                            key={faq.id}
                            activeOpacity={0.8}
                            onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                            className="bg-white p-4 rounded-xl border border-neutral-100 mb-2"
                        >
                            <View className="flex-row justify-between items-center">
                                <Text className="font-JakartaMedium text-neutral-800 flex-1">{faq.question}</Text>
                                <Image
                                    source={icons.arrowDown}
                                    className={`w-4 h-4 tint-neutral-400 ${expandedFaq === faq.id ? 'rotate-180' : ''}`}
                                    resizeMode="contain"
                                />
                            </View>
                            {expandedFaq === faq.id && (
                                <Text className="text-neutral-500 text-sm mt-2 leading-5">{faq.answer}</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Recent Tickets Section */}
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-lg font-JakartaBold">Recent Tickets</Text>
                    <TouchableOpacity onPress={() => router.push("/(root)/support/new-ticket")}>
                        <Text className="text-primary-500 font-JakartaMedium">Start Chat</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="small" color="#0286FF" />
                ) : (ticketsData?.tickets && ticketsData.tickets.length > 0) ? (
                    <View>
                        {ticketsData.tickets.map((ticket: any) => (
                            <View key={ticket.id}>{renderTicket({ item: ticket })}</View>
                        ))}
                    </View>
                ) : (
                    <View className="items-center justify-center py-10">
                        <Text className="text-neutral-400">No active tickets</Text>
                        <TouchableOpacity
                            onPress={() => router.push("/(root)/support/new-ticket")}
                            className="bg-[#0286FF] px-6 py-3 rounded-full mt-4"
                        >
                            <Text className="text-white font-JakartaBold">Chat with Support</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
};

export default SupportHome;
