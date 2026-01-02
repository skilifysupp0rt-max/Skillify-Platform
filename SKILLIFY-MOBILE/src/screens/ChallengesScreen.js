import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const CHALLENGES = [
    { id: '1', title: 'Complete 5 Lessons', description: 'Finish any 5 lessons this week', progress: 3, total: 5, xp: 500, icon: 'play-circle', active: true },
    { id: '2', title: 'Learn Daily', description: 'Study for 7 days straight', progress: 5, total: 7, xp: 1000, icon: 'flame', active: true },
    { id: '3', title: 'Community Helper', description: 'Help 3 users in community', progress: 1, total: 3, xp: 300, icon: 'people', active: true },
    { id: '4', title: 'Speed Learner', description: 'Complete a course in 1 week', progress: 0, total: 1, xp: 2000, icon: 'rocket', active: false },
];

export default function ChallengesScreen() {
    const { theme } = useTheme();

    const ChallengeCard = ({ challenge }) => {
        const progressPercent = (challenge.progress / challenge.total) * 100;
        const isComplete = challenge.progress >= challenge.total;

        return (
            <View style={[styles.challengeCard, { backgroundColor: theme.panel }]}>
                <View style={styles.challengeHeader}>
                    <LinearGradient
                        colors={isComplete ? [theme.success, '#059669'] : [theme.primary, theme.accent]}
                        style={styles.challengeIcon}
                    >
                        <Ionicons name={challenge.icon} size={24} color="#fff" />
                    </LinearGradient>
                    <View style={styles.challengeInfo}>
                        <Text style={[styles.challengeTitle, { color: theme.text }]}>{challenge.title}</Text>
                        <Text style={[styles.challengeDesc, { color: theme.textMuted }]}>{challenge.description}</Text>
                    </View>
                    <View style={[styles.xpBadge, { backgroundColor: theme.primary + '20' }]}>
                        <Text style={[styles.xpText, { color: theme.primary }]}>{challenge.xp} XP</Text>
                    </View>
                </View>

                <View style={styles.progressSection}>
                    <View style={[styles.progressBar, { backgroundColor: theme.panelHover }]}>
                        <LinearGradient
                            colors={isComplete ? [theme.success, '#059669'] : [theme.primary, theme.accent]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.progressFill, { width: `${progressPercent}%` }]}
                        />
                    </View>
                    <Text style={[styles.progressText, { color: theme.textMuted }]}>
                        {challenge.progress}/{challenge.total}
                    </Text>
                </View>

                {isComplete && (
                    <TouchableOpacity style={[styles.claimButton, { backgroundColor: theme.success }]}>
                        <Ionicons name="gift" size={18} color="#fff" />
                        <Text style={styles.claimText}>Claim Reward</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Challenges</Text>
                <TouchableOpacity style={[styles.historyBtn, { backgroundColor: theme.panel }]}>
                    <Ionicons name="time" size={20} color={theme.textMuted} />
                </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={[styles.statBox, { backgroundColor: theme.panel }]}>
                    <Ionicons name="trophy" size={24} color={theme.warning} />
                    <Text style={[styles.statValue, { color: theme.text }]}>12</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Completed</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.panel }]}>
                    <Ionicons name="flash" size={24} color={theme.primary} />
                    <Text style={[styles.statValue, { color: theme.text }]}>4,500</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>XP Earned</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.panel }]}>
                    <Ionicons name="flame" size={24} color={theme.danger} />
                    <Text style={[styles.statValue, { color: theme.text }]}>5</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Active</Text>
                </View>
            </View>

            {/* Active Challenges */}
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Active Challenges</Text>
                {CHALLENGES.filter(c => c.active).map(challenge => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}

                <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Coming Soon</Text>
                {CHALLENGES.filter(c => !c.active).map(challenge => (
                    <View key={challenge.id} style={[styles.challengeCard, { backgroundColor: theme.panel, opacity: 0.6 }]}>
                        <View style={styles.challengeHeader}>
                            <View style={[styles.challengeIcon, { backgroundColor: theme.textMuted }]}>
                                <Ionicons name={challenge.icon} size={24} color="#fff" />
                            </View>
                            <View style={styles.challengeInfo}>
                                <Text style={[styles.challengeTitle, { color: theme.text }]}>{challenge.title}</Text>
                                <Text style={[styles.challengeDesc, { color: theme.textMuted }]}>{challenge.description}</Text>
                            </View>
                            <Ionicons name="lock-closed" size={20} color={theme.textMuted} />
                        </View>
                    </View>
                ))}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    headerTitle: { fontSize: 28, fontWeight: '800' },
    historyBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 24 },
    statBox: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center' },
    statValue: { fontSize: 20, fontWeight: '800', marginTop: 8 },
    statLabel: { fontSize: 11, marginTop: 2 },
    sectionTitle: { fontSize: 18, fontWeight: '700', paddingHorizontal: 20, marginBottom: 12 },
    challengeCard: { marginHorizontal: 20, borderRadius: 16, padding: 16, marginBottom: 12 },
    challengeHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    challengeIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    challengeInfo: { flex: 1 },
    challengeTitle: { fontSize: 16, fontWeight: '700' },
    challengeDesc: { fontSize: 12, marginTop: 2 },
    xpBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    xpText: { fontSize: 12, fontWeight: '700' },
    progressSection: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 12 },
    progressBar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    progressText: { fontSize: 13, fontWeight: '600' },
    claimButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, paddingVertical: 12, borderRadius: 12, gap: 8 },
    claimText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
