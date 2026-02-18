# Free & Easy Tech Stack Roadmap: AI Karaoke App

## 1. The Strategy Shift
To achieve a $0/month operating cost while maintaining ease of development, we must shift the computing burden. Instead of paying for a backend server to do all the work, we will force the user's browser to handle the Natural Language Processing (transcription), and we will leverage free cloud research platforms to handle the heavy audio separation.

### What We Are Replacing:
* **Out:** AWS S3 & Custom PostgreSQL. **In:** Supabase (Free Tier).
* **Out:** Celery, Redis, & Paid Cloud GPUs. **In:** Hugging Face Spaces (ZeroGPU) / Google Colab.
* **Out:** Backend Python Whisper Pipeline. **In:** Transformers.js (WebGPU).

---

## 2. The Frontend (Hosting & UI)
**Goal:** Build a lightning-fast UI that hosts itself for free and utilizes the user's hardware.

* **Framework: Vite + React + Tailwind CSS.**
  * *Why:* Vite is vastly easier to set up than Next.js if you don't need complex server-side rendering. Tailwind allows you to build the high-contrast UI and sweeping text animations quickly without writing messy CSS files.
* **Hosting: Vercel or Netlify.**
  * *Why:* You can connect your GitHub repository to Vercel and it will host your frontend application on a global Content Delivery Network (CDN) completely for free forever.
* **State Management: Zustand.**
  * *Why:* Still the easiest and most lightweight way to manage audio playback state without the boilerplate of Redux.

## 3. The Backend (Database & Storage)
**Goal:** Store user accounts, saved generated lyrics, and instrumentals without AWS configuration nightmares.

* **Platform: Supabase (Free Tier).**
  * *Why:* Supabase is an open-source alternative to Firebase. Their free tier gives you a 500MB PostgreSQL database, 1GB of S3-compatible file storage, and up to 50,000 monthly active users.
  * *How:* You do not need to write backend API routes to save data. Supabase provides a simple JavaScript SDK you can use directly inside your React frontend to upload the `instrumental.wav` and save the user's song history.

## 4. The AI Processing (The Zero-Cost Hacks)
Running AI models is the only part that usually costs money. Here is how we bypass that.

### Task 1: Transcription & Alignment (Client-Side NLP)
* **Technology: Transformers.js (WebGPU Whisper).**
  * *The Hack:* Instead of sending the audio to a server, you use `transformers.js`. This brilliant library downloads a lightweight version of the Whisper model directly into the user's browser. It uses WebGPU to run the natural language processing and phoneme alignment using the user's own graphics card. 
  * *Result:* Zero server costs for you, total privacy for the user, and no API rate limits.

### Task 2: Source Separation (Serverless Demucs)
Demucs is too heavy to run reliably in the browser. We must run it in the cloud for free.
* **Option A: Hugging Face Spaces (ZeroGPU).**
  * *The Hack:* Hugging Face allows developers to host Machine Learning apps for free using their "ZeroGPU" dynamic allocation. You can write a tiny Python script using the `Gradio` SDK that takes an audio file and runs Demucs. You can then use the `@gradio/client` NPM package in your React app to send audio to your free Hugging Face Space.
* **Option B: Google Colab API (For Development).**
  * *The Hack:* While building the app, you can run Demucs inside a free Google Colab notebook (which gives you a free T4 GPU). You can expose this notebook as a temporary backend API using a free tunneling service like `ngrok` or `localtunnel`.

---

## 5. The Simplified Architecture Flow
1. **Input:** User pastes a YouTube link into your Vite React app hosted on Vercel.
2. **Separation:** The React app pings your free Hugging Face Space API, which downloads the audio, runs Demucs, and returns an `instrumental.wav` and a `vocals.wav`.
3. **Storage:** React uploads the `instrumental.wav` directly to your free Supabase Storage bucket.
4. **Transcription:** React feeds the `vocals.wav` into `transformers.js` running locally in the browser to instantly generate the timestamped lyrics.
5. **Playback:** The user sings along using your continuous-fill UI.