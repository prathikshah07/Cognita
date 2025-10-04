# Cognita

![Cognita Banner](./assets/banner.png)

**Cognita** is a cross-platform gamified learning platform designed to make education interactive, adaptive, and fun. It combines story-driven modules, quizzes, progress tracking, and gamification to help students learn core subjects efficiently.

---

## 🚀 Features

* **Interactive Learning Modules**: Story-driven lessons for math, science, and language.
* **Gamification**: Points, badges, levels, and achievements to motivate learning.
* **Personalized Dashboard**: Track performance, streaks, and progress.
* **Search and Filter**: Easily find lessons and track progress using search and date filters.
* **Export Data**: Export learning history or achievements in CSV format.
* **Sleep & Wellness Tracking**: Integrated modules like sleep tracking for holistic development.
* **Responsive UI**: Built with Tailwind CSS for clean and responsive design.

---

## 📚 Technologies

* **Frontend**: React + Vite + TypeScript + Tailwind CSS
* **Backend**: Supabase (PostgreSQL, Auth, Storage)
* **Charts & Visualizations**: Recharts
* **State Management**: React hooks & Context API
* **Optional Features**: Export CSV, date filtering, search, gamification engine

---

## ⚡ Getting Started

### Prerequisites

* Node.js ≥ 18
* npm or yarn
* Supabase account

### Setup

1. **Clone the repo**

```bash
git clone https://github.com/yourusername/cognita.git
cd cognita
```

2. **Install dependencies**

```bash
npm install
# or
yarn
```

3. **Configure environment variables**

Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run the development server**

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) to view in your browser.

---

## 🗂 Project Structure

```
src/
├─ components/        # Reusable components
│  ├─ sleep/          # Sleep tracking components
│  ├─ shared/         # Shared components like DateRangeFilter, SearchBar
├─ pages/             # App pages
├─ lib/               # Supabase client and utilities
├─ types/             # TypeScript interfaces
├─ data/              # Mock data for development/testing
```

---

## 🎮 Gamification

* Points system for module completion
* Badges for milestones (e.g., "Fast Learner", "Loop Master")
* Leveling based on accumulated points
* Leaderboards to track top performers

---

## 🧩 Future Improvements

* Mobile app wrapper for iOS/Android
* Offline-first capabilities with local caching
* Multilingual support for regional languages
* Story-based AR modules for immersive learning

---

## 📝 Contributing

1. Fork the repository
2. Create a branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📜 License

MIT License © 2025 [Your Name]

---

## 🔗 Links

* [Supabase Project Dashboard](https://app.supabase.com)
* [Cognita Demo](#)

---

If you want, I can also make a **visually rich version with badges, screenshots, and a project demo GIF** that looks more like a polished GitHub landing page.

Do you want me to do that?
