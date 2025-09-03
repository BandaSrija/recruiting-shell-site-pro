# Recruiting Shell Site

A clean, minimalist shell website built as part of a design + build exercise.  
The site demonstrates a simple structure with placeholder content, responsive design, and hints at future community + AI-driven features.

---

## 🚀 Features
- **Minimalist UI**: White background, clean typography, restrained accent colors.  
- **Responsive Design**: Works seamlessly on mobile and desktop.  
- **Dark/Light Theme Toggle**: Persistent with `localStorage` using CSS variables.  
- **Accessibility**: Semantic landmarks, ARIA labels, focus states, and reduced-motion support.  
- **Mock API Layer** (`script.js`):  
  - `postWaitlist(email)` simulates a waitlist API with latency.  
  - `generatePlaybook({...})` produces deterministic sourcing queries, outreach snippets, and screening rubrics.  
  - `semanticSearch(q)` searches a small corpus and ranks results.  
- **AI/Community Prototypes**:  
  - Semantic search bar in hero.  
  - AI Playbook Generator in Labs (supports “Junior mode”).  
- **PWA Scaffold**: `manifest.webmanifest` + `sw.js` for offline shell support.  

---

## 📂 Folder Structure
recruiting-shell-site/
├── assets/ # Images, icons, logos
├── index.html # Main entry point
├── styles.css # Styling (light/dark theme, responsive grid)
├── script.js # Mock API + interactivity
├── sw.js # Service worker (offline support)
└── manifest.webmanifest # PWA manifest

## 🔮 Next Steps (if live product)

- Replace mock APIs with serverless endpoints (e.g., Supabase/Firebase).

- Add authentication and secure user profiles.

- Ship embeddings index for semantic search + LLM integration.

- Build a community hub (profiles, reputation, shared playbooks).

- Add analytics (privacy-first) to measure engagement.