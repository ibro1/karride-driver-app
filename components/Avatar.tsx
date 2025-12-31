import React, { useState } from "react";
import { Image, Text, View } from "react-native";

interface AvatarProps {
    source?: string | null;
    name: string;
    size?: number;
    className?: string;
}

const Avatar = ({ source, name, size = 12, className }: AvatarProps) => {
    const [imageError, setImageError] = useState(false);

    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    // Validate source URL - check for empty strings, null values
    const hasValidSource = source &&
        source.trim() !== "" &&
        source !== "null" &&
        source !== "undefined";

    // Show initials if no valid source OR if image failed to load
    if (!hasValidSource || imageError) {
        return (
            <View
                className={`rounded-full bg-blue-100 items-center justify-center ${className}`}
                style={{ width: size * 4, height: size * 4 }}
            >
                <Text className="text-blue-600 font-JakartaBold text-lg">{initials}</Text>
            </View>
        );
    }

    let fullSource = source;
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || "";

    // Fix URLs with /app/uploads (legacy issue)
    if (fullSource.includes('/app/uploads/')) {
        fullSource = fullSource.replace('/app/uploads/', '/uploads/');
    }

    // In development, replace production domain with local API URL
    if (apiUrl && (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1') || apiUrl.match(/\d+\.\d+\.\d+\.\d+/))) {
        fullSource = fullSource.replace('https://karride.ng', apiUrl);
        fullSource = fullSource.replace('http://karride.ng', apiUrl);
    }

    if (source.includes("localhost") || source.includes("127.0.0.1")) {
        fullSource = source.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, apiUrl);
    } else if (!source.startsWith("http")) {
        fullSource = `${apiUrl}${source.startsWith("/") ? "" : "/"}${source}`;
    }

    return (
        <Image
            source={{ uri: fullSource }}
            className={`rounded-full ${className}`}
            style={{ width: size * 4, height: size * 4 }}
            onError={() => {
                console.log("Failed to load avatar:", fullSource);
                setImageError(true);
            }}
        />
    );
};

export default Avatar;

