# CarNews Hub - Cross-Platform Mobile App

A cross-platform mobile application that aggregates car news from multiple automotive websites into a centralized, easy-to-browse feed.

## 📱 Project Overview

CarNews Hub is a React Native application that scrapes and aggregates automotive news from various sources including:
- Car and Driver
- BMW Blog
- Motor Trend
- Autoblog
- The Drive
- And more automotive news sources

## 🎯 Features

- **Multi-Source News Aggregation**: Automatically fetches latest car news from multiple websites
- **Cross-Platform**: Works on both iOS and Android devices
- **Real-time Updates**: Periodic scraping ensures fresh content
- **Search & Filter**: Find specific news by keywords, brands, or categories
- **Offline Reading**: Cache articles for offline access
- **Clean UI**: Modern, intuitive interface for easy browsing
- **Bookmarks**: Save favorite articles for later reading

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App (React Native)                │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   UI Layer  │  │  State Mgmt  │  │   API Service    │  │
│  │  Components │  │   (Redux)    │  │    (Axios)       │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Node.js/Express)             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  REST API    │  │   Scraper    │  │   Scheduler     │  │
│  │  Endpoints   │  │   Service    │  │  (Node-cron)    │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    In-Memory Storage                         │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Articles   │  │   Sources    │                        │
│  │    (Array)   │  │    (Array)   │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

Note: This build uses in-memory storage on the backend; MongoDB is not used. Any MongoDB/Mongoose setup files present are placeholders for a future persistence upgrade and are not wired into the running server.

### Tech Stack

#### Frontend (Mobile App)
- **Framework**: React Native
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **UI Components**: React Native Elements
- **HTTP Client**: Axios
- **Image Caching**: React Native Fast Image

#### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Web Scraping**: Puppeteer / Cheerio
- **Storage**: In-memory (no MongoDB in this build)
- **Task Scheduling**: Node-cron
- **API Documentation**: Swagger

#### Development Tools
- **Package Manager**: npm/yarn
- **Testing**: Jest, React Native Testing Library
- **Linting**: ESLint
- **Code Formatting**: Prettier

## 📂 Project Structure

```
car-news-app/
├── mobile/                    # React Native mobile app
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── screens/          # App screens
│   │   ├── navigation/       # Navigation configuration
│   │   ├── services/         # API services
│   │   ├── store/           # Redux store and slices
│   │   ├── utils/           # Utility functions
│   │   └── constants/       # App constants
│   ├── ios/                 # iOS specific files
│   ├── android/             # Android specific files
│   └── package.json
│
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── scrapers/        # Web scraping modules
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utility functions
│   │   └── config/          # Configuration files
│   ├── tests/               # Backend tests
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- React Native development environment set up
  - For iOS: Xcode (Mac only)
  - For Android: Android Studio and Android SDK
- Java 17 or higher (for Android development)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/car-news-app.git
cd car-news-app
```

2. **Set up the backend**
```bash
cd backend
npm install
```

3. **Set up the mobile app**
```bash
cd ../mobile
npm install
cd ios && pod install  # For iOS only
cd ..
```

### Running the Application

#### Start the Backend Server
```bash
cd backend
npm start
# Or for development with auto-reload:
npm run dev
```
The backend will start on `http://localhost:3000`

#### Start Metro Bundler (React Native dev server)
Metro serves and hot-reloads the JS bundle on port 8081.
```bash
cd mobile
npm run start
# or with cache reset if needed:
# npx react-native start --reset-cache
```

#### Run the Mobile App

**For Android:**
```bash
cd mobile
npm run android
```
Notes:
- Ensure an emulator is running or a device is connected (`adb devices`).
- The Android emulator accesses your machine's `localhost` via `10.0.2.2`. The app is already configured for this in development.

**For iOS:**
```bash
cd mobile
npm run ios
```
Notes:
- iOS Simulator can access the backend at `http://localhost:3000`.
- Metro must be running (see step above).

## 🔧 Configuration

### Backend Environment Variables

The backend uses a `.env` file (already included). This build does not connect to MongoDB; values like `MONGODB_URI` are currently unused.

```env
PORT=3000
NODE_ENV=development
SCRAPING_INTERVAL=1800000  # 30 minutes
# Optional/unused for this in-memory build:
# MONGODB_URI=mongodb://localhost:27017/carnews
```

**Note:** This version uses in-memory storage instead of MongoDB. Data is refreshed on a schedule (see `SCRAPING_INTERVAL`) and keeps only recent articles.

### Mobile App Configuration

Development base URL differs by platform. In this repo, Android dev uses `10.0.2.2` to reach your machine's localhost.

Example configuration for platform-aware base URL:

```javascript
import { Platform } from 'react-native';

const DEV_BASE = Platform.select({
  android: 'http://10.0.2.2:3000/api', // Android emulator -> host machine
  ios: 'http://localhost:3000/api',     // iOS simulator -> host machine
  default: 'http://localhost:3000/api',
});

export const API_BASE_URL = __DEV__ ? DEV_BASE : 'https://your-production-api.com/api';
```

## 📡 API Endpoints

### Articles
- `GET /api/articles` - Get all articles (with pagination)
- `GET /api/articles/:id` - Get single article
- `GET /api/articles/search` - Search articles
- `GET /api/articles/category/:category` - Get articles by category

### Sources
- `GET /api/sources` - Get all news sources
- `POST /api/sources` - Add new source (admin)
- `PUT /api/sources/:id` - Update source (admin)
- `DELETE /api/sources/:id` - Delete source (admin)

### User
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/user/bookmarks` - Get user bookmarks
- `POST /api/user/bookmarks/:articleId` - Add bookmark
- `DELETE /api/user/bookmarks/:articleId` - Remove bookmark

## 🕷️ Web Scraping Strategy

The backend implements intelligent web scraping:

1. **Scheduled Scraping**: Runs every hour to fetch new articles
2. **Duplicate Detection**: Prevents storing duplicate articles
3. **Error Handling**: Graceful failure handling for unavailable sources
4. **Rate Limiting**: Respects website rate limits
5. **Content Extraction**: Extracts title, summary, image, author, and date

### Supported Sources

| Source | URL | Update Frequency |
|--------|-----|------------------|
| Car and Driver | caranddriver.com | Hourly |
| BMW Blog | bmwblog.com | Hourly |
| Motor Trend | motortrend.com | Hourly |
| Autoblog | autoblog.com | Hourly |
| The Drive | thedrive.com | Hourly |

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Mobile App Tests
```bash
cd mobile
npm test
```

## 📱 Screenshots

(Screenshots will be added once the app is developed)

## 🚦 Development Roadmap

### Phase 1: Foundation ✅ 
- [x] Project setup and architecture planning
- [x] Backend API development
- [x] Basic web scraping implementation
- [x] In-memory data storage

### Phase 2: Core Features ✅
- [x] Mobile app UI development
- [x] News feed implementation
- [x] Search functionality
- [x] Category filtering
- [x] Real-time news updates

### Phase 3: Current Status
- [x] Simplified demo version without database
- [x] Auto-refreshing news (30-minute intervals)
- [x] 2-day article retention
- [x] Client-side bookmarking (AsyncStorage)
- [x] Cross-platform mobile app

### Phase 4: Future Enhancements
- [ ] User authentication
- [ ] Server-side bookmarks with user accounts (sync across devices)
- [ ] Push notifications
- [ ] Offline reading
- [ ] Performance optimization
- [ ] Social sharing features

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- Your Name - Project Lead & Developer

## 📞 Contact

For questions or support, please contact: your.email@example.com

---

**Note**: This project is for educational purposes. Please respect the terms of service of the websites being scraped and implement appropriate rate limiting and caching mechanisms.
