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
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function RegisterScreen({ navigation }) {
    const { theme } = useTheme();
    const { register } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        if (!username || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        const result = await register(username, email, password);

        setLoading(false);
        if (result.success) {
            Alert.alert('Success', 'Account created! Please login.', [
                { text: 'OK', onPress: () => navigation.navigate('Login') }
            ]);
        } else {
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
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>

                {/* Brand */}
                <View style={styles.brandContainer}>
                    <Text style={[styles.brandText, { color: theme.text }]}>Create Account</Text>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                        Start your learning journey today
                    </Text>
                </View>

                {/* Register Form */}
                <View style={[styles.formCard, { backgroundColor: theme.panel }]}>
                    {error ? (
                        <View style={[styles.errorBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                            <Text style={{ color: theme.danger }}>{error}</Text>
                        </View>
                    ) : null}

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.textMuted }]}>Username</Text>
                        <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.panelHover }]}>
                            <Ionicons name="person-outline" size={20} color={theme.textMuted} />
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                placeholder="Choose a username"
                                placeholderTextColor={theme.textMuted}
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

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
                                placeholder="Create a password"
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

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.textMuted }]}>Confirm Password</Text>
                        <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.panelHover }]}>
                            <Ionicons name="shield-checkmark-outline" size={20} color={theme.textMuted} />
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                placeholder="Confirm your password"
                                placeholderTextColor={theme.textMuted}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={handleRegister}
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
                                <Text style={styles.buttonText}>Create Account</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={{ color: theme.textMuted }}>
                            Already have an account?{' '}
                            <Text style={{ color: theme.primary, fontWeight: '600' }}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, padding: 20, paddingTop: 60 },
    header: { marginBottom: 20 },
    brandContainer: { marginBottom: 30 },
    brandText: { fontSize: 28, fontWeight: '800' },
    subtitle: { fontSize: 14, marginTop: 8 },
    formCard: { borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
    errorBox: { padding: 12, borderRadius: 12, marginBottom: 16 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, height: 52, gap: 12 },
    input: { flex: 1, fontSize: 15 },
    registerButton: { marginTop: 10, borderRadius: 14, overflow: 'hidden' },
    gradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    loginLink: { alignItems: 'center', marginTop: 20 },
});
