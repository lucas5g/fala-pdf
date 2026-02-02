# 📖 Leitor de PDF com Áudio (Text-to-Speech)

Aplicação web frontend para leitura de arquivos PDF com funcionalidade de Text-to-Speech usando APIs nativas do navegador.

## 🎯 Funcionalidades

- ✅ Upload e visualização de arquivos PDF
- ✅ Navegação página por página
- ✅ Extração e exibição de texto de cada página
- ✅ Leitura em áudio usando Web Speech API (TTS)
- ✅ Controles de áudio: Play, Pause, Stop
- ✅ Rotas por página usando hash navigation (#page=1, #page=2...)
- ✅ Interface responsiva e moderna
- ✅ Atalhos de teclado para navegação

## 🏗️ Arquitetura

### Estrutura de Arquivos

```
read-pdf/
├── index.html          # Página de upload
├── viewer.html         # Visualizador de PDF
├── README.md           # Documentação
├── css/
│   └── style.css       # Estilos globais
└── js/
    ├── app.js          # Gerencia upload
    ├── pdf-handler.js  # Classe para manipular PDF
    ├── tts-handler.js  # Classe para Text-to-Speech
    └── viewer.js       # Orquestrador do visualizador
```

### Componentes Principais

#### 1. **app.js** - Gerenciamento de Upload
- Valida arquivos PDF
- Converte para base64
- Armazena no localStorage
- Redireciona para o visualizador

#### 2. **PDFHandler** - Manipulação de PDF
- Usa **PDF.js** para carregar e renderizar PDFs
- Renderiza páginas no canvas
- Extrai texto de cada página
- Gerencia navegação entre páginas

#### 3. **TTSHandler** - Text-to-Speech
- Usa **Web Speech API (SpeechSynthesis)**
- Controla leitura: play, pause, resume, stop
- Seleciona voz em português quando disponível
- Gerencia callbacks de eventos

#### 4. **viewer.js** - Orquestrador
- Conecta PDFHandler e TTSHandler
- Gerencia estado da aplicação
- Atualiza UI e controles
- Implementa navegação por hash
- Adiciona atalhos de teclado

## 🚀 Como Usar

### Método 1: Servidor Local

1. **Instale um servidor HTTP simples:**
   ```bash
   # Usando Python 3
   cd /home/lucas/app/read-pdf
   python3 -m http.server 8000
   ```

2. **Abra no navegador:**
   ```
   http://localhost:8000
   ```

### Método 2: VS Code Live Server

1. Instale a extensão "Live Server"
2. Clique com botão direito em `index.html`
3. Selecione "Open with Live Server"

### Método 3: Servidor Node.js

```bash
# Instale o http-server globalmente
npm install -g http-server

# Execute na pasta do projeto
cd /home/lucas/app/read-pdf
http-server -p 8000
```

## 🎮 Controles

### Navegação
- **Botão "Anterior"**: Volta uma página
- **Botão "Próxima"**: Avança uma página
- **Seta ← (teclado)**: Página anterior
- **Seta → (teclado)**: Próxima página

### Áudio
- **▶ Ouvir página**: Inicia a leitura do texto
- **⏸ Pausar**: Pausa a leitura (pode continuar)
- **⏹ Parar**: Para completamente a leitura
- **Espaço (teclado)**: Play/Pause
- **Esc (teclado)**: Parar

## 🔧 Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilização com Grid e Flexbox
- **JavaScript ES6+** - Lógica da aplicação

### Bibliotecas e APIs
- **PDF.js** (v3.11.174) - Renderização e extração de PDF
- **Web Speech API** - Text-to-Speech nativo do navegador
- **localStorage** - Armazenamento temporário do PDF

## 🌐 Compatibilidade

### Navegadores Suportados
- ✅ Chrome/Edge (Recomendado)
- ✅ Firefox
- ✅ Safari (Limitações no TTS)
- ❌ Internet Explorer (não suportado)

### Requisitos
- JavaScript habilitado
- Suporte a Web Speech API
- localStorage habilitado

## 📝 Observações Técnicas

### Armazenamento
- O PDF é armazenado em **localStorage** como base64
- Limite típico: ~5-10MB (varia por navegador)
- Para PDFs maiores, considere usar IndexedDB

### Text-to-Speech
- Usa vozes do sistema operacional
- Qualidade varia por plataforma
- Chrome/Edge têm melhor suporte
- Requer conexão com internet em alguns navegadores

### Performance
- Páginas são renderizadas sob demanda
- Texto é extraído em tempo real
- Canvas é redimensionado automaticamente

## 🐛 Resolução de Problemas

### PDF não carrega
- Verifique se o arquivo é um PDF válido
- Tente um PDF menor (< 5MB)
- Limpe o localStorage: `localStorage.clear()`

### Áudio não funciona
- Verifique se o navegador suporta Web Speech API
- Teste em Chrome/Edge
- Verifique permissões de áudio do navegador

### Texto não aparece
- Alguns PDFs são apenas imagens (sem texto)
- Use PDFs com texto selecionável
- PDFs escaneados precisam de OCR

## 🚀 Melhorias Futuras

- [ ] Suporte a PDFs maiores (IndexedDB)
- [ ] Marcadores e anotações
- [ ] Controle de velocidade e voz
- [ ] Download de áudio (MP3)
- [ ] Modo escuro
- [ ] Busca de texto no PDF
- [ ] Tradução de idiomas

## 📄 Licença

Projeto livre para uso educacional e comercial.

---

**Desenvolvido com ❤️ usando tecnologias web nativas**
