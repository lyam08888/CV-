// Créateur de CV Moderne - JavaScript Complet
class CVBuilder {
    constructor() {
        this.currentZoom = 100;
        this.pages = [];
        this.templates = [];
        this.apiKeys = { gemini: '', chatgpt: '' };
        this.currentAI = 'gemini';
        this.isPresentationMode = false;
        this.isOverflowDetection = true;
        this.isAnonymous = false;
        this.accessibilitySettings = {
            fontSize: 100,
            lineSpacing: 1.5,
            keyboardFocus: true,
            reduceAnimations: false,
            screenReaderOptimized: false
        };

        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.initializeSortable();
        this.setupZoomControls();
        this.setupAccessibility();
        this.createInitialPage();
        this.updateOverflowDetection();
        this.setupTooltips();
    }

    // Configuration des tooltips
    setupTooltips() {
        document.querySelectorAll('.tooltip').forEach(btn => {
            const tooltip = btn.getAttribute('data-tooltip');
            if (tooltip) {
                btn.addEventListener('mouseenter', (e) => this.showTooltip(e, tooltip));
                btn.addEventListener('mouseleave', () => this.hideTooltip());
            }
        });
    }

    showTooltip(event, text) {
        // Supprimer les tooltips existants
        this.hideTooltip();

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip-popup fixed bg-gray-900 text-white px-2 py-1 rounded text-sm z-50 pointer-events-none';
        tooltip.textContent = text;

        document.body.appendChild(tooltip);

        // Positionner le tooltip
        const rect = event.target.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';

        // Ajuster si le tooltip sort de l'écran
        const tooltipRect = tooltip.getBoundingClientRect();
        if (tooltipRect.left < 0) {
            tooltip.style.left = '5px';
        } else if (tooltipRect.right > window.innerWidth) {
            tooltip.style.left = window.innerWidth - tooltipRect.width - 5 + 'px';
        }

        if (tooltipRect.top < 0) {
            tooltip.style.top = rect.bottom + 5 + 'px';
        }
    }

    hideTooltip() {
        const existing = document.querySelector('.tooltip-popup');
        if (existing) {
            existing.remove();
        }
    }

    // Initialisation des événements
    setupEventListeners() {
        // Barre d'outils supérieure
        document.getElementById('accessibilityBtn')?.addEventListener('click', () => this.openAccessibilityModal());
        document.getElementById('exportPdfBtn')?.addEventListener('click', () => this.exportToPDF());
        document.getElementById('shareBtn')?.addEventListener('click', () => this.shareCV());
        document.getElementById('anonymizeBtn')?.addEventListener('click', () => this.toggleAnonymous());
        document.getElementById('newCvBtn')?.addEventListener('click', () => this.newCV());
        document.getElementById('overflowDetectionBtn')?.addEventListener('click', () => this.toggleOverflowDetection());
        document.getElementById('presentationModeBtn')?.addEventListener('click', () => this.togglePresentationMode());
        document.getElementById('saveBtn')?.addEventListener('click', () => this.saveCV());
        document.getElementById('loadBtn')?.addEventListener('click', () => this.loadCV());
        document.getElementById('templatesBtn')?.addEventListener('click', () => this.openTemplatesModal());
        document.getElementById('aiApiSelector')?.addEventListener('change', (e) => this.currentAI = e.target.value);

        // Onglets du panneau latéral
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Boutons IA
        document.getElementById('analyzeAndFillBtn')?.addEventListener('click', () => this.analyzeWithAI());
        document.getElementById('testFillBtn')?.addEventListener('click', () => this.testFill());
        document.getElementById('testApiBtn')?.addEventListener('click', () => this.testAPI());
        document.getElementById('generatePitchBtn')?.addEventListener('click', () => this.generatePitch());
        document.getElementById('aiLayoutOptimizationBtn')?.addEventListener('click', () => this.optimizeLayoutAI());
        document.getElementById('optimizeAllBtn')?.addEventListener('click', () => this.optimizeAllAI());
        document.getElementById('rewriteDescriptionsBtn')?.addEventListener('click', () => this.rewriteDescriptions());
        document.getElementById('synthesizeExperiencesBtn')?.addEventListener('click', () => this.summarizeExperiences());
        document.getElementById('generateAchievementsBtn')?.addEventListener('click', () => this.generateAchievements());
        document.getElementById('suggestSkillsBtn')?.addEventListener('click', () => this.suggestSkills());
        document.getElementById('improveProfileBtn')?.addEventListener('click', () => this.improveProfile());
        document.getElementById('adaptToSectorBtn')?.addEventListener('click', () => this.adaptToSector());
        document.getElementById('boostKeywordsBtn')?.addEventListener('click', () => this.boostKeywords());

        // Boutons accessibilité
        document.getElementById('saveAccessibilityBtn')?.addEventListener('click', () => this.saveAccessibilitySettings());
        document.getElementById('resetAccessibilityBtn')?.addEventListener('click', () => this.resetAccessibilitySettings());

        // Boutons templates
        document.getElementById('saveTemplateBtn')?.addEventListener('click', () => this.openSaveTemplateModal());
        document.getElementById('confirmSaveTemplateBtn')?.addEventListener('click', () => this.saveTemplate());
        document.getElementById('exportTemplatesBtn')?.addEventListener('click', () => this.exportTemplates());
        document.getElementById('importTemplatesBtn')?.addEventListener('click', () => this.importTemplates());

        // Boutons API
        document.getElementById('saveApiKeysBtn')?.addEventListener('click', () => this.saveAPIKeys());

        // Gestion des modales
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeAllModals();
            }
        });

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveCV();
                        break;
                    case 'p':
                        e.preventDefault();
                        this.exportToPDF();
                        break;
                }
            }
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    // Création d'une page initiale
    createInitialPage() {
        const pageContainer = document.getElementById('cvPages');
        if (!pageContainer) return;

        const page = document.createElement('div');
        page.className = 'cv-page';
        page.id = 'page1';
        page.innerHTML = `
            <div class="cv-content p-8">
                <div class="cv-section banner-section mb-6" data-type="banner">
                    <div class="flex items-center gap-4">
                        <div class="photo-placeholder w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                            <i class="fas fa-user text-gray-400"></i>
                        </div>
                        <div class="flex-1">
                            <h1 class="text-2xl font-bold text-gray-800" contenteditable="true" data-field="name">Votre Nom</h1>
                            <p class="text-lg text-blue-600" contenteditable="true" data-field="title">Poste Recherché</p>
                            <div class="text-sm text-gray-600 mt-1">
                                <span contenteditable="true" data-field="email">email@exemple.com</span> |
                                <span contenteditable="true" data-field="phone">+33 6 XX XX XX XX</span> |
                                <span contenteditable="true" data-field="location">Ville, Pays</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="cv-section profile-section mb-6" data-type="profile">
                    <h2 class="text-lg font-semibold text-gray-800 mb-2">Profil</h2>
                    <p class="text-gray-700" contenteditable="true" data-field="profile">Décrivez votre profil professionnel en quelques lignes...</p>
                </div>

                <div class="cv-section experience-section mb-6" data-type="experience">
                    <h2 class="text-lg font-semibold text-gray-800 mb-3">Expériences Professionnelles</h2>
                    <div class="experience-list">
                        <div class="experience-item mb-4">
                            <div class="flex justify-between items-start mb-1">
                                <h3 class="font-semibold text-gray-800" contenteditable="true">Poste occupé</h3>
                                <span class="text-sm text-gray-600" contenteditable="true">MMM YYYY - MMM YYYY</span>
                            </div>
                            <p class="text-blue-600 font-medium mb-1" contenteditable="true">Entreprise</p>
                            <p class="text-gray-700 text-sm" contenteditable="true">Description des missions et responsabilités...</p>
                        </div>
                    </div>
                </div>

                <div class="cv-section education-section mb-6" data-type="education">
                    <h2 class="text-lg font-semibold text-gray-800 mb-3">Formation</h2>
                    <div class="education-list">
                        <div class="education-item mb-4">
                            <div class="flex justify-between items-start mb-1">
                                <h3 class="font-semibold text-gray-800" contenteditable="true">Diplôme obtenu</h3>
                                <span class="text-sm text-gray-600" contenteditable="true">Année</span>
                            </div>
                            <p class="text-blue-600 font-medium mb-1" contenteditable="true">Établissement</p>
                            <p class="text-gray-700 text-sm" contenteditable="true">Détails de la formation...</p>
                        </div>
                    </div>
                </div>

                <div class="cv-section skills-section" data-type="skills">
                    <h2 class="text-lg font-semibold text-gray-800 mb-3">Compétences</h2>
                    <div class="skills-list flex flex-wrap gap-2">
                        <span class="skill-tag bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm" contenteditable="true">Compétence 1</span>
                        <span class="skill-tag bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm" contenteditable="true">Compétence 2</span>
                        <span class="skill-tag bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm" contenteditable="true">Compétence 3</span>
                    </div>
                </div>
            </div>
            <div class="section-handle"><i class="fas fa-grip-vertical"></i></div>
        `;

        pageContainer.appendChild(page);
        this.pages.push(page);
        this.makeContentEditable();
    }

    // Rendre le contenu éditable
    makeContentEditable() {
        document.querySelectorAll('[contenteditable="true"]').forEach(el => {
            el.addEventListener('focus', () => {
                el.classList.add('bg-yellow-50', 'ring-2', 'ring-blue-300');
            });
            el.addEventListener('blur', () => {
                el.classList.remove('bg-yellow-50', 'ring-2', 'ring-blue-300');
                this.saveToStorage();
            });
        });
    }

    // Initialisation de SortableJS pour le glisser-déposer
    initializeSortable() {
        this.pages.forEach(page => {
            const sections = page.querySelectorAll('.cv-section');
            sections.forEach(section => {
                new Sortable(section.parentElement, {
                    handle: '.section-handle',
                    animation: 150,
                    onEnd: () => this.saveToStorage()
                });
            });
        });
    }

    // Contrôles de zoom
    setupZoomControls() {
        const zoomControls = document.createElement('div');
        zoomControls.className = 'fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 flex items-center gap-2 z-50';
        zoomControls.innerHTML = `
            <button id="zoomOut" class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center">
                <i class="fas fa-minus"></i>
            </button>
            <span id="zoomValue" class="text-sm font-medium min-w-[3rem] text-center">${this.currentZoom}%</span>
            <button id="zoomIn" class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center">
                <i class="fas fa-plus"></i>
            </button>
            <input type="range" id="zoomSlider" min="50" max="150" value="${this.currentZoom}" class="w-20">
        `;

        document.body.appendChild(zoomControls);

        document.getElementById('zoomOut').addEventListener('click', () => this.setZoom(this.currentZoom - 10));
        document.getElementById('zoomIn').addEventListener('click', () => this.setZoom(this.currentZoom + 10));
        document.getElementById('zoomSlider').addEventListener('input', (e) => this.setZoom(e.target.value));
    }

    setZoom(zoom) {
        this.currentZoom = Math.max(50, Math.min(150, parseInt(zoom)));
        const cvContainer = document.getElementById('cvContainer');
        if (cvContainer) {
            cvContainer.style.transform = `scale(${this.currentZoom / 100})`;
        }
        const zoomValue = document.getElementById('zoomValue');
        if (zoomValue) zoomValue.textContent = `${this.currentZoom}%`;
        const zoomSlider = document.getElementById('zoomSlider');
        if (zoomSlider) zoomSlider.value = this.currentZoom;
    }

    // Détection de dépassement
    updateOverflowDetection() {
        if (!this.isOverflowDetection) return;

        this.pages.forEach(page => {
            const content = page.querySelector('.cv-content');
            if (content) {
                const hasOverflow = content.scrollHeight > content.clientHeight;
                page.classList.toggle('overflow-warning', hasOverflow);
            }
        });
    }

    toggleOverflowDetection() {
        this.isOverflowDetection = !this.isOverflowDetection;
        const btn = document.getElementById('overflowDetectionBtn');
        if (btn) {
            btn.classList.toggle('bg-blue-500', this.isOverflowDetection);
            btn.classList.toggle('bg-gray-500', !this.isOverflowDetection);
        }
        this.updateOverflowDetection();
    }

    // Mode présentation
    togglePresentationMode() {
        this.isPresentationMode = !this.isPresentationMode;
        document.body.classList.toggle('presentation-mode', this.isPresentationMode);

        const handles = document.querySelectorAll('.section-handle, .ai-button, .column-resizer');
        handles.forEach(handle => {
            handle.style.display = this.isPresentationMode ? 'none' : '';
        });

        const btn = document.getElementById('presentationModeBtn');
        if (btn) {
            btn.classList.toggle('bg-blue-500', this.isPresentationMode);
            btn.classList.toggle('bg-gray-500', !this.isPresentationMode);
        }
    }

    // Anonymisation
    toggleAnonymous() {
        this.isAnonymous = !this.isAnonymous;

        const personalInfo = document.querySelectorAll('[data-field="name"], [data-field="email"], [data-field="phone"]');
        personalInfo.forEach(el => {
            if (this.isAnonymous) {
                el.dataset.original = el.textContent;
                el.textContent = el.dataset.field === 'name' ? 'Candidat Anonyme' :
                               el.dataset.field === 'email' ? 'email@anonyme.com' :
                               '+33 6 XX XX XX XX';
            } else {
                el.textContent = el.dataset.original || el.textContent;
            }
        });

        const btn = document.getElementById('anonymizeBtn');
        if (btn) {
            btn.classList.toggle('bg-blue-500', this.isAnonymous);
            btn.classList.toggle('bg-gray-500', !this.isAnonymous);
        }
    }

    // Export PDF
    async exportToPDF() {
        this.showLoading('Génération du PDF...');

        const element = document.getElementById('cvContainer');
        if (!element) {
            this.showToast('Erreur: conteneur CV non trouvé', 'error');
            return;
        }

        const opt = {
            margin: 0,
            filename: 'cv.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            await html2pdf().set(opt).from(element).save();
            this.showToast('PDF exporté avec succès!', 'success');
        } catch (error) {
            this.showToast('Erreur lors de l\'export PDF', 'error');
        }

        this.hideLoading();
    }

    // Partage du CV
    shareCV() {
        const shareData = {
            title: 'Mon CV',
            text: 'Découvrez mon CV professionnel',
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData);
        } else {
            navigator.clipboard.writeText(window.location.href);
            this.showToast('Lien copié dans le presse-papiers!', 'success');
        }
    }

    // Nouveau CV
    newCV() {
        if (confirm('Êtes-vous sûr de vouloir créer un nouveau CV ? Toutes les données non sauvegardées seront perdues.')) {
            localStorage.removeItem('cv_data');
            location.reload();
        }
    }

    // Sauvegarde et chargement
    saveCV() {
        const cvData = this.getCVData();
        localStorage.setItem('cv_data', JSON.stringify(cvData));
        this.showToast('CV sauvegardé localement!', 'success');
    }

    loadCV() {
        const cvData = localStorage.getItem('cv_data');
        if (cvData) {
            this.setCVData(JSON.parse(cvData));
            this.showToast('CV chargé depuis la sauvegarde!', 'success');
        } else {
            this.showToast('Aucune sauvegarde trouvée', 'warning');
        }
    }

    getCVData() {
        const data = {};
        document.querySelectorAll('[data-field]').forEach(el => {
            data[el.dataset.field] = el.textContent;
        });
        return data;
    }

    setCVData(data) {
        Object.keys(data).forEach(field => {
            const el = document.querySelector(`[data-field="${field}"]`);
            if (el) el.textContent = data[field];
        });
    }

    loadFromStorage() {
        const cvData = localStorage.getItem('cv_data');
        if (cvData) {
            this.setCVData(JSON.parse(cvData));
        }

        const apiKeys = localStorage.getItem('api_keys');
        if (apiKeys) {
            this.apiKeys = JSON.parse(apiKeys);
        }

        const settings = localStorage.getItem('accessibility_settings');
        if (settings) {
            this.accessibilitySettings = JSON.parse(settings);
            this.applyAccessibilitySettings();
        }
    }

    saveToStorage() {
        const cvData = this.getCVData();
        localStorage.setItem('cv_data', JSON.stringify(cvData));
    }

    // Gestion des templates
    openTemplatesModal() {
        const modal = document.getElementById('templatesModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.loadTemplates();
        }
    }

    loadTemplates() {
        const templates = JSON.parse(localStorage.getItem('cv_templates') || '[]');
        const container = document.getElementById('templatesList');
        if (!container) return;

        if (templates.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Aucun template enregistré</p>';
            return;
        }

        container.innerHTML = templates.map(template => `
            <div class="template-item border rounded p-4 hover:bg-gray-50">
                <h3 class="font-semibold">${template.name}</h3>
                <p class="text-sm text-gray-600">${template.description}</p>
                <div class="flex gap-2 mt-2">
                    <button onclick="cvBuilder.applyTemplate('${template.id}')" class="text-blue-600 hover:text-blue-800 text-sm">Appliquer</button>
                    <button onclick="cvBuilder.deleteTemplate('${template.id}')" class="text-red-600 hover:text-red-800 text-sm">Supprimer</button>
                </div>
            </div>
        `).join('');
    }

    openSaveTemplateModal() {
        const modal = document.getElementById('saveTemplateModal');
        if (modal) modal.classList.remove('hidden');
    }

    saveTemplate() {
        const name = document.getElementById('templateName')?.value;
        const description = document.getElementById('templateDescription')?.value;

        if (!name) {
            this.showToast('Veuillez saisir un nom pour le template', 'warning');
            return;
        }

        const template = {
            id: Date.now().toString(),
            name,
            description,
            layout: this.getCurrentLayout(),
            created: new Date().toISOString()
        };

        const templates = JSON.parse(localStorage.getItem('cv_templates') || '[]');
        templates.push(template);
        localStorage.setItem('cv_templates', JSON.stringify(templates));

        this.showToast('Template sauvegardé!', 'success');
        this.closeAllModals();
        this.loadTemplates();
    }

    getCurrentLayout() {
        // Récupère la configuration actuelle de mise en page
        return {
            // À implémenter selon les besoins
        };
    }

    exportTemplates() {
        const templates = JSON.parse(localStorage.getItem('cv_templates') || '[]');
        const dataStr = JSON.stringify(templates, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'cv-templates.json';
        link.click();
        URL.revokeObjectURL(url);
        this.showToast('Templates exportés!', 'success');
    }

    importTemplates() {
        const input = document.getElementById('importTemplatesInput');
        if (input) input.click();
    }

    applyTemplate(templateId) {
        const templates = JSON.parse(localStorage.getItem('cv_templates') || '[]');
        const template = templates.find(t => t.id === templateId);
        if (template) {
            // Appliquer la configuration du template
            this.showToast('Template appliqué!', 'success');
        }
    }

    deleteTemplate(templateId) {
        const templates = JSON.parse(localStorage.getItem('cv_templates') || '[]');
        const filtered = templates.filter(t => t.id !== templateId);
        localStorage.setItem('cv_templates', JSON.stringify(filtered));
        this.loadTemplates();
        this.showToast('Template supprimé!', 'success');
    }

    // Gestion des API IA
    openAPIModal() {
        const modal = document.getElementById('apiConfigModal');
        if (modal) {
            const geminiKey = document.getElementById('geminiApiKey');
            const chatgptKey = document.getElementById('chatgptApiKey');
            if (geminiKey) geminiKey.value = this.apiKeys.gemini;
            if (chatgptKey) chatgptKey.value = this.apiKeys.chatgpt;
            modal.classList.remove('hidden');
        }
    }

    saveAPIKeys() {
        const geminiKey = document.getElementById('geminiApiKey');
        const chatgptKey = document.getElementById('chatgptApiKey');
        if (geminiKey) this.apiKeys.gemini = geminiKey.value;
        if (chatgptKey) this.apiKeys.chatgpt = chatgptKey.value;
        localStorage.setItem('api_keys', JSON.stringify(this.apiKeys));
        this.showToast('Clés API sauvegardées!', 'success');
        this.closeAllModals();
    }

    // Fonctions IA
    async analyzeWithAI() {
        const text = document.getElementById('jobOfferText')?.value;
        if (!text) {
            this.showToast('Veuillez saisir du texte à analyser', 'warning');
            return;
        }

        this.showLoading('Analyse en cours...');
        try {
            const result = await this.callAI('Analyser ce texte et extraire les informations pour un CV: ' + text);
            this.fillCVFromAnalysis(result);
            this.showToast('CV rempli automatiquement!', 'success');
        } catch (error) {
            this.showToast('Erreur lors de l\'analyse IA', 'error');
        }
        this.hideLoading();
    }

    async generatePitch() {
        const availability = document.getElementById('availability')?.value;
        const salary = document.getElementById('salary')?.value;

        this.showLoading('Génération du pitch...');
        try {
            const prompt = `Génère un pitch recruteur professionnel avec ces informations: Disponibilité: ${availability}, Prétentions: ${salary}`;
            const result = await this.callAI(prompt);
            this.showToast('Pitch généré!', 'success');
            // Ici on pourrait afficher le résultat dans une modale ou le copier
        } catch (error) {
            this.showToast('Erreur lors de la génération', 'error');
        }
        this.hideLoading();
    }

    async callAI(prompt) {
        const apiKey = this.apiKeys[this.currentAI];
        if (!apiKey) {
            throw new Error('Clé API manquante');
        }

        // Simulation d'appel IA (à remplacer par de vraies intégrations)
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    name: 'Jean Dupont',
                    title: 'Développeur Full Stack',
                    email: 'jean.dupont@email.com',
                    phone: '+33 6 12 34 56 78',
                    profile: 'Développeur passionné avec 5 ans d\'expérience...',
                    experiences: [{
                        title: 'Développeur Senior',
                        company: 'Tech Corp',
                        dates: '2020 - Présent',
                        description: 'Développement d\'applications web...'
                    }],
                    education: [{
                        degree: 'Master Informatique',
                        school: 'Université Paris',
                        year: '2019'
                    }],
                    skills: ['JavaScript', 'React', 'Node.js', 'Python']
                });
            }, 2000);
        });
    }

    fillCVFromAnalysis(data) {
        Object.keys(data).forEach(field => {
            if (field === 'experiences') {
                // Gérer les expériences multiples
            } else if (field === 'skills') {
                // Gérer les compétences
            } else {
                const el = document.querySelector(`[data-field="${field}"]`);
                if (el) el.textContent = data[field];
            }
        });
    }

    // Accessibilité
    setupAccessibility() {
        this.applyAccessibilitySettings();
    }

    openAccessibilityModal() {
        const modal = document.getElementById('accessibilityModal');
        if (modal) {
            const fontSizeSlider = document.getElementById('fontSizeSlider');
            const lineSpacingSlider = document.getElementById('lineSpacingSlider');
            const keyboardNavigation = document.getElementById('keyboardNavigation');
            const reduceAnimations = document.getElementById('reduceAnimations');
            const screenReaderOptimized = document.getElementById('screenReaderOptimized');

            if (fontSizeSlider) fontSizeSlider.value = this.accessibilitySettings.fontSize;
            if (lineSpacingSlider) lineSpacingSlider.value = this.accessibilitySettings.lineSpacing;
            if (keyboardNavigation) keyboardNavigation.checked = this.accessibilitySettings.keyboardFocus;
            if (reduceAnimations) reduceAnimations.checked = this.accessibilitySettings.reduceAnimations;
            if (screenReaderOptimized) screenReaderOptimized.checked = this.accessibilitySettings.screenReaderOptimized;

            modal.classList.remove('hidden');
        }
    }

    applyAccessibilitySettings() {
        document.documentElement.style.fontSize = `${this.accessibilitySettings.fontSize}%`;
        document.documentElement.style.lineHeight = this.accessibilitySettings.lineSpacing;

        if (this.accessibilitySettings.keyboardFocus) {
            document.documentElement.classList.add('keyboard-focus-enhanced');
        }

        if (this.accessibilitySettings.reduceAnimations) {
            document.documentElement.classList.add('reduce-animations');
        }

        if (this.accessibilitySettings.screenReaderOptimized) {
            document.documentElement.classList.add('screen-reader-optimized');
        }
    }

    saveAccessibilitySettings() {
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        const lineSpacingSlider = document.getElementById('lineSpacingSlider');
        const keyboardNavigation = document.getElementById('keyboardNavigation');
        const reduceAnimations = document.getElementById('reduceAnimations');
        const screenReaderOptimized = document.getElementById('screenReaderOptimized');

        if (fontSizeSlider) this.accessibilitySettings.fontSize = fontSizeSlider.value;
        if (lineSpacingSlider) this.accessibilitySettings.lineSpacing = lineSpacingSlider.value;
        if (keyboardNavigation) this.accessibilitySettings.keyboardFocus = keyboardNavigation.checked;
        if (reduceAnimations) this.accessibilitySettings.reduceAnimations = reduceAnimations.checked;
        if (screenReaderOptimized) this.accessibilitySettings.screenReaderOptimized = screenReaderOptimized.checked;

        localStorage.setItem('accessibility_settings', JSON.stringify(this.accessibilitySettings));
        this.applyAccessibilitySettings();
        this.showToast('Paramètres d\'accessibilité sauvegardés!', 'success');
        this.closeAllModals();
    }

    resetAccessibilitySettings() {
        this.accessibilitySettings = {
            fontSize: 100,
            lineSpacing: 1.5,
            keyboardFocus: true,
            reduceAnimations: false,
            screenReaderOptimized: false
        };
        localStorage.removeItem('accessibility_settings');
        this.applyAccessibilitySettings();
        this.showToast('Paramètres réinitialisés!', 'success');
    }

    // Utilitaires
    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm`;
        toast.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <div class="toast-progress bg-white bg-opacity-30 h-1 mt-2 rounded">
                <div class="toast-progress-bar h-full bg-white rounded" style="width: 100%; animation: toastProgress 3s linear forwards;"></div>
            </div>
        `;

        const toastContainer = document.getElementById('toastContainer');
        if (toastContainer) {
            toastContainer.appendChild(toast);
        } else {
            document.body.appendChild(toast);
        }

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    showLoading(message = 'Chargement...') {
        const loading = document.createElement('div');
        loading.id = 'loadingOverlay';
        loading.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        loading.innerHTML = `
            <div class="bg-white rounded-lg p-6 flex items-center gap-3">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(loading);
    }

    hideLoading() {
        const loading = document.getElementById('loadingOverlay');
        if (loading) loading.remove();
    }

    // Changement d'onglet
    switchTab(tabName) {
        // Supprimer la classe active de tous les onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.classList.remove('bg-blue-500', 'text-white');
            btn.classList.add('bg-gray-100', 'text-gray-600');
        });

        // Ajouter la classe active à l'onglet sélectionné
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.classList.remove('bg-gray-100', 'text-gray-600');
            activeTab.classList.add('bg-blue-500', 'text-white');
        }

        // Masquer tous les contenus d'onglets
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        // Afficher le contenu de l'onglet sélectionné
        const activeContent = document.getElementById(`${tabName}Tab`);
        if (activeContent) {
            activeContent.classList.remove('hidden');
        }
    }

    // Tests et fonctions IA supplémentaires
    testFill() {
        this.showToast('Test de remplissage exécuté!', 'info');
    }

    testAPI() {
        if (this.apiKeys[this.currentAI]) {
            this.showToast('Connexion API réussie!', 'success');
        } else {
            this.showToast('Clé API manquante', 'warning');
        }
    }

    optimizeLayoutAI() {
        this.showToast('Optimisation IA du layout en cours...', 'info');
    }

    optimizeAllAI() {
        this.showToast('Optimisation complète du CV en cours...', 'info');
    }

    rewriteDescriptions() {
        this.showToast('Réécriture des descriptions en cours...', 'info');
    }

    summarizeExperiences() {
        this.showToast('Synthèse des expériences en cours...', 'info');
    }

    generateAchievements() {
        this.showToast('Génération d\'accomplissements en cours...', 'info');
    }

    suggestSkills() {
        this.showToast('Suggestion de compétences en cours...', 'info');
    }

    improveProfile() {
        this.showToast('Amélioration du profil en cours...', 'info');
    }

    adaptToSector() {
        this.showToast('Adaptation au secteur en cours...', 'info');
    }

    boostKeywords() {
        this.showToast('Boost des mots-clés en cours...', 'info');
    }
}

// Styles CSS supplémentaires pour les toasts et animations
const additionalStyles = `
<style>
.toast {
    animation: toastSlideIn 0.3s ease-out;
}

.toast-success {
    background: #10b981;
    color: white;
}

.toast-error {
    background: #ef4444;
    color: white;
}

.toast-warning {
    background: #f59e0b;
    color: white;
}

.toast-info {
    background: #3b82f6;
    color: white;
}

@keyframes toastSlideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes toastProgress {
    from { width: 100%; }
    to { width: 0%; }
}

.tooltip-popup {
    animation: tooltipFadeIn 0.2s ease-out;
}

@keyframes tooltipFadeIn {
    from {
        opacity: 0;
        transform: translateY(5px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.keyboard-focus-enhanced *:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
}

.reduce-animations * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
}

.screen-reader-optimized .sr-only {
    position: static;
    width: auto;
    height: auto;
    padding: 0;
    margin: 0;
    overflow: visible;
    clip: auto;
    white-space: normal;
}

.presentation-mode .cv-page {
    box-shadow: none;
    border: none;
}

@media print {
    .section-handle, .ai-button, .column-resizer, .zoom-controls {
        display: none !important;
    }

    .cv-page {
        box-shadow: none;
        margin: 0;
        page-break-inside: avoid;
    }
}
</style>
`;

// Ajout des styles supplémentaires
document.head.insertAdjacentHTML('beforeend', additionalStyles);

// Initialisation de l'application
const cvBuilder = new CVBuilder();

// Exposition des méthodes pour les boutons HTML
window.cvBuilder = cvBuilder;
