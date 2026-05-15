# ConnectSphere 🌐

**ConnectSphere** is a premium, high-performance social media ecosystem engineered for the modern web. It features a sophisticated frontend architecture designed to scale seamlessly alongside a microservices-based backend, delivering a fluid, immersive user experience with state-of-the-art design principles.

---

## 🚀 Project Deep Dive

ConnectSphere isn't just a UI; it's a meticulously crafted frontend engine that handles complex data flows across multiple microservices.

### 🔐 Advanced Authentication & Security
- **Multi-layered Auth**: Integrates with a dedicated Auth Microservice using JWT with automatic token refresh logic.
- **Secure Sessions**: Utilizes `zustand` for persistent state and secure `localStorage` handling.
- **Protected Routing**: Implements high-order components for route guarding, ensuring sensitive data is only accessible to verified users.

### 📸 Intelligent Media Handling
- **Authenticated Image Streams**: A custom `AuthenticatedImage` component manages authorized requests for media assets, ensuring that images served by the Media Microservice are protected.
- **Dynamic Content Delivery**: Optimized for fast loading with specialized `Skeleton` states for images and post content.

### 💬 Interactive Social Engine
- **Hierarchical Interactions**: Supports complex nested comment threads, real-time like toggles, and multi-level replies.
- **Optimistic UI Updates**: Leveraging custom services to provide instant visual feedback on user actions while background sync occurs.
- **Real-time Notifications**: A dedicated notification system that keeps users engaged with platform-wide interactions.

---

## 🏗️ Technical Architecture

The frontend is built on a **Service-Based Architecture** that mirrors the backend's microservices structure.

### 📡 The API Layer (`src/api`)
- **Microservice-Specific Instances**: Instead of a single axios instance, we utilize dedicated instances for each domain (Auth, Post, Media, Follow, etc.).
- **Global Interceptors**: Centralized request/response interceptors handle authentication headers and global error states (401/403) with intelligent logout triggers.

### 🧠 Logic & Services (`src/services`)
- **Business Logic Decoupling**: All API orchestration is handled in the services layer, keeping React components clean and focused purely on presentation.
- **Abstraction**: Services like `postService` and `authService` abstract away the complexity of multipart form data and nested JSON responses.

### 🔋 State Management (`src/store`)
- **Zustand Power**: A lightweight yet powerful state management solution for global user context, reducing unnecessary re-renders and simplifying data access across deeply nested components.

---

## 🛠️ Modern Tech Stack

| Technology | Role | Description |
| :--- | :--- | :--- |
| **React 18** | UI Framework | Utilizing the latest concurrent features for high-performance rendering. |
| **Vite** | Build Tool | Lightning-fast development and optimized production bundles. |
| **Tailwind CSS** | Styling | Utility-first CSS for highly customized, responsive designs. |
| **Framer Motion** | Animations | Production-grade animations for smooth transitions and micro-interactions. |
| **Zustand** | State | Modern state management with minimal boilerplate. |
| **Lucide React** | Icons | Consistent, lightweight vector icon library. |
| **Axios** | API Client | Promise-based HTTP client with specialized interceptors. |
| **Jest & RTL** | Testing | Comprehensive testing suite for component reliability. |

---

## 📁 Project Structure

```bash
src/
├── api/          # Multi-service Axios configurations & interceptors
├── components/   # Reusable & Domain-specific components
│   ├── layout/   # MainLayout, Sidebars, Protected Routes
│   ├── post/     # Complex PostCard, Skeletons, Feed logic
│   ├── ui/       # Atomic UI elements (Button, Input, Avatar)
│   └── story/    # Interactive StoryBar components
├── hooks/        # Custom React hooks for shared logic
├── pages/        # Main application views and route definitions
├── services/     # Business logic and API orchestration layers
├── store/        # Global state definitions (Zustand)
├── utils/        # Helper functions, date formatters, and constants
└── index.css     # Global styles and Tailwind directives
```

---

## 🔗 Backend Integration

ConnectSphere is designed to work in tandem with its backend counterpart. The backend is built using a powerful microservices architecture with Spring Boot and RabbitMQ.

> **View the Backend Repository:**  
> [ConnectSphere Backend (GitHub)](https://github.com/ayushgupta703/ConnectSphere.git)

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18.0+)
- npm

### Quick Start
1. **Clone & Install:**
   ```bash
   git clone https://github.com/ayushgupta703/ConnectSphere-Frontend.git
   cd ConnectSphere-Frontend
   npm install
   ```

2. **Network Configuration:**
   The project uses a centralized service mapping in `src/api/config.js`. By default, it is configured to connect to local microservices:
   - **Base Domain**: `http://localhost`
   - **Service Ports**: Automated mapping for Auth (8080), Post (8081), Media (8087), etc.
   
   To point to a different environment, modify the `BASE_DOMAIN` in `src/api/config.js`.

3. **Run Development Server:**
   ```bash
   npm run dev
   ```


