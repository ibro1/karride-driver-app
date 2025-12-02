import { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { io, Socket } from "socket.io-client";
import * as SecureStore from "expo-secure-store";

import { useUser } from "@/lib/auth-context";
import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";

interface Message {
    id: number;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
}

interface Ride {
    id: number;
    rider: {
        id: string;
        name: string;
        email: string;
        image?: string;
    };
    status: string;
}

let socket: Socket | null = null;

const ChatDetails = () => {
    const { id } = useLocalSearchParams();
    const { user } = useUser();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const flatListRef = useRef<FlatList>(null);

    const { data: ride, loading: rideLoading } = useFetch<Ride>(`/api/rides/${id}`);
    const { data: history, loading: historyLoading } = useFetch<{ data: Message[] }>(`/api/chat/${id}`);

    useEffect(() => {
        if (history?.data) {
            setMessages(history.data);
        }
    }, [history]);

    useEffect(() => {
        if (!id) return;

        socket = io(process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000");

        socket.on("connect", () => {
            console.log("Connected to socket server");
            socket?.emit("join_chat_room", id);
        });

        socket.on("receive_message", (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket?.disconnect();
            socket = null;
        };
    }, [id]);

    useEffect(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim() || !user || !ride) return;

        const newMessage = {
            rideId: Number(id),
            senderId: user.id,
            receiverId: ride.rider.id,
            content: inputText.trim(),
        };

        try {
            const tempMessage: Message = {
                id: Date.now(),
                senderId: user.id,
                receiverId: ride.rider.id,
                content: inputText.trim(),
                createdAt: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, tempMessage]);
            setInputText("");

            const token = await SecureStore.getItemAsync("session_token");
            await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/chat/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(newMessage),
            });

            socket?.emit("send_message", {
                ...newMessage,
                createdAt: new Date().toISOString()
            });

        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    if (rideLoading || historyLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#0286FF" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Image source={icons.backArrow} className="w-6 h-6" resizeMode="contain" />
                </TouchableOpacity>
                <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center mr-3">
                        {ride?.rider?.image ? (
                            <Image
                                source={{ uri: ride.rider.image }}
                                className="w-10 h-10 rounded-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <Image
                                source={icons.profile}
                                className="w-5 h-5"
                                tintColor="#6B7280"
                                resizeMode="contain"
                            />
                        )}
                    </View>
                    <View>
                        <Text className="text-lg font-JakartaBold">{ride?.rider?.name || "Rider"}</Text>
                        <Text className="text-sm text-gray-500">Active Ride</Text>
                    </View>
                </View>
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                className="flex-1 px-4"
                contentContainerStyle={{ paddingVertical: 20 }}
                renderItem={({ item }) => {
                    const isOwnMessage = item.senderId === user?.id;
                    return (
                        <View
                            className={`flex-row mb-4 ${isOwnMessage ? "justify-end" : "justify-start"}`}
                        >
                            <View
                                className={`max-w-[80%] p-3 rounded-2xl ${isOwnMessage
                                        ? "bg-[#0286FF] rounded-tr-none"
                                        : "bg-gray-100 rounded-tl-none"
                                    }`}
                            >
                                <Text
                                    className={`${isOwnMessage ? "text-white" : "text-black"} font-JakartaMedium`}
                                >
                                    {item.content}
                                </Text>
                                <Text
                                    className={`text-xs mt-1 ${isOwnMessage ? "text-blue-100" : "text-gray-400"}`}
                                >
                                    {new Date(item.createdAt).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </Text>
                            </View>
                        </View>
                    );
                }}
            />

            {/* Input */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            >
                <View className="flex-row items-center p-4 border-t border-gray-200 bg-white">
                    <TextInput
                        className="flex-1 bg-gray-100 rounded-full px-4 py-3 font-JakartaMedium mr-3"
                        placeholder="Type a message..."
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        className="bg-[#0286FF] p-3 rounded-full"
                        disabled={!inputText.trim()}
                    >
                        <Image
                            source={icons.point}
                            className="w-5 h-5"
                            tintColor="white"
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ChatDetails;
