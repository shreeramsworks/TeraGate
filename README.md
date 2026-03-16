# TeraGet: Deep Technical Documentation 🚀

**TeraGet** is a custom-engineered, premium Next.js application designed to streamline the extraction and downloading of media from Terabox. This document provides a deep dive into the system architecture, data flow, and implementation details for developers and technical users.

---

## 🏗️ System Architecture

TeraGet follows a modern **Decoupled Client-Server Architecture**:

1.  **Frontend (Next.js 15+ App Router)**: Handles the user interface, input validation, state management, and aesthetic rendering.
2.  **External API Layer (tera-core)**: Acts as the bridge between the client and Terabox's servers. This layer handles the complex task of bypassing CSRF protections, handling session cookies, and parsing Terabox's internal JSON response into a clean, predictable format.

---

## 🔄 Core Data Flow

The application follows a strictly linear data processing pipeline:

### 1. Link Ingestion & Identifier Extraction
When a user pastes a URL (e.g., `https://www.1024tera.com/sharing/link?surl=GocjGsGo_vD3yLYZe...`), the specialized `extractId` regex service is triggered.
*   **Mechanism**: It uses a comprehensive regular expression to identify the `shorturl` (the portion after `/s/` or within query parameters).
*   **Supported Domains**: `terabox.com`, `terasharelink.com`, `1024tera.com`, `teraboxcdn.com`, etc.

### 2. Upstream API Request
Once the unique video ID is extracted, a client-side `fetch` request is dispatched to the `tera-core` microservice.
*   **Endpoint**: `https://tera-core.vercel.app/api?url=...`
*   **Purpose**: This service handles the "dirty work" of interacting with Terabox's internal API. It executes the necessary handshakes to retrieve the real `download_link`.

### 3. Data Transformation & Normalization
The API returns a JSON object. TeraGet's `fetchMeta` function then maps this data to a normalized internal object:
```javascript
const transformedData = {
  name: json.files[0].filename,  // Decoded filename
  link: json.files[0].download_link // Direct authenticated download URI
};
```

### 4. Interactive Rendering
The UI uses **Framer Motion** and **Tailwind CSS 4** to transition between states:
*   **Idle**: A clean, centered input field.
*   **Loading**: A high-speed spinner and "Processing" state.
*   **Success**: A revealed download card with the final direct link.

---

## 🎨 UI & UX Implementation Details

### Aesthetic Engine
- **Tailwind CSS 4**: Utilizes the modern CSS-first configuration engines for lightning-fast styling.
- **Dynamic Glow**: Implemented via absolute-positioned `blur-[120px]` divs with fuchsia/pink opacity-20.
- **Glassmorphism**: The input cards use `backdrop-blur-xl` and `bg-neutral-900/50` to create a "glass" effect over the background glows.

### Micro-Animations
- **AnimatePresence**: Handles the smooth mounting and unmounting of error messages and result cards.
- **Spring Transitions**: All buttons and card movements use `transition: { duration: 0.6 }` with cubic-bezier curves for a "premium" feel.

---

## 🛠️ Developer Checklist

### Environment Setup
1.  Initialize Node.js environment.
2.  Run `npm install` to populate `node_modules`.
3.  Ensure the `next.config.mjs` is configured for standard Next.js deployment.

### Production Build
Execute the following to generate a production-ready bundle:
```bash
npm run build
```

### Security Considerations
*   **API Exposure**: The application uses a public API for demonstration. For production use involving sensitive data, it is recommended to implement an environment-variable-backed server-side proxy to hide the upstream API details.
*   **CORS**: Bypassed primarily by the upstream microservice which appends the necessary headers to the response.

---
*Document Version: 1.1.0 | Last Updated: March 2026*
