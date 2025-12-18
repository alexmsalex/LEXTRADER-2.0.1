# LEXTRADER-IAG: PROTOCOLO DE REQUISITOS DO SISTEMA

## 1. AMBIENTE DE EXECUÇÃO
Para garantir a integridade da arquitetura de Rede Neural Híbrida, o ambiente hospedeiro deve suportar:

*   **Runtime**: Navegador Moderno com suporte a ES Modules e WebGL 2.0 (Chrome 90+, Firefox 88+, Edge).
*   **Aceleração Gráfica**: GPU com suporte a Float32 texturas para simulação de tensores visuais.
*   **Conectividade**: Websocket (WSS) irrestrito para Binance Stream e API Fetch para Google Gemini.

## 2. REQUISITOS DE HARDWARE (SIMULADO/NATIVO)

### Mínimo (Modo Sandbox)
*   **CPU**: 4 Núcleos (2.5GHz+)
*   **RAM**: 8GB (Para manter o buffer de memória de curto prazo do `CognitiveServices`)
*   **Armazenamento**: 500MB (Cache local de engramas neurais via LocalStorage/IndexedDB)

### Recomendado (Modo Nativo/Electron)
*   **CPU**: 8 Núcleos+ (Processamento paralelo dos Agentes de Enxame)
*   **NPU (Neural Processing Unit)**: Desejável para inferência local (simulado via `QuantumCore.ts`)
*   **RAM**: 16GB+ (Para manter histórico profundo de M1/M5 candles em memória)

## 3. CHAVES DE ACESSO (CRÍTICO)
O sistema requer as seguintes credenciais de ambiente para operar em capacidade total (Nível "ASI"):

1.  `API_KEY` (Google GenAI): Para raciocínio profundo, análise de sentimento e síntese de voz.
2.  `BINANCE_API_KEY`: Para leitura de saldo e execução de ordens.
3.  `BINANCE_API_SECRET`: Para assinatura criptográfica de transações.

---
*Geração do Documento: LEXTRADER-CORE v5.1*
*Status: VIGENTE*
