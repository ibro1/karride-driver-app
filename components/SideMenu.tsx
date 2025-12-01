import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Modal from "react-native-modal";
import { router } from "expo-router";
import { icons } from "@/constants";
import { useUser } from "@/lib/auth-context";
import Avatar from "@/components/Avatar";

interface SideMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

const SideMenu = ({ isVisible, onClose }: SideMenuProps) => {
  const { user, logout } = useUser();

  const menuItems = [
    { icon: icons.profile, label: "Profile", route: "/(root)/(tabs)/profile" },
    { icon: icons.dollar, label: "Earnings", route: "/(root)/earnings" },
    { icon: icons.list, label: "Ride History", route: "/(root)/(tabs)/rides" },
    { icon: icons.chat, label: "Support", route: "/(root)/(tabs)/chat" },
  ];

  const handleNavigation = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    router.replace("/(auth)/sign-in");
  }

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="left"
      animationIn="slideInLeft"
      animationOut="slideOutLeft"
      style={{ margin: 0, justifyContent: "flex-start" }}
    >
      <View className="bg-white h-full w-[75%] p-5 pt-16">
        {/* Header */}
        <View className="flex-row items-center mb-10">
          <Avatar
            source={user?.image}
            name={user?.name || "Driver"}
            size={16}
            className="border-2 border-primary-500"
          />
          <View className="ml-4">
            <Text className="text-lg font-JakartaBold text-neutral-800">
              {user?.name || "Driver"}
            </Text>
            <Text className="text-sm text-neutral-500">{user?.email}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="flex-1">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleNavigation(item.route)}
              className="flex-row items-center py-4 border-b border-neutral-100"
            >
              <Image
                source={item.icon}
                className="w-6 h-6 mr-4"
                resizeMode="contain"
                tintColor="#333"
              />
              <Text className="text-base font-JakartaMedium text-neutral-800">
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center py-4 mt-auto mb-10"
        >
          <Image source={icons.out} className="w-6 h-6 mr-4" resizeMode="contain" tintColor="#EF4444" />
          <Text className="text-base font-JakartaBold text-red-500">
            Log Out
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default SideMenu;
