import { useUser } from "@/lib/auth-context";
import { Image, ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/constants";
import { router } from "expo-router";
import Avatar from "@/components/Avatar";
import { useFetch } from "@/lib/fetch";
import Skeleton from "@/components/Skeleton";

const Profile = () => {
  const { user, logout } = useUser();
  const { data: profileData, loading, error } = useFetch<any>("/api/driver/profile");

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  const driver = profileData?.driver;
  const vehicle = profileData?.vehicle;
  const stats = profileData?.stats;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-JakartaBold my-5">My Profile</Text>

        {/* Header Section */}
        <View className="flex items-center justify-center mb-8">
          <View className="relative">
            <Avatar
              source={user?.image}
              name={user?.name || "Driver"}
              size={28}
              className="border-4 border-white shadow-lg"
            />
            <View className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-2 border-white items-center justify-center">
              <Image source={icons.checkmark} className="w-3 h-3" tintColor="white" />
            </View>
          </View>

          <Text className="text-2xl font-JakartaBold mt-4 text-neutral-800">
            {user?.name || "Driver Name"}
          </Text>
          <Text className="text-base text-neutral-500 mb-2">{user?.email}</Text>

          <View className="flex-row items-center bg-neutral-100 px-3 py-1 rounded-full">
            <Image source={icons.star} className="w-4 h-4 mr-1" />
            <Text className="text-sm font-JakartaBold text-neutral-800">
              {loading ? (
                <Text>...</Text>
              ) : (
                <>
                  {driver?.rating?.toFixed(1) || "5.0"}
                  <Text className="text-neutral-500 font-JakartaRegular"> ({driver?.ratingCount || 0} reviews)</Text>
                </>
              )}
            </Text>
          </View>
        </View>

        {/* Wallet Balance Card */}
        <View className="bg-[#0286FF] p-5 rounded-2xl shadow-md mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white/80 font-JakartaMedium text-sm">Wallet Balance</Text>
            <View className="bg-white/20 p-2 rounded-full">
              <Image source={icons.dollar} className="w-4 h-4" tintColor="white" resizeMode="contain" />
            </View>
          </View>
          {loading ? (
            <Skeleton width={150} height={40} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
          ) : (
            <Text className="text-3xl font-JakartaBold text-white">
              ₦{driver?.walletBalance?.toFixed(2) || "0.00"}
            </Text>
          )}
        </View>

        {/* Stats Grid */}
        <View className="flex-row justify-between mb-6">
          <View className="bg-neutral-50 p-4 rounded-2xl flex-1 mr-2 items-center">
            {loading ? (
              <Skeleton width={40} height={30} style={{ marginBottom: 4 }} />
            ) : (
              <Text className="text-2xl font-JakartaBold text-primary-500">{stats?.totalRides || 0}</Text>
            )}
            <Text className="text-xs text-neutral-500 font-JakartaMedium mt-1">Total Rides</Text>
          </View>
          <View className="bg-neutral-50 p-4 rounded-2xl flex-1 ml-2 items-center">
            {loading ? (
              <Skeleton width={40} height={30} style={{ marginBottom: 4 }} />
            ) : (
              <Text className="text-2xl font-JakartaBold text-green-500">{stats?.yearsActive || 1}</Text>
            )}
            <Text className="text-xs text-neutral-500 font-JakartaMedium mt-1">Years Active</Text>
          </View>
        </View>

        {/* Vehicle Info Card */}
        <View className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-JakartaBold text-neutral-800">Vehicle Details</Text>
            <TouchableOpacity onPress={() => router.push("/(root)/edit-vehicle")}>
              <Text className="text-primary-500 font-JakartaMedium text-sm">Edit</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-neutral-100 rounded-full items-center justify-center mr-4">
              <Image source={icons.list} className="w-6 h-6" resizeMode="contain" tintColor="#0286FF" />
            </View>
            <View>
              {loading ? (
                <>
                  <Skeleton width={120} height={20} style={{ marginBottom: 6 }} />
                  <Skeleton width={180} height={16} />
                </>
              ) : (
                <>
                  <Text className="text-base font-JakartaBold text-neutral-800">
                    {vehicle?.make} {vehicle?.model}
                  </Text>
                  <Text className="text-sm text-neutral-500">
                    {vehicle?.plateNumber} • {vehicle?.color}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm">
          {[
            { icon: icons.person, label: "Edit Profile", route: "/(root)/edit-profile" },
            { icon: icons.chat, label: "Support & Help", route: "/(root)/(tabs)/chat" },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(item.route as any)}
              className="flex-row items-center p-4 border-b border-neutral-100"
            >
              <View className="w-8 h-8 bg-neutral-50 rounded-full items-center justify-center mr-3">
                <Image source={item.icon} className="w-4 h-4" resizeMode="contain" tintColor="#333" />
              </View>
              <Text className="text-base font-JakartaMedium text-neutral-800 flex-1">{item.label}</Text>
              <Image source={icons.arrowDown} className="w-4 h-4 -rotate-90" tintColor="#C4C4C4" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center p-4"
          >
            <View className="w-8 h-8 bg-red-50 rounded-full items-center justify-center mr-3">
              <Image source={icons.out} className="w-4 h-4" resizeMode="contain" tintColor="#EF4444" />
            </View>
            <Text className="text-base font-JakartaMedium text-red-500 flex-1">Log Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
