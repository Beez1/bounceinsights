# NASA Data Explorer - Bounce Coding Challenge

**Live Application:** [https://bounceinsights-eta.vercel.app/](https://bounceinsights-eta.vercel.app/)

This web application provides a creative and engaging way to explore space-related data from NASA's Open APIs, enhanced with powerful AI features for deeper insights.

**Note:** The original `README.md` was very sparse. This new version has been generated based on a thorough analysis of the codebase to meet the project submission guidelines.

## ✨ Key Features

The application is divided into several main sections, each offering a unique way to interact with space and earth data:

### 1. 🚀 Explore Section
- **Astronomy Picture of the Day (APOD):** View NASA's iconic picture of the day, complete with its title, date, and detailed explanation.
- **EPIC Earth View:** Browse stunning polychromatic images of the Earth taken by the EPIC camera on the DSCOVR spacecraft.
- **Time Travel:** A feature that likely allows users to view NASA imagery from specific dates in the past.

### 2. 🧠 AI-Powered Analysis
This project goes beyond simple data display by integrating advanced AI models to provide rich, contextual information:
- **AI Image Explanation:** Select any image to receive a detailed, multi-layered analysis. The backend cleverly uses **OpenAI's GPT-4o** for a descriptive narrative and the **Google Cloud Vision API** for specific labels and related concepts, running these calls in parallel for efficiency.
- **Image Comparison:** A tool to visually and contextually compare multiple space images side-by-side.
- **Country Detection:** Leverages Google Vision to identify countries and landmarks visible in Earth imagery.

### 3. 🔍 Search & Discover
- **NASA Image Library Search:** A powerful search functionality that allows users to query the vast NASA Image and Video Library.

### 4. 🌍 Weather & Context
- **Weather Summaries:** Provides weather context for specific locations, likely related to the Earth imagery.
- **Contextual Information:** Fetches additional contextual data for geographical locations.

### 5. 📧 Email Briefings
- An integrated feature using `Nodemailer` that allows users to receive email briefings, likely summarizing interesting NASA data or their own discoveries within the app.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React (with Vite)
- **Styling:** TailwindCSS with PostCSS
- **UI Components:** Headless UI for accessible components.
- **Animations:** Framer Motion for a fluid user experience.
- **Routing:** React Router DOM
- **Data Fetching:** Axios, managed by a robust custom `useApi` hook with built-in caching.
- **Mapping:** Leaflet & React-Leaflet for interactive maps.
- **Icons & Notifications:** Lucide React, Heroicons, and React Hot Toast.

### Backend
- **Framework:** Node.js with Express
- **APIs:**
  - NASA Open APIs (APOD, EPIC, etc.)
  - OpenAI API (GPT-4o)
  - Google Cloud Vision API
- **Middleware:** CORS, Express Rate Limit for security.
- **Environment:** `dotenv` for managing API keys.

## ⚙️ Setup and Installation

### Prerequisites
- Node.js and npm (or yarn) installed.
- API keys for NASA, OpenAI, and Google Cloud.

### 1. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create a .env file in the /backend directory
# and add your API keys:
touch .env
```
Your `.env` file should look like this:
```
PORT=3000
NASA_API_KEY=YOUR_NASA_API_KEY
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
GOOGLE_APPLICATION_CREDENTIALS_BASE64=YOUR_BASE64_ENCODED_CREDENTIALS

# Email Service Configuration
# Note: If using Gmail, you may need to enable "Less secure app access" 
# or generate an "App Password" for your Google account.
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password-or-app-password
```

```bash
# Start the backend server
npm start
```

### 2. Frontend Setup
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```
The application should now be running locally, typically at `http://localhost:5173`.

## 📂 File Structure

The repository is organized as follows, meeting the submission guidelines:
```
├── frontend/
│   ├── src/
│   └── package.json
├── backend/
│   ├── routes/
│   ├── utils/
│   └── server.js
└── README.md
```
