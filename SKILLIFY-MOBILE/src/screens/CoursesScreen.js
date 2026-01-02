import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Image,
    FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const COURSES = [
    { id: '1', title: 'Web Development', icon: 'code-slash', lessons: 9, progress: 60, color: '#6366f1', gradient: ['#6366f1', '#8b5cf6'] },
    { id: '2', title: 'Game Development', icon: 'game-controller', lessons: 6, progress: 30, color: '#a855f7', gradient: ['#a855f7', '#ec4899'] },
    { id: '3', title: 'AI & Machine Learning', icon: 'hardware-chip', lessons: 8, progress: 0, color: '#10b981', gradient: ['#10b981', '#059669'] },
    { id: '4', title: 'Mobile Development', icon: 'phone-portrait', lessons: 7, progress: 45, color: '#f59e0b', gradient: ['#f59e0b', '#f97316'] },
    { id: '5', title: 'Cybersecurity', icon: 'shield-checkmark', lessons: 5, progress: 0, color: '#ef4444', gradient: ['#ef4444', '#dc2626'] },
    { id: '6', title: 'Data Science', icon: 'analytics', lessons: 6, progress: 15, color: '#06b6d4', gradient: ['#06b6d4', '#0891b2'] },
];

export default function CoursesScreen({ navigation }) {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('all');

    const filteredCourses = activeTab === 'all'
        ? COURSES
        : activeTab === 'inprogress'
            ? COURSES.filter(c => c.progress > 0 && c.progress < 100)
            : COURSES.filter(c => c.progress === 100);

    const CourseCard = ({ course }) => (
        <TouchableOpacity
            style={[styles.courseCard, { backgroundColor: theme.panel }]}
            onPress={() => navigation.navigate('CourseDetail', { course })}
            activeOpacity={0.7}
        >
            <LinearGradient
                colors={course.gradient}
                style={styles.courseIcon}
            >
                <Ionicons name={course.icon} size={28} color="#fff" />
            </LinearGradient>
            <View style={styles.courseInfo}>
                <Text style={[styles.courseTitle, { color: theme.text }]}>{course.title}</Text>
                <Text style={[styles.courseLessons, { color: theme.textMuted }]}>{course.lessons} lessons</Text>
                {course.progress > 0 && (
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { backgroundColor: theme.panelHover }]}>
                            <View style={[styles.progressFill, { width: `${course.progress}%`, backgroundColor: course.color }]} />
                        </View>
                        <Text style={[styles.progressText, { color: course.color }]}>{course.progress}%</Text>
                    </View>
                )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>My Courses</Text>
                <TouchableOpacity style={[styles.searchBtn, { backgroundColor: theme.panel }]}>
                    <Ionicons name="search" size={20} color={theme.textMuted} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                {['all', 'inprogress', 'completed'].map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.tab,
                            activeTab === tab && { backgroundColor: theme.primary }
                        ]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: activeTab === tab ? '#fff' : theme.textMuted }
                        ]}>
                            {tab === 'all' ? 'All' : tab === 'inprogress' ? 'In Progress' : 'Completed'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Featured Course */}
            <TouchableOpacity activeOpacity={0.9}>
                <LinearGradient
                    colors={[theme.primary, theme.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.featuredCard}
                >
                    <View style={styles.featuredBadge}>
                        <Text style={styles.featuredBadgeText}>🔥 Popular</Text>
                    </View>
                    <Text style={styles.featuredTitle}>Web Development Mastery</Text>
                    <Text style={styles.featuredSubtitle}>Complete frontend & backend course</Text>
                    <View style={styles.featuredStats}>
                        <View style={styles.featuredStat}>
                            <Ionicons name="play-circle" size={16} color="#fff" />
                            <Text style={styles.featuredStatText}>9 Lessons</Text>
                        </View>
                        <View style={styles.featuredStat}>
                            <Ionicons name="time" size={16} color="#fff" />
                            <Text style={styles.featuredStatText}>12 Hours</Text>
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>

            {/* Course List */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                <View style={styles.coursesList}>
                    {filteredCourses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    headerTitle: { fontSize: 28, fontWeight: '800' },
    searchBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    tabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, gap: 10 },
    tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    tabText: { fontSize: 13, fontWeight: '600' },
    featuredCard: { marginHorizontal: 20, borderRadius: 20, padding: 20, marginBottom: 20 },
    featuredBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start' },
    featuredBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    featuredTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 12 },
    featuredSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
    featuredStats: { flexDirection: 'row', marginTop: 16, gap: 20 },
    featuredStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    featuredStatText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    coursesList: { paddingHorizontal: 20, gap: 12 },
    courseCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, gap: 16 },
    courseIcon: { width: 56, height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    courseInfo: { flex: 1 },
    courseTitle: { fontSize: 16, fontWeight: '700' },
    courseLessons: { fontSize: 13, marginTop: 2 },
    progressContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
    progressBar: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 2 },
    progressText: { fontSize: 12, fontWeight: '700' },
});
