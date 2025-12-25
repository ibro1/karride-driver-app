import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Image, ActivityIndicator, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Contacts from "expo-contacts";
import { icons } from "@/constants";
import { useUser } from "@/lib/auth-context";
import { updateUserProfile } from "@/lib/auth-api";
import { useFetch } from "@/lib/fetch";

interface Contact {
    name: string;
    phone: string;
    email?: string;
}

const EmergencyContacts = () => {
    // We use user context but fetch latest profile data to be sure
    const { user } = useUser();
    const { data: profileData, loading: loadingProfile, refetch } = useFetch<any>("/api/driver/profile");

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (profileData?.emergencyContacts) {
            setContacts(profileData.emergencyContacts);
        }
    }, [profileData]);

    const handleImportContact = async () => {
        try {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Allow access to contacts to import.');
                return;
            }

            const contact = await Contacts.presentContactPickerAsync();
            if (contact) {
                setName(contact.name || "");
                if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
                    setPhone(contact.phoneNumbers[0].number || "");
                }
                if (contact.emails && contact.emails.length > 0) {
                    setEmail(contact.emails[0].email || "");
                }
            }
        } catch (error) {
            // Don't alert on cancel
            if (typeof error === 'object' && error !== null && 'message' in error && (error as any).message.includes('User canceled')) {
                return;
            }
            console.log('Error importing contact:', error);
            Alert.alert('Error', 'Failed to access contacts or canceled.');
        }
    };

    const handleAddContact = async () => {
        if (!name || !phone) {
            Alert.alert("Error", "Name and Phone are required");
            return;
        }

        const newContact = { name, phone, email };
        const updatedContacts = [...contacts, newContact];

        setSaving(true);
        try {
            // Driver API expects emergencyContacts in the body
            await updateUserProfile({ emergencyContacts: updatedContacts });

            setContacts(updatedContacts);
            refetch(); // Reload from server to be sure

            setModalVisible(false);
            setName("");
            setPhone("");
            setEmail("");
            Alert.alert("Success", "Emergency contact added");
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to add contact");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteContact = async (index: number) => {
        Alert.alert("Delete Contact", "Are you sure you want to remove this contact?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    const updatedContacts = contacts.filter((_, i) => i !== index);
                    setSaving(true);
                    try {
                        await updateUserProfile({ emergencyContacts: updatedContacts });
                        setContacts(updatedContacts);
                        refetch();
                    } catch (error: any) {
                        Alert.alert("Error", error.message || "Failed to delete contact");
                    } finally {
                        setSaving(false);
                    }
                }
            }
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center p-5 border-b border-neutral-100">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Image source={icons.backArrow} className="w-6 h-6" resizeMode="contain" />
                </TouchableOpacity>
                <Text className="text-xl font-JakartaBold">Emergency Contacts</Text>
            </View>

            <ScrollView className="flex-1 p-5">
                <Text className="text-gray-500 mb-6">
                    Add trusted contacts who can be reached in case of an emergency.
                </Text>

                {loadingProfile && contacts.length === 0 ? (
                    <ActivityIndicator color="#0286FF" className="mt-10" />
                ) : (
                    <>
                        {contacts.map((contact, index) => (
                            <View key={index} className="flex-row items-center justify-between bg-neutral-50 p-4 rounded-xl mb-3 border border-neutral-100">
                                <View>
                                    <Text className="font-JakartaBold text-neutral-800">{contact.name}</Text>
                                    <Text className="text-neutral-500 text-sm">{contact.phone}</Text>
                                    {contact.email && <Text className="text-neutral-400 text-xs">{contact.email}</Text>}
                                </View>
                                <TouchableOpacity onPress={() => handleDeleteContact(index)} className="p-2">
                                    <Image source={icons.close} className="w-5 h-5 opacity-40" resizeMode="contain" />
                                </TouchableOpacity>
                            </View>
                        ))}

                        {contacts.length === 0 && (
                            <View className="items-center justify-center py-10">
                                <Text className="text-neutral-400">No emergency contacts added yet.</Text>
                            </View>
                        )}
                    </>
                )}

                {!loadingProfile && contacts.length < 5 && (
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        className="flex-row items-center justify-center bg-[#0286FF]/10 p-4 rounded-xl mt-4 border border-[#0286FF]/20 border-dashed"
                    >
                        <Text className="text-[#0286FF] font-JakartaBold">+ Add New Contact</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* Add Contact Modal */}
            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 h-[80%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-JakartaBold">Add Contact</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Image source={icons.close} className="w-6 h-6" resizeMode="contain" />
                            </TouchableOpacity>
                        </View>

                        {/* Import Button */}
                        <TouchableOpacity
                            onPress={handleImportContact}
                            className="flex-row items-center justify-center bg-neutral-100 p-4 rounded-xl mb-6 border border-neutral-200"
                        >
                            <Image source={icons.person} className="w-5 h-5 mr-3" resizeMode="contain" />
                            <Text className="font-JakartaBold text-neutral-800">Import from Phone List</Text>
                        </TouchableOpacity>

                        <View className="space-y-4">
                            <View>
                                <Text className="font-JakartaMedium mb-2 text-neutral-700">Name</Text>
                                <TextInput
                                    value={name} onChangeText={setName}
                                    placeholder="Full Name"
                                    className="bg-neutral-50 p-4 rounded-xl border border-neutral-200"
                                />
                            </View>
                            <View>
                                <Text className="font-JakartaMedium mb-2 text-neutral-700">Phone Number</Text>
                                <TextInput
                                    value={phone} onChangeText={setPhone}
                                    placeholder="+234..."
                                    keyboardType="phone-pad"
                                    className="bg-neutral-50 p-4 rounded-xl border border-neutral-200"
                                />
                            </View>
                            <View>
                                <Text className="font-JakartaMedium mb-2 text-neutral-700">Email (Optional)</Text>
                                <TextInput
                                    value={email} onChangeText={setEmail}
                                    placeholder="email@example.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    className="bg-neutral-50 p-4 rounded-xl border border-neutral-200"
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleAddContact}
                                disabled={saving}
                                className="bg-[#0286FF] p-4 rounded-xl mt-6 flex-row justify-center items-center"
                            >
                                {saving && <ActivityIndicator color="white" className="mr-2" />}
                                <Text className="text-white font-JakartaBold text-lg">Save Contact</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
};

export default EmergencyContacts;
