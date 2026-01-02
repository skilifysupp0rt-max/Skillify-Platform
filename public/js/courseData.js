/**
 * SKILLIFY Course Data
 * Real working YouTube video IDs from freeCodeCamp & Traversy Media
 * Each card has its own video and quiz (English)
 */

const COURSES_DATA = {
    // ==================== FRONTEND ====================
    frontend: {
        theme: '--blue',
        title: 'Frontend Engineering',
        desc: 'Master modern frontend development from zero to hero',
        stats: [
            { l: 'Videos', v: '18' },
            { l: 'Projects', v: '6' },
            { l: 'Hours', v: '72' },
            { l: 'Level', v: 'Advanced' }
        ],
        modules: [
            {
                levelId: 1,
                levelTitle: 'Foundation',
                status: 'active',
                courses: [
                    {
                        title: 'HTML Crash Course',
                        desc: 'Learn HTML basics and structure',
                        videoId: 'UB1O30fR-EE', // Traversy HTML
                        thumbnail: 'https://i.ytimg.com/vi/UB1O30fR-EE/maxresdefault.jpg',
                        tag: 'HTML',
                        duration: '60:00',
                        quiz: [
                            { q: 'What tag is used for paragraphs?', opts: ['<p>', '<div>', '<span>', '<br>'], correct: 0 },
                            { q: 'Which is a semantic element?', opts: ['<div>', '<section>', '<span>', '<b>'], correct: 1 },
                            { q: 'How do you add an image?', opts: ['<image>', '<img>', '<picture>', '<photo>'], correct: 1 },
                            { q: 'What is the difference between id and class?', opts: ['id repeats', 'class is unique', 'id is unique, class repeats', 'No difference'], correct: 2 },
                            { q: 'Which attribute sets the image source?', opts: ['href', 'src', 'link', 'path'], correct: 1 }
                        ]
                    },
                    {
                        title: 'CSS Crash Course',
                        desc: 'Master CSS styling fundamentals',
                        videoId: 'yfoY53QXEnI', // Traversy CSS
                        thumbnail: 'https://i.ytimg.com/vi/yfoY53QXEnI/maxresdefault.jpg',
                        tag: 'CSS',
                        duration: '85:00',
                        quiz: [
                            { q: 'What property changes background color?', opts: ['color', 'bg-color', 'background-color', 'fill'], correct: 2 },
                            { q: 'What display value puts elements side by side?', opts: ['block', 'inline', 'flex', 'none'], correct: 2 },
                            { q: 'How do you select an element by ID?', opts: ['.id', '#id', '@id', '*id'], correct: 1 },
                            { q: 'Which is a relative unit?', opts: ['px', 'em', 'pt', 'in'], correct: 1 },
                            { q: 'Which property controls inner spacing?', opts: ['margin', 'border', 'padding', 'gap'], correct: 2 }
                        ]
                    },
                    {
                        title: 'JavaScript Fundamentals',
                        desc: 'Core JavaScript concepts',
                        videoId: 'hdI2bqOjy3c', // Traversy JS
                        thumbnail: 'https://i.ytimg.com/vi/hdI2bqOjy3c/maxresdefault.jpg',
                        tag: 'JS',
                        duration: '140:00',
                        quiz: [
                            { q: 'What is the output: typeof []?', opts: ['array', 'object', 'list', 'undefined'], correct: 1 },
                            { q: 'What is the difference between let and const?', opts: ['No difference', 'const is constant', 'let is constant', 'const for numbers only'], correct: 1 },
                            { q: 'How do you select an element by ID in DOM?', opts: ['getElement()', 'getElementById()', 'querySelector()', 'Both B and C'], correct: 3 },
                            { q: 'What is a callback function?', opts: ['Function that returns value', 'Function passed as argument', 'Anonymous function', 'Array type'], correct: 1 },
                            { q: 'What is a Promise?', opts: ['Variable', 'Async object', 'Data type', 'Loop'], correct: 1 }
                        ]
                    }
                ]
            },
            {
                levelId: 2,
                levelTitle: 'Advanced CSS',
                status: 'locked',
                courses: [
                    {
                        title: 'Flexbox Tutorial',
                        desc: 'Master flexible layouts',
                        videoId: 'JJSoEo8JSnc', // Traversy Flexbox
                        thumbnail: 'https://i.ytimg.com/vi/JJSoEo8JSnc/maxresdefault.jpg',
                        tag: 'CSS',
                        duration: '20:00',
                        quiz: [
                            { q: 'What property enables flexbox?', opts: ['flex: true', 'display: flex', 'flexbox: on', 'type: flex'], correct: 1 },
                            { q: 'What is the default main axis?', opts: ['vertical', 'horizontal', 'diagonal', 'none'], correct: 1 },
                            { q: 'Which property centers items horizontally?', opts: ['align-items', 'justify-content', 'text-align', 'margin'], correct: 1 },
                            { q: 'What does flex-wrap: wrap mean?', opts: ['No wrapping', 'Allow wrapping', 'Delete items', 'Shrink items'], correct: 1 },
                            { q: 'Which property changes flex direction?', opts: ['flex-way', 'flex-direction', 'flex-flow', 'direction'], correct: 1 }
                        ]
                    },
                    {
                        title: 'CSS Grid Layout',
                        desc: 'Build complex grid layouts',
                        videoId: 'jV8B24rSN5o', // Traversy Grid
                        thumbnail: 'https://i.ytimg.com/vi/jV8B24rSN5o/maxresdefault.jpg',
                        tag: 'CSS',
                        duration: '47:00',
                        quiz: [
                            { q: 'What property enables CSS Grid?', opts: ['grid: true', 'display: grid', 'layout: grid', 'type: grid'], correct: 1 },
                            { q: 'What does grid-template-columns define?', opts: ['Row sizes', 'Column sizes', 'Gap size', 'Grid color'], correct: 1 },
                            { q: 'What is the fr unit?', opts: ['Fraction', 'Frame', 'Free', 'Fixed'], correct: 0 },
                            { q: 'What is grid-gap?', opts: ['Border', 'Spacing between cells', 'Padding', 'Margin'], correct: 1 },
                            { q: 'What does span keyword do?', opts: ['Delete cell', 'Merge cells', 'Hide cell', 'Color cell'], correct: 1 }
                        ]
                    },
                    {
                        title: 'Responsive Design',
                        desc: 'Mobile-first responsive layouts',
                        videoId: 'srvUrASNj0s', // Traversy Responsive
                        thumbnail: 'https://i.ytimg.com/vi/srvUrASNj0s/maxresdefault.jpg',
                        tag: 'CSS',
                        duration: '38:00',
                        quiz: [
                            { q: 'What are media queries used for?', opts: ['Images', 'Responsive design', 'Fonts', 'Colors'], correct: 1 },
                            { q: 'What does mobile-first mean?', opts: ['Design for mobile last', 'Design for mobile first', 'No mobile support', 'Desktop only'], correct: 1 },
                            { q: 'What viewport meta tag does?', opts: ['SEO', 'Controls viewport', 'Changes color', 'Adds fonts'], correct: 1 },
                            { q: 'What unit is best for responsive?', opts: ['px', 'em/rem', 'pt', 'in'], correct: 1 },
                            { q: 'What is breakpoint?', opts: ['Error point', 'Width where layout changes', 'Height limit', 'Speed limit'], correct: 1 }
                        ]
                    }
                ]
            },
            {
                levelId: 3,
                levelTitle: 'React.js',
                status: 'locked',
                courses: [
                    {
                        title: 'React Crash Course',
                        desc: 'Learn React fundamentals',
                        videoId: 'w7ejDZ8SWv8', // Traversy React
                        thumbnail: 'https://i.ytimg.com/vi/w7ejDZ8SWv8/maxresdefault.jpg',
                        tag: 'React',
                        duration: '100:00',
                        quiz: [
                            { q: 'What is JSX?', opts: ['New language', 'JavaScript XML', 'CSS Framework', 'Database'], correct: 1 },
                            { q: 'What is useState?', opts: ['Component', 'Hook', 'Prop', 'Event'], correct: 1 },
                            { q: 'How do you pass data from Parent to Child?', opts: ['state', 'props', 'context', 'ref'], correct: 1 },
                            { q: 'What is useEffect?', opts: ['For styling', 'For side effects', 'For routing', 'For forms'], correct: 1 },
                            { q: 'What is Virtual DOM?', opts: ['Real DOM', 'DOM copy in memory', 'API', 'Library'], correct: 1 }
                        ]
                    },
                    {
                        title: 'React Hooks',
                        desc: 'Master React Hooks',
                        videoId: 'O6P86uwfdR0', // Fireship Hooks
                        thumbnail: 'https://i.ytimg.com/vi/O6P86uwfdR0/maxresdefault.jpg',
                        tag: 'React',
                        duration: '12:00',
                        quiz: [
                            { q: 'What hook manages state?', opts: ['useEffect', 'useState', 'useRef', 'useMemo'], correct: 1 },
                            { q: 'What hook runs on mount?', opts: ['useState', 'useEffect', 'useContext', 'useCallback'], correct: 1 },
                            { q: 'What does useRef do?', opts: ['State', 'DOM reference', 'Effect', 'Context'], correct: 1 },
                            { q: 'What is useMemo for?', opts: ['State', 'Memoization', 'Effects', 'Context'], correct: 1 },
                            { q: 'Can hooks be called conditionally?', opts: ['Yes', 'No', 'Sometimes', 'Only in classes'], correct: 1 }
                        ]
                    },
                    {
                        title: 'Next.js Crash Course',
                        desc: 'Server-side React',
                        videoId: 'mTz0GXj8NN0', // Traversy Next.js
                        thumbnail: 'https://i.ytimg.com/vi/mTz0GXj8NN0/maxresdefault.jpg',
                        tag: 'Next.js',
                        duration: '75:00',
                        quiz: [
                            { q: 'What is Next.js?', opts: ['Database', 'React Framework', 'CSS Library', 'Testing tool'], correct: 1 },
                            { q: 'What is SSR?', opts: ['Server Side Rendering', 'Static Site Ready', 'Super Speed Run', 'Secure Server Run'], correct: 0 },
                            { q: 'Where do pages go in Next.js?', opts: ['/src', '/pages or /app', '/public', '/components'], correct: 1 },
                            { q: 'What is getServerSideProps?', opts: ['Client function', 'Server function', 'API route', 'Hook'], correct: 1 },
                            { q: 'What folder serves static files?', opts: ['/static', '/public', '/assets', '/files'], correct: 1 }
                        ]
                    }
                ]
            }
        ]
    },

    // ==================== BACKEND ====================
    backend: {
        theme: '--green',
        title: 'Backend Development',
        desc: 'Build APIs and server-side applications',
        stats: [
            { l: 'Videos', v: '15' },
            { l: 'Projects', v: '5' },
            { l: 'Hours', v: '60' },
            { l: 'Level', v: 'Intermediate' }
        ],
        modules: [
            {
                levelId: 1,
                levelTitle: 'Node.js Basics',
                status: 'active',
                courses: [
                    {
                        title: 'Node.js Crash Course',
                        desc: 'Learn Node.js fundamentals',
                        videoId: 'fBNz5xF-Kx4', // Traversy Node
                        thumbnail: 'https://i.ytimg.com/vi/fBNz5xF-Kx4/maxresdefault.jpg',
                        tag: 'Node',
                        duration: '90:00',
                        quiz: [
                            { q: 'What is Node.js?', opts: ['Framework', 'Runtime Environment', 'Database', 'Language'], correct: 1 },
                            { q: 'What is npm?', opts: ['Node Package Manager', 'New Programming Method', 'Programming language', 'Database'], correct: 0 },
                            { q: 'How do you run a JS file in Node?', opts: ['node file.js', 'run file.js', 'start file.js', 'execute file.js'], correct: 0 },
                            { q: 'What is package.json?', opts: ['Config file', 'Database', 'JavaScript file', 'Image'], correct: 0 },
                            { q: 'What does require() do?', opts: ['Import module', 'Export module', 'Create module', 'Delete module'], correct: 0 }
                        ]
                    },
                    {
                        title: 'Express.js Crash Course',
                        desc: 'Build web servers with Express',
                        videoId: 'L72fhGm1tfE', // Traversy Express
                        thumbnail: 'https://i.ytimg.com/vi/L72fhGm1tfE/maxresdefault.jpg',
                        tag: 'Express',
                        duration: '75:00',
                        quiz: [
                            { q: 'What is Express?', opts: ['Framework', 'Database', 'Language', 'OS'], correct: 0 },
                            { q: 'How do you create an app?', opts: ['express()', 'new Express()', 'Express.create()', 'createApp()'], correct: 0 },
                            { q: 'What is middleware?', opts: ['Function between request and response', 'Database', 'Template', 'Route'], correct: 0 },
                            { q: 'How do you listen on a port?', opts: ['app.listen()', 'app.start()', 'app.run()', 'app.connect()'], correct: 0 },
                            { q: 'What is app.get()?', opts: ['GET request handler', 'Get variable', 'Fetch data', 'Nothing'], correct: 0 }
                        ]
                    },
                    {
                        title: 'REST API Design',
                        desc: 'Design professional APIs',
                        videoId: '-MTSQjw5DrM', // Traversy REST
                        thumbnail: 'https://i.ytimg.com/vi/-MTSQjw5DrM/maxresdefault.jpg',
                        tag: 'API',
                        duration: '35:00',
                        quiz: [
                            { q: 'What does REST stand for?', opts: ['Representational State Transfer', 'Remote Server Transfer', 'Request State Transfer', 'None'], correct: 0 },
                            { q: 'Which HTTP method for creating?', opts: ['GET', 'POST', 'PUT', 'DELETE'], correct: 1 },
                            { q: 'Which HTTP method for deleting?', opts: ['GET', 'POST', 'PUT', 'DELETE'], correct: 3 },
                            { q: 'What status code means success?', opts: ['100', '200', '300', '400'], correct: 1 },
                            { q: 'What status code for Not Found?', opts: ['200', '301', '404', '500'], correct: 2 }
                        ]
                    }
                ]
            }
        ]
    }
};

// Export for use in course pages
if (typeof module !== 'undefined' && module.exports) {
    module.exports = COURSES_DATA;
}
