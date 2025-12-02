import { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

// Initialize socket outside component to avoid multiple connections
let socket: Socket;

const Chat = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // TODO: Get active ride ID from context or store
  // For now, we'll use a dummy ID or fetch the active ride
  const activeRideId = 1; // Replace with actual logic to get active ride

  const { data: history, loading } = useFetch<{ data: Message[] }>(`/api/chat/${activeRideId}`);

  useEffect(() => {
    if (history?.data) {
      setMessages(history.data);
    }
  }, [history]);

  useEffect(() => {
    // Connect to socket
    socket = io(process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000");

    socket.on("connect", () => {
      console.log("Connected to socket server");
      socket.emit("join_chat_room", activeRideId);
    });

    socket.on("receive_message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [activeRideId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !user) return;

    const newMessage = {
      rideId: activeRideId,
      senderId: user.id,
      receiverId: "rider_id_placeholder", // TODO: Get rider ID from active ride
      content: inputText.trim(),
    };

    try {
      // Optimistic update
      const tempMessage: Message = {
        id: Date.now(),
        senderId: user.id,
        receiverId: "rider_id_placeholder",
        content: inputText.trim(),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempMessage]);
      setInputText("");

      // Send to API
      const token = await SecureStore.getItemAsync("session_token");
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/chat/${activeRideId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(newMessage),
      });

      // Emit to socket (optional, if server doesn't broadcast on API save)
      // socket.emit("send_message", newMessage); 
      // Our server implementation broadcasts on "send_message" event, 
      // BUT we decided in server.ts that client calls API, and we might need to emit to socket manually 
      // OR server broadcasts. 
      // Let's check server.ts again. 
      // Server.ts listens to "send_message" and broadcasts "receive_message".
      // So we should emit "send_message" here AFTER API call success, 
      // OR rely on API to emit. 
      // Current server.ts implementation expects "send_message" event to broadcast.

      socket.emit("send_message", {
        ...newMessage,
        createdAt: new Date().toISOString()
      });

    } catch (error) {
      console.error("Failed to send message:", error);
      // Revert optimistic update if needed
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-200">
        <Text className="text-xl font-JakartaBold">Chat</Text>
      </View>

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
              className={`flex-row mb-4 ${isOwnMessage ? "justify-end" : "justify-start"
                }`}
            >
              <View
                className={`max-w-[80%] p-3 rounded-2xl ${isOwnMessage
                    ? "bg-[#0286FF] rounded-tr-none"
                    : "bg-gray-100 rounded-tl-none"
                  }`}
              >
                <Text
                  className={`${isOwnMessage ? "text-white" : "text-black"
                    } font-JakartaMedium`}
                >
                  {item.content}
                </Text>
                <Text
                  className={`text-xs mt-1 ${isOwnMessage ? "text-blue-100" : "text-gray-400"
                    }`}
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
              source={icons.point} // Use a send icon if available, fallback to point
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

export default Chat;
