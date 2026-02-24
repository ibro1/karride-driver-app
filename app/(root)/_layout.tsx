import { Stack } from "expo-router";
import { useEffect } from "react";
import { usePushNotifications } from "@/lib/notifications";
import { fetchAPI } from "@/lib/fetch";

const Layout = () => {
  const { expoPushToken } = usePushNotifications();

  useEffect(() => {
    if (expoPushToken) {
      const syncToken = async () => {
        try {
          await fetchAPI("/api/user/push-token", {
            method: "POST",
            body: JSON.stringify({ pushToken: expoPushToken }),
          });
          console.log("Push Token Synced");
        } catch (error) {
          console.error("Failed to sync push token", error);
        }
      };
      syncToken();
    }
  }, [expoPushToken]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="ride/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="earnings" options={{ headerShown: false }} />

      <Stack.Screen name="ride-history/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="support/index" options={{ headerShown: false }} />
      <Stack.Screen name="support/new-ticket" options={{ headerShown: false }} />
      <Stack.Screen name="support/chat/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="emergency-contacts" options={{ headerShown: false }} />
      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
      <Stack.Screen name="edit-vehicle" options={{ headerShown: false }} />

      <Stack.Screen name="wallet/add-bank" options={{ headerShown: false }} />
      <Stack.Screen name="wallet/withdraw" options={{ headerShown: false }} />
      <Stack.Screen name="wallet/history" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
