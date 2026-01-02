import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const AuthContext = createContext({});

const API_URL = 'http://localhost:5000';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const userData = await SecureStore.getItemAsync('userData');

            if (token && userData) {
                setUser(JSON.parse(userData));
                setIsAuthenticated(true);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password
            });

            if (response.data.user) {
                await SecureStore.setItemAsync('userToken', response.data.token || 'session');
                await SecureStore.setItemAsync('userData', JSON.stringify(response.data.user));
                setUser(response.data.user);
                setIsAuthenticated(true);
                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (username, email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, {
                username,
                email,
                password
            });

            if (response.data.success || response.data.user) {
                return { success: true, message: 'Registration successful!' };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync('userToken');
            await SecureStore.deleteItemAsync('userData');
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const updateUser = async (userData) => {
        setUser(userData);
        await SecureStore.setItemAsync('userData', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated,
            login,
            register,
            logout,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
