# She Can Foundation - Full-Stack Internship Portal

This project is a premium, state-of-the-art full-stack web application designed for the **She Can Foundation** (a registered NGO under the Indian Society Act of 1860). 

It fulfills the **Full Stack Development Internship Task** by creating a beautiful landing page with an integrated volunteer contact/application form, server-side data persistence, real-time client & server validation, responsive styling, persistent light/dark themes, and an interactive administrator control panel.

---

## ✨ Features

### 1. Modern Web Design & Aesthetics
* **Premium Typography & Layout:** Built using modern styling guidelines, utilizing typography from Google Fonts (Poppins & DM Sans) and elegant crimson accent colors matching the She Can Foundation branding.
* **Micro-interactions & Animations:** Features floating banner animation cards, custom interactive SVG icons, hover transitions, and a smooth wavy section separator.
* **Persistent Dark/Light Mode:** Includes a header theme toggle button. System preference is checked by default, and user choice is persisted in `localStorage`.

### 2. High-Fidelity Front-End Form
* **Client-Side Form Validation:** Real-time checking for empty inputs and valid email syntax. Invalid fields highlight in red and direct the focus for accessible correction.
* **Interactive Modals:** Shows a glassmorphic success overlay modal once submissions have succeeded ("Form Submitted Successfully").
* **Asynchronous Networking:** Utilizes modern `fetch` AJAX posting to avoid reloading the browser page.

### 3. Node.js Express Backend & JSON Database
* **Structured Express Server:** The server serves the static folder, provides schema validation, handles post requests, and exposes authenticated admin control APIs.
* **Zero-Configuration JSON Database (`db.json`):** Persists submissions inside a JSON file store. Offers 100% execution reliability on Windows or any system without requiring complex SQLite compiler downloads.

### 4. Admin Portal Dashboard
* **Verification Security:** Access submissions via a login passcode entry directly within the app (Default passcode: **`admin123`**).
* **Live Stats Counter:** Visual stat indicator that tracks the total number of submission records dynamically.
* **Management Controls:** Lets the administrator view lists (including date, email links, messages), delete specific applicant rows directly, and immediately sync the data to the JSON file.
* **Export to CSV:** Allows downloading the applicant database as a standard CSV spreadsheet file with a single click.

---

## 🛠️ Technology Stack
* **Frontend:** HTML5 (Semantic Structure), CSS3 (Custom Grid/Flex layout, Variable tokens, Keyframes), Vanilla JavaScript (DOM manipulation, theme states, REST integration).
* **Backend:** Node.js, Express.js.
* **Database:** Native file-based JSON store.

---

## 🚀 Running the Project Locally

Follow these quick steps to get the application running on your computer:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (Node.js version 18.x or above is recommended).

### Setup Steps
1. **Open your terminal or command prompt** inside the project folder (`c:\Users\lokes\Desktop\scf`).
2. **Install project dependencies** by running:
   ```bash
   npm install
   ```
3. **Start the server** in development mode:
   ```bash
   npm run dev
   ```
   *(Alternatively, run `npm start` to execute the production server script directly)*.
4. **Access the application:** Open your web browser and navigate to:
   ```
   http://localhost:3500
   ```

---

## 🔒 Administrative Passcode

* **Passcode:** `admin123`
* To test the Admin portal, scroll down to the **Admin Portal** section in the footer or navigation links, input `admin123`, and hit **Verify & Access**.

---

*Designed and developed as an internship selection task submission representing high creativity, willingness to learn, and full-stack integration capability.*
