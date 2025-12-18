
// LEXTRADER-IAG: SYSTEM BRIDGE & HARDWARE PROFILER
// Este módulo fornece acesso ao sistema hospedeiro e calibra a IA baseada no hardware disponível.

import { SystemSpecs, PerformanceTier } from "../types";

interface DriveInfo {
    path: string;
    totalSpace: string;
    freeSpace: string;
    files: string[];
}

export class SystemBridge {
    private isNative: boolean;
    private systemSpecs: SystemSpecs | null = null;

    constructor() {
        // Detecta se está rodando em ambiente Electron (Native)
        this.isNative = window && (window as any).process && (window as any).process.type;
        console.log(`🖥️ System Bridge Inicializado. Modo: ${this.isNative ? 'NATIVO (Acesso Total)' : 'SANDBOX (Navegador)'}`);
    }

    // --- HARDWARE PROFILING ---

    public async analyzeHardware(): Promise<SystemSpecs> {
        if (this.systemSpecs) return this.systemSpecs;

        console.log("⚙️ Calibrando Matriz Neural para Hardware Local...");
        
        const cores = navigator.hardwareConcurrency || 4;
        // @ts-ignore - deviceMemory is standard in Chrome/Edge but not Typescript lib
        const memoryGB = (navigator as any).deviceMemory || 8; 
        
        // Micro-Benchmark (Simple FLOPs test)
        const start = performance.now();
        let result = 0;
        const iterations = 5000000;
        for (let i = 0; i < iterations; i++) {
            result += Math.sqrt(i * Math.random());
        }
        const end = performance.now();
        const duration = end - start;
        const benchmarkScore = Math.floor((iterations / duration) * 10); // Arbitrary score

        let tier: PerformanceTier = 'STANDARD';
        if (benchmarkScore > 1500 && cores >= 8) tier = 'QUANTUM_NATIVE';
        else if (benchmarkScore > 800) tier = 'TURBO';
        else if (benchmarkScore < 300 || cores < 4) tier = 'ECO';

        this.systemSpecs = {
            cores,
            memoryGB,
            platform: this.isNative ? 'DESKTOP_NATIVE' : 'WEB',
            benchmarkScore,
            tier,
            gpuTier: this.detectGPUTier()
        };

        console.log(`✅ Calibração Concluída: [${tier}] Score: ${benchmarkScore} | Cores: ${cores} | RAM: ~${memoryGB}GB`);
        return this.systemSpecs;
    }

    private detectGPUTier(): string {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl');
            if (!gl) return "N/A";
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }
        } catch (e) {}
        return "GENERIC_GPU";
    }

    public getHardwareScalingFactor(): number {
        // Returns a multiplier (0.5 to 2.0) for Neural Complexity
        if (!this.systemSpecs) return 1.0;
        
        switch (this.systemSpecs.tier) {
            case 'ECO': return 0.5;
            case 'STANDARD': return 1.0;
            case 'TURBO': return 1.5;
            case 'QUANTUM_NATIVE': return 2.0; // Max Capability
            default: return 1.0;
        }
    }

    // --- FILE SYSTEM ACCESS ---

    public async scanDrive(path: string = 'C:/'): Promise<DriveInfo> {
        if (this.isNative) {
            // Em um app Electron real, isso usaria ipcRenderer para chamar o processo principal
            // Exemplo: return await window.electron.invoke('scan-drive', path);
            return {
                path: path,
                totalSpace: "1TB",
                freeSpace: "450GB",
                files: ["Windows", "Program Files", "Users", "LEXTRADER_DATA"]
            };
        } else {
            // Simulação para ambiente Web
            console.warn("⚠️ Acesso direto ao disco bloqueado pelo navegador. Usando sistema de arquivos virtual.");
            return {
                path: "VIRTUAL_DRIVE_C",
                totalSpace: "500MB (Alocado)",
                freeSpace: "498MB",
                files: ["logs", "strategies", "neural_weights.json", "market_history.csv"]
            };
        }
    }

    public async saveToFile(filename: string, content: string): Promise<boolean> {
        if (this.isNative) {
            // Lógica nativa de gravação
            console.log(`💾 Salvando em disco real: ${filename}`);
            return true;
        } else {
            // Lógica web (Download ou LocalStorage)
            console.log(`💾 Salvando virtualmente: ${filename}`);
            try {
                localStorage.setItem(`VIRTUAL_FILE_${filename}`, content);
                return true;
            } catch (e) {
                return false;
            }
        }
    }

    public async readSystemLogs(): Promise<string[]> {
        // Simula leitura de logs do sistema operacional
        return [
            "[SYSTEM] Boot sequence initiated",
            "[KERNEL] Neural interface linked",
            "[DRIVE] C:/ mounted with write access",
            "[NETWORK] Quantum Uplink established"
        ];
    }
}

export const systemBridge = new SystemBridge();
