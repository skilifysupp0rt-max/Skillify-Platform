import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CoursesScreen from './src/screens/CoursesScreen';
import ChallengesScreen from './src/screens/ChallengesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CourseDetailScreen from './src/screens/CourseDetailScreen';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#0f1117',
                    borderTopColor: 'rgba(255,255,255,0.1)',
                    height: 70,
                    paddingBottom: 10,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: '#6366f1',
                tabBarInactiveTintColor: '#6b7280',
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Courses') iconName = focused ? 'book' : 'book-outline';
                    else if (route.name === 'Challenges') iconName = focused ? 'trophy' : 'trophy-outline';
                    else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
                    return <Ionicons name={iconName} size={24} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Courses" component={CoursesScreen} />
            <Tab.Screen name="Challenges" component={ChallengesScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

// Auth Stack
function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}

// Main Stack (after login)
function AppStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
        </Stack.Navigator>
    );
}

// Root Navigator
function RootNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#08090d' }}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return isAuthenticated ? <AppStack /> : <AuthStack />;
}

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <NavigationContainer>
                    <StatusBar style="light" />
                    <RootNavigator />
                </NavigationContainer>
            </AuthProvider>
        </ThemeProvider>
    );
}
