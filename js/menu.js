/**
 * menu.js - Gerencia o menu lateral de configura\u00e7\u00f5es
 */

// Elementos do menu
const menuToggle = document.getElementById('menuToggle');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettings = document.getElementById('closeSettings');

// Cria overlay
const overlay = document.createElement('div');
overlay.className = 'settings-overlay';
document.body.appendChild(overlay);

// Bot\u00f5es de tema
const lightThemeBtn = document.getElementById('lightTheme');
const darkThemeBtn = document.getElementById('darkTheme');

/**
 * Abre o menu
 */
function openMenu() {
    settingsPanel.classList.add('open');
    overlay.classList.add('visible');
}

/**
 * Fecha o menu
 */
function closeMenu() {
    settingsPanel.classList.remove('open');
    overlay.classList.remove('visible');
}

/**
 * Atualiza bot\u00f5es de tema baseado no tema atual
 */
function updateThemeButtons() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        darkThemeBtn.classList.add('active');
        lightThemeBtn.classList.remove('active');
    } else {
        lightThemeBtn.classList.add('active');
        darkThemeBtn.classList.remove('active');
    }
}

// Event listeners
menuToggle.addEventListener('click', openMenu);
closeSettings.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);

// Bot\u00f5es de tema
lightThemeBtn.addEventListener('click', () => {
    applyTheme('light');
    updateThemeButtons();
});

darkThemeBtn.addEventListener('click', () => {
    applyTheme('dark');
    updateThemeButtons();
});

// Atualiza os bot\u00f5es quando a p\u00e1gina carrega
document.addEventListener('DOMContentLoaded', () => {
    updateThemeButtons();
});

// Atalho de teclado: ESC fecha o menu
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsPanel.classList.contains('open')) {
        e.stopPropagation();
        closeMenu();
    }
});
