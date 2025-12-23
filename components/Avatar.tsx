import React from "react";
import { Image, Text, View } from "react-native";

interface AvatarProps {
    source?: string | null;
    name: string;
    size?: number;
    className?: string;
}

const Avatar = ({ source, name, size = 12, className }: AvatarProps) => {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    if (source) {
        let fullSource = source;
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || "";

        if (source.includes("localhost") || source.includes("127.0.0.1")) {
            // Replace localhost origin with API URL origin
            // This handles both http://localhost:3000/path and localhost:3000/path
            fullSource = source.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, apiUrl);
        } else if (!source.startsWith("http")) {
            fullSource = `${apiUrl}${source.startsWith("/") ? "" : "/"}${source}`;
        }

        return (
            <Image
                source={{ uri: fullSource }}
                className={`rounded-full ${className}`}
                style={{ width: size * 4, height: size * 4 }}
            />
        );
    }

    return (
        <View
            className={`rounded-full bg-blue-100 items-center justify-center ${className}`}
            style={{ width: size * 4, height: size * 4 }}
        >
            <Text className="text-blue-600 font-JakartaBold text-lg">{initials}</Text>
        </View>
    );
};

export default Avatar;
