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
        <View className="bg-[#131B2E] p-1 rounded-2xl flex-row border border-white/5">
            {tabs.map((tab) => (
                <Pressable
                    key={tab.value}
                    onPress={() => {
                        console.log(`[Tabs] Switching to: ${tab.value}`);
                        onTabChange(tab.value);
                    }}
                    className={cn(
                        "flex-1 py-3 px-1 rounded-xl items-center justify-center",
                        activeTab === tab.value ? "bg-[#4F46E5]" : ""
                    )}
                >
                    <Text className={cn(
                        "text-xs font-bold tracking-wide",
                        activeTab === tab.value ? "text-white" : "text-zinc-500"
                    )}>
                        {tab.label}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
}
