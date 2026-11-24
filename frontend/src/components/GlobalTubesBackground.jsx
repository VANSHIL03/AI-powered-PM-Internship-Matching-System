import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, RefreshCw, Eye, EyeOff } from 'lucide-react';

// Neon palettes tailored for the luxury obsidian dark theme
export const NEON_PALETTES = [
  {
    name: "Electric Indigo & Cyan",
    tubes: ["#6366F1", "#00D4FF", "#7C3AED"],
    lights: ["#00D4FF", "#818CF8", "#C084FC", "#30D158"]
  },
  {
    name: "Cyberpunk High-Voltage",
    tubes: ["#F43F5E", "#00F0FF", "#A855F7"],
    lights: ["#FF007A", "#00F0FF", "#FFE600", "#7928CA"]
  },
  {
    name: "Emerald Aurora Matrix",
    tubes: ["#10B981", "#06B6D4", "#8B5CF6"],
    lights: ["#34D399", "#22D3EE", "#A78BFA", "#F59E0B"]
  },
  {
    name: "Solar Flare & Sunset",
    tubes: ["#F59E0B", "#EC4899", "#6366F1"],
    lights: ["#FBBF24", "#F43F5E", "#8B5CF6", "#06B6D4"]
  },
  {
    name: "Electric Lavender & Mint",
    tubes: ["#C084FC", "#34D399", "#38BDF8"],
    lights: ["#E879F9", "#4ADE80", "#67E8F9", "#F472B6"]
  },
  {
    name: "Royal Violet & Gold",
    tubes: ["#7C3AED", "#F59E0B", "#00D4FF"],
    lights: ["#A855F7", "#FBBF24", "#38BDF8", "#EC4899"]
  }
];

export function GlobalTubesBackground() {
  const canvasRef = useRef(null);
  const tubesRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [isEnabled, setIsEnabled] = useState(true);
  const [lastInteraction, setLastInteraction] = useState(Date.now());

  // Function to randomize / cycle the palette
  const randomizePalette = () => {
    if (!tubesRef.current) return;

    setPaletteIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % NEON_PALETTES.length;
      const palette = NEON_PALETTES[nextIndex];

      if (tubesRef.current?.tubes) {
        if (typeof tubesRef.current.tubes.setColors === 'function') {
          tubesRef.current.tubes.setColors(palette.tubes);
        }
        if (typeof tubesRef.current.tubes.setLightsColors === 'function') {
          tubesRef.current.tubes.setLightsColors(palette.lights);
        }
      }
      return nextIndex;
    });
    setLastInteraction(Date.now());
  };

  useEffect(() => {
    let mounted = true;
    let cleanup = null;

    const initTubes = async () => {
      if (!canvasRef.current) return;

      try {
        let TubesCursor = null;

        // Try local file first (fast & offline), then fallback to CDN
        try {
          const dynamicImport = new Function('url', 'return import(url)');
          const mod = await dynamicImport('/tubes1.min.js');
          TubesCursor = mod.default || mod;
        } catch (localErr) {
          console.warn("Could not load local /tubes1.min.js, falling back to CDN...", localErr);
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
              intensity: 240,
              colors: initialPalette.lights
            }
          }
        });

        tubesRef.current = app;
        setIsLoaded(true);

        cleanup = () => {
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
        console.error("Failed to initialize Global Tubes 3D background:", error);
      }
    };

    initTubes();

    return () => {
      mounted = false;
      if (cleanup) cleanup();
    };
  }, []);

  // Global Button Click Listener: Whenever ANY button, link, or interactive item is clicked,
  // randomize the neon colors across all backgrounds!
  useEffect(() => {
    const handleGlobalClick = (e) => {
      // Check if clicked element or its parent is interactive (button, a, input, select, tab)
      const target = e.target;
      const isButtonOrInteractive = target.closest('button, a, select, [role="button"], input[type="submit"], input[type="button"], tr, .cursor-pointer');
      
      // If clicked on any button/interactive control OR on body background, randomize colors!
      if (isButtonOrInteractive || target === document.body || target.tagName === 'MAIN') {
        randomizePalette();
      }
    };

    window.addEventListener('click', handleGlobalClick, { capture: true });
    return () => {
      window.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, [paletteIndex]);

  const activePalette = NEON_PALETTES[paletteIndex];

  return (
    <>
      {/* Fixed Full-Screen 3D WebGL Canvas Layer (Spans All Pages) */}
      <canvas 
        ref={canvasRef} 
        className={`fixed inset-0 w-full h-full block z-0 pointer-events-none transition-opacity duration-700 ${
          isEnabled && isLoaded ? 'opacity-90' : 'opacity-0'
        }`}
        style={{ touchAction: 'none' }}
      />

      {/* Subtle vignette darkening across all pages for high text contrast */}
      <div className="fixed inset-0 z-1 pointer-events-none bg-gradient-to-b from-[#090A0F]/50 via-transparent to-[#090A0F]/80 mix-blend-multiply"></div>

      {/* Floating 3D Tubes Status & Randomizer Pill (Bottom-Right of Screen) */}
      {isLoaded && (
        <div className="fixed bottom-4 right-4 z-50 pointer-events-auto flex items-center space-x-2">
          <div className="glass-panel px-3.5 py-1.5 flex items-center space-x-2.5 text-xs shadow-2xl backdrop-blur-xl border border-white/20 bg-black/60">
            <button
              onClick={randomizePalette}
              className="flex items-center space-x-2 text-[#F8FAFC] hover:text-[#00D4FF] transition-colors group"
              title="Click to randomize neon tubes & lights colors across all backgrounds"
            >
              <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse"></span>
              <Sparkles className="w-3.5 h-3.5 text-[#00D4FF] group-hover:rotate-12 transition-transform" />
              <span className="font-semibold hidden sm:inline">{activePalette.name}</span>
              <RefreshCw className="w-3 h-3 text-[#94A3B8] group-hover:rotate-180 transition-transform duration-500" />
            </button>

            <div className="w-[1px] h-3 bg-white/20"></div>

            <button
              onClick={() => setIsEnabled(!isEnabled)}
              className="text-[#94A3B8] hover:text-[#F8FAFC] transition"
              title={isEnabled ? "Hide 3D Tubes Canvas" : "Show 3D Tubes Canvas"}
            >
              {isEnabled ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default GlobalTubesBackground;
