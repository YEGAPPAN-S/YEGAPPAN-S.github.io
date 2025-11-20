// Design Customizer for Admin Panel

class DesignCustomizer {
    constructor() {
        this.init();
    }

    init() {
        this.loadSavedDesign();
        this.setupEventListeners();
        this.syncColorInputs();
    }

    setupEventListeners() {
        // Color pickers
        document.getElementById('primary-color')?.addEventListener('input', (e) => {
            document.getElementById('primary-color-text').value = e.target.value;
        });

        document.getElementById('primary-color-text')?.addEventListener('input', (e) => {
            document.getElementById('primary-color').value = e.target.value;
        });

        document.getElementById('secondary-color')?.addEventListener('input', (e) => {
            document.getElementById('secondary-color-text').value = e.target.value;
        });

        document.getElementById('secondary-color-text')?.addEventListener('input', (e) => {
            document.getElementById('secondary-color').value = e.target.value;
        });

        document.getElementById('bg-color')?.addEventListener('input', (e) => {
            document.getElementById('bg-color-text').value = e.target.value;
        });

        document.getElementById('bg-color-text')?.addEventListener('input', (e) => {
            document.getElementById('bg-color').value = e.target.value;
        });

        document.getElementById('accent-color')?.addEventListener('input', (e) => {
            document.getElementById('accent-color-text').value = e.target.value;
        });

        document.getElementById('accent-color-text')?.addEventListener('input', (e) => {
            document.getElementById('accent-color').value = e.target.value;
        });

        // Save buttons
        document.getElementById('save-colors')?.addEventListener('click', () => this.saveColors());
        document.getElementById('preview-colors')?.addEventListener('click', () => this.previewColors());
        document.getElementById('reset-colors')?.addEventListener('click', () => this.resetColors());

        document.getElementById('save-typography')?.addEventListener('click', () => this.saveTypography());
        document.getElementById('reset-typography')?.addEventListener('click', () => this.resetTypography());

        document.getElementById('save-layout')?.addEventListener('click', () => this.saveLayout());
        document.getElementById('reset-layout')?.addEventListener('click', () => this.resetLayout());

        // Export/Import
        document.getElementById('export-design')?.addEventListener('click', () => this.exportDesign());
        document.getElementById('import-design')?.addEventListener('click', () => {
            document.getElementById('import-design-file')?.click();
        });
        document.getElementById('import-design-file')?.addEventListener('change', (e) => {
            this.importDesign(e.target.files[0]);
        });
    }

    syncColorInputs() {
        const primary = document.getElementById('primary-color').value;
        document.getElementById('primary-color-text').value = primary;

        const secondary = document.getElementById('secondary-color').value;
        document.getElementById('secondary-color-text').value = secondary;

        const bg = document.getElementById('bg-color').value;
        document.getElementById('bg-color-text').value = bg;

        const accent = document.getElementById('accent-color').value;
        document.getElementById('accent-color-text').value = accent;
    }

    loadSavedDesign() {
        const design = localStorage.getItem('site_design');
        if (!design) return;

        try {
            const settings = JSON.parse(design);
            
            // Load colors
            if (settings.colors) {
                document.getElementById('primary-color').value = settings.colors.primary || '#0071e3';
                document.getElementById('primary-color-text').value = settings.colors.primary || '#0071e3';
                document.getElementById('secondary-color').value = settings.colors.secondary || '#1d1d1f';
                document.getElementById('secondary-color-text').value = settings.colors.secondary || '#1d1d1f';
                document.getElementById('bg-color').value = settings.colors.background || '#ffffff';
                document.getElementById('bg-color-text').value = settings.colors.background || '#ffffff';
                document.getElementById('accent-color').value = settings.colors.accent || '#f5f5f7';
                document.getElementById('accent-color-text').value = settings.colors.accent || '#f5f5f7';
            }

            // Load typography
            if (settings.typography) {
                document.getElementById('primary-font').value = settings.typography.primaryFont || 'Inter';
                document.getElementById('heading-font').value = settings.typography.headingFont || 'inherit';
                document.getElementById('base-font-size').value = settings.typography.baseFontSize || '16px';
            }

            // Load layout
            if (settings.layout) {
                document.getElementById('border-radius').value = settings.layout.borderRadius || '8px';
                document.getElementById('content-width').value = settings.layout.contentWidth || '1200px';
            }

            // Apply the design
            this.applyDesign(settings);
        } catch (error) {
            console.error('Error loading saved design:', error);
        }
    }

    saveColors() {
        const settings = this.getCurrentSettings();
        localStorage.setItem('site_design', JSON.stringify(settings));
        this.applyDesign(settings);
        this.generateCSS(settings);
        
        if (window.adminPanel) {
            window.adminPanel.showToast('Colors saved successfully!');
        }
    }

    previewColors() {
        const settings = this.getCurrentSettings();
        this.applyDesign(settings);
        
        if (window.adminPanel) {
            window.adminPanel.showToast('Preview applied! Click "Save Colors" to make permanent.');
        }
    }

    resetColors() {
        const defaults = {
            primary: '#0071e3',
            secondary: '#1d1d1f',
            background: '#ffffff',
            accent: '#f5f5f7'
        };

        document.getElementById('primary-color').value = defaults.primary;
        document.getElementById('primary-color-text').value = defaults.primary;
        document.getElementById('secondary-color').value = defaults.secondary;
        document.getElementById('secondary-color-text').value = defaults.secondary;
        document.getElementById('bg-color').value = defaults.background;
        document.getElementById('bg-color-text').value = defaults.background;
        document.getElementById('accent-color').value = defaults.accent;
        document.getElementById('accent-color-text').value = defaults.accent;

        this.saveColors();
    }

    saveTypography() {
        const settings = this.getCurrentSettings();
        localStorage.setItem('site_design', JSON.stringify(settings));
        this.applyDesign(settings);
        this.generateCSS(settings);
        
        if (window.adminPanel) {
            window.adminPanel.showToast('Typography saved successfully!');
        }
    }

    resetTypography() {
        document.getElementById('primary-font').value = 'Inter';
        document.getElementById('heading-font').value = 'inherit';
        document.getElementById('base-font-size').value = '16px';
        this.saveTypography();
    }

    saveLayout() {
        const settings = this.getCurrentSettings();
        localStorage.setItem('site_design', JSON.stringify(settings));
        this.applyDesign(settings);
        this.generateCSS(settings);
        
        if (window.adminPanel) {
            window.adminPanel.showToast('Layout saved successfully!');
        }
    }

    resetLayout() {
        document.getElementById('border-radius').value = '8px';
        document.getElementById('content-width').value = '1200px';
        this.saveLayout();
    }

    getCurrentSettings() {
        return {
            colors: {
                primary: document.getElementById('primary-color').value,
                secondary: document.getElementById('secondary-color').value,
                background: document.getElementById('bg-color').value,
                accent: document.getElementById('accent-color').value
            },
            typography: {
                primaryFont: document.getElementById('primary-font').value,
                headingFont: document.getElementById('heading-font').value,
                baseFontSize: document.getElementById('base-font-size').value
            },
            layout: {
                borderRadius: document.getElementById('border-radius').value,
                contentWidth: document.getElementById('content-width').value
            }
        };
    }

    applyDesign(settings) {
        const root = document.documentElement;

        // Apply colors
        if (settings.colors) {
            root.style.setProperty('--color-primary', settings.colors.primary);
            root.style.setProperty('--color-secondary', settings.colors.secondary);
            root.style.setProperty('--color-bg', settings.colors.background);
            root.style.setProperty('--color-bg-secondary', settings.colors.accent);
        }

        // Apply typography
        if (settings.typography) {
            root.style.setProperty('--font-family', settings.typography.primaryFont);
            if (settings.typography.headingFont !== 'inherit') {
                root.style.setProperty('--heading-font', settings.typography.headingFont);
            }
            root.style.setProperty('--font-size-base', settings.typography.baseFontSize);
        }

        // Apply layout
        if (settings.layout) {
            root.style.setProperty('--border-radius-md', settings.layout.borderRadius);
            root.style.setProperty('--container-width', settings.layout.contentWidth);
        }
    }

    generateCSS(settings) {
        const css = `
/* Custom Design Settings */
:root {
    --color-primary: ${settings.colors.primary};
    --color-secondary: ${settings.colors.secondary};
    --color-bg: ${settings.colors.background};
    --color-bg-secondary: ${settings.colors.accent};
    --font-family: ${settings.typography.primaryFont}, -apple-system, BlinkMacSystemFont, sans-serif;
    --font-size-base: ${settings.typography.baseFontSize};
    --border-radius-md: ${settings.layout.borderRadius};
}

.container {
    max-width: ${settings.layout.contentWidth};
}

${settings.typography.headingFont !== 'inherit' ? `
h1, h2, h3, h4, h5, h6 {
    font-family: ${settings.typography.headingFont}, var(--font-family);
}
` : ''}
        `;

        // Store CSS for export
        localStorage.setItem('site_custom_css', css);
        
        // Apply to current page
        let styleEl = document.getElementById('custom-design-styles');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'custom-design-styles';
            document.head.appendChild(styleEl);
        }
        styleEl.textContent = css;
    }

    exportDesign() {
        const settings = this.getCurrentSettings();
        const css = localStorage.getItem('site_custom_css') || '';
        
        const exportData = {
            settings: settings,
            css: css,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `design-settings-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        if (window.adminPanel) {
            window.adminPanel.showToast('Design exported successfully!');
        }
    }

    async importDesign(file) {
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (data.settings) {
                localStorage.setItem('site_design', JSON.stringify(data.settings));
                this.loadSavedDesign();
                this.applyDesign(data.settings);
                
                if (window.adminPanel) {
                    window.adminPanel.showToast('Design imported successfully!');
                }
            }
        } catch (error) {
            console.error('Import error:', error);
            if (window.adminPanel) {
                window.adminPanel.showToast('Error importing design', 'error');
            }
        }
    }
}

// Initialize when admin panel loads
if (window.location.pathname.includes('admin.html')) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            window.designCustomizer = new DesignCustomizer();
        }, 1000);
    });
}
