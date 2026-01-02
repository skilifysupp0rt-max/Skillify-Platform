import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
    const { theme } = useTheme();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        const result = await login(email, password);

        setLoading(false);
        if (!result.success) {
            setError(result.message);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.bg }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Logo & Brand */}
                <View style={styles.brandContainer}>
                    <LinearGradient
                        colors={[theme.primary, theme.accent]}
                        style={styles.logoGradient}
                    >
                        <Ionicons name="diamond" size={40} color="#fff" />
                    </LinearGradient>
                    <Text style={[styles.brandText, { color: theme.text }]}>Skillify</Text>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                        Master new skills with AI
                    </Text>
                </View>

                {/* Login Form */}
                <View style={[styles.formCard, { backgroundColor: theme.panel }]}>
                    <Text style={[styles.formTitle, { color: theme.text }]}>Welcome Back</Text>

                    {error ? (
                        <View style={[styles.errorBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                            <Text style={{ color: theme.danger }}>{error}</Text>
                        </View>
                    ) : null}

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.textMuted }]}>Email</Text>
                        <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.panelHover }]}>
                            <Ionicons name="mail-outline" size={20} color={theme.textMuted} />
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                placeholder="Enter your email"
                                placeholderTextColor={theme.textMuted}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.textMuted }]}>Password</Text>
                        <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.panelHover }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={theme.textMuted} />
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                placeholder="Enter your password"
                                placeholderTextColor={theme.textMuted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color={theme.textMuted}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={[theme.primary, theme.accent]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Sign In</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.registerLink}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <Text style={{ color: theme.textMuted }}>
                            Don't have an account?{' '}
                            <Text style={{ color: theme.primary, fontWeight: '600' }}>Sign Up</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        paddingTop: 60,
    },
    brandContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoGradient: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    brandText: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 14,
        marginTop: 8,
    },
    formCard: {
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 24,
    },
    errorBox: {
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 52,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
    },
    loginButton: {
        marginTop: 10,
        borderRadius: 14,
        overflow: 'hidden',
    },
    gradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    registerLink: {
        alignItems: 'center',
        marginTop: 20,
    },
});
