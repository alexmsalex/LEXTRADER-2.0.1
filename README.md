# LEXTRADER-IAG Terminal Quântico

Sistema de trading com Inteligência Artificial Híbrida (Geral e Quântica).

## Instalação

1. Certifique-se de ter o **Node.js** instalado (versão 18+).
2. Instale as dependências:

```bash
npm install
```

## Configuração

Crie um arquivo `.env` na raiz do projeto com sua chave da Google Gemini API:

```env
API_KEY=sua_chave_api_aqui
```

*Nota: O sistema também permite inserir chaves da Binance/cTrader diretamente na interface gráfica.*

## Execução

### Modo Web (Desenvolvimento)
Roda o servidor local em `http://localhost:5173`.

```bash
npm run dev
```

### Modo Desktop (Electron)
Roda a aplicação em uma janela nativa do sistema operacional.

```bash
npm run electron:dev
```

## Build

Para gerar os arquivos estáticos de produção:

```bash
npm run build
```
