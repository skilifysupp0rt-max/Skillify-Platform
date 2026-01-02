/**
 * SKILLIFY Video Learning System
 * Handles video progress, unlocking, and social features
 * All messages in ENGLISH
 */

class VideoLearningSystem {
    constructor() {
        this.progress = {};
        this.currentVideo = null;
        this.courseFile = window.location.pathname.split('/').pop();
        this.init();
    }

    async init() {
        await this.loadProgress();
        this.applyUnlockState();
    }

    // Load user's video progress from backend
    async loadProgress() {
        try {
            const res = await fetch(`/api/video/progress/${this.courseFile}`);
            if (res.ok) {
                const data = await res.json();
                data.forEach(p => {
                    this.progress[p.videoId] = p;
                });
            }
        } catch (e) {
            console.error('Failed to load progress:', e);
        }
    }

    // Apply locked/unlocked states to courses
    applyUnlockState() {
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            const videoId = card.dataset.videoId;
            const isCompleted = this.progress[videoId]?.completed;

            if (index === 0) {
                card.classList.remove('locked');
            } else {
                const prevCard = cards[index - 1];
                const prevVideoId = prevCard?.dataset.videoId;
                const prevCompleted = this.progress[prevVideoId]?.completed;

                if (prevCompleted) {
                    card.classList.remove('locked');
                } else {
                    card.classList.add('locked');
                }
            }

            if (isCompleted) {
                card.classList.add('completed');
            }
        });
    }

    // Play video and track progress
    async playVideo(videoId, title, cardElement) {
        if (cardElement && cardElement.classList.contains('locked')) {
            alert('🔒 Complete the previous video first!');
            return;
        }

        this.currentVideo = videoId;

        const modal = document.getElementById('videoModal');
        const frame = document.getElementById('vidFrame');
        const titleEl = document.getElementById('vidTitle');

        modal.classList.add('active');
        titleEl.innerText = title;
        frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

        this.renderSocialBar(videoId);
        this.startProgressTracking(videoId);
    }

    // Track video progress
    async startProgressTracking(videoId) {
        const saveProgress = async (percent) => {
            try {
                await fetch('/api/video/progress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        videoId,
                        courseFile: this.courseFile,
                        moduleIndex: 0,
                        watchedPercent: percent
                    })
                });

                if (percent >= 90) {
                    this.progress[videoId] = { completed: true };
                    this.applyUnlockState();
                    this.showToast('🎉 Video Complete! +100 XP - Next video unlocked!');
                }
            } catch (e) {
                console.error('Failed to save progress:', e);
            }
        };

        setTimeout(() => saveProgress(50), 15000);
        setTimeout(() => saveProgress(100), 30000);
    }

    // Mark video as complete manually
    async markComplete(videoId) {
        try {
            const res = await fetch('/api/video/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    videoId,
                    courseFile: this.courseFile,
                    moduleIndex: 0,
                    watchedPercent: 100
                })
            });

            if (res.ok) {
                this.progress[videoId] = { completed: true };
                this.applyUnlockState();
                this.showToast('✅ Marked as complete! +100 XP');
            }
        } catch (e) {
            console.error('Failed to mark complete:', e);
        }
    }

    // Render social bar
    renderSocialBar(videoId) {
        let socialBar = document.getElementById('videoSocialBar');
        if (!socialBar) {
            socialBar = document.createElement('div');
            socialBar.id = 'videoSocialBar';
            socialBar.style.cssText = `
                display: flex;
                gap: 12px;
                padding: 12px 20px;
                background: rgba(0,0,0,0.9);
                border-top: 1px solid rgba(255,255,255,0.1);
                flex-wrap: wrap;
            `;
            document.getElementById('videoModal').querySelector('.modal-box').appendChild(socialBar);
        }

        socialBar.innerHTML = `
            <button class="social-btn" onclick="videoSystem.toggleLike('${videoId}')">
                <i class="ph ph-heart"></i> <span id="likeCount">0</span> Like
            </button>
            <button class="social-btn" onclick="videoSystem.showComments('${videoId}')">
                <i class="ph ph-chat-circle"></i> Comment
            </button>
            <button class="social-btn" onclick="videoSystem.shareVideo('${videoId}')">
                <i class="ph ph-share"></i> Share
            </button>
            <button class="social-btn complete-btn" onclick="videoSystem.markComplete('${videoId}')" style="margin-left:auto; background:var(--success); color:white;">
                <i class="ph ph-check-circle"></i> Mark Complete
            </button>
        `;

        this.loadLikeCount(videoId);
    }

    // Toggle like
    async toggleLike(videoId) {
        try {
            const res = await fetch('/api/video/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId })
            });
            const data = await res.json();
            this.showToast(data.liked ? '❤️ Liked!' : '💔 Unliked');
            this.loadLikeCount(videoId);
        } catch (e) {
            console.error('Failed to toggle like:', e);
        }
    }

    // Load like count
    async loadLikeCount(videoId) {
        try {
            const res = await fetch(`/api/video/likes/${videoId}`);
            const data = await res.json();
            const el = document.getElementById('likeCount');
            if (el) el.innerText = data.count || 0;
        } catch (e) { }
    }

    // Show comments modal
    async showComments(videoId) {
        let commentsModal = document.getElementById('commentsModal');
        if (!commentsModal) {
            commentsModal = document.createElement('div');
            commentsModal.id = 'commentsModal';
            commentsModal.className = 'modal-wrap';
            commentsModal.innerHTML = `
                <div class="modal-box" style="width: 500px; max-height: 80vh;">
                    <div class="modal-head">
                        <span>💬 Comments</span>
                        <i class="ph ph-x close-icon" onclick="document.getElementById('commentsModal').classList.remove('active')"></i>
                    </div>
                    <div id="commentsList" style="padding: 20px; max-height: 300px; overflow-y: auto;"></div>
                    <div style="padding: 20px; border-top: 1px solid var(--border);">
                        <textarea id="newComment" placeholder="Write a comment..." style="width: 100%; padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; color: white; resize: none;"></textarea>
                        <button class="btn primary" style="width: 100%; margin-top: 10px;" onclick="videoSystem.addComment('${videoId}')">
                            Post Comment
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(commentsModal);
        }

        commentsModal.classList.add('active');
        await this.loadComments(videoId);
    }

    // Load comments
    async loadComments(videoId) {
        try {
            const res = await fetch(`/api/video/comments/${videoId}`);
            const comments = await res.json();
            const list = document.getElementById('commentsList');

            if (comments.length === 0) {
                list.innerHTML = '<div style="text-align:center; color:var(--text-muted);">No comments yet. Be the first!</div>';
                return;
            }

            list.innerHTML = comments.map(c => `
                <div style="margin-bottom: 16px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <div style="width: 32px; height: 32px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">
                            ${c.User?.username?.substring(0, 2).toUpperCase() || '??'}
                        </div>
                        <span style="font-weight: 600;">${c.User?.username || 'User'}</span>
                        <span style="color: var(--text-muted); font-size: 12px;">${new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <div style="color: var(--text-muted);">${c.content}</div>
                </div>
            `).join('');
        } catch (e) {
            console.error('Failed to load comments:', e);
        }
    }

    // Add comment
    async addComment(videoId) {
        const input = document.getElementById('newComment');
        const content = input.value.trim();
        if (!content) return;

        try {
            await fetch('/api/video/comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId, content })
            });
            input.value = '';
            await this.loadComments(videoId);
            this.showToast('✅ Comment posted!');
        } catch (e) {
            console.error('Failed to add comment:', e);
        }
    }

    // Share video
    shareVideo(videoId) {
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        if (navigator.share) {
            navigator.share({
                title: 'Check out this video on Skillify!',
                url: url
            });
        } else {
            navigator.clipboard.writeText(url);
            this.showToast('📋 Link copied!');
        }
    }

    // Toast notification
    showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = msg;
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: var(--panel);
            border: 1px solid var(--primary);
            padding: 16px 24px;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // Open quiz for specific video/card
    openQuiz(courseKey, buttonElement) {
        const card = buttonElement.closest('.card');
        const videoId = card?.dataset?.videoId;

        let quizData = null;

        if (typeof COURSES_DATA !== 'undefined') {
            const courseData = COURSES_DATA[courseKey];
            if (courseData?.modules) {
                for (const module of courseData.modules) {
                    for (const course of module.courses) {
                        if (course.videoId === videoId && course.quiz) {
                            quizData = course.quiz;
                            break;
                        }
                    }
                    if (quizData) break;
                }
            }
        }

        if (!quizData && typeof DB !== 'undefined' && DB[courseKey]?.quiz) {
            quizData = DB[courseKey].quiz;
        }

        if (!quizData || quizData.length === 0) {
            this.showToast('⚠️ No quiz available for this video');
            return;
        }

        this.showQuizModal(quizData, videoId);
    }

    // Show quiz modal with questions
    showQuizModal(questions, videoId) {
        this.currentQuiz = {
            questions: Array.isArray(questions) ? questions : [questions],
            currentIndex: 0,
            score: 0,
            videoId
        };

        let quizModal = document.getElementById('quizModal');
        if (!quizModal) {
            quizModal = document.createElement('div');
            quizModal.id = 'quizModal';
            quizModal.className = 'modal-wrap';
            document.body.appendChild(quizModal);
        }

        this.renderQuizQuestion();
        quizModal.classList.add('active');
    }

    // Render current quiz question
    renderQuizQuestion() {
        const quiz = this.currentQuiz;
        const q = quiz.questions[quiz.currentIndex];
        const isLast = quiz.currentIndex === quiz.questions.length - 1;

        document.getElementById('quizModal').innerHTML = `
            <div class="modal-box" style="width: 600px; max-width: 95vw;">
                <div class="modal-head">
                    <span>📝 Quiz - Question ${quiz.currentIndex + 1}/${quiz.questions.length}</span>
                    <i class="ph ph-x close-icon" onclick="document.getElementById('quizModal').classList.remove('active')"></i>
                </div>
                <div style="padding: 30px;">
                    <div style="background: linear-gradient(135deg, var(--primary), var(--purple)); padding: 3px; border-radius: 12px; margin-bottom: 20px;">
                        <div style="background: var(--panel); padding: 20px; border-radius: 10px;">
                            <h3 style="margin: 0; font-size: 18px;">${q.q}</h3>
                        </div>
                    </div>
                    <div id="quizOptions" style="display:flex; flex-direction:column; gap:12px;">
                        ${q.opts.map((opt, i) => `
                            <button class="quiz-option" data-index="${i}" onclick="videoSystem.selectOption(${i})" style="
                                padding: 16px 20px;
                                background: rgba(255,255,255,0.05);
                                border: 2px solid rgba(255,255,255,0.1);
                                border-radius: 12px;
                                color: white;
                                font-size: 15px;
                                cursor: pointer;
                                text-align: left;
                                transition: 0.2s;
                            ">
                                <span style="display: inline-block; background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 6px; font-size: 12px; margin-right: 10px;">
                                    ${String.fromCharCode(65 + i)}
                                </span>
                                ${opt}
                            </button>
                        `).join('')}
                    </div>
                    <button id="quizSubmit" class="btn primary" style="width:100%; margin-top:20px; padding:16px; font-size: 16px; opacity: 0.5; pointer-events: none;" onclick="videoSystem.submitQuizAnswer()">
                        ${isLast ? '✅ Finish Quiz' : 'Next ➡️'}
                    </button>
                </div>
            </div>
        `;
    }

    // Select quiz option
    selectOption(index) {
        this.currentQuiz.selectedAnswer = index;

        document.querySelectorAll('.quiz-option').forEach((btn, i) => {
            if (i === index) {
                btn.style.borderColor = 'var(--primary)';
                btn.style.background = 'rgba(99, 102, 241, 0.2)';
            } else {
                btn.style.borderColor = 'rgba(255,255,255,0.1)';
                btn.style.background = 'rgba(255,255,255,0.05)';
            }
        });

        const submitBtn = document.getElementById('quizSubmit');
        submitBtn.style.opacity = '1';
        submitBtn.style.pointerEvents = 'auto';
    }

    // Submit quiz answer
    submitQuizAnswer() {
        const quiz = this.currentQuiz;
        const q = quiz.questions[quiz.currentIndex];
        const isCorrect = quiz.selectedAnswer === q.correct;

        if (isCorrect) {
            quiz.score++;
            this.showToast('✅ Correct! +20 XP');
        } else {
            this.showToast(`❌ Wrong! Correct answer: ${q.opts[q.correct]}`);
        }

        if (quiz.currentIndex < quiz.questions.length - 1) {
            quiz.currentIndex++;
            quiz.selectedAnswer = null;
            this.renderQuizQuestion();
        } else {
            this.finishQuiz();
        }
    }

    // Finish quiz and show results
    finishQuiz() {
        const quiz = this.currentQuiz;
        const percentage = Math.round((quiz.score / quiz.questions.length) * 100);
        const passed = percentage >= 60;

        document.getElementById('quizModal').innerHTML = `
            <div class="modal-box" style="width: 500px; max-width: 95vw; text-align: center; padding: 40px;">
                <div style="font-size: 80px; margin-bottom: 20px;">
                    ${passed ? '🎉' : '😔'}
                </div>
                <h2 style="margin-bottom: 10px;">${passed ? 'Congratulations!' : 'Try Again'}</h2>
                <p style="color: var(--text-muted); margin-bottom: 30px;">
                    Score: ${quiz.score}/${quiz.questions.length} (${percentage}%)
                </p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button class="btn" onclick="document.getElementById('quizModal').classList.remove('active')">
                        Close
                    </button>
                    ${!passed ? `<button class="btn primary" onclick="videoSystem.retryQuiz()">Retry</button>` : ''}
                </div>
            </div>
        `;

        if (passed) {
            const xpGained = quiz.score * 20;
            this.showToast(`🏆 You earned ${xpGained} XP!`);
        }
    }

    // Retry quiz
    retryQuiz() {
        this.currentQuiz.currentIndex = 0;
        this.currentQuiz.score = 0;
        this.currentQuiz.selectedAnswer = null;
        this.renderQuizQuestion();
    }
}

// Global instance
let videoSystem;
document.addEventListener('DOMContentLoaded', () => {
    videoSystem = new VideoLearningSystem();
});

// CSS for locked cards and responsive video modal
const style = document.createElement('style');
style.textContent = `
    .card.locked {
        opacity: 0.5;
        filter: grayscale(1);
        pointer-events: none;
        position: relative;
    }
    .card.locked::after {
        content: '🔒';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 48px;
        z-index: 10;
    }
    .card.completed {
        border-color: var(--success) !important;
    }
    .card.completed::before {
        content: '✅';
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 24px;
        z-index: 10;
    }
    .social-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 8px;
        color: white;
        cursor: pointer;
        font-size: 13px;
        transition: 0.2s;
    }
    .social-btn:hover {
        background: rgba(255,255,255,0.2);
    }
    
    /* Fix video modal for laptop */
    #videoModal .modal-box {
        width: 90vw !important;
        max-width: 1000px !important;
    }
    #videoModal .modal-box > div[style*="aspect-ratio"] {
        width: 100%;
        max-height: 70vh;
    }
    #vidFrame {
        width: 100%;
        height: 100%;
        min-height: 400px;
    }
    
    @media (max-width: 768px) {
        #videoModal .modal-box {
            width: 95vw !important;
        }
        #vidFrame {
            min-height: 250px;
        }
        .social-btn {
            padding: 8px 12px;
            font-size: 12px;
        }
    }
`;
document.head.appendChild(style);
