# Freelancer Dashboard

A comprehensive dashboard for freelancers to manage their projects, clients, and subscriptions.

## ✨ Features

- 🔐 User authentication with Firebase
- 💳 Subscription management with Lemon Squeezy
- ⚡ Real-time updates
- 📱 Responsive design
- 🔒 Secure API endpoints
- 📊 Analytics and reporting
- 📅 Task and project management

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Firebase project
- Lemon Squeezy account

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/freelancer-dashboard.git
   cd freelancer-dashboard
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration.

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The app will be available at `http://localhost:3000`

## 🛠 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

### Tech Stack

- Frontend: React 18, Vite, Material-UI
- Backend: Node.js, Express
- Database: Firebase Firestore
- Authentication: Firebase Auth
- Payments: Lemon Squeezy

## 🌐 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Ffreelancer-dashboard)

### Manual Deployment

1. Build the application
   ```bash
   npm run build
   ```

2. Start the production server
   ```bash
   NODE_ENV=production node server.prod.js
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) to get started.

## 📧 Contact

For support or questions, please open an issue in the GitHub repository.
