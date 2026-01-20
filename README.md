# TimeWise – Advanced Pomodoro Timer with Productivity Suite

## Overview

TimeWise is a comprehensive productivity application built around the Pomodoro technique, designed to help users efficiently manage their time while staying motivated and tracking their mental well-being. Built using **Next.js** and **TypeScript**, it offers an intuitive and visually engaging experience with integrated features such as **built-in music players**, **mood tracking**, **AI-powered chatbot**, and **customizable wallpapers**.

## Import Links

Trello: available upon request

## Key Features

- **Pomodoro Timer**: Customizable work and break durations with preset options for different productivity styles
- **Music Integration**:
  - **YouTube Playlist Player**: Seamlessly play curated focus music or user-selected videos
  - **Spotify Player**: Connect to your Spotify account to play your favorite focus playlists
- **Mood Tracking**: Log and visualize your mood patterns over time to understand productivity correlations
- **AI Chatbot**: Integrated Gemini-powered assistant with customizable personality to help with productivity tips and motivation
- **Changeable Wallpaper**: Personalize your workspace with dynamic or static wallpapers
- **Analytics Dashboard**: Track your productivity metrics, streaks, and usage patterns
- **Achievements System**: Gamified productivity with unlockable achievements
- **User Authentication**: Secure login with Firebase authentication
- **Cross-device Sync**: Sync your settings and data across devices with Firebase backend
- **User-Friendly Interface**: Clean, responsive design optimized for both desktop and mobile users
- **Local Storage Support**: Option to store settings and preferences locally for privacy

## Tech Stack

- **Frontend**:
  - Next.js 15 with React 19 (TypeScript, Hooks)
  - Tailwind CSS for responsive design
  - Framer Motion for animations
- **Backend & Data**:
  - Firebase (Authentication, Firestore)
  - Local Storage for offline functionality
- **APIs & Integrations**:
  - YouTube IFrame API for embedded playlists
  - Spotify Web API for music integration
  - Gemini API for AI chatbot functionality
- **State Management**: React Context API for efficient state handling
- **Data Visualization**: Recharts for analytics and mood tracking visualizations

## Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account (for backend functionality)
- Gemini API key (for chatbot functionality)
- Spotify Developer account (for Spotify integration)

### Installation Steps

1. Clone the repository:

```bash
git clone https://github.com/ad-archer/timewise.git
cd timewise
```

1. Install dependencies:

```bash
npm install
# or
yarn install
```

1. Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Gemini Configuration
GEMINI_API_KEY=your_gemini_api_key

# Spotify Configuration
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

1. Run the development server:

```bash
npm run dev
# or
yarn dev
```

1. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

The application can be deployed using Vercel, Netlify, or any other Next.js-compatible hosting service.

```bash
vercel
# or
npm run build && npm run start
```

## Future Enhancements

- Task management integration with popular services
- Team collaboration features
- Advanced analytics with AI-powered insights
- Mobile app versions for iOS and Android

## Contributing

If you have any ideas or would like to contribute, please submit an issue or pull request in this repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
