import { useState } from "react";
import { View, Text, TouchableOpacity, Image, TextInput, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { icons } from "@/constants";
import { fetchAPI } from "@/lib/fetch";

const categories = ["Ride Issue", "Payment", "Account", "Technical", "Other"];

const NewTicket = () => {
    const [selectedCategory, setSelectedCategory] = useState("Ride Issue");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreateTicket = async () => {
        if (!message.trim()) {
            Alert.alert("Error", "Please explain your issue.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetchAPI("/api/support/create", {
                method: "POST",
                body: JSON.stringify({
                    category: selectedCategory,
                    content: message,
                    subject: `${selectedCategory} Request`
                }),
            });

            if (response.success) {
                // Navigate to Chat with initial message for optimistic UI
                router.replace({
                    pathname: `/(root)/support/chat/${response.ticket.id}` as any,
                    params: {
                        initialMessage: message,
                        initialBotReply: response.initialBotReply || ""
                    }
                });
            } else {
                Alert.alert("Error", response.error || "Failed to create ticket");
            }
        } catch (error) {
            Alert.alert("Error", "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex flex-row items-center justify-start px-5 py-4 bg-white z-10">
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
                    New Support Chat
                </Text>
            </View>

            <ScrollView className="px-5 pt-6">
                <Text className="text-base font-JakartaMedium text-neutral-800 mb-2">Select a Topic</Text>
                <View className="flex-row flex-wrap gap-2 mb-6">
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full border ${selectedCategory === cat ? "bg-[#0286FF] border-[#0286FF]" : "bg-white border-neutral-200"}`}
                        >
                            <Text className={`font-JakartaMedium ${selectedCategory === cat ? "text-white" : "text-neutral-600"}`}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text className="text-base font-JakartaMedium text-neutral-800 mb-2">How can we help?</Text>
                <TextInput
                    className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-neutral-800 font-JakartaMedium h-40"
                    placeholder="Describe your issue..."
                    textAlignVertical="top"
                    multiline
                    value={message}
                    onChangeText={setMessage}
                />

                <TouchableOpacity
                    onPress={handleCreateTicket}
                    disabled={loading}
                    className={`mt-8 py-4 rounded-full items-center ${loading ? "bg-neutral-300" : "bg-[#0286FF]"}`}
                >
                    <Text className="text-white font-JakartaBold text-lg">
                        {loading ? "Starting Chat..." : "Start Chat"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default NewTicket;
