<div align="center">

# 🏙️ MyCityLife

### Explore. Connect. Enjoy.

A web and mobile platform to discover activities, places and unique experiences in any city, and to find people to share them with.

![Status](https://img.shields.io/badge/status-MVP%20in%20progress-orange)
![Frontend](https://img.shields.io/badge/frontend-React%20%7C%20Tailwind-61DAFB)
![Backend](https://img.shields.io/badge/backend-PHP%20(Laravel)-777BB4)
![Database](https://img.shields.io/badge/database-MySQL-4479A1)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

---

## 📑 Table of Contents

- [About the Project](#-about-the-project)
- [Goals](#-goals)
- [Target Audience](#-target-audience)
- [Features](#-features)
- [User Roles](#-user-roles)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Admin Dashboard](#-admin-dashboard)
- [Design Guidelines](#-design-guidelines)
- [Deliverables](#-deliverables)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Author](#-author)
- [License](#-license)

---

## 📖 About the Project

**MyCityLife** helps people discover activities, local spots and events in their city: cafés, bars, restaurants, art exhibitions, hikes, street festivals, free community events and paid experiences.

Whether you are a **visitor** exploring a new place or a **local** looking for something to do, MyCityLife connects you with the best things happening around you, and with the people who want to go with you.

**Why it matters**

- Travelers often miss hidden, authentic places.
- Locals sometimes feel disconnected from what is happening around them.
- Local businesses lack an easy way to reach both groups.

MyCityLife closes this gap by bringing **people, businesses and communities** together on one experience-driven platform. The first target market is **Morocco** (for example Casablanca and Marrakech).

---

## 🎯 Goals

- Let users discover local activities (bars, cafés, outdoor spaces, events, etc.).
- Give local businesses more visibility, free or paid.
- Build an interactive community around urban life.
- Provide real-time chat to meet and talk with new people.
- Offer secure online payment for paid event bookings.
- Generate tickets and let users download them as PDF.
- Send automatic emails for every key action (sign-up, booking, cancellation, etc.).
- Highlight the most popular places per city and provide personalized recommendations.

---

## 👥 Target Audience

- Residents looking for new things to do.
- Tourists exploring a new city (starting in Morocco).
- Businesses that want to promote their venues or events.
- Young adults (18 to 35) as the main user base.

---

## ✨ Features

### 🔍 Activity Discovery
- Search by name, location, category or price.
- Filter by type (free / paid), popularity or proximity.
- Interactive map view.
- Trending and nearby activities.
- Personalized recommendations based on user preferences and favorites.
- Categories: food, culture, sport, nature, nightlife.

### 💬 Real-Time Chat
- Public rooms by city or category (for example *Nightlife in Casablanca*).
- Private messaging between users.
- Business to customer chat for event questions.
- Real-time messages via WebSockets.

### 🔐 Authentication
- Sign up and log in with email and password.
- Social login with **Google** and **Facebook**.
- Password recovery.

### 💳 Payments and Tickets
- Secure online payments with **Stripe**.
- Booking and payment validation.
- PDF ticket generation and download.
- Confirmation email with the ticket attached.

### 🔔 Notifications and Emails
- Account creation confirmation.
- Booking and cancellation notifications.
- Emails for validation, cancellation and other key actions.
- Optional in-app alerts (new events, new messages).

### ❤️ Favorites and Recommendations
- "Save for later" on any activity.
- Recommendations based on favorites.
- "Most popular" section by city.

### ⭐ Reviews
- 1 to 5 star ratings.
- Written reviews.
- Businesses can reply to reviews.

---

## 🧑‍🤝‍🧑 User Roles

| Role | Description | Main permissions |
|------|-------------|------------------|
| **Guest** (not logged in) | Anonymous visitor | Browse activities and businesses, use search and filters, sign up to unlock all features |
| **User** (logged in) | Regular explorer | Create a profile and preferences, save favorites, add or edit activities, join chat rooms, rate and comment, pay for activities, receive emails, download PDF tickets |
| **Business Owner / Organizer** | Bars, cafés, restaurants, event creators | Create and manage a business profile, publish activities, events and special offers, add location, photos, descriptions and opening hours, view basic stats (visits, likes, bookings), chat with customers, receive booking and review notifications, upgrade to premium for more visibility |
| **Administrator** (Super Admin) | Platform manager | Manage users and businesses (ban, verify, promote), approve or delete activities, validate business registrations, handle reports and complaints, moderate discussions, access dashboards and statistics, manage featured places and app settings |
| **Community Moderator** *(optional)* | Helps keep the community healthy | Moderate discussions and comments, remove inappropriate posts, handle user reports, help validate community events |
| **Local Guide / Ambassador** *(optional, future)* | Trusted local contributor | Create public posts such as "Top activities in Marrakech", earn badges for verified contributions, help validate local businesses and events |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js, Tailwind CSS |
| **Backend** | PHP (Laravel), with a possible migration to Node.js / Express |
| **Database** | MySQL |
| **Real-time** | WebSockets (Laravel Echo + Pusher) or Firebase |
| **Authentication** | Email/password, Google and Facebook OAuth (Laravel Socialite) |
| **Payments** | Stripe |
| **Emails** | SMTP / Laravel Mail |
| **PDF tickets** | PDF generation library (for example DomPDF) |
| **Versioning** | Git + GitHub |
| **Hosting** | Local (temporary) |
| **Design** | Figma |

> ⚠️ Adjust this table to match the libraries you actually use.

---

## 🏗 Architecture

```
┌──────────────┐      REST API       ┌──────────────────┐      ┌──────────┐
│  React App   │ ◄─────────────────► │  PHP / Laravel   │ ◄──► │  MySQL   │
│  (Tailwind)  │                     │     Backend      │      └──────────┘
└──────┬───────┘                     └────────┬─────────┘
       │                                      │
       │          WebSockets                  ├──► Stripe (payments)
       └────────────(real-time chat)──────────┤──► Google / Facebook OAuth
                                              ├──► Mail service (emails)
                                              └──► PDF generator (tickets)
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18 and npm
- [PHP](https://www.php.net/) >= 8.1 and [Composer](https://getcomposer.org/)
- [MySQL](https://www.mysql.com/) >= 8
- [Git](https://git-scm.com/)
- A [Stripe](https://stripe.com/) account (test mode is enough)
- Google and Facebook developer apps (for social login)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/mycitylife.git
cd mycitylife
```

### 2. Backend setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Create a MySQL database named `mycitylife`, update `.env` (see [Environment Variables](#-environment-variables)), then run:

```bash
php artisan migrate --seed
php artisan serve
```

The API runs at `http://localhost:8000`.

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:5173`.

### 4. Real-time server (chat)

```bash
# Example with Laravel Echo / Pusher or a local WebSocket server
php artisan queue:work
```

### 5. Stripe webhooks (local testing)

```bash
stripe listen --forward-to localhost:8000/api/stripe/webhook
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
APP_NAME=MyCityLife
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mycitylife
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=no-reply@mycitylife.test

STRIPE_KEY=
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
FACEBOOK_REDIRECT_URI=http://localhost:8000/api/auth/facebook/callback

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8000/api
VITE_STRIPE_PUBLIC_KEY=
VITE_PUSHER_APP_KEY=
VITE_PUSHER_APP_CLUSTER=
VITE_MAPS_API_KEY=
```

> 🔒 Never commit your `.env` files. Make sure they are listed in `.gitignore`.

---

## 📂 Project Structure

```
mycitylife/
├── backend/                # PHP / Laravel API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Mail/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   └── ...
├── frontend/               # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── ...
│   └── ...
├── docs/                   # Documentation, specs, Figma links
└── README.md
```

> Update this tree to match your actual folders.

---

## 🛡 Admin Dashboard

- Manage, approve or delete users and businesses.
- Validate or reject new activities.
- View reports and problematic content.
- Track metrics (users, activities, bookings).
- Manage reviews and resolve reported issues.
- Moderate chat rooms and discussions.

---

## 🎨 Design Guidelines

- Modern, clean and fully **responsive** interface.
- Priority on **performance** and **ease of use**.
- Activity cards with **high-quality images**.
- Intuitive and consistent navigation.

🔗 **Figma mockups:** _add your link here_

---

## 📦 Deliverables

- [ ] Functional web application (MVP)
- [ ] Local hosting configured
- [ ] GitHub repository with documented code
- [ ] Complete Figma mockups

---

## 🗺 Roadmap

**MVP**
- [ ] Authentication (email + Google + Facebook)
- [ ] Activity CRUD and approval workflow
- [ ] Search, filters and map view
- [ ] Favorites and reviews
- [ ] Real-time chat (public rooms, private, business to customer)
- [ ] Stripe payments, PDF tickets and confirmation emails
- [ ] Business dashboard (basic stats)
- [ ] Admin dashboard

**Next**
- [ ] Personalized recommendation engine
- [ ] Community moderator role
- [ ] Local Guide / Ambassador role with badges
- [ ] Interest groups and group activities
- [ ] Special offers and exclusive events for businesses
- [ ] Premium business accounts
- [ ] Mobile app (React Native)
- [ ] Production hosting and CI/CD
- [ ] Multi-language support (Arabic, French, English)

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the project.
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "feat: add amazing feature"`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request.

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) style.

---

## 👤 Author

**Aymane El Khadraoui**
Full Stack Developer

- GitHub: [@your-username](https://github.com/your-username)
- LinkedIn: [your-linkedin](https://www.linkedin.com/in/your-linkedin)
- Email: aymane.elkhadraoui1@gmail.com

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

⭐ If you like this project, give it a star!

</div>
