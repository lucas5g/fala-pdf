/**
 * theme.js - Gerencia o tema dark/light da aplicação
 */

// Obtém o tema salvo ou usa o padrão do sistema
function getInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        return savedTheme;
    }
    
    // Detecta preferência do sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    
    return 'light';
}

// Aplica o tema
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Atualiza ícone do botão
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    
    console.log('🎨 Tema aplicado:', theme);
}

// Alterna entre temas
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
}

// Inicializa o tema ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const initialTheme = getInitialTheme();
    applyTheme(initialTheme);
    
    // Configura o botão de toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Escuta mudanças na preferência do sistema
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // Só aplica se não houver preferência salva
            if (!localStorage.getItem('theme')) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
});
