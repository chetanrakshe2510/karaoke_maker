# Product Strategy Document: Edge-Powered AI Karaoke App

## 1. Product Vision
**"To democratize music practice by transforming any online audio link into an immersive karaoke experience, leveraging edge computing to make it 100% free and instantly accessible."**

*Real-world Analogy:* Think of the old architecture like a high-end restaurant where we paid expensive chefs (Cloud GPUs) to cook the meals. This new architecture is like a premium meal-kit service: we provide the raw ingredients (the audio and the AI models), and the user's own kitchen (their browser and WebGPU) does the cooking.



## 2. Feature Prioritization (MoSCoW Framework)
*Note: The MoSCoW method categorizes features to ensure we launch a functional Minimum Viable Product (MVP) that respects our new zero-cost infrastructure limits.*

### Must-Have (Critical for Launch)
* **Client-Side NLP Transcription:** Integrating `transformers.js` via WebGPU to run the Whisper model locally in the user's browser.
* **Serverless Source Separation:** Utilizing a free Hugging Face Space (ZeroGPU) via the Gradio Client to run Demucs and isolate the vocal track.
* **Determinate Loading UI:** A transparent, multi-stage loading screen that explains to the user *why* they are waiting (e.g., "Downloading 50MB AI model to your browser...").
* **Edge Storage Pipeline:** Saving the separated `instrumental.wav` directly to a free-tier Supabase storage bucket.

### Should-Have (Important, but post-launch)
* **IndexedDB Model Caching:** Storing the 50MB Whisper WebGPU model in the browser's local database so the user only has to download it on their very first visit.
* **Local File Upload Fallback:** Allowing users to bypass the Hugging Face queue entirely by uploading their own `.mp3` files for strictly local processing.

### Could-Have (Nice to have, for future differentiation)
* **Supabase User Authentication:** Allowing users to create accounts to save their generated lyrics and instrumentals to a personal dashboard.
* **Hardware Benchmarking UI:** A small visual indicator showing the user how fast their specific device's GPU is processing the audio (gamifying the local computing experience).

### Won't-Have (Out of scope for this architecture)
* **Real-Time Collaborative Singing:** Network latency and the lack of a centralized WebSocket server make live multiplayer impossible for now.
* **Paid Cloud Scaling:** We will not implement paid AWS/GCP auto-scaling, as it violates the core business requirement of keeping operating costs at zero.

---

## 3. Product Roadmap

### Phase 1: The Zero-Cost Engine (Months 1-2)
**Goal:** Prove the Serverless/Edge pipeline works seamlessly together.
* **Milestone 1:** Deploy the Vite + React frontend to Vercel and successfully initialize `transformers.js` using the device's WebGPU.
* **Milestone 2:** Write the Python Gradio script for Demucs and host it on a free Hugging Face Space.
* **Milestone 3:** Connect the frontend to Supabase to successfully upload and retrieve the separated audio files.

### Phase 2: The Transparent Experience (Months 3-4)
**Goal:** Perfect the loading UX to prevent users from abandoning the app during variable processing times.
* **Milestone 1:** Build the 4-stage loading interface (Queue -> Separation -> Model Download -> Local Inference).
* **Milestone 2:** Implement the continuous-fill lyric animation using `requestAnimationFrame` and the WebGPU timestamp outputs.
* **Milestone 3:** Launch the IndexedDB caching feature to drastically speed up repeat usage.

### Phase 3: The Edge Expansion (Months 5-6)
**Goal:** Add features that capitalize on the privacy and power of local edge computing.
* **Milestone 1:** Implement local `.mp3` processing.
* **Milestone 2:** Execute a Public Beta Launch and monitor the Supabase free-tier bandwidth limits.