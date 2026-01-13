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
        <View className="bg-secondary p-1 rounded-lg flex-row">
            {tabs.map((tab) => (
                <Pressable
                    key={tab.value}
                    onPress={() => onTabChange(tab.value)}
                    className={cn(
                        "flex-1 py-2 px-1 rounded-md items-center justify-center",
                        activeTab === tab.value ? "bg-background" : ""
                    )}
                >
                    <Text className={cn(
                        "text-xs font-medium",
                        activeTab === tab.value ? "text-foreground" : "text-muted-foreground"
                    )}>
                        {tab.label}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
}
