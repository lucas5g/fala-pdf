/**
 * pdf-handler.js - Gerencia o carregamento e renderização do PDF usando PDF.js
 */

class PDFHandler {
    constructor() {
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.canvas = document.getElementById('pdfCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scale = 1.5; // Escala padrão
        
        // Configura o worker do PDF.js
        pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    /**
     * Carrega o PDF do IndexedDB
     * @returns {Promise<void>}
     */
    async loadPDF() {
        try {
            // Recupera o PDF do IndexedDB
            const pdfData = await dbHandler.getPDF();
            
            if (!pdfData || !pdfData.file) {
                throw new Error('Nenhum PDF encontrado');
            }

            // Converte o File para ArrayBuffer
            const arrayBuffer = await pdfData.file.arrayBuffer();
            
            // Carrega o documento PDF
            const loadingTask = pdfjsLib.getDocument(arrayBuffer);
            this.pdfDoc = await loadingTask.promise;
            this.totalPages = this.pdfDoc.numPages;
            
            console.log(`PDF carregado: ${this.totalPages} páginas`);
            
            return this.pdfDoc;
        } catch (error) {
            console.error('Erro ao carregar PDF:', error);
            throw error;
        }
    }

    /**
     * Renderiza uma página específica do PDF
     * @param {number} pageNum - Número da página a renderizar
     * @returns {Promise<void>}
     */
    async renderPage(pageNum) {
        try {
            if (!this.pdfDoc) {
                throw new Error('PDF não carregado');
            }

            this.currentPage = pageNum;
            
            // Obtém a página
            const page = await this.pdfDoc.getPage(pageNum);
            
            // Calcula a escala para ajustar ao container
            const viewport = page.getViewport({ scale: this.scale });
            
            // Ajusta o tamanho do canvas
            this.canvas.width = viewport.width;
            this.canvas.height = viewport.height;
            
            // Renderiza a página no canvas
            const renderContext = {
                canvasContext: this.ctx,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
            console.log(`Página ${pageNum} renderizada`);
        } catch (error) {
            console.error('Erro ao renderizar página:', error);
            throw error;
        }
    }

    /**
     * Extrai o texto de uma página específica
     * @param {number} pageNum - Número da página
     * @returns {Promise<string>} Texto extraído da página
     */
    async extractPageText(pageNum) {
        try {
            if (!this.pdfDoc) {
                throw new Error('PDF não carregado');
            }

            const page = await this.pdfDoc.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            // Concatena todos os itens de texto
            const text = textContent.items
                .map(item => item.str)
                .join(' ');
            
            return text;
        } catch (error) {
            console.error('Erro ao extrair texto:', error);
            throw error;
        }
    }

    /**
     * Navega para a próxima página
     * @returns {Promise<boolean>} true se houver próxima página
     */
    async nextPage() {
        if (this.currentPage < this.totalPages) {
            await this.renderPage(this.currentPage + 1);
            return true;
        }
        return false;
    }

    /**
     * Navega para a página anterior
     * @returns {Promise<boolean>} true se houver página anterior
     */
    async previousPage() {
        if (this.currentPage > 1) {
            await this.renderPage(this.currentPage - 1);
            return true;
        }
        return false;
    }

    /**
     * Obtém o número da página atual
     * @returns {number}
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * Obtém o total de páginas
     * @returns {number}
     */
    getTotalPages() {
        return this.totalPages;
    }

    /**
     * Define a escala/zoom do PDF
     * @param {number} scale - Escala (ex: 1.0 = 100%, 1.5 = 150%)
     */
    setScale(scale) {
        this.scale = scale;
        console.log('🔍 Escala do PDF definida para:', scale);
    }

    /**
     * Obtém a escala atual
     * @returns {number}
     */
    getScale() {
        return this.scale;
    }
}
