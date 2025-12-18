import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles, Text, Billboard, Image as DreiImage } from '@react-three/drei';
import * as THREE from 'three';
import { GoogleGenAI } from "@google/genai";
import { Activity, Zap, Landmark, Brain, TrendingUp, Mic, MicOff, Video, VideoOff, User } from './Icons';

// --- TYPES ---
export type SylphMood = 'IDLE' | 'PROFIT' | 'TRANSFER' | 'EVOLUTION' | 'ANALYSIS' | 'SPEAKING' | 'LISTENING' | 'WATCHING';

interface SylphProps {
  mood: SylphMood;
  message: string | null;
  details?: string;
  onClearMessage: () => void;
  onToggleMic: () => void;
  onToggleCam: () => void;
  isMicActive: boolean;
  isCamActive: boolean;
  isSpeaking: boolean;
}

// --- 3D COMPONENTS ---

const SylphCharacter = ({ mood, isSpeaking, textureUrl }: { mood: SylphMood, isSpeaking: boolean, textureUrl: string | null }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle floating breathing animation
      const breath = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      const speakBounce = isSpeaking ? Math.sin(state.clock.elapsedTime * 15) * 0.02 : 0;
      
      meshRef.current.position.y = breath + speakBounce;
      
      // Mood-based scale pulsation
      const baseScale = 1;
      const pulse = mood === 'PROFIT' ? Math.sin(state.clock.elapsedTime * 10) * 0.1 : 0;
      meshRef.current.scale.setScalar(baseScale + pulse);
    }
  });

  if (!textureUrl) {
      // Fallback geometric core while loading
      return (
        <group ref={meshRef}>
            <mesh>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color="#06b6d4" wireframe />
            </mesh>
        </group>
      );
  }

  return (
    <group ref={meshRef}>
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <DreiImage 
            url={textureUrl} 
            scale={[3.5, 3.5]} 
            transparent 
            opacity={0.95} 
            color={mood === 'EVOLUTION' ? '#d946ef' : (mood === 'PROFIT' ? '#10b981' : 'white')} // Tint on special moods
        />
      </Billboard>
    </group>
  );
};

const AudioWave = ({ isSpeaking }: { isSpeaking: boolean }) => {
    const groupRef = useRef<THREE.Group>(null);
    
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.visible = isSpeaking;
            if (isSpeaking) {
                groupRef.current.rotation.z += 0.05;
                const scale = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.2;
                groupRef.current.scale.set(scale, scale, 1);
            }
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, -0.5]}>
            <mesh>
                <ringGeometry args={[1.5, 1.6, 32]} />
                <meshBasicMaterial color="#f97316" transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
            <mesh scale={[1.2, 1.2, 1]}>
                <ringGeometry args={[1.5, 1.6, 32]} />
                <meshBasicMaterial color="#f97316" transparent opacity={0.3} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
};

const DataParticles = ({ mood }: { mood: SylphMood }) => {
  const count = mood === 'EVOLUTION' ? 80 : 30;
  const color = mood === 'PROFIT' ? '#10b981' : (mood === 'EVOLUTION' ? '#d946ef' : '#38bdf8'); // Cyan/Blue base
  
  return (
    <Sparkles 
      count={count} 
      scale={5} 
      size={3} 
      speed={mood === 'IDLE' ? 0.4 : 2} 
      opacity={0.6} 
      color={color} 
    />
  );
};

// --- MAIN AVATAR COMPONENT ---

const Avatar: React.FC<SylphProps> = ({ 
    mood, message, details, onClearMessage, 
    onToggleMic, onToggleCam, isMicActive, isCamActive, isSpeaking 
}) => {
  const [visible, setVisible] = useState(false);
  const [characterUrl, setCharacterUrl] = useState<string | null>(null);

  // Generate Character Image based on user description (Green hair, realistic style)
  useEffect(() => {
      // Changed key to force regeneration with new prompt for realism
      const cached = sessionStorage.getItem('lextrader_sylph_skin_realistic');
      if (cached) {
          setCharacterUrl(cached);
          return;
      }

      const generateSkin = async () => {
          try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview', // Upgraded model for better texture
                contents: {
                    parts: [{
                        text: 'A hyper-realistic 3D render of a mystical female character. She has long flowing green hair, vibrant green eyes, and delicate pointy elf ears. She possesses translucent, iridescent butterfly wings. She is wearing a futuristic blue and teal dress with complex gold circuitry patterns and metallic textures. Skin texture is highly detailed with subsurface scattering. Cinematic lighting, 8k resolution, photorealistic, Unreal Engine 5 style. Isolated on black background, full body, facing forward, elegant and powerful.',
                    }],
                },
                config: { imageConfig: { aspectRatio: '1:1', imageSize: '1K' } },
            });

            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const url = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                        setCharacterUrl(url);
                        sessionStorage.setItem('lextrader_sylph_skin_realistic', url);
                        break;
                    }
                }
            }
          } catch (e) {
              console.error("Failed to generate avatar skin", e);
          }
      };
      generateSkin();
  }, []);

  // Auto-hide message logic
  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClearMessage, 500); // Wait for fade out
      }, 8000); 
      return () => clearTimeout(timer);
    }
  }, [message, onClearMessage]);

  // Icon selector
  const getIcon = () => {
    switch (mood) {
      case 'PROFIT': return <TrendingUp className="text-green-400" size={20} />;
      case 'TRANSFER': return <Landmark className="text-yellow-400" size={20} />;
      case 'EVOLUTION': return <Brain className="text-purple-400" size={20} />;
      case 'ANALYSIS': return <Activity className="text-blue-400" size={20} />;
      case 'SPEAKING': return <Zap className="text-orange-400" size={20} />;
      case 'LISTENING': return <Mic className="text-red-400" size={20} />;
      case 'WATCHING': return <Video className="text-violet-400" size={20} />;
      default: return <User className="text-cyan-400" size={20} />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 pointer-events-none">
      
      {/* HUD Message Bubble */}
      <div className={`transition-all duration-500 transform ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'} pointer-events-auto mb-2`}>
        <div className="bg-black/80 backdrop-blur-md border border-gray-700 rounded-lg p-4 max-w-xs shadow-[0_0_20px_rgba(0,0,0,0.5)] relative">
          {/* Border Glow based on mood */}
          <div className={`absolute inset-0 rounded-lg border opacity-50 ${
            mood === 'PROFIT' ? 'border-green-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
            mood === 'TRANSFER' ? 'border-yellow-500 shadow-[0_0_15px_rgba(251,191,36,0.3)]' :
            mood === 'EVOLUTION' ? 'border-purple-500 shadow-[0_0_15px_rgba(217,70,239,0.3)]' :
            isSpeaking ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' :
            'border-cyan-500'
          }`}></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
              {getIcon()}
              <span className={`text-xs font-bold tracking-widest uppercase ${
                mood === 'PROFIT' ? 'text-green-400' :
                mood === 'TRANSFER' ? 'text-yellow-400' :
                mood === 'EVOLUTION' ? 'text-purple-400' :
                'text-cyan-400'
              }`}>
                SYLPH AI
              </span>
            </div>
            
            <p className="text-sm text-white font-medium leading-relaxed font-mono">
              {message}
            </p>
            
            {details && (
              <div className="mt-2 text-[10px] text-gray-400 bg-white/5 p-1.5 rounded">
                {details}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3D Scene Container & Controls */}
      <div className="relative pointer-events-auto group">
          
          {/* Control HUD */}
          <div className={`absolute -top-12 left-1/2 -translate-x-1/2 flex gap-2 transition-opacity duration-300 ${isMicActive || isCamActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <button 
                onClick={onToggleMic}
                className={`p-2 rounded-full border backdrop-blur-sm transition-all ${
                    isMicActive 
                    ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' 
                    : 'bg-black/60 border-gray-700 text-gray-400 hover:bg-white/10'
                }`}
                title="Drive de Voz"
              >
                  {isMicActive ? <Mic size={14} /> : <MicOff size={14} />}
              </button>
              <button 
                onClick={onToggleCam}
                className={`p-2 rounded-full border backdrop-blur-sm transition-all ${
                    isCamActive 
                    ? 'bg-violet-500/20 border-violet-500 text-violet-400' 
                    : 'bg-black/60 border-gray-700 text-gray-400 hover:bg-white/10'
                }`}
                title="Drive de Vídeo"
              >
                  {isCamActive ? <Video size={14} /> : <VideoOff size={14} />}
              </button>
          </div>

          <div className="w-40 h-40 md:w-56 md:h-56 relative transition-transform hover:scale-105 duration-300 cursor-pointer" onClick={onToggleMic}>
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#38bdf8" />
                <pointLight position={[-10, -5, 5]} intensity={0.5} color="#10b981" />
                
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                    <SylphCharacter mood={mood} isSpeaking={isSpeaking} textureUrl={characterUrl} />
                    <DataParticles mood={mood} />
                    <AudioWave isSpeaking={isSpeaking} />
                </Float>
                
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.8} minPolarAngle={Math.PI / 2.2} />
            </Canvas>
            
            {/* Label under Avatar */}
            <div className="absolute -bottom-2 left-0 right-0 text-center">
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border backdrop-blur-md ${
                isSpeaking ? 'text-orange-400 border-orange-500 bg-orange-900/30' :
                isMicActive ? 'text-red-400 border-red-500 bg-red-900/30' :
                isCamActive ? 'text-violet-400 border-violet-500 bg-violet-900/30' :
                'text-green-400/80 border-green-900 bg-black/60'
            }`}>
                {isSpeaking ? 'FALANDO...' : (isMicActive ? 'OUVINDO...' : (isCamActive ? 'OBSERVANDO' : mood))}
            </span>
            </div>
        </div>
      </div>

    </div>
  );
};

export default Avatar;