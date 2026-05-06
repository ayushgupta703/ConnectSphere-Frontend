# ConnectSphere 🌐

**ConnectSphere** is a premium, modern social media platform designed for seamless interaction and immersive content sharing. Built with a focus on speed, aesthetics, and a microservices-aligned architecture.

![ConnectSphere Preview](https://via.placeholder.com/1200x600/0f172a/ffffff?text=ConnectSphere+Social+Platform)

## ✨ Features

- **🔐 Robust Authentication**: Secure login and signup powered by JWT-based microservices.
- **📱 Dynamic Home Feed**: Real-time post interaction with glassmorphism design elements.
- **📸 Stories Ecosystem**: Create, view, and interact with expiring stories.
- **👤 Advanced Profiles**: Customizable user profiles with bio, full name, and profile picture updates.
- **🔍 Smart Search**: Discover users and content with an intuitive search interface.
- **🔔 Real-time Notifications**: Stay updated with interactions across the platform.
- **✨ Premium UI/UX**: Dark mode by default, glassmorphism components, and smooth micro-animations.

## 🛠️ Tech Stack

- **Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **API Client**: [Axios](https://axios-http.com/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.0 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ayushgupta703/ConnectSphere-Frontend.git
   cd ConnectSphere-Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add your backend API URLs:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api/v1
   ```

### Running Locally

```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

## 📂 Project Structure

```
src/
├── api/          # API configurations and interceptors
├── components/   # Reusable UI components (layout, stories, posts)
├── hooks/        # Custom React hooks
├── pages/        # Main application views/routes
├── services/     # Business logic and API service layers
├── store/        # State management with Zustand
└── utils/        # Helper functions and constants
```

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by the ConnectSphere Team.
