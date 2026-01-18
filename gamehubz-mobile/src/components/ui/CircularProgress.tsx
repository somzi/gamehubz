import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '../../lib/utils';

interface CircularProgressProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    backgroundColor?: string;
    showText?: boolean;
    className?: string;
}

export function CircularProgress({
    percentage,
    size = 100,
    strokeWidth = 8,
    color = '#10B981', // green-500
    backgroundColor = '#374151', // gray-700
    showText = true,
    className
}: CircularProgressProps) {
    const radius = size / 2;

    return (
        <View
            style={{ width: size, height: size }}
            className={cn("items-center justify-center", className)}
        >
            {/* Background Circle */}
            <View
                style={{
                    width: size,
                    height: size,
                    borderRadius: radius,
                    borderWidth: strokeWidth,
                    borderColor: backgroundColor,
                    position: 'absolute',
                }}
            />

            {/* Simple partial border mock - without SVG, we'll use a 2-sided border approach for a "half/three-quarter" look */}
            <View
                style={{
                    width: size,
                    height: size,
                    borderRadius: radius,
                    borderWidth: strokeWidth,
                    borderColor: color,
                    borderBottomColor: 'transparent',
                    borderLeftColor: percentage < 50 ? 'transparent' : color,
                    position: 'absolute',
                    transform: [{ rotate: '-45deg' }]
                }}
            />

            {showText && <Text className="text-white font-bold text-xl">{percentage}%</Text>}
        </View>
    );
}
