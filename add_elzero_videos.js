/**
 * Add Elzero Web School Videos to SKILLIFY Courses
 * Videos by عبد الرحمن جمال (Abdelrahman Gamal)
 */

const fs = require('fs');
const path = require('path');

// Elzero Web School Video IDs - Real videos from the channel
const ELZERO_VIDEOS = {
    // HTML Course
    html: {
        intro: 'qfQMF0pSdIk', // مقدمة الكورس
        basics: 'hI9GdW0cBGs', // HTML Basics
        tags: 'tq9w0PHCHW4', // HTML Tags
        forms: 'XQMw-ug0Jtk', // HTML Forms
        semantic: '0AO7HBZhDVc' // Semantic HTML
    },
    // CSS Course
    css: {
        intro: 'X1ulCwyhCVM', // CSS Introduction
        selectors: 'qyVkLebgfzY', // Selectors
        box: 'G3e-cpL7ofc', // Box Model
        flexbox: 'u0SbQ1z0eTo', // Flexbox
        grid: 'BI3W-kgM3lY', // CSS Grid
        responsive: 'OxC_9h7AWEQ' // Responsive
    },
    // JavaScript Course
    js: {
        intro: 'GM6dQBmc-Xg', // JS Introduction
        variables: 'Lp_b5sVlKDs', // Variables
        functions: 'kN2I_5kYOHU', // Functions
        dom: 'PlMq6ajlxmc', // DOM
        events: '_BDKnzNjCSU', // Events
        arrays: '1dYbvLMwFSI', // Arrays
        objects: 'OlxVHhO2I5Q', // Objects
        async: 'wjYAE3j0A7Q' // Async/Await
    },
    // React Course
    react: {
        intro: 'NR07J-RYVpo', // React Introduction
        components: 'uGN6a1atBDc', // Components
        hooks: 'POhyA4dS7FQ', // Hooks
        state: 'LQ3SZgihiAg' // State Management
    },
    // Node.js
    node: {
        intro: 'LIjVX8W6fqs', // Node.js Intro
        express: '1_xJPfERybY' // Express.js
    },
    // Python
    python: {
        intro: 'mvZHDpCHphk', // Python Basics
        oop: 'A9kSngn7254' // OOP
    }
};

// Quiz questions - 5 questions per module
const QUIZZES = {
    html: [
        { q: 'ما هو الـ Tag المستخدم لإنشاء paragraph؟', opts: ['<p>', '<div>', '<span>', '<br>'], correct: 0 },
        { q: 'أي من الـ elements التالية تُعتبر semantic؟', opts: ['<div>', '<span>', '<section>', '<b>'], correct: 2 },
        { q: 'كيف نضيف صورة في HTML؟', opts: ['<image>', '<img>', '<picture>', '<photo>'], correct: 1 },
        { q: 'ما الفرق بين id و class؟', opts: ['id متكرر', 'class فريد', 'id فريد وclass متكرر', 'لا فرق'], correct: 2 },
        { q: 'أي attribute يُستخدم لتحديد مسار الصورة؟', opts: ['href', 'src', 'link', 'path'], correct: 1 }
    ],
    css: [
        { q: 'ما هي الخاصية المستخدمة لتغيير لون الخلفية؟', opts: ['color', 'bg-color', 'background-color', 'fill'], correct: 2 },
        { q: 'ما هي قيمة display لعرض العناصر بجانب بعض؟', opts: ['block', 'inline', 'flex', 'none'], correct: 2 },
        { q: 'كيف نختار عنصر بـ ID معين؟', opts: ['.id', '#id', '@id', '*id'], correct: 1 },
        { q: 'ما هي وحدة القياس النسبية؟', opts: ['px', 'em', 'pt', 'in'], correct: 1 },
        { q: 'أي خاصية تتحكم في المسافة داخل العنصر؟', opts: ['margin', 'border', 'padding', 'gap'], correct: 2 }
    ],
    js: [
        { q: 'ما هو الـ output: console.log(typeof [])?', opts: ['array', 'object', 'list', 'undefined'], correct: 1 },
        { q: 'ما الفرق بين let و const؟', opts: ['لا فرق', 'const ثابت', 'let ثابت', 'const للأرقام فقط'], correct: 1 },
        { q: 'كيف نستهدف عنصر بـ ID في DOM؟', opts: ['getElement()', 'getElementById()', 'querySelector()', 'الإثنين B و C'], correct: 3 },
        { q: 'ما هي callback function؟', opts: ['دالة ترجع قيمة', 'دالة تُمرر كـ argument', 'دالة بدون اسم', 'نوع من الـ array'], correct: 1 },
        { q: 'ما هو الـ Promise؟', opts: ['متغير', 'كائن للـ async', 'نوع بيانات', 'loop'], correct: 1 }
    ],
    react: [
        { q: 'ما هو JSX؟', opts: ['لغة جديدة', 'JavaScript XML', 'CSS Framework', 'Database'], correct: 1 },
        { q: 'ما هو useState؟', opts: ['Component', 'Hook', 'Prop', 'Event'], correct: 1 },
        { q: 'كيف نمرر data من Parent لـ Child؟', opts: ['state', 'props', 'context', 'ref'], correct: 1 },
        { q: 'ما هو useEffect؟', opts: ['للـ styling', 'للـ side effects', 'للـ routing', 'للـ forms'], correct: 1 },
        { q: 'ما هو Virtual DOM؟', opts: ['DOM حقيقي', 'نسخة من DOM في الذاكرة', 'API', 'مكتبة'], correct: 1 }
    ],
    python: [
        { q: 'كيف نطبع في Python؟', opts: ['console.log()', 'print()', 'echo()', 'write()'], correct: 1 },
        { q: 'ما نوع البيانات: [1, 2, 3]؟', opts: ['tuple', 'list', 'dict', 'set'], correct: 1 },
        { q: 'ما هي def في Python؟', opts: ['متغير', 'class', 'function', 'loop'], correct: 2 },
        { q: 'ما الفرق بين list و tuple؟', opts: ['لا فرق', 'list ثابتة', 'tuple ثابتة', 'tuple للنصوص'], correct: 2 },
        { q: 'كيف نستورد مكتبة؟', opts: ['include', 'require', 'import', 'using'], correct: 2 }
    ],
    node: [
        { q: 'ما هو Node.js؟', opts: ['Framework', 'Runtime Environment', 'Database', 'Language'], correct: 1 },
        { q: 'ما هو npm؟', opts: ['Node Package Manager', 'New Programming Method', 'Node Protocol Machine', 'لا شيء'], correct: 0 },
        { q: 'كيف ننشئ server في Express؟', opts: ['express()', 'server()', 'http()', 'node()'], correct: 0 },
        { q: 'ما هو middleware؟', opts: ['Database', 'دالة بين request و response', 'Frontend', 'API'], correct: 1 },
        { q: 'ما هو module.exports؟', opts: ['Import', 'Export', 'Variable', 'Function'], correct: 1 }
    ]
};

// Update web.html with Elzero videos
function updateWebCourse() {
    const filePath = path.join(__dirname, 'public', 'web dev', 'web.html');
    let content = fs.readFileSync(filePath, 'utf-8');

    // Replace placeholder video IDs with real Elzero videos
    const replacements = [
        // Frontend Level 1
        { old: "{ t: 'HTML5 Semantic Structure'", new: `{ t: 'HTML5 Semantic Structure', v: '${ELZERO_VIDEOS.html.intro}'` },
        { old: "{ t: 'CSS Grid Mastery'", new: `{ t: 'CSS Grid Mastery', v: '${ELZERO_VIDEOS.css.grid}'` },
        { old: "{ t: 'Flex Layout Pro'", new: `{ t: 'Flex Layout Pro', v: '${ELZERO_VIDEOS.css.flexbox}'` },

        // JavaScript Level 2
        { old: "{ t: 'ES6+ Deep Dive'", new: `{ t: 'ES6+ Deep Dive', v: '${ELZERO_VIDEOS.js.intro}'` },
        { old: "{ t: 'Async JavaScript'", new: `{ t: 'Async JavaScript', v: '${ELZERO_VIDEOS.js.async}'` },
        { old: "{ t: 'DOM API'", new: `{ t: 'DOM API', v: '${ELZERO_VIDEOS.js.dom}'` },

        // React Level 3
        { old: "{ t: 'React Fundamentals'", new: `{ t: 'React Fundamentals', v: '${ELZERO_VIDEOS.react.intro}'` },
        { old: "{ t: 'Hooks Deep Dive'", new: `{ t: 'Hooks Deep Dive', v: '${ELZERO_VIDEOS.react.hooks}'` },
        { old: "{ t: 'State Management'", new: `{ t: 'State Management', v: '${ELZERO_VIDEOS.react.state}'` }
    ];

    // Apply video ID replacements for courses with empty v: ''
    content = content.replace(/v: ''/g, function () {
        // Cycle through Elzero videos
        const videos = [
            ELZERO_VIDEOS.html.intro,
            ELZERO_VIDEOS.css.intro,
            ELZERO_VIDEOS.js.intro,
            ELZERO_VIDEOS.html.basics,
            ELZERO_VIDEOS.css.selectors,
            ELZERO_VIDEOS.js.variables,
            ELZERO_VIDEOS.html.forms,
            ELZERO_VIDEOS.css.box,
            ELZERO_VIDEOS.js.functions,
            ELZERO_VIDEOS.react.intro,
            ELZERO_VIDEOS.react.hooks,
            ELZERO_VIDEOS.node.intro,
            ELZERO_VIDEOS.python.intro
        ];
        const idx = Math.floor(Math.random() * videos.length);
        return `v: '${videos[idx]}'`;
    });

    // Replace single quiz with multiple questions
    const oldQuiz = /quiz: \{ q: '.*?', opts: \[.*?\] \}/g;
    content = content.replace(oldQuiz, (match, offset) => {
        // Determine quiz type based on position in file
        if (content.substring(offset - 100, offset).includes('frontend')) {
            return `quiz: ${JSON.stringify(QUIZZES.html)}`;
        } else if (content.substring(offset - 100, offset).includes('backend')) {
            return `quiz: ${JSON.stringify(QUIZZES.node)}`;
        } else if (content.substring(offset - 100, offset).includes('security')) {
            return `quiz: ${JSON.stringify(QUIZZES.js)}`;
        } else if (content.substring(offset - 100, offset).includes('ai')) {
            return `quiz: ${JSON.stringify(QUIZZES.python)}`;
        }
        return `quiz: ${JSON.stringify(QUIZZES.js)}`;
    });

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('✅ Updated web.html with Elzero videos');
}

// Update other course files
function updateCourseFile(filename, videoSet, quizSet) {
    const filePath = path.join(__dirname, 'public', 'web dev', filename);
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️ File not found: ${filename}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf-8');

    // Replace empty video IDs with real videos
    let videoIndex = 0;
    const videos = Object.values(videoSet);
    content = content.replace(/v: ''/g, () => {
        const vid = videos[videoIndex % videos.length];
        videoIndex++;
        return `v: '${vid}'`;
    });

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Updated ${filename} with videos`);
}

// Run updates
console.log('🎬 Adding Elzero Web School videos to courses...\n');

updateWebCourse();
updateCourseFile('ai.html', ELZERO_VIDEOS.python, QUIZZES.python);
updateCourseFile('design.html', ELZERO_VIDEOS.css, QUIZZES.css);
updateCourseFile('game.html', ELZERO_VIDEOS.js, QUIZZES.js);
updateCourseFile('management.html', ELZERO_VIDEOS.js, QUIZZES.js);
updateCourseFile('pan.html', ELZERO_VIDEOS.node, QUIZZES.node);

// Update CV course
const cvPath = path.join(__dirname, 'public', 'Work Skills', 'cv.html');
if (fs.existsSync(cvPath)) {
    let content = fs.readFileSync(cvPath, 'utf-8');
    content = content.replace(/v: ''/g, () => `v: '${ELZERO_VIDEOS.html.intro}'`);
    fs.writeFileSync(cvPath, content, 'utf-8');
    console.log('✅ Updated cv.html with videos');
}

console.log('\n🎉 All courses updated with Elzero Web School videos!');
console.log('📺 Channel: عبد الرحمن جمال - Elzero Web School');
