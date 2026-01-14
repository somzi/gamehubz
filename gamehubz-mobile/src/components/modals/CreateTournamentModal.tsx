import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    Modal,
    TouchableOpacity,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CreateTournamentModalProps {
    visible: boolean;
    onClose: () => void;
}

const regions = [
    { value: 'global', label: 'Global (No Restrictions)' },
    { value: 'europe', label: 'Europe' },
    { value: 'north-america', label: 'North America' },
    { value: 'south-america', label: 'South America' },
    { value: 'asia', label: 'Asia' },
    { value: 'africa', label: 'Africa' },
    { value: 'oceania', label: 'Oceania' },
];

const playerLevels = [
    { value: '1', label: 'Level 1 - Beginner' },
    { value: '2', label: 'Level 2 - Intermediate' },
    { value: '3', label: 'Level 3 - Advanced' },
    { value: '4', label: 'Level 4 - Expert' },
    { value: '5', label: 'Level 5 - Professional' },
];

const maxPlayerOptions = [
    { value: '8', label: '8 Players' },
    { value: '16', label: '16 Players' },
    { value: '32', label: '32 Players' },
    { value: '64', label: '64 Players' },
    { value: '128', label: '128 Players' },
];

export function CreateTournamentModal({ visible, onClose }: CreateTournamentModalProps) {
    const insets = useSafeAreaInsets();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [rules, setRules] = useState('');
    const [minLevel, setMinLevel] = useState('1');
    const [maxPlayers, setMaxPlayers] = useState('32');
    const [selectedRegions, setSelectedRegions] = useState<string[]>(['global']);
    const [prizePool, setPrizePool] = useState('');
    const [inviteFollowers, setInviteFollowers] = useState(false);

    // Picker States
    const [showLevelPicker, setShowLevelPicker] = useState(false);
    const [showPlayersPicker, setShowPlayersPicker] = useState(false);
    const [showRegionPicker, setShowRegionPicker] = useState(false);

    const handleRegionSelect = (regionValue: string) => {
        if (regionValue === 'global') {
            setSelectedRegions(['global']);
            return;
        }

        let updated = selectedRegions.includes('global')
            ? [regionValue]
            : selectedRegions.includes(regionValue)
                ? selectedRegions.filter(r => r !== regionValue)
                : [...selectedRegions, regionValue];

        if (updated.length === 0) updated = ['global'];
        setSelectedRegions(updated);
    };

    const getRegionLabel = () => {
        if (selectedRegions.includes('global')) return 'Global (No Restrictions)';
        if (selectedRegions.length === 1) {
            return regions.find(r => r.value === selectedRegions[0])?.label ?? 'Region';
        }
        return `${selectedRegions.length} Regions Selected`;
    };

    const handleSubmit = () => {
        console.log({
            name,
            description,
            rules,
            minLevel,
            maxPlayers,
            regions: selectedRegions,
            prizePool,
            inviteFollowers,
        });
        onClose();
    };

    const renderSelectField = (
        label: string,
        value: string,
        icon: keyof typeof Ionicons.glyphMap,
        onPress: () => void
    ) => (
        <View className="flex-1">
            <View className="flex-row items-center mb-3">
                <Ionicons name={icon} size={16} color="#fbbf24" style={{ marginRight: 6 }} />
                <Text className="text-sm font-bold text-white">{label}</Text>
            </View>
            <TouchableOpacity
                onPress={onPress}
                className="bg-[#1f2937] p-3 h-12 rounded-xl border border-white/10 flex-row justify-between items-center"
            >
                <Text className="text-white text-sm" numberOfLines={1}>{value}</Text>
                <Ionicons name="chevron-down" size={16} color="#9ca3af" />
            </TouchableOpacity>
        </View>
    );

    const renderOptionsModal = (
        visible: boolean,
        onCloseModal: () => void,
        options: { value: string; label: string }[],
        selected: string | string[],
        onSelect: (val: string) => void,
        multi = false
    ) => (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onCloseModal}>
            <Pressable className="flex-1 bg-black/60 justify-center px-6" onPress={onCloseModal}>
                <Pressable className="bg-[#111827] rounded-2xl border border-white/10 max-h-[50%] overflow-hidden">
                    <ScrollView contentContainerStyle={{ padding: 8 }}>
                        {options.map(opt => {
                            const active = multi
                                ? (selected as string[]).includes(opt.value)
                                : selected === opt.value;

                            return (
                                <TouchableOpacity
                                    key={opt.value}
                                    onPress={() => {
                                        onSelect(opt.value);
                                        if (!multi) onCloseModal();
                                    }}
                                    className={`p-4 mb-1 rounded-xl flex-row justify-between items-center ${active ? 'bg-[#fbbf24]' : 'bg-transparent'
                                        }`}
                                >
                                    <Text className={`${active ? 'text-black' : 'text-white'} font-medium`}>
                                        {opt.label}
                                    </Text>
                                    {active && <Ionicons name="checkmark" size={18} color="#000" />}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View
                className="flex-1 bg-black/80 px-4 justify-center"
                style={{
                    paddingTop: insets.top + 20,
                    paddingBottom: insets.bottom + 20,
                }}
            >
                <View className="bg-[#0f172a] w-full rounded-3xl border border-white/10 shadow-2xl overflow-hidden max-h-full">
                    <View className="flex-row justify-between items-center p-5 border-b border-white/5">
                        <Text className="text-xl font-bold text-white">Create Tournament</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        className="px-5 py-4"
                        contentContainerStyle={{ paddingBottom: 32 }}
                        showsVerticalScrollIndicator={true}
                    >
                        <View className="flex flex-col gap-y-8">
                            <View>
                                <Text className="text-sm font-bold text-white mb-3">Tournament Name</Text>
                                <TextInput
                                    className="bg-[#1f2937] p-4 rounded-xl text-white border border-[#22d3ee] shadow-sm shadow-[#22d3ee]/20"
                                    placeholder="Enter tournament name"
                                    placeholderTextColor="#6b7280"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View>
                                <Text className="text-sm font-bold text-white mb-3">Description</Text>
                                <TextInput
                                    multiline
                                    className="bg-[#1f2937] p-4 h-24 rounded-xl text-white border border-white/10"
                                    placeholder="Describe your tournament..."
                                    placeholderTextColor="#6b7280"
                                    textAlignVertical="top"
                                    value={description}
                                    onChangeText={setDescription}
                                />
                            </View>

                            <View>
                                <View className="flex-row items-center mb-3">
                                    <Ionicons name="document-text-outline" size={16} color="#fbbf24" style={{ marginRight: 6 }} />
                                    <Text className="text-sm font-bold text-white">Rules</Text>
                                </View>
                                <TextInput
                                    multiline
                                    className="bg-[#1f2937] p-4 h-24 rounded-xl text-white border border-white/10"
                                    placeholder="Enter tournament rules (e.g., Best of 3, no exploits allowed...)"
                                    placeholderTextColor="#6b7280"
                                    textAlignVertical="top"
                                    value={rules}
                                    onChangeText={setRules}
                                />
                            </View>

                            <View className="flex-row gap-4">
                                {renderSelectField(
                                    'Min Level',
                                    playerLevels.find(l => l.value === minLevel)?.label || 'Select',
                                    'trophy-outline',
                                    () => setShowLevelPicker(true)
                                )}
                                {renderSelectField(
                                    'Max Players',
                                    maxPlayerOptions.find(o => o.value === maxPlayers)?.label || 'Select',
                                    'people-outline',
                                    () => setShowPlayersPicker(true)
                                )}
                            </View>

                            {renderSelectField('Region', getRegionLabel(), 'globe-outline', () =>
                                setShowRegionPicker(true)
                            )}

                            <View>
                                <View className="flex-row items-center mb-3">
                                    <Ionicons name="cash-outline" size={16} color="#fbbf24" style={{ marginRight: 6 }} />
                                    <Text className="text-sm font-bold text-white">Prize Pool</Text>
                                </View>
                                <TextInput
                                    className="bg-[#1f2937] p-4 rounded-xl text-white border border-white/10"
                                    placeholder="e.g., $500 or 1000 V-Bucks"
                                    placeholderTextColor="#6b7280"
                                    value={prizePool}
                                    onChangeText={setPrizePool}
                                />
                            </View>

                            {/* Invite Followers */}
                            <View className="flex-row items-center bg-[#1f2937] p-4 rounded-xl border border-white/10">
                                <View className="h-10 w-10 bg-white/5 rounded-lg justify-center items-center mr-4">
                                    <Ionicons name="people" size={20} color="#9ca3af" />
                                </View>

                                <View className="flex-1 mr-4">
                                    <Text className="text-base font-bold text-white">Invite Hub Followers</Text>
                                    <Text className="text-xs text-gray-400">Send notifications to all your hub followers</Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => setInviteFollowers(!inviteFollowers)}
                                    className={`h-6 w-6 rounded border ${inviteFollowers ? 'bg-[#fbbf24] border-[#fbbf24]' : 'border-gray-500'} justify-center items-center`}
                                >
                                    {inviteFollowers && <Ionicons name="checkmark" size={16} color="#000" />}
                                </TouchableOpacity>
                            </View>

                            <Button size="lg" onPress={handleSubmit} disabled={!name} className="mt-8 bg-[#06b6d4]">
                                Create Tournament
                            </Button>
                        </View>
                    </ScrollView>
                </View>
            </View>

            {renderOptionsModal(showLevelPicker, () => setShowLevelPicker(false), playerLevels, minLevel, setMinLevel)}
            {renderOptionsModal(showPlayersPicker, () => setShowPlayersPicker(false), maxPlayerOptions, maxPlayers, setMaxPlayers)}
            {renderOptionsModal(showRegionPicker, () => setShowRegionPicker(false), regions, selectedRegions, handleRegionSelect, true)}
        </Modal>
    );
}
