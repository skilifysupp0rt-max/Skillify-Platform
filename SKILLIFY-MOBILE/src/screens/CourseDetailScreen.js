import React, { useState } from 'react';
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

const LESSONS = [
    { id: '1', title: 'Introduction', duration: '5:30', completed: true },
    { id: '2', title: 'Setting Up Environment', duration: '12:45', completed: true },
    { id: '3', title: 'HTML Basics', duration: '18:20', completed: true },
    { id: '4', title: 'CSS Fundamentals', duration: '22:15', completed: false },
    { id: '5', title: 'JavaScript Intro', duration: '25:40', completed: false },
    { id: '6', title: 'DOM Manipulation', duration: '30:10', completed: false },
    { id: '7', title: 'Building a Project', duration: '45:00', completed: false },
    { id: '8', title: 'Deployment', duration: '15:30', completed: false },
    { id: '9', title: 'Final Quiz', duration: '10:00', completed: false },
];

export default function CourseDetailScreen({ route, navigation }) {
    const { theme } = useTheme();
    const { course } = route.params;
    const [expandedLesson, setExpandedLesson] = useState(null);

    const completedCount = LESSONS.filter(l => l.completed).length;
    const progress = (completedCount / LESSONS.length) * 100;

    const LessonItem = ({ lesson, index }) => {
        const isLocked = index > completedCount;

        return (
            <TouchableOpacity
                style={[styles.lessonItem, { backgroundColor: theme.panel, opacity: isLocked ? 0.5 : 1 }]}
                onPress={() => !isLocked && setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                disabled={isLocked}
            >
                <View style={[
                    styles.lessonNumber,
                    {
                        backgroundColor: lesson.completed ? theme.success : isLocked ? theme.textMuted : theme.primary,
                    }
                ]}>
                    {lesson.completed ? (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                    ) : isLocked ? (
                        <Ionicons name="lock-closed" size={14} color="#fff" />
                    ) : (
                        <Text style={styles.lessonNumberText}>{index + 1}</Text>
                    )}
                </View>

                <View style={styles.lessonInfo}>
                    <Text style={[styles.lessonTitle, { color: theme.text }]}>{lesson.title}</Text>
                    <View style={styles.lessonMeta}>
                        <Ionicons name="time-outline" size={14} color={theme.textMuted} />
                        <Text style={[styles.lessonDuration, { color: theme.textMuted }]}>{lesson.duration}</Text>
                    </View>
                </View>

                {!isLocked && (
                    <TouchableOpacity
                        style={[styles.playButton, { backgroundColor: course.color }]}
                        onPress={() => { }}
                    >
                        <Ionicons name="play" size={16} color="#fff" />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* Header */}
            <LinearGradient
                colors={course.gradient}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bookmarkButton}>
                        <Ionicons name="bookmark-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.headerContent}>
                    <View style={styles.courseIconLarge}>
                        <Ionicons name={course.icon} size={40} color="#fff" />
                    </View>
                    <Text style={styles.courseTitle}>{course.title}</Text>
                    <Text style={styles.courseSubtitle}>{course.lessons} lessons • 12 hours</Text>
                </View>

                {/* Progress */}
                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Your Progress</Text>
                        <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
                    </View>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                </View>
            </LinearGradient>

            {/* Lessons */}
            <ScrollView style={styles.lessonsContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.lessonsList}>
                    {LESSONS.map((lesson, index) => (
                        <LessonItem key={lesson.id} lesson={lesson} index={index} />
                    ))}
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Continue Button */}
            <View style={[styles.bottomBar, { backgroundColor: theme.bg }]}>
                <TouchableOpacity style={styles.continueButton}>
                    <LinearGradient
                        colors={course.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.continueGradient}
                    >
                        <Ionicons name="play-circle" size={24} color="#fff" />
                        <Text style={styles.continueText}>Continue Learning</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between' },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    bookmarkButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    headerContent: { alignItems: 'center', marginTop: 24 },
    courseIconLarge: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    courseTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 16, textAlign: 'center' },
    courseSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 8 },
    progressSection: { marginTop: 24 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
    progressPercent: { color: '#fff', fontSize: 13, fontWeight: '700' },
    progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },
    lessonsContainer: { flex: 1 },
    lessonsList: { padding: 20, gap: 12 },
    lessonItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, gap: 16 },
    lessonNumber: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    lessonNumberText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    lessonInfo: { flex: 1 },
    lessonTitle: { fontSize: 15, fontWeight: '600' },
    lessonMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
    lessonDuration: { fontSize: 12 },
    playButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 34 },
    continueButton: { borderRadius: 16, overflow: 'hidden' },
    continueGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
    continueText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
