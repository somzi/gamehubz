import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { cn } from '../../lib/utils';

interface TabsProps {
    tabs: { label: string; value: string }[];
    activeTab: string;
    onTabChange: (value: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
    return (
        <View className="bg-card p-1 rounded-xl flex-row border border-white/5">
            {tabs.map((tab) => (
                <Pressable
                    key={tab.value}
                    onPress={() => onTabChange(tab.value)}
                    className={cn(
                        "flex-1 py-3 px-1 rounded-lg items-center justify-center",
                        activeTab === tab.value ? "bg-card-elevated border border-white/10" : ""
                    )}
                >
                    <Text className={cn(
                        "text-xs font-semibold",
                        activeTab === tab.value ? "text-primary" : "text-gray-500"
                    )}>
                        {tab.label}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
}
