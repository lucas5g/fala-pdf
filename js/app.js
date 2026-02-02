/**
 * app.js - Gerencia o upload do PDF e redirecionamento para o visualizador
 */

// Elementos DOM
const pdfInput = document.getElementById('pdfInput');
const fileInfo = document.getElementById('fileInfo');

/**
 * Listener para o upload de arquivo PDF
 * Armazena o arquivo no IndexedDB e redireciona para o visualizador
 */
pdfInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }

    // Valida se é um arquivo PDF
    if (file.type !== 'application/pdf') {
        alert('Por favor, selecione um arquivo PDF válido.');
        return;
    }

    fileInfo.textContent = `Processando ${file.name}...`;

    try {
        // Salva o PDF no IndexedDB (suporta arquivos grandes)
        await dbHandler.savePDF(file);
        
        fileInfo.textContent = `✓ ${file.name} carregado com sucesso!`;
        
        // Aguarda um momento para o usuário ver a mensagem
        setTimeout(() => {
            // Redireciona para o visualizador na página 1
            window.location.href = 'viewer.html#page=1';
        }, 500);
        
    } catch (error) {
        console.error('Erro ao processar PDF:', error);
        fileInfo.textContent = '';
        alert('Erro ao carregar o arquivo PDF. Tente novamente.');
    }
});
