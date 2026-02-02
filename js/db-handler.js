/**
 * db-handler.js - Gerencia o armazenamento de PDFs usando IndexedDB
 * IndexedDB suporta arquivos muito maiores que localStorage (centenas de MB)
 */

class DBHandler {
    constructor() {
        this.dbName = 'PDFReaderDB';
        this.storeName = 'pdfs';
        this.version = 1;
        this.db = null;
    }

    /**
     * Inicializa o banco de dados IndexedDB
     * @returns {Promise<IDBDatabase>}
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                reject(new Error('Erro ao abrir banco de dados'));
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            // Cria o object store se necessário
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Deleta store antigo se existir
                if (db.objectStoreNames.contains(this.storeName)) {
                    db.deleteObjectStore(this.storeName);
                }
                
                // Cria novo object store
                db.createObjectStore(this.storeName, { keyPath: 'id' });
            };
        });
    }

    /**
     * Salva um PDF no banco de dados
     * @param {File} file - Arquivo PDF
     * @returns {Promise<void>}
     */
    async savePDF(file) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            // Salva o arquivo diretamente (sem conversão para base64)
            const data = {
                id: 'current',
                file: file,
                fileName: file.name,
                fileSize: file.size,
                uploadDate: new Date().toISOString()
            };

            const request = store.put(data);

            request.onsuccess = () => {
                console.log('PDF salvo com sucesso');
                resolve();
            };

            request.onerror = () => {
                reject(new Error('Erro ao salvar PDF'));
            };
        });
    }

    /**
     * Recupera o PDF atual do banco de dados
     * @returns {Promise<Object>} Objeto com dados do PDF
     */
    async getPDF() {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get('current');

            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result);
                } else {
                    reject(new Error('Nenhum PDF encontrado'));
                }
            };

            request.onerror = () => {
                reject(new Error('Erro ao recuperar PDF'));
            };
        });
    }

    /**
     * Remove o PDF do banco de dados
     * @returns {Promise<void>}
     */
    async deletePDF() {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete('current');

            request.onsuccess = () => {
                console.log('PDF removido com sucesso');
                resolve();
            };

            request.onerror = () => {
                reject(new Error('Erro ao remover PDF'));
            };
        });
    }

    /**
     * Verifica se existe um PDF salvo
     * @returns {Promise<boolean>}
     */
    async hasPDF() {
        try {
            await this.getPDF();
            return true;
        } catch {
            return false;
        }
    }
}

// Instância global
const dbHandler = new DBHandler();
