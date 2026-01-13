import React from 'react';
import { View, Pressable, ViewStyle, StyleSheet } from 'react-native';
import { cn } from '../../lib/utils';

interface CardProps {
    children: React.ReactNode;
    onPress?: () => void;
    className?: string;
    variant?: 'default' | 'gradient';
}

export function Card({ children, onPress, className, variant = 'gradient' }: CardProps) {
    const cardContent = (
        <View
            className={cn(
                "rounded-2xl border border-border/50 p-4",
                variant === 'gradient' ? "bg-card" : "bg-card",
                className
            )}
            style={styles.cardShadow}
        >
            {children}
        </View>
    );

    if (onPress) {
        return (
            <Pressable
                onPress={onPress}
                style={styles.pressed}
            >
                {cardContent}
            </Pressable>
        );
    }

    return cardContent;
}

const styles = StyleSheet.create({
    cardShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    pressed: {
        opacity: 0.9,
    },
});

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
    return <View className={cn("mb-2", className)}>{children}</View>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
    return <View className={cn("", className)}>{children}</View>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
    return <View className={cn("", className)}>{children}</View>;
}

