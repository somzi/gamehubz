import React from 'react';
import { View, Text, Modal, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FeedCard } from '../cards/FeedCard';
import { DashboardActivityDto } from '../../types/dashboard';

interface HighlightsModalProps {
    visible: boolean;
    onClose: () => void;
    activities: DashboardActivityDto[];
}

export function HighlightsModal({ visible, onClose, activities }: HighlightsModalProps) {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50">
                <View className="flex-1 bg-background mt-20 rounded-t-3xl border-t border-border/50">
                    {/* Header */}
                    <View className="flex-row items-center justify-between p-6 border-b border-border/30">
                        <View className="flex-row items-center gap-3">
                            <View className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                                <Ionicons name="planet-outline" size={24} color="#10B981" />
                            </View>
                            <View>
                                <Text className="text-xl font-bold text-foreground">All Highlights</Text>
                                <Text className="text-xs text-muted-foreground mt-0.5">
                                    {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                                </Text>
                            </View>
                        </View>
                        <Pressable
                            onPress={onClose}
                            className="w-10 h-10 rounded-full bg-secondary items-center justify-center"
                        >
                            <Ionicons name="close" size={24} color="#94A3B8" />
                        </Pressable>
                    </View>

                    {/* Content */}
                    <ScrollView
                        className="flex-1 px-6 py-4"
                        showsVerticalScrollIndicator={false}
                    >
                        {activities.length > 0 ? (
                            <View className="gap-3 pb-8">
                                {activities.map((item, index) => (
                                    <FeedCard
                                        key={index}
                                        hubName={item.hubName}
                                        hubAvatar={item.hubAvatar}
                                        message={item.message}
                                        tournamentName={item.tournamentName}
                                        timestamp={item.timeAgo}
                                        onClick={() => { }}
                                    />
                                ))}
                            </View>
                        ) : (
                            <View className="flex-1 items-center justify-center py-20">
                                <View className="bg-muted/10 p-6 rounded-full mb-4">
                                    <Ionicons name="planet-outline" size={48} color="#71717A" />
                                </View>
                                <Text className="text-foreground font-bold text-lg">No Highlights Yet</Text>
                                <Text className="text-muted-foreground text-sm mt-2 text-center px-8">
                                    Hub activities and tournament updates will appear here
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
