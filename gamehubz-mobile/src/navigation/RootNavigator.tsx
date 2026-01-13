import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { MainTabNavigator } from './MainTabNavigator';
import TournamentDetailsScreen from '../screens/TournamentDetailsScreen';
import HubProfileScreen from '../screens/HubProfileScreen';
import PlayerProfileScreen from '../screens/PlayerProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import NotFoundScreen from '../screens/NotFoundScreen';

const Stack = createStackNavigator<RootStackParamList>();

export function RootNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false, // We use our own PageHeader
            }}
        >
            <Stack.Screen
                name="MainTabs"
                component={MainTabNavigator}
            />
            <Stack.Screen
                name="TournamentDetails"
                component={TournamentDetailsScreen}
            />
            <Stack.Screen
                name="HubProfile"
                component={HubProfileScreen}
            />
            <Stack.Screen
                name="PlayerProfile"
                component={PlayerProfileScreen}
            />
            <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
            />
            <Stack.Screen
                name="NotFound"
                component={NotFoundScreen}
            />
        </Stack.Navigator>
    );
}
