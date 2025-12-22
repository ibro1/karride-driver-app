import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Image, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { icons } from "@/constants";
import { useFetch, fetchAPI } from "@/lib/fetch";
import { useUser } from "@/lib/auth-context";
import { io, Socket } from "socket.io-client";

interface Message {
    id: number;
    senderId: string;
    content: string;
    createdAt: string;
}

const SupportChat = () => {
    const { id, initialMessage, initialBotReply } = useLocalSearchParams();
    const { user } = useUser();
    const { data: messagesData, loading, refetch } = useFetch<any>(`/api/support/messages/${id}`);

    const [ticketStatus, setTicketStatus] = useState<string>("open");

    // Seed with initial message AND bot reply if available
    const [messages, setMessages] = useState<Message[]>(() => {
        const initialInfo: Message[] = [];
        const now = Date.now();

        if (initialMessage) {
            initialInfo.push({
                id: now,
                senderId: user?.id || "user",
                content: initialMessage as string,
                createdAt: new Date(now).toISOString()
            });
        }

        if (initialBotReply) {
            initialInfo.push({
                id: now + 1,
                senderId: "bot",
                content: initialBotReply as string,
                createdAt: new Date(now + 1).toISOString()
            });
        }

        return initialInfo;
    });

    const [inputText, setInputText] = useState("");
    const [sending, setSending] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const flatListRef = useRef<FlatList>(null);

    const handleResolve = async () => {
        Alert.alert("Close Chat", "Are you sure you want to mark this issue as resolved?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Yes, Resolve",
                onPress: async () => {
                    try {
                        await fetchAPI(`/api/support/${id}/status`, {
                            method: "POST",
                            body: JSON.stringify({ status: 'resolved' })
                        });
                        setTicketStatus('resolved');
                        router.back();
                    } catch (e) {
                        Alert.alert("Error", "Could not resolve ticket");
                    }
                }
            }
        ]);
    };

    // Initial Load - Merge/Replace optimistic message
    useEffect(() => {
        if (messagesData?.messages) {
            setMessages(messagesData.messages);
        }
        if (messagesData?.ticket) {
            setTicketStatus(messagesData.ticket.status);
        }
    }, [messagesData]);

    // Socket Connection
    useEffect(() => {
        if (!id) return;

        // console.log("Connecting to Socket for Ticket:", id);
        socketRef.current = io(process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000");

        socketRef.current.emit("join_support_chat", { ticketId: id });

        socketRef.current.on("new_support_message", (message: Message) => {
            // console.log("Socket received message:", message);
            setMessages((prev) => {
                // Prevent duplicates
                if (prev.some(m => m.id === message.id || (m.createdAt === message.createdAt && m.content === message.content))) {
                    return prev;
                }
                return [...prev, message];
            });
            setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [id]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        setSending(true);
        const text = inputText;
        setInputText(""); // Clear input immediately

        // Optimistic Update
        const tempId = Date.now();
        const optimisticMessage: Message = {
            id: tempId,
            senderId: user?.id || "user",
            content: text,
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);

        try {
            const response = await fetchAPI(`/api/support/messages/${id}`, {
                method: "POST",
                body: JSON.stringify({ content: text }),
            });

            if (response.success) {
                // Update optimistic message with real ID if available
                if (response.message && response.message.id !== tempId) {
                    setMessages(prev => prev.map(m => m.id === tempId ? response.message : m));
                }

                // HANDLE BOT MESSAGE FALLBACK
                if (response.botMessage) {
                    setMessages(prev => {
                        if (prev.some(m => m.id === response.botMessage.id)) return prev;
                        return [...prev, response.botMessage];
                    });
                    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
                }

            } else {
                console.error("Failed to send message", response);
                // Optionally remove optimistic message here
            }
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.senderId === user?.id || item.senderId === "user"; // Handle simplified senderId
        const isBot = item.senderId === "bot";

        return (
            <View className={`my-2 flex-row ${isUser ? "justify-end" : "justify-start"}`}>
                {!isUser && (
                    <View className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${isBot ? "bg-purple-100" : "bg-neutral-200"}`}>
                        {isBot ? (
                            <Text className="text-xs font-bold text-purple-600">AI</Text>
                        ) : (
                            <Image source={icons.person} className="w-4 h-4" resizeMode="contain" tintColor="#555" />
                        )}
                    </View>
                )}

                <View
                    className={`max-w-[75%] px-4 py-3 rounded-2xl ${isUser
                        ? "bg-[#0286FF] rounded-br-none"
                        : "bg-neutral-100 rounded-bl-none"
                        }`}
                >
                    <Text className={`text-base ${isUser ? "text-white" : "text-neutral-800"}`}>
                        {item.content}
                    </Text>
                    <Text className={`text-[10px] mt-1 ${isUser ? "text-blue-100" : "text-neutral-400"} text-right`}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex flex-row items-center justify-between px-5 py-4 bg-white shadow-sm z-10">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()}>
                        <View className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center">
                            <Image
                                source={icons.backArrow}
                                resizeMode="contain"
                                className="w-6 h-6"
                            />
                        </View>
                    </TouchableOpacity>
                    <View className="ml-5">
                        <Text className="text-xl font-JakartaSemiBold">Support Chat</Text>
                        <Text className="text-xs text-neutral-500">Ticket #{id}</Text>
                    </View>
                </View>

                {ticketStatus !== 'closed' && ticketStatus !== 'resolved' && (
                    <TouchableOpacity onPress={handleResolve} className="bg-green-100 px-3 py-1 rounded-full">
                        <Text className="text-green-700 font-JakartaMedium text-xs">Resolve</Text>
                    </TouchableOpacity>
                )}
            </View>

            {loading && messages.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#0286FF" />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderMessage}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center mt-10">
                            <Text className="text-neutral-400">No messages yet. Type below to start.</Text>
                        </View>
                    }
                />
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="absolute bottom-0 w-full bg-white border-t border-neutral-100 px-4 py-3"
            >
                <View className="flex-row items-center bg-neutral-50 rounded-full px-4 border border-neutral-200">
                    <TextInput
                        className="flex-1 py-3 text-base font-JakartaMedium text-neutral-800 max-h-24"
                        placeholder="Type a message..."
                        placeholderTextColor="#9CA3AF"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={!inputText.trim() || sending}
                        className={`ml-2 p-2 rounded-full ${!inputText.trim() ? "opacity-50" : ""}`}
                    >
                        <Image source={icons.arrowDown} className="w-6 h-6 -rotate-90" tintColor="#0286FF" resizeMode="contain" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SupportChat;
