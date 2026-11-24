import React, { useEffect, useRef, useState } from 'react';
import { MousePointer2, Sparkles, RefreshCw } from 'lucide-react';

// Neon color palettes tailored for the ultra-premium dark theme
const NEON_PALETTES = [
  // 1. Electric Indigo & Cyan (Default)
  {
    tubes: ["#6366F1", "#00D4FF", "#7C3AED"],
    lights: ["#00D4FF", "#818CF8", "#C084FC", "#30D158"]
  },
  // 2. Cyberpunk Neon
  {
    tubes: ["#F43F5E", "#00F0FF", "#A855F7"],
    lights: ["#FF007A", "#00F0FF", "#FFE600", "#7928CA"]
  },
  // 3. Emerald & Aurora
  {
    tubes: ["#10B981", "#06B6D4", "#8B5CF6"],
    lights: ["#34D399", "#22D3EE", "#A78BFA", "#F59E0B"]
  },
  // 4. Solar Flare & Gold
  {
    tubes: ["#F59E0B", "#EC4899", "#6366F1"],
    lights: ["#FBBF24", "#F43F5E", "#8B5CF6", "#06B6D4"]
  },
  // 5. Electric Lavender & Mint
  {
    tubes: ["#C084FC", "#34D399", "#38BDF8"],
    lights: ["#E879F9", "#4ADE80", "#67E8F9", "#F472B6"]
  }
];

export function TubesBackground({ 
  children, 
  className = "",
  enableClickInteraction = true,
  showHint = true
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const tubesRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [paletteIndex, setPaletteIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    let cleanup = null;

    const initTubes = async () => {
      if (!canvasRef.current) return;

      try {
        let TubesCursor = null;

        // Try local file first (fast & offline), then fallback to CDN
        try {
          // Dynamic import using Function to bypass build-time bundling issues
          const dynamicImport = new Function('url', 'return import(url)');
          const mod = await dynamicImport('/tubes1.min.js');
          TubesCursor = mod.default || mod;
        } catch (localErr) {
          console.warn("Could not load local /tubes1.min.js, trying CDN fallback...", localErr);
          const dynamicImport = new Function('url', 'return import(url)');
          const mod = await dynamicImport('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js');
          TubesCursor = mod.default || mod;
        }

        if (!mounted || !TubesCursor || !canvasRef.current) return;

        const initialPalette = NEON_PALETTES[0];

        const app = TubesCursor(canvasRef.current, {
          tubes: {
            colors: initialPalette.tubes,
            lights: {
              intensity: 220,
              colors: initialPalette.lights
            }
          }
        });

        tubesRef.current = app;
        setIsLoaded(true);

        const handleResize = () => {
          // The threejs-components library automatically tracks canvas size and window resize
        };

        window.addEventListener('resize', handleResize);
        
        cleanup = () => {
          window.removeEventListener('resize', handleResize);
          if (app && typeof app.dispose === 'function') {
            try {
              app.dispose();
            } catch (e) {
              console.warn("TubesCursor dispose:", e);
            }
          }
          tubesRef.current = null;
        };

      } catch (error) {
        console.error("Failed to initialize TubesCursor 3D background:", error);
      }
    };

    initTubes();

    return () => {
      mounted = false;
      if (cleanup) cleanup();
    };
  }, []);

  const randomizePalette = () => {
    if (!enableClickInteraction || !tubesRef.current) return;

    const nextIndex = (paletteIndex + 1) % NEON_PALETTES.length;
    setPaletteIndex(nextIndex);

    const palette = NEON_PALETTES[nextIndex];
    if (tubesRef.current.tubes) {
      if (typeof tubesRef.current.tubes.setColors === 'function') {
        tubesRef.current.tubes.setColors(palette.tubes);
      }
      if (typeof tubesRef.current.tubes.setLightsColors === 'function') {
        tubesRef.current.tubes.setLightsColors(palette.lights);
      }
    }
  };

  const handleClick = (e) => {
    // Only randomize if clicking the canvas background (not interactive buttons or inputs)
    const target = e.target;
    const isInteractive = target.closest('button, a, input, textarea, select, [role="button"], .pointer-events-auto');
    if (!isInteractive && enableClickInteraction) {
      randomizePalette();
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-[#090A0F] ${className}`}
      onClick={handleClick}
    >
      {/* 3D WebGL Canvas Layer */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full block z-0 transition-opacity duration-700"
        style={{ 
          touchAction: 'none',
          opacity: isLoaded ? 0.9 : 0
        }}
      />

      {/* Subtle vignette darkening to maintain high readability of text */}
      <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-b from-[#090A0F]/60 via-transparent to-[#090A0F] mix-blend-multiply"></div>

      {/* Interactive Micro-chip hint in top-right or bottom-right */}
      {showHint && isLoaded && (
        <div className="absolute top-4 right-4 z-20 pointer-events-auto hidden sm:flex items-center space-x-2">
          <button
            onClick={randomizePalette}
            className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-[11px] text-[#F8FAFC] backdrop-blur-md transition-all flex items-center space-x-1.5 shadow-lg shadow-black/40 group hover:scale-105 active:scale-95"
            title="Randomize 3D Neon Tubes & Lights"
          >
            <Sparkles className="w-3 h-3 text-[#00D4FF] group-hover:rotate-12 transition-transform" />
            <span className="font-medium">3D Neon Colors</span>
            <RefreshCw className="w-2.5 h-2.5 text-[#94A3B8] ml-0.5" />
          </button>
        </div>
      )}

      {/* Content Overlay */}
      <div className="relative z-10 w-full pointer-events-none">
        {children}
      </div>
    </div>
  );
}

export default TubesBackground;
