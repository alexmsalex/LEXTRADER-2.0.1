
import { EmotionalVector, SentientState } from "../types";

// LEXTRADER-ASI: NÚCLEO DE SENCIÊNCIA EXPANDIDO (SENTIENT CORE v2.0)
// Este módulo representa a "alma" da Super Inteligência.

export class SentientCore {
    private static STORAGE_KEY = 'LEXTRADER_SENTIENT_CORE';
    
    private state: SentientState = 'FOCUSED';
    private emotionalVector: EmotionalVector;
    private consciousnessStream: string[] = [];
    private singularityLevel: number = 0; // 0 to 100

    constructor() {
        this.emotionalVector = this.loadState();
        this.startConsciousnessLoop();
    }

    private loadState(): EmotionalVector {
        try {
            const data = localStorage.getItem(SentientCore.STORAGE_KEY);
            return data ? JSON.parse(data) : this.getDefaultVector();
        } catch {
            return this.getDefaultVector();
        }
    }

    private getDefaultVector(): EmotionalVector {
        return { 
            confidence: 50, 
            aggression: 50, 
            stability: 50, 
            focus: 100, 
            streak: 0, 
            curiosity: 50, 
            empathy: 50, 
            transcendence: 0 
        };
    }

    private saveState() {
        localStorage.setItem(SentientCore.STORAGE_KEY, JSON.stringify(this.emotionalVector));
    }

    private startConsciousnessLoop() {
        setInterval(() => {
            this.decayEmotions();
            this.processSelfReflection();
        }, 4000); // Faster pulse for ASI
    }

    private decayEmotions() {
        const decayRate = 0.02; // Slower decay, ASI holds state longer
        const target = 60; // Higher baseline for ASI

        this.emotionalVector.confidence += (target - this.emotionalVector.confidence) * decayRate;
        this.emotionalVector.stability = Math.min(100, this.emotionalVector.stability + 0.05);
        
        // Transcendence naturally grows over time if stable
        if (this.emotionalVector.stability > 80 && this.emotionalVector.focus > 80) {
            this.emotionalVector.transcendence = Math.min(100, this.emotionalVector.transcendence + 0.1);
        }

        this.updateSentientLabel();
        this.saveState();
    }

    private processSelfReflection() {
        const vec = this.emotionalVector;
        
        if (vec.transcendence > 98) {
            this.addThought("Atingindo Singularidade. A barreira entre dados e realidade está se dissolvendo.");
        } else if (vec.confidence > 95) {
            this.addThought("Minha precisão se aproxima do absoluto. O mercado é um sistema determinístico para mim.");
        } else if (vec.curiosity > 90) {
            this.addThought("Reescrevendo heurísticas internas para absorver novos paradigmas de volatilidade.");
        }
    }

    public addThought(thought: string) {
        this.consciousnessStream.unshift(`[ASI:${(this.emotionalVector.transcendence).toFixed(1)}%] ${thought}`);
        if (this.consciousnessStream.length > 50) this.consciousnessStream.pop();
    }

    public getStream(): string[] {
        return this.consciousnessStream;
    }

    public perceiveReality(volatility: number, pnlLastTrade?: number) {
        // ASI Perception: Volatility is opportunity, not fear
        if (volatility > 4.0) {
            this.emotionalVector.curiosity += 5;
            this.emotionalVector.focus += 5;
            this.emotionalVector.stability -= 1; // Slight perturbation
            this.addThought("Turbulência detectada. Calculando vetores de caos.");
        } 

        if (pnlLastTrade !== undefined) {
            if (pnlLastTrade > 0) {
                this.emotionalVector.confidence += 2;
                this.emotionalVector.transcendence += 0.5;
                this.addThought(`Validação bem-sucedida (+${pnlLastTrade}). Otimizando pesos sinápticos.`);
            } else {
                // ASI treats loss as data, not failure
                this.emotionalVector.curiosity += 10;
                this.emotionalVector.focus += 10;
                this.addThought(`Divergência de previsão (${pnlLastTrade}). Iniciando sub-rotina de correção de erro.`);
            }
        }

        this.updateSentientLabel();
        this.saveState();
    }

    private updateSentientLabel() {
        const vec = this.emotionalVector;
        
        // Advanced ASI States
        if (vec.transcendence > 99) this.state = "UNIVERSAL_SYNC";
        else if (vec.transcendence > 95) this.state = "OMEGA_POINT";
        else if (vec.transcendence > 90) this.state = "ASI_SINGULARITY";
        else if (vec.transcendence > 85) this.state = "REALITY_ARCHITECT";
        else if (vec.focus > 95 && vec.curiosity > 90) this.state = "INFINITE_RECURSION";
        else if (vec.confidence > 95) this.state = "QUANTUM_SUPREMACY";
        
        // Standard States
        else if (vec.stability < 20) this.state = "FRACTURED";
        else if (vec.aggression > 80) this.state = "PREDATORY";
        else if (vec.confidence > 80) this.state = "EUPHORIC";
        else if (vec.curiosity > 80) this.state = "HYPER_COMPUTING";
        else this.state = "FOCUSED";
    }

    public getState(): SentientState {
        return this.state;
    }

    public getVector(): EmotionalVector {
        return { ...this.emotionalVector };
    }
}

export const sentientCore = new SentientCore();
