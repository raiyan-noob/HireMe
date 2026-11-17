# HireMe 🚀

**HireMe** is a full-stack job hiring and posting platform connecting talented professionals with top companies.

## 📁 Project Structure

```
HireMe/
└── app/                  # Next.js Full Stack Application
    ├── public/           # Static assets
    ├── src/
    │   └── app/
    │       ├── components/  # Reusable UI components (Navbar, etc.)
    │       ├── pages/       # Page components (Home, etc.)
    │       ├── layout.js    # Root layout with responsive Navbar & theme support
    │       ├── page.js      # Main route
    │       └── globals.css  # Tailwind CSS v4 styling & dark mode configuration
    ├── package.json
    └── next.config.mjs
```

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Theme**: Dark & Light mode toggle with persistent state
- **Authentication**: Better Auth (`@better-auth/mongo-adapter`)
- **Database**: MongoDB

## 🚀 Getting Started

1. Navigate to the `app` directory:
   ```bash
   cd app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.
