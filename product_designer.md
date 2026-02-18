# UI/UX Design Blueprint: Edge-Powered AI Karaoke

## 1. Core Design Philosophy
**Objective:** Bridge the gap between human cognition and AI audio processing by minimizing cognitive load, while gracefully managing the variable latency of Edge/Serverless computing.

When a user sings, they are concurrently listening to rhythm, recalling melody, and processing text. The interface must adapt to human ergonomic limitations—specifically visual processing speeds—rather than forcing the user to adapt to the software. 

## 2. The "Serverless" User Journey & Loading UX
Because we are utilizing free Hugging Face Spaces for audio separation and local WebGPU for transcription, the user will experience distinct loading phases. **Do not use a generic spinning wheel.** We must use progressive, determinate loading states to build trust and prevent the user from closing the tab.

### The 4-Stage Loading Interface
1. **The Cloud Queue (Hugging Face API):** * *UX Goal:* Manage expectations for free-tier cloud limits.
   * *UI Design:* Display a status message like *"Connecting to Cloud GPU..."* or *"Waiting in Queue: Position 2"*. If the Hugging Face Space is waking up from sleep mode, show a specific "Waking up server (this may take up to 60s)" warning.
2. **Source Separation (Cloud Inference):**
   * *UX Goal:* Show active work.
   * *UI Design:* A pulsing equalizer animation paired with the text: *"Extracting vocals and instruments..."*
3. **Model Caching (WebGPU / Transformers.js):**
   * *UX Goal:* Explain why their browser is suddenly downloading data. Whisper ONNX models can be 50MB+. 
   * *UI Design:* A determinate progress bar tracking the exact megabytes downloaded: *"Downloading secure, local transcription engine (35MB / 50MB)..."* **Crucial:** Add a note saying, *"This only happens once!"* so they know future songs will be instant.
4. **Local Transcription (Edge Inference):**
   * *UX Goal:* Capitalize on the "cool factor" of local AI.
   * *UI Design:* Display a terminal-style window or a rapidly updating text box showing the words appearing on screen *as the WebGPU processes them in real-time*. This turns a "loading screen" into an entertaining feature.



## 3. The Psychology of Reading (Visual Ergonomics)
Once the app loads, the human eye does not read smoothly; it jumps in rapid movements called **saccades**, processing chunks of information at a time. 

* **The Look-Ahead Rule:** The user’s visual focus is always 1 to 2 seconds *ahead* of the word they are actively vocalizing. 
* **Implementation:** The UI must feature a **Look-Ahead Buffer**. Never display only the current line. Always display the active line and at least one upcoming line so the user's eyes can safely plan their next saccade without cognitive friction.

## 4. The Lyric Animation Engine (Continuous Fill)
Standard "bouncing ball" or blocky word-by-word highlights disrupt natural reading flows. We will use a **Continuous Fill Highlight** driven by the Transformers.js timestamp data.

* **Syllabic Sweeping:** The frontend rendering engine (`requestAnimationFrame`) must interpolate the WebGPU timestamps to create a smooth, left-to-right color sweep that mimics natural phonetic delivery. 
* **Syntactic Formatting:** Break lines based on natural syntactic boundaries (clauses or breaths) rather than strict character counts. 
* **Instrumental Cues:** During instrumental sections isolated by Demucs, provide a clear visual countdown (e.g., shrinking progress bar) mapped exactly to the millisecond the next vocal morpheme begins.



## 5. Visual Design & Accessibility (Tailwind CSS)
Because we are using Tailwind CSS, implementing high-visibility contrast is straightforward.

* **Typography:** Utilize heavy, bold, Sans-Serif fonts (e.g., `font-sans font-black tracking-tight`). 
* **High-Contrast Color Palette:**
  * **Unsung Text:** Light gray (`text-gray-200`) with a heavy drop-shadow (`drop-shadow-xl`).
  * **Active Fill (Sung Text):** A vibrant, high-visibility color such as Electric Yellow (`text-yellow-400`) or Neon Cyan (`text-cyan-400`).
  * **Background Overlay:** Apply a heavy dark overlay (`bg-black/70` or `backdrop-blur-md bg-black/50`) over any background visualizer to ensure text contrast never drops below WCAG accessibility standards.

---

## 6. Animation Styles Comparison

| Animation Style | Description | Usability Impact | Recommendation |
| :--- | :--- | :--- | :--- |
| **Continuous Fill** | Color smoothly fills letters left-to-right. | **Low Cognitive Load.** Matches natural vocal flow perfectly. | **Primary Choice.** |
| **Word-by-Word Pop**| Entire words change color instantly. | **Medium Cognitive Load.** Highly readable but feels robotic. | Fallback for slow/old mobile devices. |
| **Bouncing Ball** | A visual indicator hops from word to word. | **High Cognitive Load.** Distracting; hides duration of syllables. | **Avoid.** |