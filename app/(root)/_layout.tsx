import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="ride/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="earnings" options={{ headerShown: false }} />

      <Stack.Screen name="support/index" options={{ headerShown: false }} />
      <Stack.Screen name="support/new-ticket" options={{ headerShown: false }} />
      <Stack.Screen name="support/chat/[id]" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
