/**
 * viewer.js - Orquestra a aplicação do visualizador, conectando PDF e TTS
 */

// Instâncias dos handlers
const pdfHandler = new PDFHandler();
const ttsHandler = new TTSHandler();

// Elementos DOM
const pageIndicator = document.getElementById('pageIndicator');
const pageText = document.getElementById('pageText');
const pdfTitle = document.getElementById('pdfTitle');
const loadingOverlay = document.getElementById('loadingOverlay');
const viewerMain = document.getElementById('viewerMain');
const viewToggleBtn = document.getElementById('viewToggle');

// Botões de navegação
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');

// Botões de áudio
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const audioStatus = document.getElementById('audioStatus');

// Controles de voz
const voiceSelect = document.getElementById('voiceSelect');
const zoomInput = document.getElementById('zoomInput');
const zoomValue = document.getElementById('zoomValue');
const rateInput = document.getElementById('rateInput');
const rateValue = document.getElementById('rateValue');

// Estado atual
let currentPageText = '';

/**
 * Inicializa a aplicação
 */
async function init() {
    try {
        // Verifica se há um PDF carregado no IndexedDB
        const hasPDF = await dbHandler.hasPDF();
        if (!hasPDF) {
            alert('Nenhum PDF carregado. Redirecionando...');
            window.location.href = 'index.html';
            return;
        }

        // Obtém informações do PDF
        const pdfData = await dbHandler.getPDF();
        pdfTitle.textContent = pdfData.fileName || 'PDF';

        // Carrega o PDF
        await pdfHandler.loadPDF();

        // Obtém a página da URL (hash)
        const pageFromHash = getPageFromHash();
        const initialPage = pageFromHash || 1;

        // Renderiza a primeira página
        await loadPage(initialPage);

        // Esconde o loading
        loadingOverlay.classList.add('hidden');

        // Configura event listeners
        setupEventListeners();        
        // Carrega vozes disponíveis
        loadAvailableVoices();
        console.log('Aplicação inicializada com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar:', error);
        alert('Erro ao carregar o PDF. Tente novamente.');
        window.location.href = 'index.html';
    }
}

/**
 * Carrega e exibe uma página específica
 * @param {number} pageNum - Número da página
 */
async function loadPage(pageNum) {
    try {
        // Mostra loading
        loadingOverlay.classList.remove('hidden');

        // Para qualquer áudio em reprodução
        ttsHandler.stop();

        // Renderiza a página no canvas
        await pdfHandler.renderPage(pageNum);

        // Extrai o texto da página
        currentPageText = await pdfHandler.extractPageText(pageNum);
        
        // Renderiza o texto extraido da pagina
        renderPageText(currentPageText);

        // Atualiza a UI
        updateUI();

        // Atualiza a URL (hash)
        updateHash(pageNum);

        // Esconde loading
        loadingOverlay.classList.add('hidden');

        // Habilita o botão de play se houver texto
        playBtn.disabled = !currentPageText || currentPageText.trim() === '';
    } catch (error) {
        console.error('Erro ao carregar página:', error);
        loadingOverlay.classList.add('hidden');
    }
}

/**
 * Atualiza elementos da UI baseado no estado atual
 */
function updateUI() {
    const current = pdfHandler.getCurrentPage();
    const total = pdfHandler.getTotalPages();

    // Atualiza indicador de página
    pageIndicator.textContent = `Página ${current} de ${total}`;

    // Habilita/desabilita botões de navegação
    prevPageBtn.disabled = current === 1;
    nextPageBtn.disabled = current === total;
}

/**
 * Atualiza o status do áudio na UI
 * @param {string} status - Status a exibir
 */
function updateAudioStatus(status) {
    audioStatus.textContent = status;
}

/**
 * Atualiza o hash da URL com o número da página
 * @param {number} pageNum - Número da página
 */
function updateHash(pageNum) {
    window.location.hash = `page=${pageNum}`;
}

/**
 * Obtém o número da página do hash da URL
 * @returns {number|null}
 */
function getPageFromHash() {
    const hash = window.location.hash;
    const match = hash.match(/page=(\d+)/);
    return match ? parseInt(match[1], 10) : null;
}

/**
 * Renderiza o texto da pagina
 * @param {string} text - Texto a ser renderizado
 */
function renderPageText(text) {
    if (!text || text.trim() === '') {
        pageText.innerHTML = '<span class="no-text">Nenhum texto encontrado nesta página.</span>';
        return;
    }

    pageText.textContent = text;
}

/**
 * Carrega as vozes disponíveis e popula o seletor
 */
function loadAvailableVoices() {
    // Tenta carregar imediatamente
    let voices = ttsHandler.getAvailableVoices();
    
    if (voices.length > 0) {
        console.log(`${voices.length} vozes disponíveis`);
        populateVoiceSelect(voices);
    } else {
        console.log('Aguardando vozes...');
    }
}

/**
 * Popula o seletor de vozes
 * @param {Array<SpeechSynthesisVoice>} voices
 */
function populateVoiceSelect(voices) {
    voiceSelect.innerHTML = '';
    
    if (!voices || voices.length === 0) {
        voiceSelect.innerHTML = '<option>Nenhuma voz disponível</option>';
        return;
    }
    
    // Agrupa vozes por idioma
    const portugueseVoices = voices.filter(v => v.lang.startsWith('pt'));
    const otherVoices = voices.filter(v => !v.lang.startsWith('pt'));
    
    // Função para verificar se é voz confiável (não Natural)
    const isReliableVoice = (voice) => {
        return !voice.name.includes('Natural') && 
               !voice.name.includes('Premium') &&
               !voice.name.includes('Enhanced');
    };
    
    // Ordena vozes: confiáveis primeiro
    const sortVoices = (a, b) => {
        const aReliable = isReliableVoice(a);
        const bReliable = isReliableVoice(b);
        if (aReliable && !bReliable) return -1;
        if (!aReliable && bReliable) return 1;
        return a.name.localeCompare(b.name);
    };
    
    portugueseVoices.sort(sortVoices);
    otherVoices.sort(sortVoices);
    
    // Adiciona vozes em português primeiro
    if (portugueseVoices.length > 0) {
        const ptGroup = document.createElement('optgroup');
        ptGroup.label = '🇧🇷 Português';
        portugueseVoices.forEach((voice) => {
            const option = document.createElement('option');
            const voiceIndex = voices.indexOf(voice);
            option.value = voiceIndex;
            
            // Adiciona indicador visual
            const indicator = isReliableVoice(voice) ? '✓' : '⚠️';
            const suffix = isReliableVoice(voice) ? '' : ' (pode não funcionar)';
            option.textContent = `${indicator} ${voice.name} (${voice.lang})${suffix}`;
            
            if (voice === ttsHandler.getCurrentVoice()) {
                option.selected = true;
            }
            ptGroup.appendChild(option);
        });
        voiceSelect.appendChild(ptGroup);
    }
    
    // Adiciona outras vozes
    if (otherVoices.length > 0) {
        const otherGroup = document.createElement('optgroup');
        otherGroup.label = '🌍 Outros idiomas';
        otherVoices.forEach((voice) => {
            const option = document.createElement('option');
            const voiceIndex = voices.indexOf(voice);
            option.value = voiceIndex;
            
            const indicator = isReliableVoice(voice) ? '✓' : '⚠️';
            option.textContent = `${indicator} ${voice.name} (${voice.lang})`;
            
            otherGroup.appendChild(option);
        });
        voiceSelect.appendChild(otherGroup);
    }
    
    // Armazena as vozes para referência
    voiceSelect.voices = voices;
    
    console.log('Seletor populado com', voices.length, 'vozes');
    console.log('Vozes confiáveis em PT:', portugueseVoices.filter(isReliableVoice).length);
}

/**
 * Configura todos os event listeners
 */
function setupEventListeners() {
    // Carrega vozes quando disponíveis
    ttsHandler.onVoicesChanged = (voices) => {
        console.log('Vozes carregadas via callback:', voices.length);
        populateVoiceSelect(voices);
    };
    
    // Seleção de voz
    voiceSelect.addEventListener('change', () => {
        const voices = voiceSelect.voices || ttsHandler.getAvailableVoices();
        const selectedIndex = parseInt(voiceSelect.value);
        const selectedVoice = voices[selectedIndex];
        
        if (selectedVoice) {
            ttsHandler.setVoice(selectedVoice);
            console.log('Voz selecionada:', selectedVoice.name, selectedVoice.lang);
        } else {
            console.error('Voz não encontrada no índice:', selectedIndex);
        }
    });
    voiceSelect.addEventListener('change', () => {
        const voices = voiceSelect.voices || ttsHandler.getAvailableVoices();
        const selectedIndex = parseInt(voiceSelect.value);
        const selectedVoice = voices[selectedIndex];
        
        if (selectedVoice) {
            ttsHandler.setVoice(selectedVoice);
            console.log('Voz selecionada:', selectedVoice.name, selectedVoice.lang);
        } else {
            console.error('Voz não encontrada no índice:', selectedIndex);
        }
    });
    
    // Controle de velocidade
    rateInput.addEventListener('input', () => {
        const rate = parseFloat(rateInput.value);
        ttsHandler.setRate(rate);
        rateValue.textContent = `${rate.toFixed(1)}x`;
    });
    
    // Controle de zoom do PDF
    zoomInput.addEventListener('input', () => {
        const zoom = parseFloat(zoomInput.value);
        pdfHandler.setScale(zoom);
        zoomValue.textContent = `${Math.round(zoom * 100)}%`;
        // Re-renderiza a página atual com novo zoom
        pdfHandler.renderPage(pdfHandler.getCurrentPage());
    });
    
    // Navegação de páginas
    prevPageBtn.addEventListener('click', async () => {
        const success = await pdfHandler.previousPage();
        if (success) {
            await loadPage(pdfHandler.getCurrentPage());
        }
    });

    nextPageBtn.addEventListener('click', async () => {
        const success = await pdfHandler.nextPage();
        if (success) {
            await loadPage(pdfHandler.getCurrentPage());
        }
    });

    // Controles de áudio
    playBtn.addEventListener('click', () => {
        if (currentPageText && currentPageText.trim() !== '') {
            ttsHandler.speak(currentPageText);
            updateAudioStatus('Reproduzindo...');
            playBtn.disabled = true;
            pauseBtn.disabled = false;
            stopBtn.disabled = false;
        }
    });

    pauseBtn.addEventListener('click', () => {
        if (ttsHandler.getIsPlaying() && !ttsHandler.getIsPaused()) {
            ttsHandler.pause();
            updateAudioStatus('Pausado');
            playBtn.textContent = '▶ Continuar';
            playBtn.disabled = false;
        } else if (ttsHandler.getIsPaused()) {
            ttsHandler.resume();
            updateAudioStatus('Reproduzindo...');
            playBtn.disabled = true;
        }
    });

    stopBtn.addEventListener('click', () => {
        ttsHandler.stop();
        updateAudioStatus('Parado');
        playBtn.textContent = '▶ Ouvir página';
        playBtn.disabled = false;
        pauseBtn.disabled = true;
        stopBtn.disabled = true;
    });

    // Callbacks do TTS
    ttsHandler.onStart = () => {
        updateAudioStatus('Reproduzindo...');
    };

    ttsHandler.onEnd = () => {
        updateAudioStatus('Pronto para reproduzir');
        playBtn.textContent = '▶ Ouvir página';
        playBtn.disabled = false;
        pauseBtn.disabled = true;
        stopBtn.disabled = true;
    };

    ttsHandler.onPause = () => {
        updateAudioStatus('Pausado');
    };

    ttsHandler.onResume = () => {
        updateAudioStatus('Reproduzindo...');
    };

    // Alternar visualização
    viewToggleBtn.addEventListener('click', () => {
        // Estado atual: PDF -> Split -> Text -> PDF
        if (viewerMain.classList.contains('split-view')) {
            // Ir para Texto Apenas
            viewerMain.classList.remove('split-view');
            viewerMain.classList.add('text-only');
            viewToggleBtn.textContent = '🖼️ Ver PDF';
            viewToggleBtn.title = 'Mostrar apenas o PDF original';
        } else if (viewerMain.classList.contains('text-only')) {
            // Ir para PDF Apenas
            viewerMain.classList.remove('text-only');
            viewToggleBtn.textContent = '📝 Ver Texto';
            viewToggleBtn.title = 'Mostrar visualização dividida com texto';
        } else {
            // Ir para Split
            viewerMain.classList.add('split-view');
            viewToggleBtn.textContent = '📄 Só Texto';
            viewToggleBtn.title = 'Mostrar apenas o texto extraído';
        }
    });

    // Navegação por hash (back/forward do navegador)
    window.addEventListener('hashchange', () => {
        const pageNum = getPageFromHash();
        if (pageNum && pageNum !== pdfHandler.getCurrentPage()) {
            loadPage(pageNum);
        }
    });

    // Atalhos de teclado
    document.addEventListener('keydown', (e) => {
        // Ignora se estiver digitando em um input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Seta esquerda: página anterior
        if (e.key === 'ArrowLeft' && !prevPageBtn.disabled) {
            prevPageBtn.click();
        }
        // Seta direita: próxima página
        else if (e.key === 'ArrowRight' && !nextPageBtn.disabled) {
            nextPageBtn.click();
        }
        // Espaço: play/pause
        else if (e.key === ' ' && !playBtn.disabled) {
            e.preventDefault();
            playBtn.click();
        }
        // Escape: parar
        else if (e.key === 'Escape') {
            stopBtn.click();
        }
        // D: aumenta velocidade em 0.1x
        else if (e.key === 'd' || e.key === 'D') {
            e.preventDefault();
            const currentRate = parseFloat(rateInput.value);
            const newRate = Math.min(4, currentRate + 0.1);
            rateInput.value = newRate.toFixed(1);
            ttsHandler.setRate(newRate);
            rateValue.textContent = `${newRate.toFixed(1)}x`;
            console.log('⚡ Velocidade aumentada para:', newRate.toFixed(1));
        }
        // S: diminui velocidade em 0.1x
        else if (e.key === 's' || e.key === 'S') {
            e.preventDefault();
            const currentRate = parseFloat(rateInput.value);
            const newRate = Math.max(0.5, currentRate - 0.1);
            rateInput.value = newRate.toFixed(1);
            ttsHandler.setRate(newRate);
            rateValue.textContent = `${newRate.toFixed(1)}x`;
            console.log('⚡ Velocidade reduzida para:', newRate.toFixed(1));
        }
        // +/=: aumenta zoom em 0.1
        else if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            const currentZoom = parseFloat(zoomInput.value);
            const newZoom = Math.min(2.5, currentZoom + 0.1);
            zoomInput.value = newZoom.toFixed(1);
            pdfHandler.setScale(newZoom);
            zoomValue.textContent = `${Math.round(newZoom * 100)}%`;
            pdfHandler.renderPage(pdfHandler.getCurrentPage());
            console.log('🔍 Zoom aumentado para:', Math.round(newZoom * 100) + '%');
        }
        // -: diminui zoom em 0.1
        else if (e.key === '-' || e.key === '_') {
            e.preventDefault();
            const currentZoom = parseFloat(zoomInput.value);
            const newZoom = Math.max(0.5, currentZoom - 0.1);
            zoomInput.value = newZoom.toFixed(1);
            pdfHandler.setScale(newZoom);
            zoomValue.textContent = `${Math.round(newZoom * 100)}%`;
            pdfHandler.renderPage(pdfHandler.getCurrentPage());
            console.log('🔍 Zoom reduzido para:', Math.round(newZoom * 100) + '%');
        }
    });
}

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
