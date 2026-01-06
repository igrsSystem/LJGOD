# LJGOD - App de Captura de Fotos

App React para captura de fotos com câmera e registro de status de pagamento.

## 🚀 Como Executar

### 1. Instalar dependências
```bash
npm install
```

### 2. Executar em modo desenvolvimento
```bash
npm run dev
```

### 3. Acessar no navegador
Abra o link que aparecer no terminal (geralmente `http://localhost:5173`)

## 📱 Funcionalidades

- **Captura de Fotos**: Usa a câmera do dispositivo (API nativa do navegador)
- **Lista de Fotos**: Exibe todas as fotos capturadas
- **Status de Pagamento**: Botão toggle para marcar como Pago/Não Pago
- **Forma de Pagamento**: Dropdown com opções (Dinheiro, Débito, Crédito)

## 🛠️ Tecnologias

- React 18
- Vite
- CSS puro
- MediaDevices API (câmera nativa)

## 📝 Estrutura do Projeto

```
LJGOD/
├── src/
│   ├── components/
│   │   ├── PhotoItem.jsx
│   │   └── PhotoItem.css
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

## 📌 Observações

- A câmera só funciona em conexões HTTPS ou localhost
- No celular, usa automaticamente a câmera traseira
- As fotos são armazenadas em Base64 no estado do React
