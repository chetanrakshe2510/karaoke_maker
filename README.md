# 🎤 Karaok — Instant AI Karaoke Maker

Turn **any song** into a karaoke experience — right in your browser. Upload an audio file and Karaok will separate the vocals, transcribe the lyrics with timestamps, and display them in a real-time karaoke view.

---

## ✨ Features

- **AI Source Separation** — Splits vocals from instrumental using [Demucs v4](https://github.com/facebookresearch/demucs) via Hugging Face Spaces
- **Blazing-Fast Transcription** — Lyrics extracted in ~2-3 seconds using [Groq Whisper API](https://groq.com) (`whisper-large-v3-turbo`)
- **Multi-Language** — Supports 99+ languages (Hindi, English, Spanish, etc.) with auto-detection
- **Real-Time Karaoke View** — Smooth word-by-word highlight animation synced to audio playback
- **Auto Audio Compression** — Large files are downsampled to 16kHz mono before transcription (no quality loss for speech recognition)
- **Glassmorphism UI** — Premium dark theme with neon accents and micro-animations
- **100% Browser-Based** — No server setup required for development

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 7 |
| **Styling** | Tailwind CSS v3 |
| **State** | Zustand |
| **Source Separation** | HF Spaces (Demucs v4) via `@gradio/client` |
| **Transcription** | Groq Whisper API (primary) / WebGPU Whisper (fallback) |
| **Storage** | Supabase |

---

## 📂 Project Structure

```
Karaok/
├── src/
│   ├── components/
│   │   ├── AudioUpload.tsx          # Drag-and-drop file upload
│   │   ├── Header.tsx               # App header with branding
│   │   ├── Player.tsx               # Audio player with seek controls
│   │   ├── LoadingStages/
│   │   │   ├── LoadingOrchestrator.tsx  # 4-stage loading UI
│   │   │   ├── CloudQueue.tsx       # Cloud queue animation
│   │   │   └── StageCard.tsx        # Individual stage card
│   │   └── LyricDisplay/
│   │       ├── LyricContainer.tsx   # Main karaoke view
│   │       └── LyricLine.tsx        # Single animated lyric line
│   ├── hooks/
│   │   ├── useDemucs.ts             # Source separation hook
│   │   ├── useWhisper.ts            # Transcription hook (Groq → WebGPU → Mock)
│   │   └── useAudioSync.ts          # Audio playback sync
│   ├── services/
│   │   ├── groq.ts                  # Groq Whisper API client + audio compression
│   │   ├── huggingface.ts           # HF Space Demucs integration
│   │   ├── whisper.ts               # WebGPU Whisper (local fallback)
│   │   └── supabase.ts              # Supabase client setup
│   ├── store/
│   │   └── useAppStore.ts           # Zustand store (stages, segments, audio)
│   ├── utils/
│   │   └── formatTime.ts            # Time formatting helpers
│   ├── App.tsx                      # Root app with stage routing
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Tailwind + custom theme
├── .env                             # Environment variables (not committed)
├── .env.example                     # Example env template
├── vite.config.ts                   # Vite config with Groq proxy
├── tailwind.config.js               # Tailwind theme extensions
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18 (LTS recommended)
- **npm** ≥ 9
- A **Groq API key** (free) — [Get one here](https://console.groq.com)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Karaok.git
cd Karaok
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example env file and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your keys:

```env
# Supabase (optional — for cloud storage)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Hugging Face Space for source separation
# Leave empty to use mock mode (instant, no real separation)
VITE_HF_SPACE_URL=https://your-username-music-separation.hf.space

# Groq API key for transcription (REQUIRED for real lyrics)
# Get a free key at: https://console.groq.com
VITE_GROQ_API_KEY=gsk_your_key_here

# Set to "true" to use local WebGPU Whisper instead of Groq (downloads ~150MB model)
VITE_ENABLE_WHISPER=false
```

### 4. Start the Development Server

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🎵 How to Use

### Step 1: Upload a Song

- Drag and drop an audio file (MP3, WAV, OGG, FLAC) onto the upload area
- Or click **Choose File** to browse

### Step 2: Wait for Processing

The app processes your song through a 4-stage pipeline:

| Stage | What Happens | Time |
|-------|-------------|------|
| ☁️ **Cloud Queue** | Connects to HF Space | ~5s |
| 🎸 **Separating** | Demucs splits vocals from instruments | ~30-60s |
| 📥 **Model Ready** | Groq API connection check | ~1s |
| 🎤 **Transcribing** | Whisper extracts lyrics with timestamps | ~2-3s |

> **Note:** The first run may take longer if the HF Space is sleeping (cold start). Subsequent runs are faster.

### Step 3: Karaoke Time! 🎤

Once processing completes, you'll see the **karaoke view**:

- **Lyrics** are displayed with real-time highlighting synced to the audio
- **Play/Pause** using the player controls at the bottom
- **Seek** by clicking anywhere on the progress bar
- The **current line** is automatically scrolled into view

---

## ⚙️ Configuration Options

### Transcription Priority

The app uses a 3-tier transcription system:

1. **Groq API** (default, fastest) — Set `VITE_GROQ_API_KEY` in `.env`
2. **WebGPU Whisper** (local) — Set `VITE_ENABLE_WHISPER=true` (downloads ~150MB model)
3. **Mock Mode** (fallback) — Shows demo lyrics if neither is configured

### Mock Mode (No API Keys)

If you don't set any API keys, the app runs in **mock mode**:
- Source separation is simulated (returns original audio as both vocals and instrumental)
- Transcription returns demo lyrics
- Great for UI development and testing

### Hindi / Multilingual Songs

Whisper auto-detects the language. No configuration needed! Supported languages include Hindi, English, Spanish, French, Japanese, Korean, and 90+ more.

To hint a specific language for better accuracy, add this line in `src/services/groq.ts`:

```typescript
formData.append('language', 'hi'); // ISO 639-1 code: hi = Hindi
```

---

## 🔧 Development

### Build for Production

```bash
npm run build
```

Output is generated in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Vite Proxy (Development Only)

The Vite dev server proxies `/api/groq/*` requests to `api.groq.com` to bypass CORS. This is configured in `vite.config.ts` and only applies during development.

For production deployment, you'll need a server-side proxy (e.g., Supabase Edge Function, Cloudflare Worker, or Vercel API route).

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Demucs](https://github.com/facebookresearch/demucs) by Meta Research — AI source separation
- [Whisper](https://github.com/openai/whisper) by OpenAI — Speech recognition
- [Groq](https://groq.com) — Ultra-fast LPU inference
- [Hugging Face Spaces](https://huggingface.co/spaces) — ML model hosting
- [Supabase](https://supabase.com) — Backend as a Service
