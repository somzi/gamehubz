import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface SelectOption {
    label: string;
    value: any;
}

interface SelectInputProps {
    label?: string;
    placeholder?: string;
    value?: any;
    options: SelectOption[];
    onSelect: (value: any) => void;
    error?: string;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    className?: string;
}

export function SelectInput({
    label,
    placeholder = 'Select an option',
    value,
    options,
    onSelect,
    error,
    leftIcon,
    className
}: SelectInputProps) {
    const [modalVisible, setModalVisible] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (val: any) => {
        onSelect(val);
        setModalVisible(false);
    };

    return (
        <View className={`w-full ${className}`}>
            {label && (
                <Text className="text-sm font-medium text-muted-foreground mb-1.5 ml-1">
                    {label}
                </Text>
            )}

            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className={`
                    flex-row items-center w-full h-12 bg-card/50 border rounded-xl px-3
                    ${error ? 'border-destructive' : 'border-border'}
                `}
            >
                {leftIcon && (
                    <Ionicons
                        name={leftIcon}
                        size={20}
                        color={error ? "hsl(0, 72%, 51%)" : "hsl(220, 15%, 55%)"}
                        style={{ marginRight: 8 }}
                    />
                )}

                <Text className={`flex-1 text-base ${selectedOption ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>

                <Ionicons
                    name="chevron-down"
                    size={20}
                    color="hsl(220, 15%, 55%)"
                />
            </TouchableOpacity>

            {error && (
                <Text className="text-xs text-destructive mt-1 ml-1">
                    {error}
                </Text>
            )}

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable
                    className="flex-1 bg-black/50 justify-center items-center px-6"
                    onPress={() => setModalVisible(false)}
                >
                    <View className="bg-card w-full rounded-xl border border-border/30 max-h-[70%] overflow-hidden">
                        <View className="p-4 border-b border-border/30 flex-row justify-between items-center">
                            <Text className="text-lg font-bold text-foreground">
                                {label || 'Select'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="hsl(220, 15%, 55%)" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={options}
                            keyExtractor={(item) => String(item.value)}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className={`
                                        p-4 border-b border-border/10 flex-row justify-between items-center
                                        ${value === item.value ? 'bg-primary/10' : ''}
                                    `}
                                    onPress={() => handleSelect(item.value)}
                                >
                                    <Text className={`text-base ${value === item.value ? 'text-primary font-bold' : 'text-foreground'}`}>
                                        {item.label}
                                    </Text>
                                    {value === item.value && (
                                        <Ionicons name="checkmark" size={20} color="hsl(185, 75%, 45%)" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}
