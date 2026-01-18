import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { RegionType } from '../types/auth';
import { SelectInput } from '../components/ui/SelectInput';

export default function RegisterScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { register, isLoading } = useAuth();

    const regionOptions = [
        { label: 'North America', value: RegionType.NA },
        { label: 'Europe', value: RegionType.EUROPE },
        { label: 'Asia', value: RegionType.ASIA },
        { label: 'South America', value: RegionType.SA },
        { label: 'Africa', value: RegionType.AFRICA },
        { label: 'Oceania', value: RegionType.OCEANIA },
    ];

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        region: undefined as RegionType | undefined
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Partial<typeof formData>>({});

    const updateForm = (key: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        // Clear error when user types
        if (errors[key]) {
            setErrors(prev => ({ ...prev, [key]: undefined }));
        }
    };

    const validate = () => {
        const newErrors: Partial<typeof formData> = {};
        if (!formData.username) newErrors.username = 'Username is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (formData.region === undefined) newErrors.region = 'Region is required' as any; // Temporary fix for Partial<FormData> type mismatch

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        // Construct the payload expected by backend
        // If backend expects specific fields, this map should be adjusted.
        // Based on user object provided, we send what we have.
        const payload = {
            userName: formData.username,
            email: formData.email,
            password: formData.password,
            region: formData.region,
            firstName: formData.firstName || "",
            lastName: formData.lastName || "",
            userRoleId: "6AB87F80-2DE2-4F95-BCE5-7B86F38E426F"
        };

        const success = await register(payload);
        if (success) {
            Alert.alert(
                'Account Created',
                'Your account has been successfully created. Please log in.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        } else {
            Alert.alert('Registration Failed', 'Unable to create account. Please try again.');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <StatusBar style="light" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                    className="px-6"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="items-center my-8">
                        <View className="w-16 h-16 bg-accent/20 rounded-2xl items-center justify-center mb-4 -rotate-3">
                            <Ionicons name="person-add" size={30} color="hsl(45, 90%, 55%)" />
                        </View>

                        <Text className="text-3xl font-bold text-foreground mb-1">Create Account</Text>
                        <Text className="text-muted-foreground text-center">
                            Join the community and start competing
                        </Text>
                    </View>

                    <View className="gap-4 w-full max-w-sm self-center">
                        <Input
                            label="Username"
                            placeholder="ProGamer123"
                            value={formData.username}
                            onChangeText={(text) => updateForm('username', text)}
                            leftIcon="person-outline"
                            error={errors.username}
                        />

                        <Input
                            label="Email Address"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChangeText={(text) => updateForm('email', text)}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            leftIcon="mail-outline"
                            error={errors.email}
                        />

                        <SelectInput
                            label="Region"
                            placeholder="Select your region"
                            options={regionOptions}
                            value={formData.region}
                            onSelect={(val) => updateForm('region', val)}
                            leftIcon="earth-outline"
                            error={errors.region as string | undefined}
                            className="mb-1"
                        />

                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <Input
                                    label="First Name (Opt)"
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChangeText={(text) => updateForm('firstName', text)}
                                />
                            </View>
                            <View className="flex-1">
                                <Input
                                    label="Last Name (Opt)"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChangeText={(text) => updateForm('lastName', text)}
                                />
                            </View>
                        </View>

                        <Input
                            label="Password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChangeText={(text) => updateForm('password', text)}
                            secureTextEntry={!showPassword}
                            leftIcon="lock-closed-outline"
                            rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                            onRightIconPress={() => setShowPassword(!showPassword)}
                            error={errors.password}
                        />

                        <Input
                            label="Confirm Password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChangeText={(text) => updateForm('confirmPassword', text)}
                            secureTextEntry={!showPassword}
                            leftIcon="lock-closed-outline"
                            error={errors.confirmPassword}
                        />

                        <Button
                            onPress={handleRegister}
                            loading={isLoading}
                            className="mt-4"
                            size="lg"
                        >
                            Create Account
                        </Button>

                        <View className="flex-row items-center justify-center mt-6 mb-4">
                            <Text className="text-muted-foreground">Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text className="text-primary font-bold">Log In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
