# Freelancer Dashboard

Freelancer Dashboard is a web application designed to help freelancers manage their income, subscriptions, and analytics. It provides tools for tracking income trends, managing subscriptions, and analyzing platform performance, all in one centralized dashboard.

---

## Features

- **Income Management**: Add, edit, and view income records with visualizations like charts and tables.
- **Analytics**: Gain insights into income trends and platform performance through detailed analytics.
- **Authentication**: Secure login and signup functionality with protected routes.
- **Responsive Design**: Fully responsive UI for seamless use across devices.
- **Admin Tools**: Feedback and admin-specific pages for managing user input.
- **Integration with Firebase**: Authentication, Firestore database, and hosting.
- **Subscription Management**: Cancel, reactivate, and manage subscriptions with ease.

---

## Tech Stack

- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Firebase (Authentication, Firestore)
- **Deployment**: [Vercel](https://trackmyincome.vercel.app/)
- **Other Tools**: 
  - Firebase Admin SDK
  - PostCSS
  - ESLint for code linting
  - Pre-configured CI/CD workflows with GitHub Actions

---

## Installation

Follow these steps to set up the project locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Adnan7389/freelancer-dashboard.git
   cd freelancer-dashboard

2. **Install dependencies**:
Ensure you have Node.js installed. Then run:
   ```bash
   npm install

3. **Set up Environment Variables**:
   Copy the .env.example file to .env:
   ```bash
   cp .env.example .env
   ```
   Update the .env file with your Firebase credentials and other required values.

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Run Tests**
   ```bash
   npm test
   ```
6. **Build for Production**
   Build the project:
   ```bash
   npm run build
   ```
   Preview the production build:
   ```bash
   npm run preview
   ```
## License
   This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

This project was a solo effort by Adnan, but it stands on the shoulders of giants. A heartfelt thank you to:

- The entire open-source community for creating and maintaining the incredible tools and libraries that power this project.
- The developers and maintainers of [ React, Firebase, Tailwind CSS] for their fantastic work.
- The countless tutorials, forums, and documentation writers who provide the knowledge that makes independent development possible. 

