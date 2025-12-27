import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, Modal, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { icons } from "@/constants";
import { fetchAPI, useFetch } from "@/lib/fetch";
import { useUser } from "@/lib/auth-context";

const Withdraw = () => {
    // const { user } = useUser(); // Don't rely on stale user context
    const { data: banksData, loading: loadingBanks } = useFetch<any>("/api/driver/bank/list");
    const { data: balanceData, loading: loadingBalance } = useFetch<any>("/api/driver/balance");

    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const defaultBank = banksData?.accounts?.[0];
    const currentBalance = balanceData?.balance || 0;

    const handleWithdraw = async () => {
        if (!amount || isNaN(Number(amount))) {
            Alert.alert("Error", "Please enter a valid amount");
            return;
        }
        if (Number(amount) > currentBalance) {
            Alert.alert("Error", `Insufficient balance. You only have ₦${currentBalance.toLocaleString()} available.`);
            return;
        }
        if (Number(amount) < 100) {
            Alert.alert("Error", "Minimum withdrawal is ₦100");
            return;
        }
        if (!defaultBank) {
            Alert.alert("Error", "Please setup your bank account first");
            return;
        }

        setLoading(true);
        try {
            const res = await fetchAPI("/api/driver/withdraw", {
                method: "POST",
                body: JSON.stringify({
                    amount: Number(amount),
                    bank_id: defaultBank.id
                })
            });

            if (res.success) {
                Alert.alert("Submitted", "Withdrawal request placed successfully! It will be processed shortly.");
                router.back();
            } else {
                Alert.alert("Error", res.error || "Failed to withdraw");
            }
        } catch (error) {
            Alert.alert("Error", "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center px-5 py-4 border-b border-neutral-100">
                <TouchableOpacity onPress={() => router.back()}>
                    <Image source={icons.backArrow} className="w-6 h-6" resizeMode="contain" />
                </TouchableOpacity>
                <Text className="text-xl font-JakartaBold text-neutral-800 ml-4">Cash Out</Text>
            </View>

            <ScrollView className="p-5">
                <View className="mb-6">
                    <Text className="text-neutral-500 font-JakartaMedium mb-2">Available for Withdrawal</Text>
                    {loadingBalance ? (
                        <View className="w-48 h-10 bg-neutral-200 rounded animate-pulse my-1" />
                    ) : (
                        <Text className="text-4xl font-JakartaBold text-neutral-800">
                            ₦{currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                    )}
                </View>

                <Text className="text-neutral-500 font-JakartaMedium mb-2">Amount to Withdraw (₦)</Text>
                <TextInput
                    className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl text-3xl font-JakartaBold text-neutral-800 mb-6"
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                />

                <Text className="text-neutral-500 font-JakartaMedium mb-3">To Bank Account</Text>
                {loadingBanks ? (
                    <View className="bg-white border border-neutral-200 rounded-xl p-4 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 bg-neutral-200 rounded-full mr-3 animate-pulse" />
                            <View>
                                <View className="w-32 h-6 bg-neutral-200 rounded mb-1 animate-pulse" />
                                <View className="w-24 h-4 bg-neutral-200 rounded animate-pulse" />
                            </View>
                        </View>
                    </View>
                ) : defaultBank ? (
                    <View className="bg-white border border-neutral-200 rounded-xl p-4 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 bg-neutral-100 rounded-full items-center justify-center mr-3">
                                <Image source={icons.checkmark} className="w-6 h-6 tint-neutral-600" resizeMode="contain" />
                            </View>
                            <View>
                                <Text className="font-JakartaBold text-neutral-800 text-lg">{defaultBank.bankName}</Text>
                                <Text className="text-neutral-500 font-JakartaMedium">{defaultBank.accountNumber}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => router.push("/(root)/wallet/add-bank")}>
                            <Text className="text-emerald-600 font-JakartaBold">Change</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={() => router.push("/(root)/wallet/add-bank")}
                        className="p-6 rounded-xl border border-dashed border-emerald-500 bg-emerald-50 items-center justify-center"
                    >
                        <Text className="font-JakartaBold text-emerald-600 text-lg mb-1">Add Bank Account</Text>
                        <Text className="text-emerald-400 text-sm text-center">You need to link a bank account to cash out.</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    onPress={handleWithdraw}
                    disabled={loading || !amount || !defaultBank}
                    className={`w-full py-4 rounded-full items-center mt-8 ${loading || !amount || !defaultBank ? 'bg-neutral-300' : 'bg-emerald-600'}`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-JakartaBold text-lg">Confirm Cash Out</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push("/(root)/wallet/history")}
                    className="mt-6 items-center"
                >
                    <Text className="text-emerald-600 font-JakartaMedium text-base">View Payout History</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Withdraw;
