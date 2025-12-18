
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Brain } from './Icons';

const AppLogo: React.FC = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generateLogo = async () => {
      // Check if logo is already cached in session storage to save API calls
      const cachedLogo = sessionStorage.getItem('lextrader_logo');
      if (cachedLogo) {
        setLogoUrl(cachedLogo);
        return;
      }

      setLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{
              text: 'A futuristic, minimalist logo for a Quantum AI Trading system named LEXTRADER. The design should feature a stylized brain or neural network merged with quantum wave functions and financial candlestick charts. Cyberpunk aesthetic, neon blue and cyan colors on a black background. High tech, sleek, professional icon style.',
            }],
          },
          config: {
            imageConfig: {
              aspectRatio: '1:1',
            }
          },
        });

        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              const base64Image = part.inlineData.data;
              const mimeType = part.inlineData.mimeType || 'image/png';
              const url = `data:${mimeType};base64,${base64Image}`;
              setLogoUrl(url);
              sessionStorage.setItem('lextrader_logo', url);
              break;
            }
          }
        }
      } catch (error) {
        console.error("Failed to generate logo:", error);
      } finally {
        setLoading(false);
      }
    };

    generateLogo();
  }, []);

  if (loading) {
    return (
      <div className="w-10 h-10 rounded bg-black/50 flex items-center justify-center animate-pulse border border-quantum-900">
        <Brain size={20} className="text-quantum-500 opacity-50" />
      </div>
    );
  }

  if (logoUrl) {
    return (
      <img src={logoUrl} alt="LEXTRADER Logo" className="w-10 h-10 rounded object-cover border border-quantum-500/30 shadow-[0_0_10px_rgba(14,165,233,0.3)]" />
    );
  }

  // Fallback icon
  return <Brain className="text-quantum-500 animate-pulse" size={24} />;
};

export default AppLogo;
