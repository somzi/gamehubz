import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { cn } from '../../lib/utils';

interface SocialLink {
    platform: "discord" | "tiktok" | "instagram" | "twitter" | "youtube";
    username: string;
    url?: string;
}

interface SocialLinksProps {
    links: SocialLink[];
    className?: string;
}

const platformConfig: any = {
    discord: {
        icon: <Ionicons name="logo-discord" size={18} />,
        color: "text-[#5865F2]",
        bgColor: "bg-[#5865F2]/20",
    },
    tiktok: {
        icon: <Ionicons name="logo-tiktok" size={18} />,
        color: "text-foreground",
        bgColor: "bg-foreground/10",
    },
    instagram: {
        icon: <FontAwesome name="instagram" size={18} />,
        color: "text-[#E4405F]",
        bgColor: "bg-[#E4405F]/20",
    },
    twitter: {
        icon: <FontAwesome name="twitter" size={18} />,
        color: "text-foreground",
        bgColor: "bg-foreground/10",
    },
    youtube: {
        icon: <FontAwesome name="youtube-play" size={18} />,
        color: "text-[#FF0000]",
        bgColor: "bg-[#FF0000]/20",
    },
};

export function SocialLinks({ links, className }: SocialLinksProps) {
    if (!links || links.length === 0) return null;

    const handlePress = (url?: string) => {
        if (url) {
            Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
        }
    };

    return (
        <View className={cn("flex-row flex-wrap gap-2", className)}>
            {links.map((link) => {
                const config = platformConfig[link.platform];
                if (!config) return null;

                return (
                    <Pressable
                        key={link.platform}
                        onPress={() => handlePress(link.url)}
                        className={cn(
                            "flex-row items-center gap-2 px-3 py-2 rounded-xl border border-border/30",
                            config.bgColor
                        )}
                        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                    >
                        <Text className={config.color}>{config.icon}</Text>
                        <Text className="text-sm font-medium text-foreground">{link.username}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
}
