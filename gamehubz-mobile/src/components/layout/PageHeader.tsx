import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation, NavigationProp, useNavigationState } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../../lib/utils';

interface PageHeaderProps {
    title: string;
    showBack?: boolean;
    rightElement?: React.ReactNode;
    className?: string;
}

export function PageHeader({ title, showBack, rightElement, className }: PageHeaderProps) {
    const navigation = useNavigation();
    const canGoBack = useNavigationState(state => state?.routes?.length > 1);

    const handleGoBack = () => {
        if (canGoBack) {
            navigation.goBack();
        }
    };

    return (
        <View className={cn("bg-background border-b border-border/50", className)}>
            <View className="flex-row items-center justify-between h-14 px-4">
                <View className="flex-row items-center gap-3">
                    {showBack && canGoBack && (
                        <Pressable
                            onPress={handleGoBack}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary/50"
                        >
                            <Ionicons name="arrow-back" size={20} color="#FAFAFA" />
                        </Pressable>
                    )}
                    <Text className="text-lg font-semibold text-foreground">{title}</Text>
                </View>
                {rightElement}
            </View>
        </View>
    );
}
