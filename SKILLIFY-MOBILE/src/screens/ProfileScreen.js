import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen() {
    const { theme, isDark, toggleTheme } = useTheme();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout },
            ]
        );
    };

    const SettingItem = ({ icon, label, value, onPress, toggle, toggleValue }) => (
        <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
            onPress={onPress}
            disabled={toggle}
        >
            <View style={[styles.settingIcon, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name={icon} size={20} color={theme.primary} />
            </View>
            <Text style={[styles.settingLabel, { color: theme.text }]}>{label}</Text>
            {toggle ? (
                <Switch
                    value={toggleValue}
                    onValueChange={onPress}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#fff"
                />
            ) : (
                <View style={styles.settingRight}>
                    {value && <Text style={[styles.settingValue, { color: theme.textMuted }]}>{value}</Text>}
                    <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
                </View>

                {/* Profile Card */}
                <View style={[styles.profileCard, { backgroundColor: theme.panel }]}>
                    <LinearGradient
                        colors={[theme.primary, theme.accent]}
                        style={styles.avatar}
                    >
                        <Text style={styles.avatarText}>
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </Text>
                    </LinearGradient>
                    <Text style={[styles.username, { color: theme.text }]}>{user?.username || 'User'}</Text>
                    <Text style={[styles.email, { color: theme.textMuted }]}>{user?.email || 'email@example.com'}</Text>

                    <View style={styles.badgesRow}>
                        <View style={[styles.badge, { backgroundColor: theme.primary + '20' }]}>
                            <Ionicons name="star" size={14} color={theme.primary} />
                            <Text style={[styles.badgeText, { color: theme.primary }]}>Lvl {user?.level || 1}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: theme.success + '20' }]}>
                            <Ionicons name="flame" size={14} color={theme.success} />
                            <Text style={[styles.badgeText, { color: theme.success }]}>{user?.streak || 0} Day Streak</Text>
                        </View>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsCard}>
                    <View style={[styles.statItem, { backgroundColor: theme.panel }]}>
                        <Text style={[styles.statValue, { color: theme.primary }]}>{user?.xp || 0}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total XP</Text>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: theme.panel }]}>
                        <Text style={[styles.statValue, { color: theme.success }]}>3</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Courses</Text>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: theme.panel }]}>
                        <Text style={[styles.statValue, { color: theme.warning }]}>12</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Badges</Text>
                    </View>
                </View>

                {/* Settings */}
                <View style={[styles.settingsSection, { backgroundColor: theme.panel }]}>
                    <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>PREFERENCES</Text>
                    <SettingItem icon="moon" label="Dark Mode" toggle toggleValue={isDark} onPress={toggleTheme} />
                    <SettingItem icon="notifications" label="Notifications" value="On" onPress={() => { }} />
                    <SettingItem icon="language" label="Language" value="English" onPress={() => { }} />
                </View>

                <View style={[styles.settingsSection, { backgroundColor: theme.panel }]}>
                    <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>ACCOUNT</Text>
                    <SettingItem icon="person" label="Edit Profile" onPress={() => { }} />
                    <SettingItem icon="lock-closed" label="Change Password" onPress={() => { }} />
                    <SettingItem icon="card" label="Subscription" value="Pro" onPress={() => { }} />
                </View>

                <View style={[styles.settingsSection, { backgroundColor: theme.panel }]}>
                    <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>SUPPORT</Text>
                    <SettingItem icon="help-circle" label="Help Center" onPress={() => { }} />
                    <SettingItem icon="document-text" label="Terms of Service" onPress={() => { }} />
                    <SettingItem icon="shield" label="Privacy Policy" onPress={() => { }} />
                </View>

                {/* Logout */}
                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: theme.danger + '20' }]}
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out" size={20} color={theme.danger} />
                    <Text style={[styles.logoutText, { color: theme.danger }]}>Logout</Text>
                </TouchableOpacity>

                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60 },
    header: { paddingHorizontal: 20, marginBottom: 20 },
    headerTitle: { fontSize: 28, fontWeight: '800' },
    profileCard: { marginHorizontal: 20, borderRadius: 20, padding: 24, alignItems: 'center' },
    avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontSize: 32, fontWeight: '800' },
    username: { fontSize: 22, fontWeight: '800', marginTop: 16 },
    email: { fontSize: 14, marginTop: 4 },
    badgesRow: { flexDirection: 'row', marginTop: 16, gap: 12 },
    badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
    badgeText: { fontSize: 12, fontWeight: '600' },
    statsCard: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 16, gap: 12 },
    statItem: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center' },
    statValue: { fontSize: 22, fontWeight: '800' },
    statLabel: { fontSize: 11, marginTop: 4 },
    settingsSection: { marginHorizontal: 20, marginTop: 20, borderRadius: 16, overflow: 'hidden' },
    sectionTitle: { fontSize: 11, fontWeight: '600', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    settingItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    settingIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    settingLabel: { flex: 1, fontSize: 15, fontWeight: '500', marginLeft: 12 },
    settingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    settingValue: { fontSize: 14 },
    logoutButton: { marginHorizontal: 20, marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 8 },
    logoutText: { fontSize: 16, fontWeight: '700' },
});
