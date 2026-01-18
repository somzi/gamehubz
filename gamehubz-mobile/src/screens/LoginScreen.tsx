import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';

export default function LoginScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { login, isLoading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validate = () => {
        const newErrors: { email?: string; password?: string } = {};
        if (!email) newErrors.email = 'Email is required';
        if (!password) newErrors.password = 'Password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        const success = await login(email, password);
        if (!success) {
            Alert.alert('Login Failed', 'Please check your credentials and try again.');
        }
        // Navigation is handled by RootNavigator observing user state usually, 
        // or we can manually navigate if not using conditional rendering for stacks.
        // But with Context Auth, usually we rely on conditional rendering.
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <StatusBar style="light" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                    className="px-6"
                >
                    <View className="items-center mb-10">
                        {/* Placeholder for Logo */}
                        <View className="w-20 h-20 bg-primary/20 rounded-2xl items-center justify-center mb-6 rotate-3">
                            <Ionicons name="game-controller" size={40} color="hsl(185, 75%, 45%)" />
                        </View>

                        <Text className="text-3xl font-bold text-foreground mb-2">Welcome Back!</Text>
                        <Text className="text-muted-foreground text-center">
                            Sign in to continue your gaming journey with GameHubz
                        </Text>
                    </View>

                    <View className="gap-4 w-full max-w-sm self-center">
                        <Input
                            label="Email Address"
                            placeholder="entered@email.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            leftIcon="mail-outline"
                            error={errors.email}
                        />

                        <Input
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            leftIcon="lock-closed-outline"
                            rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                            onRightIconPress={() => setShowPassword(!showPassword)}
                            error={errors.password}
                        />

                        <TouchableOpacity
                            className="self-end"
                            onPress={() => Alert.alert('Coming Soon', 'Forgot Password flow to be implemented')}
                        >
                            <Text className="text-primary text-sm font-medium">Forgot Password?</Text>
                        </TouchableOpacity>

                        <Button
                            onPress={handleLogin}
                            loading={isLoading}
                            className="mt-2"
                            size="lg"
                        >
                            Log In
                        </Button>

                        <View className="flex-row items-center justify-center mt-6">
                            <Text className="text-muted-foreground">Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register' as any)}>
                                <Text className="text-primary font-bold">Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
