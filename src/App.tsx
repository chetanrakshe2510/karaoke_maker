import { useAppStore } from './store/useAppStore';
import { Header } from './components/Header';
import { AudioUpload } from './components/AudioUpload';
import { LoadingOrchestrator } from './components/LoadingStages/LoadingOrchestrator';
import { LyricContainer } from './components/LyricDisplay/LyricContainer';
import { Player } from './components/Player';

function App() {
  const stage = useAppStore((s) => s.stage);
  const error = useAppStore((s) => s.error);

  const isLoading = ['queue', 'separating', 'model-download', 'transcribing', 'polishing'].includes(stage);
  const isReady = stage === 'ready';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center py-8 gap-8">
        {/* Error state */}
        {error && (
          <div className="w-full max-w-lg mx-auto px-4">
            <div className="glass-panel p-4 border-red-500/30 text-center">
              <p className="text-red-400 font-medium text-sm">{error}</p>
              <button
                onClick={() => useAppStore.getState().reset()}
                className="mt-2 text-xs text-gray-400 hover:text-white underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Idle: Upload view */}
        {stage === 'idle' && !error && (
          <div className="flex flex-col items-center gap-8 animate-fade-in">
            <div className="text-center space-y-3">
              <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight">
                <span className="text-gradient">Sing Along</span>
                <br />
                <span className="text-gray-200">With Any Song</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-md mx-auto">
                Drop an audio file and our edge AI will create an instant karaoke experience — 100% free, right in your browser.
              </p>
            </div>
            <AudioUpload />

            {/* Feature badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
              <span className="px-3 py-1.5 rounded-full bg-surface-700/50 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                100% Free
              </span>
              <span className="px-3 py-1.5 rounded-full bg-surface-700/50 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-neon-cyan" />
                Runs Locally
              </span>
              <span className="px-3 py-1.5 rounded-full bg-surface-700/50 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                WebGPU Powered
              </span>
            </div>
          </div>
        )}

        {/* Processing: Loading stages */}
        {isLoading && <LoadingOrchestrator />}

        {/* Ready: Karaoke view */}
        {isReady && (
          <div className="w-full flex flex-col items-center gap-6 animate-fade-in">
            <LyricContainer />
            <Player />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-gray-600">
          Powered by Whisper WebGPU &middot; Demucs &middot; Supabase
        </p>
      </footer>
    </div>
  );
}

export default App;
