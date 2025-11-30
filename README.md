# Shukuma Web

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Font Awesome](https://img.shields.io/badge/Font_Awesome-528DD7?style=for-the-badge&logo=fontawesome&logoColor=white)

</div>

The web frontend for Shukuma — a fitness companion app helping users track exercises, build streaks, complete daily challenges, and connect with a community. Built with Next.js 16 using the App Router and React 19.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see [backend README](https://github.com/siyabuilds/shukuma_backend/blob/main/README.md))

### Installation

```bash
# Install dependencies
npm install

# Create .env.local with backend URL
echo "BACKEND_URL=http://localhost:3000" > .env.local

# Start development server (runs on port 4200)
npm run dev
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

### Environment Variables

| Variable      | Description                    | Default                 |
| ------------- | ------------------------------ | ----------------------- |
| `BACKEND_URL` | URL of the Shukuma backend API | `http://localhost:3000` |

---

## File Structure

```
web/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout with ThemeProvider
│   ├── page.tsx                  # Home/dashboard page
│   ├── globals.css               # CSS variables & theme tokens
│   ├── api/                      # API route handlers (proxy to backend)
│   │   ├── login/route.ts
│   │   ├── exercises/route.ts
│   │   └── ...                   # One folder per endpoint
│   ├── exercises/                # Exercise listing & details
│   ├── daily/                    # Daily exercise card
│   ├── progress/                 # Progress tracking & charts
│   ├── journal/                  # Personal journal entries
│   ├── white-noise/              # Ambient audio player
│   ├── community/                # Social features & challenges
│   ├── login/                    # Authentication
│   └── register/
├── components/                   # Reusable UI components
│   ├── Navbar.tsx                # Navigation with auth state
│   ├── Footer.tsx                # Footer with theme toggle
│   ├── theme.tsx                 # ThemeToggle button
│   ├── ExerciseFlipCard.tsx      # Interactive exercise cards
│   ├── DailyChallengeCard.tsx    # Daily challenge display
│   ├── ProgressCharts.tsx        # SVG-based charts
│   ├── StreakBadges.tsx          # Badge display & progress
│   ├── AudioTrackItem.tsx        # White noise player
│   └── WorkoutChallengeCard.tsx  # Friend challenge cards
├── contexts/
│   └── ThemeContext.tsx          # React Context for theming
├── hooks/
│   └── useTheme.ts               # Theme state management hook
├── config/
│   └── colors.ts                 # Color palette constants
└── utils/
    └── swal.ts                   # Theme-aware SweetAlert2 helpers
```

---

## Design Patterns & Key Approaches

### 1. CSS Variables for Theming (Token System)

Instead of using Tailwind's built-in dark mode classes, we use CSS custom properties (tokens) that switch based on a `data-theme` attribute. This gives us more control and eliminates class duplication.

**How it works:**

```css
/* globals.css */
:root,
[data-theme="light"] {
  --background: #f8f9fa;
  --foreground: #212529;
  --primary: #ff6b35;
}

[data-theme="dark"] {
  --background: #1e1e1e;
  --foreground: #eaeaea;
  --primary: #ff6b35; /* Primary stays consistent */
}
```

Components simply use `bg-background`, `text-foreground`, `text-primary` — Tailwind maps these to our CSS variables via the `@theme inline` directive. When the theme changes, everything updates automatically.

**Why this approach?**

- Single class per element (no `dark:bg-gray-900` everywhere)
- Smooth 0.3s transitions on all theme-aware properties
- Third-party libraries (like SweetAlert2) can read the same tokens

---

### 2. Theme Hook & Context Pattern

The theming system uses a two-layer architecture: a custom hook handles the logic, and a Context makes it available app-wide.

**`hooks/useTheme.ts`** — The Brain

```typescript
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    /* ... */
  };
  return { theme, toggleTheme, setTheme, mounted };
}
```

**`contexts/ThemeContext.tsx`** — The Distributor

```typescript
export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeData = useThemeHook();
  return (
    <ThemeContext.Provider value={themeData}>{children}</ThemeContext.Provider>
  );
}
```

**Why separate hook from context?**

- The hook is testable in isolation
- Context just distributes — single responsibility
- `mounted` flag prevents hydration mismatch (see next section)

---

### 3. Hydration Flash Prevention

Server-rendered React doesn't know the user's theme preference, so there's a brief "flash" of wrong colors on load. We prevent this with an inline script in `layout.tsx`:

```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `
    (function() {
      try {
        var theme = localStorage.getItem('theme');
        if (!theme) {
          theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.setAttribute('data-theme', theme);
      } catch (e) {}
    })();
  `,
  }}
/>
```

This runs **before React hydrates**, so the correct theme is applied instantly. The `suppressHydrationWarning` on `<html>` tells React to expect this mismatch.

Additionally, theme-dependent components check `mounted` before rendering interactive elements:

```tsx
if (!mounted) {
  return <div className="w-12 h-12 rounded-full bg-neutral" />; // Skeleton
}
```

---

### 4. API Proxy Routes

The frontend doesn't call the backend directly from the browser. Instead, Next.js API routes act as a proxy:

```
Browser → /api/exercises (Next.js) → BACKEND_URL/api/exercises (Express)
```

**Why proxy?**

- **Security**: `BACKEND_URL` stays server-side only
- **CORS avoidance**: Same-origin requests from browser to Next.js
- **Flexibility**: Can add caching, logging, or transforms later

**Pattern used in every route:**

```typescript
// app/api/exercises/route.ts
export async function GET(request: Request) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
  const response = await fetch(`${backendUrl}/api/exercises`);
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
```

For authenticated routes, the `Authorization` header is forwarded:

```typescript
const authHeader = request.headers.get("Authorization");
const response = await fetch(`${backendUrl}/api/progress`, {
  headers: { Authorization: authHeader || "" },
});
```

---

### 5. Theme-Aware SweetAlert2 Dialogs

SweetAlert2 doesn't automatically inherit CSS variables, so `utils/swal.ts` provides wrapper functions that read the current theme and apply matching colors:

```typescript
const getThemedColors = () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  return {
    background: isDark ? "#1a1a1a" : "#ffffff",
    color: isDark ? "#e5e5e5" : "#171717",
    confirmButtonColor: isDark ? "#3b82f6" : "#2563eb",
  };
};

export const showAlert = (title, text, icon) => {
  const colors = getThemedColors();
  return Swal.fire({ title, text, icon, ...colors });
};
```

Components import `showAlert` instead of `Swal.fire` directly, ensuring consistent theming everywhere.

---

### 6. Client-Side Authentication State

Auth tokens are stored in `localStorage` and checked on the client side. The `Navbar` component demonstrates this pattern:

```typescript
useEffect(() => {
  const token = localStorage.getItem("token");
  setIsLoggedIn(!!token);
}, []);

const handleLogout = () => {
  localStorage.removeItem("token");
  setIsLoggedIn(false);
  window.location.href = "/";
};
```

**Why client-side?**

- Simple SPAs can manage auth without server middleware
- Token is sent with each API request via `Authorization` header
- Backend validates and returns `401` if expired

**Caveat**: Protected pages should redirect if no token exists:

```typescript
if (!token) {
  router.push("/login");
  return;
}
```

---

### 7. Exercise Type Color Mapping

Exercises have types (`core`, `lowerbody`, `cardio`, `upperbody`), each mapped to a semantic color and icon. This pattern repeats across components:

```typescript
const getTypeIcon = (type: string) => {
  switch (type) {
    case "core":
      return "fa-circle-notch";
    case "lowerbody":
      return "fa-shoe-prints";
    case "cardio":
      return "fa-heartbeat";
    case "upperbody":
      return "fa-dumbbell";
    default:
      return "fa-dumbbell";
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "core":
      return "text-primary"; // Orange
    case "lowerbody":
      return "text-secondary"; // Blue
    case "cardio":
      return "text-warning"; // Yellow-orange
    case "upperbody":
      return "text-success"; // Green
    default:
      return "text-primary";
  }
};
```

This visual language helps users quickly identify exercise categories across cards, filters, and progress charts.

---

### 8. SVG-Based Progress Charts

Instead of a charting library, `ProgressCharts.tsx` renders SVG directly for full styling control and tiny bundle size:

```tsx
<svg viewBox="0 0 100 100" preserveAspectRatio="none">
  {data.map((item, index) => {
    const height = (item.count / maxCount) * 80;
    return (
      <rect
        x={`${index * barWidth}%`}
        y={`${100 - height}%`}
        width={`${barWidth * 0.8}%`}
        height={`${height}%`}
        className="fill-primary hover:opacity-100"
      />
    );
  })}
</svg>
```

**Advantages:**

- No external dependencies
- Theme colors via CSS classes
- Responsive by default (`viewBox` scales)

---

### 9. Audio Player with Shared State

The white noise page needs to ensure only one track plays at a time. Parent state manages which track is active:

```tsx
// Parent: white-noise/page.tsx
const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(
  null
);

{
  tracks.map((track) => (
    <AudioTrackItem
      isCurrentlyPlaying={currentlyPlayingId === track._id}
      onPlay={(id) => setCurrentlyPlayingId(id)}
      onPause={() => setCurrentlyPlayingId(null)}
    />
  ));
}
```

The `AudioTrackItem` component handles its own playback but defers to parent for coordination. When a new track starts, others automatically pause.

---

### 10. Animated Mobile Navigation

The navbar uses Framer Motion for a smooth mobile menu with staggered link animations:

```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
    >
      {navLinks.map((link, index) => (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link href={link.href}>{link.name}</Link>
        </motion.div>
      ))}
    </motion.div>
  )}
</AnimatePresence>
```

`AnimatePresence` enables exit animations (normally components just disappear). The staggered `delay` creates a cascading reveal effect.

---

## Pages Overview

| Route             | Description                                   |
| ----------------- | --------------------------------------------- |
| `/`               | Dashboard (logged in) or landing page         |
| `/login`          | User authentication                           |
| `/register`       | Account creation                              |
| `/exercises`      | Browse, filter, and search all exercises      |
| `/exercises/[id]` | Single exercise details with complete button  |
| `/daily`          | Today's assigned exercise card                |
| `/progress`       | Charts, streak badges, and completion history |
| `/journal`        | Personal fitness journal with mood tracking   |
| `/white-noise`    | Ambient audio tracks for focus/relaxation     |
| `/community`      | Social feed, friend challenges, leaderboard   |

---

## Scripts

```bash
npm run dev      # Start dev server on port 4200
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) — App Router, Server Components
- [Tailwind CSS v4](https://tailwindcss.com/docs) — Utility-first styling
- [Framer Motion](https://www.framer.com/motion/) — Animation library
- [SweetAlert2](https://sweetalert2.github.io/) — Beautiful alert dialogs
