import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
    const { theme } = useTheme();
    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        xp: 0,
        level: 1,
        streak: 0,
        focusHours: 0,
    });

    useEffect(() => {
        if (user) {
            setStats({
                xp: user.xp || 0,
                level: user.level || 1,
                streak: user.streak || 0,
                focusHours: user.focusHours || 0,
            });
        }
    }, [user]);

    const onRefresh = async () => {
        setRefreshing(true);
        // Fetch updated user data
        setTimeout(() => setRefreshing(false), 1000);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const StatCard = ({ icon, value, label, color, iconName }) => (
        <View style={[styles.statCard, { backgroundColor: theme.panel }]}>
            <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={iconName} size={24} color={color} />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
        </View>
    );

    const QuickAction = ({ icon, label, onPress, gradient }) => (
        <TouchableOpacity style={styles.quickAction} onPress={onPress}>
            <LinearGradient
                colors={gradient}
                style={styles.quickActionGradient}
            >
                <Ionicons name={icon} size={28} color="#fff" />
            </LinearGradient>
            <Text style={[styles.quickActionLabel, { color: theme.text }]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                }
            >
                {/* Header */}
                <LinearGradient
                    colors={[theme.primary + '30', theme.accent + '20', 'transparent']}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={[styles.greeting, { color: theme.textMuted }]}>{getGreeting()}</Text>
                            <Text style={[styles.username, { color: theme.text }]}>{user?.username || 'Learner'} 👋</Text>
                        </View>
                        <TouchableOpacity style={[styles.notifButton, { backgroundColor: theme.panel }]}>
                            <Ionicons name="notifications-outline" size={22} color={theme.text} />
                            <View style={styles.notifDot} />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <StatCard iconName="flash" value={`${stats.xp} XP`} label="Total XP" color={theme.primary} />
                    <StatCard iconName="star" value={`Lvl ${stats.level}`} label="Level" color={theme.accent} />
                    <StatCard iconName="flame" value={`${stats.streak}🔥`} label="Streak" color={theme.warning} />
                    <StatCard iconName="time" value={`${stats.focusHours}h`} label="Focus" color={theme.success} />
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        <QuickAction
                            icon="play-circle"
                            label="Continue"
                            gradient={[theme.primary, theme.accent]}
                            onPress={() => navigation.navigate('Courses')}
                        />
                        <QuickAction
                            icon="trophy"
                            label="Challenges"
                            gradient={[theme.warning, '#ff8c00']}
                            onPress={() => navigation.navigate('Challenges')}
                        />
                        <QuickAction
                            icon="ribbon"
                            label="Certificates"
                            gradient={[theme.success, '#059669']}
                            onPress={() => { }}
                        />
                        <QuickAction
                            icon="people"
                            label="Community"
                            gradient={['#ec4899', '#f43f5e']}
                            onPress={() => { }}
                        />
                    </View>
                </View>

                {/* Progress Card */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Progress</Text>
                    <View style={[styles.progressCard, { backgroundColor: theme.panel }]}>
                        <View style={styles.progressHeader}>
                            <View>
                                <Text style={[styles.progressTitle, { color: theme.text }]}>Keep going! 💪</Text>
                                <Text style={[styles.progressSubtitle, { color: theme.textMuted }]}>
                                    You're 60% to your daily goal
                                </Text>
                            </View>
                            <View style={[styles.progressCircle, { borderColor: theme.primary }]}>
                                <Text style={[styles.progressPercent, { color: theme.primary }]}>60%</Text>
                            </View>
                        </View>
                        <View style={[styles.progressBar, { backgroundColor: theme.panelHover }]}>
                            <LinearGradient
                                colors={[theme.primary, theme.accent]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.progressFill, { width: '60%' }]}
                            />
                        </View>
                    </View>
                </View>

                {/* Weekly Challenge */}
                <View style={[styles.section, { marginBottom: 100 }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Weekly Challenge</Text>
                    <LinearGradient
                        colors={[theme.primary, theme.accent]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.challengeCard}
                    >
                        <View style={styles.challengeContent}>
                            <Ionicons name="trophy" size={40} color="#fff" />
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Text style={styles.challengeTitle}>Complete 5 Lessons</Text>
                                <Text style={styles.challengeProgress}>3/5 completed • 500 XP reward</Text>
                            </View>
                        </View>
                        <View style={[styles.challengeBar, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                            <View style={[styles.challengeFill, { width: '60%', backgroundColor: '#fff' }]} />
                        </View>
                    </LinearGradient>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    greeting: { fontSize: 14, fontWeight: '500' },
    username: { fontSize: 26, fontWeight: '800', marginTop: 4 },
    notifButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    notifDot: { position: 'absolute', top: 10, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 12, marginTop: 10 },
    statCard: { width: (width - 48) / 2 - 6, borderRadius: 16, padding: 16, alignItems: 'center' },
    statIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    statValue: { fontSize: 20, fontWeight: '800' },
    statLabel: { fontSize: 12, marginTop: 4 },
    section: { paddingHorizontal: 20, marginTop: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
    quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    quickAction: { alignItems: 'center', width: (width - 60) / 4 },
    quickActionGradient: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    quickActionLabel: { fontSize: 11, fontWeight: '600', marginTop: 8, textAlign: 'center' },
    progressCard: { borderRadius: 20, padding: 20 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    progressTitle: { fontSize: 18, fontWeight: '700' },
    progressSubtitle: { fontSize: 13, marginTop: 4 },
    progressCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 4, justifyContent: 'center', alignItems: 'center' },
    progressPercent: { fontSize: 16, fontWeight: '800' },
    progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    challengeCard: { borderRadius: 20, padding: 20 },
    challengeContent: { flexDirection: 'row', alignItems: 'center' },
    challengeTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
    challengeProgress: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
    challengeBar: { height: 6, borderRadius: 3, marginTop: 16, overflow: 'hidden' },
    challengeFill: { height: '100%', borderRadius: 3 },
});
