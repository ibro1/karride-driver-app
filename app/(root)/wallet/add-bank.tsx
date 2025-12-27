import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, Modal, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { icons } from "@/constants";
import { fetchAPI, useFetch } from "@/lib/fetch"; // Ensure fetchAPI is exported

const AddBank = () => {
    // Form State
    const [accountNumber, setAccountNumber] = useState("");
    const [selectedBank, setSelectedBank] = useState<any>(null);
    const [resolvedName, setResolvedName] = useState("");
    const [resolving, setResolving] = useState(false);
    const [saving, setSaving] = useState(false);

    // Bank Selection Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Data Fetching
    const { data: banksData, loading: loadingBanks } = useFetch<any>("/api/banks/list");
    const { data: savedBanksData, loading: loadingSaved, refetch: refetchSaved } = useFetch<any>("/api/driver/bank/list");

    const banks = banksData?.banks || [];
    const savedBanks = savedBanksData?.accounts || [];

    const filteredBanks = banks.filter((b: any) =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Auto-resolve when account number is 10 digits and bank is selected
    useEffect(() => {
        if (selectedBank && accountNumber.length === 10) {
            resolveAccount();
        } else {
            setResolvedName("");
        }
    }, [selectedBank, accountNumber]);

    const resolveAccount = async () => {
        setResolving(true);
        try {
            const res = await fetchAPI("/api/banks/resolve", {
                method: "POST",
                body: JSON.stringify({
                    accountNumber,
                    bankCode: selectedBank.code
                })
            });
            if (res.success) {
                setResolvedName(res.account_name);
            } else {
                setResolvedName("");
                Alert.alert("Invalid Account", "Could not resolve account name. Please check details.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setResolving(false);
        }
    };

    const [showForm, setShowForm] = useState(false);
    const currentBank = savedBanksData?.accounts?.[0]; // usage of single account policy

    const handleSave = async () => {
        if (!resolvedName) return;
        setSaving(true);
        try {
            const res = await fetchAPI("/api/driver/bank/add", {
                method: "POST",
                body: JSON.stringify({
                    account_number: accountNumber,
                    bank_code: selectedBank.code,
                    bank_name: selectedBank.name,
                    account_name: resolvedName,
                })
            });

            if (res.success) {
                Alert.alert("Success", "Bank account updated successfully!");
                setAccountNumber("");
                setSelectedBank(null);
                setResolvedName("");
                setShowForm(false); // Hide form after save
                refetchSaved();
            } else {
                Alert.alert("Error", res.error || "Failed to update bank account.");
            }
        } catch (error) {
            Alert.alert("Error", "Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center px-5 py-4 border-b border-neutral-100">
                <TouchableOpacity onPress={() => router.back()}>
                    <Image source={icons.backArrow} className="w-6 h-6" resizeMode="contain" />
                </TouchableOpacity>
                <Text className="text-xl font-JakartaBold text-neutral-800 ml-4">Payout Method</Text>
            </View>

            <ScrollView className="p-5">
                {/* Loading Skeleton */}
                {loadingSaved ? (
                    <View className="items-center mt-4">
                        <View className="w-20 h-20 bg-neutral-200 rounded-full mb-4 animate-pulse" />
                        <View className="w-48 h-6 bg-neutral-200 rounded mb-2 animate-pulse" />
                        <View className="w-64 h-8 bg-neutral-200 rounded mb-8 animate-pulse" />
                        <View className="w-full h-14 bg-neutral-200 rounded-full animate-pulse" />
                    </View>
                ) : currentBank && !showForm ? (
                    <View className="items-center mt-4">
                        <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
                            <Image source={icons.checkmark} className="w-10 h-10 tint-green-600" resizeMode="contain" />
                        </View>
                        <Text className="text-xl font-JakartaBold text-neutral-800">{currentBank.bankName}</Text>
                        <Text className="text-3xl font-JakartaExtraBold text-neutral-900 my-2">{currentBank.accountNumber}</Text>
                        <Text className="text-base text-neutral-500 font-JakartaMedium uppercase mb-8">{currentBank.accountName}</Text>

                        <TouchableOpacity
                            onPress={() => setShowForm(true)}
                            className="w-full bg-neutral-100 py-4 rounded-full items-center border border-neutral-200"
                        >
                            <Text className="text-neutral-800 font-JakartaBold text-lg">Change Bank Details</Text>
                        </TouchableOpacity>

                        <Text className="text-center text-neutral-400 text-sm mt-4 px-10">
                            Updating your bank details will replace the current account for all future payouts.
                        </Text>
                    </View>
                ) : (
                    <View>
                        <Text className="text-lg font-JakartaBold text-neutral-800 mb-6">
                            {currentBank ? "Update Bank Details" : "Add Bank Details"}
                        </Text>

                        {/* Form Section */}
                        <Text className="text-base font-JakartaMedium text-neutral-500 mb-2">Select Bank</Text>
                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                            className="flex-row justify-between items-center bg-neutral-50 border border-neutral-200 p-4 rounded-xl mb-6"
                        >
                            <Text className={`text-base font-JakartaMedium ${selectedBank ? 'text-neutral-800' : 'text-neutral-400'}`}>
                                {selectedBank?.name || "Choose a bank"}
                            </Text>
                            <Image source={icons.arrowDown} className="w-5 h-5 tint-neutral-400" resizeMode="contain" />
                        </TouchableOpacity>

                        <Text className="text-base font-JakartaMedium text-neutral-500 mb-2">Account Number</Text>
                        <TextInput
                            className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl text-xl font-JakartaBold text-neutral-800 mb-6"
                            placeholder="0123456789"
                            keyboardType="numeric"
                            maxLength={10}
                            value={accountNumber}
                            onChangeText={setAccountNumber}
                        />

                        {resolving && (
                            <View className="flex-row items-center justify-center mb-6">
                                <ActivityIndicator size="small" color="#059669" />
                                <Text className="text-neutral-500 ml-2 font-JakartaMedium">Verifying account...</Text>
                            </View>
                        )}

                        {resolvedName ? (
                            <View className="bg-green-50 border border-green-200 p-4 rounded-xl mb-6 flex-row items-center">
                                <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                                    <Image source={icons.checkmark} className="w-4 h-4 tint-green-600" resizeMode="contain" />
                                </View>
                                <View>
                                    <Text className="text-xs text-green-600 font-JakartaBold uppercase">Account Verified</Text>
                                    <Text className="text-lg font-JakartaBold text-green-800">{resolvedName}</Text>
                                </View>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={!resolvedName || saving}
                            className={`w-full py-4 rounded-full items-center mt-4 ${(!resolvedName || saving) ? 'bg-neutral-300' : 'bg-emerald-600'}`}
                        >
                            {saving ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-JakartaBold text-lg">
                                    {currentBank ? "Update Account" : "Save Account"}
                                </Text>
                            )}
                        </TouchableOpacity>

                        {currentBank && (
                            <TouchableOpacity onPress={() => setShowForm(false)} className="mt-4 py-3">
                                <Text className="text-center text-neutral-500 font-JakartaMedium">Cancel</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                <View className="h-20" />
            </ScrollView>

            {/* Bank Selection Modal */}
            <Modal visible={modalVisible} animationType="slide">
                <SafeAreaView className="flex-1 bg-white">
                    <View className="px-5 py-4 border-b border-neutral-100 flex-row items-center">
                        <TouchableOpacity onPress={() => setModalVisible(false)} className="mr-4">
                            <Image source={icons.backArrow} className="w-6 h-6" resizeMode="contain" />
                        </TouchableOpacity>
                        <TextInput
                            className="flex-1 bg-neutral-100 p-3 rounded-lg font-JakartaMedium"
                            placeholder="Search bank..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                    </View>

                    {loadingBanks ? (
                        <ActivityIndicator size="large" color="#059669" className="mt-10" />
                    ) : (
                        <FlatList
                            data={filteredBanks}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className="p-5 border-b border-neutral-100"
                                    onPress={() => {
                                        setSelectedBank(item);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text className="text-base font-JakartaMedium text-neutral-800">{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

export default AddBank;
