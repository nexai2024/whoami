# Frontend Guideline Document for whoami

This document outlines the frontend architecture, design principles, styling approach, component structure, state management, routing, performance optimization, testing strategy, and overall guidelines for the whoami application. It is written in everyday language so that anyone on the team—designers, developers, or stakeholders—can understand how the frontend is set up and why.

## 1. Frontend Architecture

### 1.1 Frameworks and Libraries
- **Next.js (App Router)**: File-based routing, server-rendering, static generation, and API routes in one framework.  
- **React & TypeScript**: Core UI library with type safety for easier maintenance and fewer runtime bugs.  
- **Tailwind CSS + PostCSS**: Utility-first styling for rapid UI building and small, optimized CSS output.  
- **Zustand**: Lightweight state management for client-side interactions.  
- **Framer Motion**: Smooth, declarative animations and transitions.  
- **React Hook Form**: Simple, performant form handling and validation.  
- **Tiptap (@tiptap/react)**: Rich text editor for content creation.  
- **Stripe**: Payment and subscription handling.  
- **Cloudflare R2**: Fast, reliable object storage and CDN.  
- **SVIX**: Secure webhook delivery and verification.  

### 1.2 Scalability, Maintainability, Performance
- **Modular File Structure**: `app/`, `components/`, `lib/`, and `prisma/` keep related code together.  
- **Server & Client Components**: Offload data fetching and heavy logic to the server when possible, reducing bundle size.  
- **TypeScript Everywhere**: Early error detection and clear contracts between modules.  
- **Code Splitting & Lazy Loading**: Next.js automatically splits bundles; we also use dynamic imports for heavy modules (e.g., Tiptap).  
- **CDN & Caching**: Static assets (images, fonts) served via Cloudflare R2 with long-term caching.  

## 2. Design Principles

### 2.1 Usability
- **Consistent Patterns**: Buttons, forms, and layouts behave the same across the app.  
- **Clear Hierarchy**: Headings, labels, and calls to action follow a predictable visual order.  

### 2.2 Accessibility
- **Semantic HTML**: Use `<button>`, `<nav>`, `<main>`, etc., for built-in accessibility.  
- **ARIA Attributes**: Where needed (modals, custom widgets), add appropriate ARIA roles and labels.  
- **Keyboard Navigation**: Ensure all interactive elements are reachable via Tab/Shift+Tab.  
- **Contrast & Text Size**: Follow WCAG AA guidelines for text and background contrast.  

### 2.3 Responsiveness
- **Mobile-First Approach**: Build components to work on small screens first, then add breakpoints.  
- **Flexible Layouts**: Use CSS Grid and Flexbox via Tailwind classes for fluid, adaptive UIs.  

## 3. Styling and Theming

### 3.1 Styling Approach
- **Utility-First with Tailwind CSS**: Compose UIs by stacking small, atomic classes.  
- **PostCSS**: Processes Tailwind directives and custom CSS.  
- **Minimal Custom CSS**: If a style can’t be expressed with Tailwind, use a small, scoped CSS module.  

### 3.2 Theming
- **Tailwind Theme Configuration**: All colors, fonts, and spacing live in `tailwind.config.js`.  
- **CSS Variables**: For dynamic themes (light/dark), we define custom properties in `:root` and toggle a `dark` class on `<html>`.  

### 3.3 Visual Style
- **Overall Style**: Modern, flat design with occasional glassmorphism overlays (semi-transparent cards and modals).  
- **Color Palette**:  
  • Primary: Indigo 600 (#4F46E5)  
  • Secondary: Pink 500 (#EC4899)  
  • Accent: Amber 500 (#F59E0B)  
  • Background: Gray 50 (#F9FAFB)  
  • Surface (cards): White (#FFFFFF)  
  • Text Primary: Gray 900 (#111827)  
  • Text Secondary: Gray 700 (#4B5563)  
- **Fonts**:  
  • Headings: Poppins, Sans-serif  
  • Body: Inter, Sans-serif  

## 4. Component Structure

### 4.1 Organization
- **`app/` Directory**: Contains route definitions, layouts, and server components.  
- **`components/` Directory**:  
  • `ui/`: Generic UI primitives (Button, Modal, FormInput).  
  • `auth/`: Login, Signup, Profile components.  
  • Feature folders: e.g., `CampaignWizard/`, `HeaderCustomizer/`.  

### 4.2 Reusability
- **Small, Focused Components**: Each component does one thing—either a UI primitive or a feature building block.  
- **Props-Driven**: All state and callbacks pass via props, making components predictable and easy to test.  
- **Atomic Design Inspiration**: UI primitives → composite patterns → pages.  

### 4.3 Benefits
- **Maintainability**: Smaller components are easier to read, update, and debug.  
- **Consistency**: Reused UI building blocks keep the look and behavior uniform.  
- **Parallel Development**: Teams can work on different features without stepping on each other.  

## 5. State Management

### 5.1 Local vs. Global State
- **Local State**: `useState` and React Hook Form’s `useForm` for individual components and forms.  
- **Global UI State**: Zustand for theme (light/dark), modal visibility, builder canvas state, and feature gating flags.  

### 5.2 Server Data
- **Next.js Server Components** fetch data directly from the database or APIs, minimizing client bundle size.  
- **Client Fetching**: For client-side data updates, we use `fetch` or React Query (future improvement) with caching and invalidation.  

## 6. Routing and Navigation

### 6.1 File-Based Routing
- **`app/` Directory**: Each folder maps to a URL.  
- **Nested Layouts**: Shared headers, sidebars, and footers across related routes.  
- **Dynamic Routes**: `[id]` and catch-all `[[...slug]]` for pages and custom domains.  

### 6.2 Navigation Components
- **<Link>**: Next.js’ `next/link` for client-side transitions.  
- **Active State**: Track current path to highlight active menu items.  

## 7. Performance Optimization

### 7.1 Rendering Strategies
- **SSR & SSG**: Pre-render public pages and personalized pages at build or request time.  
- **Server Components**: Move heavy data logic to the server, reducing client JS.  

### 7.2 Bundle & Asset Management
- **Automatic Code Splitting**: Built into Next.js for each route.  
- **Dynamic Imports**: Load large libraries (Tiptap, charts) only when needed.  
- **Image Optimization**: `next/image` for responsive, lazy-loaded images.  
- **Tree Shaking & PurgeCSS**: Remove unused code and CSS.  

### 7.3 Caching & CDN
- **Cloudflare R2**: Fast asset delivery worldwide.  
- **HTTP Caching**: Leverage immutable and stale-while-revalidate headers.  

## 8. Testing and Quality Assurance

### 8.1 Unit & Integration Tests
- **Vitest**: Fast, Vite-powered testing for functions and components.  
- **React Testing Library**: Render components in a JSDOM environment and assert on the UI.  

### 8.2 End-to-End Tests
- **Playwright (or Cypress)**: Automate user flows—sign up, build a page, check out, analytics.  

### 8.3 Linting & Formatting
- **ESLint**: Enforce code style, catch common bugs.  
- **Prettier**: Consistent code formatting.  
- **Tailwind Linter**: Ensure valid utility classes and catch typos.  

### 8.4 CI/CD Integration
- **GitHub Actions**: Run lint, tests, and type checks on every pull request.  

## 9. Conclusion and Overall Frontend Summary

The whoami frontend is built on a modern, well-structured stack that prioritizes performance, maintainability, and a great user experience. By using Next.js with Server Components, utility-first styling, and a clear component hierarchy, we ensure:

- **Scalability**: Modular code and file-based routing let us expand features without complexity growing out of hand.  
- **Maintainability**: TypeScript, small focused components, and a single source of truth for styles keep the codebase healthy.  
- **Performance**: Server-rendering, lazy loading, and CDN caching deliver fast load times globally.  
- **User-Centered Design**: Accessibility, responsive layouts, and consistent UI patterns make the product easy to use for everyone.

By following these guidelines, every team member—developer, designer, or QA—can quickly understand how the frontend is put together, contribute effectively, and maintain a high level of quality as the whoami platform grows.