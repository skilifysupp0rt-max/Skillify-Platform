# 📱 Skillify Mobile App

Professional React Native mobile app for Skillify learning platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start Expo
npx expo start
```

## 📦 Project Structure

```
SKILLIFY-MOBILE/
├── App.js                    # Main entry point
├── app.json                  # Expo config
├── package.json              # Dependencies
├── src/
│   ├── context/
│   │   ├── AuthContext.js    # Authentication state
│   │   └── ThemeContext.js   # Dark/Light theme
│   └── screens/
│       ├── LoginScreen.js
│       ├── RegisterScreen.js
│       ├── DashboardScreen.js
│       ├── CoursesScreen.js
│       ├── ChallengesScreen.js
│       ├── ProfileScreen.js
│       └── CourseDetailScreen.js
└── assets/                   # App icons & splash
```

## 📱 Features

- ✅ Login & Register with API
- ✅ Dashboard with stats & gamification
- ✅ Courses list with progress
- ✅ Challenges with XP rewards
- ✅ Profile settings
- ✅ Dark/Light theme
- ✅ Bottom tab navigation
- ✅ Gradient UI matching web version

## 🔧 Configuration

Update `src/context/AuthContext.js`:
```javascript
const API_URL = 'http://YOUR_SERVER_IP:5000';
```

## 📲 Build for Production

```bash
# Android
npx expo build:android

# iOS
npx expo build:ios
```
