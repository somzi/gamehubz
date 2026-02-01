import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { HourlyAvailabilityPicker } from './HourlyAvailabilityPicker';
import { Button } from '../ui/Button';
import { PlayerAvatar } from '../ui/PlayerAvatar';
import { cn } from '../../lib/utils';
import { authenticatedFetch, ENDPOINTS } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';

type MatchStatus = 'pending_availability' | 'scheduled' | 'ready_phase' | 'completed';

interface MatchScheduleCardProps {
    matchId: string;
    tournamentId: string;
    tournamentName: string;
    roundName: string;
    opponentName: string;
    status: MatchStatus;
    deadline?: string;
    scheduledTime?: string;
    opponentAvailability?: string[];
    onMatchUpdate?: () => void;
    onPress?: () => void;
    variant?: 'default' | 'compact';
}

export function MatchScheduleCard({
    matchId,
    tournamentId,
    tournamentName,
    roundName,
    opponentName,
    status: initialStatus,
    deadline = 'Jan 22, 2024',
    scheduledTime: initialScheduledTime,
    opponentAvailability: initialOpponentAvailability = [],
    onMatchUpdate,
    onPress,
    variant = 'default',
}: MatchScheduleCardProps) {
    const { user } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<MatchStatus>(initialStatus);
    const [matchTime, setMatchTime] = useState(initialScheduledTime);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Slots state
    const [mySlots, setMySlots] = useState<string[]>([]);
    const [opponentSlots, setOpponentSlots] = useState<string[]>(initialOpponentAvailability);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

    // Result reporting state
    const [homeScore, setHomeScore] = useState('');
    const [awayScore, setAwayScore] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

    const fetchAvailability = async () => {
        if (!user?.id || !matchId) return;
        setIsLoadingAvailability(true);
        try {
            const response = await authenticatedFetch(ENDPOINTS.GET_MATCH_AVAILABILITY(matchId, user.id));
            if (response.ok) {
                const data = await response.json();
                if (data.mySlots) setMySlots(data.mySlots);
                if (data.opponentSlots) setOpponentSlots(data.opponentSlots);
                if (data.confirmedTime) {
                    const confirmedDate = new Date(data.confirmedTime);
                    setMatchTime(confirmedDate.toLocaleString());
                    setCurrentStatus('scheduled');
                }
            }
        } catch (error) {
            console.error('Error fetching availability:', error);
        } finally {
            setIsLoadingAvailability(false);
        }
    };

    // Fetch availability when modal opens
    React.useEffect(() => {
        if (modalVisible && currentStatus === 'pending_availability') {
            fetchAvailability();
        }
    }, [modalVisible, currentStatus, matchId]);

    const handleAvailabilitySubmit = async (slots: string[], dateTimeSlots: string[]) => {
        try {
            setIsSubmitting(true);
            if (!matchId) return;

            const payload = {
                matchId: matchId,
                selectedSlots: dateTimeSlots,
            };

            const response = await authenticatedFetch(ENDPOINTS.SUBMIT_MATCH_AVAILABILITY, {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.json();

                // Check if match was scheduled
                if (result.data?.confirmedTime) {
                    const confirmedDate = new Date(result.data.confirmedTime);
                    setMatchTime(confirmedDate.toLocaleString());
                    setCurrentStatus('scheduled');
                }

                // Notify parent to refresh immediately
                if (onMatchUpdate) {
                    onMatchUpdate();
                }
            }
        } catch (error) {
            console.error('Error submitting availability:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const pickImages = async () => {
        try {
            const { status: pStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (pStatus !== 'granted') {
                setError('Sorry, we need camera roll permissions to make this work!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: true,
                quality: 0.8,
            });

            if (!result.canceled) {
                setSelectedImages(prev => [...prev, ...result.assets]);
            }
        } catch (err) {
            console.error('Error picking images:', err);
            setError('Failed to pick images');
        }
    };

    const removeImage = (uri: string) => {
        setSelectedImages(prev => prev.filter(img => img.uri !== uri));
    };

    const handleSubmitResult = async () => {
        console.log('[MatchScheduleCard] handleSubmitResult called');
        console.log('[MatchScheduleCard] matchId:', matchId);
        console.log('[MatchScheduleCard] tournamentId:', tournamentId);
        console.log('[MatchScheduleCard] homeScore:', homeScore);
        console.log('[MatchScheduleCard] awayScore:', awayScore);

        if (!matchId || !tournamentId) {
            console.log('[MatchScheduleCard] Missing matchId or tournamentId');
            return;
        }
        if (homeScore === '' || awayScore === '') {
            console.log('[MatchScheduleCard] Missing scores');
            setError('Please enter scores for both players');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                MatchId: matchId,
                HomeScore: parseInt(homeScore, 10),
                AwayScore: parseInt(awayScore, 10),
                TournamentId: tournamentId
            };

            console.log('[MatchScheduleCard] Payload:', JSON.stringify(payload));
            console.log('[MatchScheduleCard] Calling API:', ENDPOINTS.REPORT_MATCH_RESULT);

            const response = await authenticatedFetch(ENDPOINTS.REPORT_MATCH_RESULT, {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            console.log('[MatchScheduleCard] Response status:', response.status);

            console.log('[MatchScheduleCard] Success! Checking for images to upload');

            if (selectedImages.length > 0) {
                const formData = new FormData();
                selectedImages.forEach((img, index) => {
                    const filename = img.uri.split('/').pop() || `evidence-${index}.jpg`;
                    const match = /\.(\w+)$/.exec(filename);
                    const type = match ? `image/${match[1]}` : `image/jpeg`;
                    // @ts-ignore
                    formData.append('files', { uri: img.uri, name: filename, type });
                });

                await authenticatedFetch(ENDPOINTS.UPLOAD_MATCH_EVIDENCE(matchId), {
                    method: 'POST',
                    body: formData,
                });
            }

            console.log('[MatchScheduleCard] Complete! Closing modal and refreshing');
            // Success - close modal and refresh
            setModalVisible(false);
            if (onMatchUpdate) {
                onMatchUpdate();
            }
        } catch (err: any) {
            console.error('[MatchScheduleCard] Report result error:', err);
            setError(err.message || 'An error occurred while reporting result');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusContent = () => {
        switch (currentStatus) {
            case 'pending_availability':
                return (
                    <View className="flex-row items-center gap-2 mt-2 bg-yellow-500/10 self-start px-2.5 py-1.5 rounded-lg border border-yellow-500/20">
                        <Ionicons name="calendar-outline" size={14} color="#EAB308" />
                        <Text className="text-[12px] font-bold text-yellow-500 uppercase tracking-tight">Set Availability</Text>
                    </View>
                );
            case 'scheduled':
                return (
                    <View className="flex-row items-center gap-2 mt-2 bg-primary/10 self-start px-2.5 py-1.5 rounded-lg border border-primary/20">
                        <Ionicons name="time-outline" size={14} color="#10B981" />
                        <Text className="text-[12px] font-bold text-primary uppercase tracking-tight">{matchTime}</Text>
                    </View>
                );
            case 'ready_phase':
                return (
                    <View className="flex-row items-center gap-2 mt-2 bg-indigo-500/10 self-start px-2.5 py-1.5 rounded-lg border border-indigo-500/20">
                        <Ionicons name="flash-outline" size={14} color="#6366F1" />
                        <Text className="text-[12px] font-bold text-indigo-500 uppercase tracking-tight">Ready Check</Text>
                    </View>
                );
            default:
                return null;
        }
    };

    const isSetAvailability = currentStatus === 'pending_availability';

    if (variant === 'compact') {
        return (
            <>
                <Pressable
                    onPress={() => setModalVisible(true)}
                    className={cn(
                        "w-[240px] bg-card/60 rounded-[32px] border border-white/5 p-5 mr-3",
                        currentStatus === 'ready_phase' && "border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                    )}
                >
                    <View className="flex-row items-center justify-between mb-4">
                        <View className={cn(
                            "w-12 h-12 rounded-2xl items-center justify-center",
                            isSetAvailability ? "bg-yellow-500/10" :
                                currentStatus === 'scheduled' ? "bg-primary/10" : "bg-indigo-500/10"
                        )}>
                            <Ionicons
                                name={isSetAvailability ? "alert-circle" : "game-controller"}
                                size={24}
                                color={isSetAvailability ? "#EAB308" :
                                    currentStatus === 'scheduled' ? "#10B981" : "#6366F1"}
                            />
                        </View>
                        <View className="items-end">
                            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{roundName}</Text>
                            <Text className="text-[10px] font-bold text-slate-500" numberOfLines={1}>{tournamentName}</Text>
                        </View>
                    </View>

                    <Text className="text-xl font-black text-white leading-tight" numberOfLines={1}>
                        vs {opponentName}
                    </Text>

                    <View className="mt-4 pt-4 border-t border-white/5">
                        {isSetAvailability ? (
                            <View className="flex-row items-center gap-2 bg-yellow-500/10 self-start px-3 py-2 rounded-xl border border-yellow-500/20">
                                <Ionicons name="calendar-outline" size={14} color="#EAB308" />
                                <Text className="text-[11px] font-black text-yellow-500 uppercase tracking-tight">Set Availability</Text>
                            </View>
                        ) : (
                            <View className={cn(
                                "flex-row items-center gap-2 self-start px-3 py-2 rounded-xl border",
                                currentStatus === 'scheduled' ? "bg-primary/10 border-primary/20" : "bg-indigo-500/10 border-indigo-500/20"
                            )}>
                                <Ionicons
                                    name={currentStatus === 'scheduled' ? "time-outline" : "flash-outline"}
                                    size={14}
                                    color={currentStatus === 'scheduled' ? "#10B981" : "#6366F1"}
                                />
                                <Text className={cn(
                                    "text-[11px] font-black uppercase tracking-tight",
                                    currentStatus === 'scheduled' ? "text-primary" : "text-indigo-500"
                                )}>
                                    {currentStatus === 'scheduled' ? matchTime : "Ready Check"}
                                </Text>
                            </View>
                        )}
                    </View>
                </Pressable>

                {renderModal()}
            </>
        );
    }

    return (
        <>
            <Card
                onPress={() => setModalVisible(true)}
                className={cn(
                    "mb-2",
                    currentStatus === 'ready_phase' && "border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                )}
            >
                <View className="flex-row items-center gap-4">
                    <View className={cn(
                        "w-12 h-12 rounded-2xl items-center justify-center",
                        currentStatus === 'pending_availability' ? "bg-yellow-500/10" :
                            currentStatus === 'scheduled' ? "bg-primary/10" : "bg-indigo-500/10"
                    )}>
                        <Ionicons
                            name={currentStatus === 'pending_availability' ? "alert-circle" : "game-controller"}
                            size={24}
                            color={currentStatus === 'pending_availability' ? "#EAB308" :
                                currentStatus === 'scheduled' ? "#10B981" : "#6366F1"}
                        />
                    </View>

                    <View className="flex-1">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider">{tournamentName}</Text>
                            <Text className="text-[10px] font-medium text-slate-500">{roundName}</Text>
                        </View>
                        <Text className="text-lg font-bold text-white mt-0.5" numberOfLines={1}>
                            vs {opponentName}
                        </Text>
                        {getStatusContent()}
                    </View>
                </View>
            </Card>

            {renderModal()}
        </>
    );

    function renderModal() {
        const isPremium = variant === 'compact';
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className={cn("flex-1 justify-end", isPremium ? "bg-black/80" : "bg-black/50")}>
                    <View className={cn(
                        "rounded-t-[40px] border-t p-8 max-h-[92%]",
                        isPremium ? "bg-slate-900 border-white/10" : "bg-card border-border/50 p-6 max-h-[90%]"
                    )}>
                        {isPremium && <View className="w-12 h-1.5 bg-white/10 rounded-full self-center mb-6" />}

                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-8">
                            <View>
                                <Text className={cn(
                                    "font-black text-white tracking-tight",
                                    isPremium ? "text-2xl" : "text-lg text-foreground"
                                )}>
                                    {tournamentName}
                                </Text>
                                <Text className={cn(
                                    "font-bold uppercase tracking-widest mt-1",
                                    isPremium ? "text-sm text-slate-400" : "text-sm text-muted-foreground"
                                )}>{roundName}</Text>
                            </View>
                            <Pressable
                                onPress={() => setModalVisible(false)}
                                className={cn(
                                    "rounded-full items-center justify-center",
                                    isPremium ? "w-10 h-10 bg-white/5 border border-white/10" : "w-8 h-8 bg-secondary"
                                )}
                            >
                                <Ionicons name="close" size={isPremium ? 24 : 20} color={isPremium ? "#94A3B8" : "hsl(220, 15%, 55%)"} />
                            </Pressable>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {currentStatus === 'pending_availability' && (
                                <HourlyAvailabilityPicker
                                    matchId={matchId}
                                    deadline={deadline}
                                    opponentName={opponentName}
                                    opponentAvailability={opponentSlots}
                                    initialSlots={mySlots}
                                    onSubmit={handleAvailabilitySubmit}
                                />
                            )}

                            {(currentStatus === 'scheduled' || currentStatus === 'ready_phase') && matchTime && (
                                <View className={cn("gap-6", !isPremium && "space-y-4")}>
                                    {/* Match Info */}
                                    <View className="items-center mb-2">
                                        <Text className={cn(
                                            "font-black uppercase tracking-[2px]",
                                            isPremium ? "text-xs text-slate-500" : "text-sm text-muted-foreground"
                                        )}>Match Time</Text>
                                        <Text className={cn(
                                            "font-black text-primary mt-2",
                                            isPremium ? "text-2xl" : "text-lg"
                                        )}>{matchTime}</Text>
                                    </View>

                                    {/* Error Message */}
                                    {error && (
                                        <View className={cn(
                                            "p-4 rounded-2xl mb-2 border",
                                            isPremium ? "bg-destructive/10 border-destructive/20" : "bg-destructive/10 border-transparent"
                                        )}>
                                            <Text className={cn(
                                                "text-sm text-center font-bold",
                                                isPremium ? "text-destructive tracking-tight" : "text-destructive"
                                            )}>{error}</Text>
                                        </View>
                                    )}

                                    {/* Players and Score Inputs */}
                                    <View className="flex-row items-center justify-between gap-4">
                                        {/* Home Player (You) */}
                                        <View className="flex-1 items-center gap-3">
                                            <PlayerAvatar name={user?.username || 'You'} size={isPremium ? "xl" : "lg"} className={isPremium ? "border-4 border-white/10" : ""} />
                                            <Text className={cn(
                                                "font-black text-center",
                                                isPremium ? "text-base text-white" : "text-sm text-foreground"
                                            )} numberOfLines={1}>
                                                {user?.username || 'You'}
                                            </Text>
                                            <TextInput
                                                className={cn(
                                                    "w-full rounded-2xl text-center font-black border",
                                                    isPremium ? "bg-white/5 h-16 text-2xl text-primary border-white/10" : "bg-muted/30 h-12 text-lg text-foreground border-border/10"
                                                )}
                                                placeholder="0"
                                                placeholderTextColor={isPremium ? "#475569" : "#71717A"}
                                                keyboardType="numeric"
                                                value={homeScore}
                                                onChangeText={(val) => setHomeScore(val.replace(/[^0-9]/g, ''))}
                                            />
                                        </View>

                                        <View className="items-center justify-center h-16 mt-12">
                                            <Text className="text-sm font-black text-slate-500 uppercase">VS</Text>
                                        </View>

                                        {/* Away Player (Opponent) */}
                                        <View className="flex-1 items-center gap-3">
                                            <PlayerAvatar name={opponentName} size={isPremium ? "xl" : "lg"} className={isPremium ? "border-4 border-white/10" : ""} />
                                            <Text className={cn(
                                                "font-black text-center",
                                                isPremium ? "text-base text-white" : "text-sm text-foreground"
                                            )} numberOfLines={1}>
                                                {opponentName}
                                            </Text>
                                            <TextInput
                                                className={cn(
                                                    "w-full rounded-2xl text-center font-black border",
                                                    isPremium ? "bg-white/5 h-16 text-2xl text-white border-white/10" : "bg-muted/30 h-12 text-lg text-foreground border-border/10"
                                                )}
                                                placeholder="0"
                                                placeholderTextColor={isPremium ? "#475569" : "#71717A"}
                                                keyboardType="numeric"
                                                value={awayScore}
                                                onChangeText={(val) => setAwayScore(val.replace(/[^0-9]/g, ''))}
                                            />
                                        </View>
                                    </View>

                                    {/* Evidence Section */}
                                    <View className={cn("mt-4 pt-6 border-t", isPremium ? "border-white/5" : "border-border/10")}>
                                        <View className="flex-row items-center justify-between mb-4">
                                            <View>
                                                <Text className={cn(
                                                    "font-black uppercase tracking-tight",
                                                    isPremium ? "text-lg text-white" : "text-sm text-foreground"
                                                )}>Evidence</Text>
                                                <Text className={cn(
                                                    "font-bold",
                                                    isPremium ? "text-xs text-slate-500" : "text-[10px] text-muted-foreground"
                                                )}>{isPremium ? "Attach match results" : "Add screenshots"}</Text>
                                            </View>
                                            <Pressable onPress={pickImages} className={cn(
                                                "flex-row items-center px-4 py-2.5 rounded-xl border",
                                                isPremium ? "bg-primary/20 border-primary/30" : "bg-primary/10 border-primary/20"
                                            )}>
                                                <Ionicons name="add" size={isPremium ? 20 : 16} color="#10B981" />
                                                <Text className={cn(
                                                    "font-black uppercase ml-1.5",
                                                    isPremium ? "text-xs text-primary" : "text-xs text-primary"
                                                )}>{isPremium ? "Photos" : "Add"}</Text>
                                            </Pressable>
                                        </View>
                                        {selectedImages.length > 0 ? (
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                                                {selectedImages.map((img, index) => (
                                                    <View key={img.uri + index} className="mr-3 mb-2">
                                                        <Image source={{ uri: img.uri }} className={cn("rounded-xl", isPremium ? "w-24 h-24 border border-white/10" : "w-20 h-20")} />
                                                        <Pressable onPress={() => removeImage(img.uri)} className={cn(
                                                            "absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full items-center justify-center border-2 shadow-sm",
                                                            isPremium ? "bg-destructive border-slate-900" : "bg-destructive border-background"
                                                        )}>
                                                            <Ionicons name="close" size={14} color="white" />
                                                        </Pressable>
                                                    </View>
                                                ))}
                                            </ScrollView>
                                        ) : (
                                            <Pressable onPress={pickImages} className={cn(
                                                "h-24 border-2 border-dashed rounded-3xl items-center justify-center",
                                                isPremium ? "border-white/10 bg-white/[0.02]" : "border-border/20 bg-muted/5"
                                            )}>
                                                <Ionicons name="images-outline" size={isPremium ? 32 : 24} color={isPremium ? "#475569" : "#71717A"} />
                                                <Text className={cn(
                                                    "font-bold uppercase tracking-widest mt-1",
                                                    isPremium ? "text-xs text-slate-500" : "text-[10px] text-muted-foreground"
                                                )}>{isPremium ? "No Photos" : "No Selection"}</Text>
                                            </Pressable>
                                        )}
                                    </View>

                                    {/* Action Buttons */}
                                    <View className="mt-8 flex-row gap-4 pb-4">
                                        <Button
                                            variant="outline"
                                            className={cn("flex-1 h-14 rounded-2xl", isPremium ? "border-white/10" : "border-border/10")}
                                            onPress={() => {
                                                setHomeScore('');
                                                setAwayScore('');
                                                setError(null);
                                                setSelectedImages([]);
                                            }}
                                        >
                                            <Text className={cn("font-bold uppercase", isPremium ? "text-slate-400" : "text-muted-foreground")}>Clear</Text>
                                        </Button>
                                        <Button
                                            className="flex-[2] h-14 rounded-2xl"
                                            onPress={handleSubmitResult}
                                            loading={isSubmitting}
                                        >
                                            <Text className={cn("font-black uppercase tracking-widest", isPremium ? "text-slate-900" : "text-white")}>Submit Result</Text>
                                        </Button>
                                    </View>
                                </View>
                            )}

                            {currentStatus === 'completed' && (
                                <View className={cn(
                                    "py-12 items-center rounded-[40px] border mt-4",
                                    isPremium ? "bg-white/5 border-white/10" : "bg-muted/10 border-transparent"
                                )}>
                                    <View className={cn(
                                        "w-20 h-20 rounded-full items-center justify-center border",
                                        isPremium ? "bg-primary/20 border-primary/30" : "bg-primary/20 border-transparent"
                                    )}>
                                        <Ionicons name="checkmark" size={40} color="#10B981" />
                                    </View>
                                    <Text className={cn(
                                        "font-black mt-6 uppercase tracking-widest",
                                        isPremium ? "text-xl text-white" : "text-foreground"
                                    )}>Completed</Text>
                                    {isPremium && <Text className="text-sm font-medium text-slate-500 mt-2">Results have been recorded</Text>}
                                </View>
                            )}
                            <View className="h-10" />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        );
    }
}

