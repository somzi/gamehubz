import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../components/layout/PageHeader';
import { Ionicons } from '@expo/vector-icons';

export function HelpCenterScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background">
            <PageHeader title="Help Center" showBack />
            <ScrollView className="flex-1 px-6 py-8">
                <View className="items-center mb-8">
                    <Ionicons name="help-circle-outline" size={64} color="#10B981" />
                    <Text className="text-xl font-bold text-white mt-4">How can we help?</Text>
                </View>
                <View className="bg-card p-6 rounded-2xl border border-white/5 space-y-4">
                    <Text className="text-white font-bold text-lg">Frequently Asked Questions</Text>
                    <View className="border-t border-white/5 pt-4">
                        <Text className="text-primary font-bold mb-1">How do I join a tournament?</Text>
                        <Text className="text-gray-400 text-sm">Navigate to the Hubs screen, find a Hub you like, and join its upcoming tournaments.</Text>
                    </View>
                    <View className="border-t border-white/5 pt-4">
                        <Text className="text-primary font-bold mb-1">How can I report a match result?</Text>
                        <Text className="text-gray-400 text-sm">Go to your match details and click the 'Report Result' button after the match is finished.</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export function AboutUsScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background">
            <PageHeader title="About Us" showBack />
            <ScrollView className="flex-1 px-6 py-8">
                <View className="items-center mb-8">
                    <Ionicons name="information-circle-outline" size={64} color="#10B981" />
                    <Text className="text-xl font-bold text-white mt-4">GameHubz</Text>
                </View>
                <Text className="text-gray-300 leading-6 text-center">
                    GameHubz is the ultimate platform for tournament organizers and competitive gamers.
                    We provide the tools you need to create, manage, and scale your gaming communities.
                </Text>
                <View className="mt-12 items-center">
                    <Text className="text-gray-500 text-sm">Version 1.0.0</Text>
                    <Text className="text-gray-500 text-sm mt-2">© 2026 GameHubz Inc.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export function ContactUsScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background">
            <PageHeader title="Contact Us" showBack />
            <ScrollView className="flex-1 px-6 py-8">
                <View className="items-center mb-8">
                    <Ionicons name="mail-outline" size={64} color="#10B981" />
                    <Text className="text-xl font-bold text-white mt-4">Get in Touch</Text>
                </View>
                <View className="space-y-4">
                    <View className="bg-card p-4 rounded-xl border border-white/5 flex-row items-center gap-4">
                        <Ionicons name="mail" size={24} color="#10B981" />
                        <View>
                            <Text className="text-white font-bold">Email Support</Text>
                            <Text className="text-gray-400 text-sm">support@gamehubz.com</Text>
                        </View>
                    </View>
                    <View className="bg-card p-4 rounded-xl border border-white/5 flex-row items-center gap-4">
                        <Ionicons name="logo-discord" size={24} color="#7289DA" />
                        <View>
                            <Text className="text-white font-bold">Join our Discord</Text>
                            <Text className="text-gray-400 text-sm">discord.gg/gamehubz</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
