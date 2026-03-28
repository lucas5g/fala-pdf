/**
 * tts-handler.js - Gerencia a leitura de texto usando Web Speech API (SpeechSynthesis)
 */

class TTSHandler {
    constructor() {
        // Verifica se o navegador suporta Web Speech API
        if (!('speechSynthesis' in window)) {
            console.error('Web Speech API não suportada neste navegador');
            alert('Seu navegador não suporta a função de leitura em áudio.');
        }

        this.synth = window.speechSynthesis;
        this.utterance = null;
        this.isPaused = false;
        this.isPlaying = false;
        this.currentText = '';
        this.selectedVoice = null;
        this.rate = 1.0;
        this.pitch = 1.0;
        this.volume = 1.0;
        // Callbacks para eventos
        this.onStart = null;
        this.onEnd = null;
        this.onPause = null;
        this.onResume = null;
        this.onVoicesChanged = null;
        
        // Carrega vozes quando disponíveis
        this.loadVoices();
    }

    /**
     * Inicia a leitura do texto
     * @param {string} text - Texto a ser lido
     */
    speak(text) {
        if (!text || text.trim() === '') {
            console.warn('Nenhum texto para ler');
            return;
        }

        // Para qualquer leitura em andamento e limpa a fila
        this.synth.cancel();
        
        // Pequeno delay para garantir que cancelou
        setTimeout(() => {
            this.currentText = text;
            this.utterance = new SpeechSynthesisUtterance(text);
            
            // Usa a voz selecionada ou padrão em português
            if (this.selectedVoice) {
                console.log('Usando voz selecionada:', this.selectedVoice.name);
                this.utterance.voice = this.selectedVoice;
            } else {
                const voices = this.synth.getVoices();
                const portugueseVoice = voices.find(voice => 
                    voice.lang.startsWith('pt-BR') || voice.lang.startsWith('pt')
                );
                if (portugueseVoice) {
                    console.log('Usando voz padrão em português:', portugueseVoice.name);
                    this.utterance.voice = portugueseVoice;
                } else {
                    console.log('Nenhuma voz em português, usando padrão do sistema');
                }
            }

            // Configurações da fala - força volume 1.0
            this.utterance.lang = 'pt-BR';
            this.utterance.rate = Math.max(0.5, Math.min(4, this.rate));
            this.utterance.pitch = Math.max(0, Math.min(2, this.pitch));
            this.utterance.volume = 1.0; // SEMPRE volume máximo

            console.log('Configurações aplicadas:', {
                voz: this.utterance.voice?.name || 'padrão do sistema',
                idioma: this.utterance.lang,
                velocidade: this.utterance.rate,
                tom: this.utterance.pitch,
                volume: this.utterance.volume,
                tamanhoTexto: text.length
            });

        // Event listeners
        this.utterance.onstart = () => {
            this.isPlaying = true;
            this.isPaused = false;
            console.log('✅ Iniciou a leitura');
            
            if (this.onStart) this.onStart();
        };

        this.utterance.onend = () => {
            this.isPlaying = false;
            this.isPaused = false;
            console.log('✅ Terminou a leitura');
            if (this.onEnd) this.onEnd();
        };

        this.utterance.onerror = (event) => {
            console.error('❌ Erro na leitura:', event.error, event);
            this.isPlaying = false;
            this.isPaused = false;
        };

        // Evento de boundary (detecta palavras sendo faladas)
        this.utterance.onboundary = (event) => {
            console.log('🔵 Boundary event:', {
                charIndex: event.charIndex,
                charLength: event.charLength,
                name: event.name
            });
            if (this.onBoundary && event.charIndex !== undefined) {
                this.onBoundary(event.charIndex, event.charLength || 1);
            }
        };

        // Inicia a fala
        console.log('🎤 Chamando synth.speak()...');
        this.synth.speak(this.utterance);
        
        setTimeout(() => {
            console.log('🎤 Estado após iniciar:', {
                speaking: this.synth.speaking,
                pending: this.synth.pending,
                paused: this.synth.paused,
                isPlaying: this.isPlaying
            });
        }, 100);
        }, 50);
    }

    /**
     * Pausa a leitura
     */
    pause() {
        if (this.isPlaying && !this.isPaused) {
            this.synth.pause();
            this.isPaused = true;
            console.log('Leitura pausada');
            if (this.onPause) this.onPause();
        }
    }

    /**
     * Retoma a leitura pausada
     */
    resume() {
        if (this.isPaused) {
            this.synth.resume();
            this.isPaused = false;
            console.log('Leitura retomada');
            if (this.onResume) this.onResume();
        }
    }

    /**
     * Para completamente a leitura
     */
    stop() {
        this.synth.cancel();
        this.isPlaying = false;
        this.isPaused = false;
        console.log('🛑 Leitura parada');
    }

    /**
     * Verifica se está reproduzindo
     * @returns {boolean}
     */
    getIsPlaying() {
        return this.isPlaying;
    }

    /**
     * Verifica se está pausado
     * @returns {boolean}
     */
    getIsPaused() {
        return this.isPaused;
    }

    /**
     * Define a taxa de velocidade da fala
     * @param {number} rate - Velocidade (0.1 a 10, padrão 1)
     */
    setRate(rate) {
        this.rate = rate;
        if (this.utterance) {
            this.utterance.rate = rate;
        }
        console.log('Velocidade definida para:', rate);
    }

    /**
     * Define o tom da fala
     * @param {number} pitch - Tom (0 a 2, padrão 1)
     */
    setPitch(pitch) {
        this.pitch = pitch;
        if (this.utterance) {
            this.utterance.pitch = pitch;
        }
        console.log('Tom definido para:', pitch);
    }

    /**
     * Define o volume da fala
     * @param {number} volume - Volume (0 a 1, padrão 1)
     */
    setVolume(volume) {
        this.volume = volume;
        if (this.utterance) {
            this.utterance.volume = volume;
        }
        console.log('Volume definido para:', volume);
    }

    /**
     * Carrega as vozes disponíveis
     * Algumas plataformas precisam aguardar o evento onvoiceschanged
     */
    loadVoices() {
        // Tenta carregar imediatamente
        let voices = this.synth.getVoices();
        
        if (voices.length > 0) {
            this.selectDefaultVoice(voices);
            if (this.onVoicesChanged) this.onVoicesChanged(voices);
        }
        
        // Registra listener para quando as vozes estiverem disponíveis
        this.synth.onvoiceschanged = () => {
            voices = this.synth.getVoices();
            this.selectDefaultVoice(voices);
            if (this.onVoicesChanged) this.onVoicesChanged(voices);
        };
    }

    /**
     * Seleciona uma voz padrão em português
     * @param {Array<SpeechSynthesisVoice>} voices
     */
    selectDefaultVoice(voices) {
        // Função para verificar se é voz confiável
        const isReliable = (voice) => {
            return !voice.name.includes('Natural') && 
                   !voice.name.includes('Premium') &&
                   !voice.name.includes('Enhanced');
        };
        
        // Tenta encontrar uma voz confiável em português brasileiro
        let defaultVoice = voices.find(voice => 
            voice.lang === 'pt-BR' && isReliable(voice)
        );
        
        // Se não encontrar confiável, tenta qualquer uma em pt-BR
        if (!defaultVoice) {
            defaultVoice = voices.find(voice => voice.lang === 'pt-BR');
        }
        
        // Se ainda não encontrar, procura qualquer voz confiável em português
        if (!defaultVoice) {
            defaultVoice = voices.find(voice => 
                voice.lang.startsWith('pt') && isReliable(voice)
            );
        }
        
        // Se não encontrar, procura qualquer voz em português
        if (!defaultVoice) {
            defaultVoice = voices.find(voice => voice.lang.startsWith('pt'));
        }
        
        // Se ainda não encontrar, usa a primeira voz disponível
        if (!defaultVoice && voices.length > 0) {
            defaultVoice = voices[0];
        }
        
        if (defaultVoice) {
            this.selectedVoice = defaultVoice;
            console.log('Voz padrão selecionada:', defaultVoice.name, 
                       '| Confiável:', isReliable(defaultVoice));
        }
    }

    /**
     * Obtém todas as vozes disponíveis
     * @returns {Array<SpeechSynthesisVoice>}
     */
    getAvailableVoices() {
        return this.synth.getVoices();
    }

    /**
     * Define a voz a ser usada
     * @param {SpeechSynthesisVoice} voice
     */
    setVoice(voice) {
        this.selectedVoice = voice;
        console.log('Voz selecionada:', voice.name, voice.lang);
    }

    /**
     * Obtém a voz atual
     * @returns {SpeechSynthesisVoice|null}
     */
    getCurrentVoice() {
        return this.selectedVoice;
    }
}
