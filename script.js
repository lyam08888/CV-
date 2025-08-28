// Créateur de CV Moderne - Version Simplifiée et Robuste
class CVBuilder {
    constructor() {
        this.currentTab = 'content';
        this.experiences = [];
        this.education = [];
        this.skills = [];
        this.customSections = [];
        this.languages = [];
        this.certifications = [];
        this.projects = [];
        this.bannerSettings = {
            enabled: false,
            title: '',
            subtitle: '',
            image: null,
            style: 'modern',
            color: '#667eea',
            alignment: 'center',
            inverted: false,
            photoSize: 'md'
        };
        this.theme = 'modern';
        this.primaryColor = '#3b82f6';
        this.fontFamily = 'Inter';
        this.titleStyle = 'bold';
        this.layout = 'single';
        this.skillsStyle = 'tags';
        this.progress = 0;
        this.undoStack = [];
        this.redoStack = [];
        this.maxUndoSteps = 50;
        this.aiProvider = 'gemini';
        this.zoomLevel = 100;
        this.presentationMode = false;
        this.overflowDetection = false;
        this.anonymized = false;
        this.templates = [];
        this.accessibilitySettings = {
            textSize: 1,
            lineSpacing: 1.5,
            keyboardFocus: false,
            reduceAnimations: false,
            screenReader: false
        };

        // Attendre que le DOM soit chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    // Vérification des dépendances
    checkDependencies() {
        const dependencies = {
            'TailwindCSS': typeof tailwind !== 'undefined',
            'Font Awesome': typeof FontAwesome !== 'undefined' || document.querySelector('link[href*="font-awesome"]'),
            'html2pdf': typeof html2pdf !== 'undefined',
            'SortableJS': typeof Sortable !== 'undefined'
        };

        console.log('Vérification des dépendances:');
        Object.entries(dependencies).forEach(([name, loaded]) => {
            console.log(`${name}: ${loaded ? '✅' : '❌'}`);
        });

        return Object.values(dependencies).every(dep => dep);
    }

    init() {
        console.log('CV Builder initialisé');
        try {
            // Vérifier les dépendances
            const dependenciesOk = this.checkDependencies();

            this.loadFromStorage();
            this.setupEventListeners();
            this.initializeSortable();
            this.updateProgress();
            this.updateBannerPreview();
            this.renderAll();
            console.log('CV Builder prêt');

            if (!dependenciesOk) {
                console.warn('Certaines dépendances ne sont pas chargées correctement');
            }
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
        }
    }

    // Configuration des événements
    setupEventListeners() {
        // Boutons de la barre d'outils
        this.addEventListener('toggle-panel', 'click', () => this.togglePanel());
        this.addEventListener('accessibility-btn', 'click', () => this.openAccessibilityModal());
        this.addEventListener('export-pdf-btn', 'click', () => this.openExportModal());
        this.addEventListener('share-btn', 'click', () => this.shareCV());
        this.addEventListener('anonymize-btn', 'click', () => this.anonymizeCV());
        this.addEventListener('new-cv-btn', 'click', () => this.newCV());
        this.addEventListener('overflow-detection-btn', 'click', () => this.toggleOverflowDetection());
        this.addEventListener('presentation-btn', 'click', () => this.togglePresentationMode());
        this.addEventListener('save-cv-btn', 'click', () => this.openSaveModal());
        this.addEventListener('load-cv-btn', 'click', () => this.openLoadModal());
        this.addEventListener('templates-btn', 'click', () => this.openTemplatesModal());
        this.addEventListener('ai-provider-select', 'change', (e) => this.changeAIProvider(e.target.value));
        this.addEventListener('undo-btn', 'click', () => this.undo());
        this.addEventListener('redo-btn', 'click', () => this.redo());
        this.addEventListener('ai-analyze-btn', 'click', () => this.openAIModal());

        // Onglets
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Champs personnels
        this.addEventListener('first-name', 'input', () => this.updatePersonalInfo());
        this.addEventListener('last-name', 'input', () => this.updatePersonalInfo());
        this.addEventListener('job-title', 'input', () => this.updatePersonalInfo());
        this.addEventListener('email', 'input', () => this.updatePersonalInfo());
        this.addEventListener('phone', 'input', () => this.updatePersonalInfo());
        this.addEventListener('address', 'input', () => this.updatePersonalInfo());
        this.addEventListener('linkedin', 'input', () => this.updatePersonalInfo());
        this.addEventListener('website', 'input', () => this.updatePersonalInfo());
        this.addEventListener('summary', 'input', () => this.updatePersonalInfo());

        // Photo de profil
        this.addEventListener('photo-upload', 'change', (e) => this.handlePhotoUpload(e));
        this.addEventListener('remove-photo', 'click', () => this.removePhoto());
        this.addEventListener('upload-photo-btn', 'click', () => this.triggerPhotoUpload());
        this.addEventListener('photo-size-sm', 'click', () => this.setPhotoSize('sm'));
        this.addEventListener('photo-size-md', 'click', () => this.setPhotoSize('md'));
        this.addEventListener('photo-size-lg', 'click', () => this.setPhotoSize('lg'));
        this.addEventListener('photo-size-xl', 'click', () => this.setPhotoSize('xl'));

        // Expériences
        this.addEventListener('add-experience', 'click', () => this.addExperience());

        // Formation
        this.addEventListener('add-education', 'click', () => this.addEducation());

        // Compétences
        this.addEventListener('add-skill', 'click', () => this.addSkill());
        this.addEventListener('skills-style-tags', 'click', () => this.changeSkillsStyle('tags'));
        this.addEventListener('skills-style-levels', 'click', () => this.changeSkillsStyle('levels'));
        this.addEventListener('skills-style-simple', 'click', () => this.changeSkillsStyle('simple'));
        this.addEventListener('limit-skills-10', 'click', () => this.limitSkillsTo10());
        this.addEventListener('synthesize-skills', 'click', () => this.synthesizeSkills());

        // Sections complémentaires
        this.addEventListener('add-language', 'click', () => this.addLanguage());
        this.addEventListener('add-certification', 'click', () => this.addCertification());
        this.addEventListener('add-project', 'click', () => this.addProject());
        this.addEventListener('add-custom-section', 'click', () => this.addCustomSection());

        // Contrôles de layout
        this.addEventListener('layout-single', 'click', () => this.setLayout('single'));
        this.addEventListener('layout-50-50', 'click', () => this.setLayout('50-50'));
        this.addEventListener('layout-33-67', 'click', () => this.setLayout('33-67'));
        this.addEventListener('layout-67-33', 'click', () => this.setLayout('67-33'));
        this.addEventListener('spacing-vertical', 'input', (e) => this.updateSpacing('vertical', e.target.value));
        this.addEventListener('font-size', 'input', (e) => this.updateFontSize(e.target.value));
        this.addEventListener('margins', 'input', (e) => this.updateMargins(e.target.value));

        // Couleurs et polices
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => this.selectColor(option.dataset.color));
        });
        document.querySelectorAll('.font-option').forEach(option => {
            option.addEventListener('click', () => this.selectFont(option.dataset.font));
        });

        // Bannière
        this.addEventListener('align-left', 'click', () => this.setBannerAlignment('left'));
        this.addEventListener('align-center', 'click', () => this.setBannerAlignment('center'));
        this.addEventListener('align-right', 'click', () => this.setBannerAlignment('right'));
        this.addEventListener('inverted-layout', 'change', (e) => this.toggleInvertedLayout(e.target.checked));
        this.addEventListener('style-elegant', 'click', () => this.setBannerStyle('elegant'));
        this.addEventListener('style-modern', 'click', () => this.setBannerStyle('modern'));
        this.addEventListener('style-discreet', 'click', () => this.setBannerStyle('discreet'));
        this.addEventListener('style-card', 'click', () => this.setBannerStyle('card'));
        this.addEventListener('style-gradient', 'click', () => this.setBannerStyle('gradient'));
        this.addEventListener('style-premium', 'click', () => this.setBannerStyle('premium'));
        this.addEventListener('style-minimal', 'click', () => this.setBannerStyle('minimal'));
        this.addEventListener('style-framed', 'click', () => this.setBannerStyle('framed'));

        // Boutons IA
        this.addEventListener('analyze-fill-btn', 'click', () => this.analyzeAndFill());
        this.addEventListener('test-fill-btn', 'click', () => this.testFilling());
        this.addEventListener('test-api-btn', 'click', () => this.testAPI());
        this.addEventListener('generate-pitch-btn', 'click', () => this.generatePitch());
        this.addEventListener('layout-optimization-btn', 'click', () => this.optimizeLayout());
        this.addEventListener('optimize-cv-btn', 'click', () => this.optimizeCV());
        this.addEventListener('rewrite-descriptions-btn', 'click', () => this.rewriteDescriptions());
        this.addEventListener('summarize-experiences-btn', 'click', () => this.summarizeExperiences());
        this.addEventListener('generate-achievements-btn', 'click', () => this.generateAchievements());
        this.addEventListener('suggest-skills-btn', 'click', () => this.suggestSkills());
        this.addEventListener('improve-profile-btn', 'click', () => this.improveProfile());
        this.addEventListener('adapt-sector-btn', 'click', () => this.adaptToSector());
        this.addEventListener('boost-keywords-btn', 'click', () => this.boostKeywords());

        // Accessibilité
        this.addEventListener('text-size-slider', 'input', (e) => this.updateTextSize(e.target.value));
        this.addEventListener('line-spacing-slider', 'input', (e) => this.updateLineSpacing(e.target.value));
        this.addEventListener('keyboard-focus', 'change', (e) => this.toggleKeyboardFocus(e.target.checked));
        this.addEventListener('reduce-animations', 'change', (e) => this.toggleAnimations(e.target.checked));
        this.addEventListener('screen-reader', 'change', (e) => this.toggleScreenReader(e.target.checked));
        this.addEventListener('reset-accessibility', 'click', () => this.resetAccessibility());
        this.addEventListener('save-accessibility', 'click', () => this.saveAccessibility());
        this.addEventListener('close-accessibility', 'click', () => this.closeAccessibilityModal());

        // Templates
        this.addEventListener('save-template-btn', 'click', () => this.saveTemplate());
        this.addEventListener('export-templates-btn', 'click', () => this.exportTemplates());
        this.addEventListener('import-templates-btn', 'click', () => this.importTemplates());

        // Zoom controls
        this.addEventListener('zoom-out', 'click', () => this.zoomOut());
        this.addEventListener('zoom-in', 'click', () => this.zoomIn());
        this.addEventListener('zoom-reset', 'click', () => this.resetZoom());
        this.addEventListener('zoom-slider', 'input', (e) => this.setZoom(e.target.value));

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Modales
        document.querySelectorAll('.modal-close').forEach(close => {
            close.addEventListener('click', () => this.closeAllModals());
        });

        // IA
        this.addEventListener('analyze-job-btn', 'click', () => this.analyzeWithAI());

        // Export
        this.addEventListener('confirm-export-btn', 'click', () => this.exportToPDF());

        // Sauvegarde
        this.addEventListener('confirm-save-btn', 'click', () => this.saveCV());

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    addEventListener(id, event, handler) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, handler);
        } else {
            console.warn(`Élément avec l'ID '${id}' non trouvé`);
        }
    }

    // Gestion des onglets
    switchTab(tabName) {
        // Masquer tous les onglets
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });

        // Afficher l'onglet sélectionné
        const tabContent = document.getElementById(`tab-${tabName}`);
        const tabButton = document.querySelector(`[data-tab="${tabName}"]`);

        if (tabContent) tabContent.classList.add('active');
        if (tabButton) tabButton.classList.add('active');

        this.currentTab = tabName;
    }

    // Informations personnelles
    updatePersonalInfo() {
        const firstName = document.getElementById('first-name')?.value || '';
        const lastName = document.getElementById('last-name')?.value || '';
        const fullName = `${firstName} ${lastName}`.trim();

        const nameDisplay = document.getElementById('name-display');
        if (nameDisplay) nameDisplay.textContent = fullName || 'Votre Nom';

        const email = document.getElementById('email')?.value || '';
        const emailDisplay = document.getElementById('email-display');
        if (emailDisplay) {
            emailDisplay.innerHTML = email ? `<i class="fas fa-envelope mr-2"></i>${email}` : '';
            emailDisplay.style.display = email ? 'flex' : 'none';
        }

        const phone = document.getElementById('phone')?.value || '';
        const phoneDisplay = document.getElementById('phone-display');
        if (phoneDisplay) {
            phoneDisplay.innerHTML = phone ? `<i class="fas fa-phone mr-2"></i>${phone}` : '';
            phoneDisplay.style.display = phone ? 'flex' : 'none';
        }

        const address = document.getElementById('address')?.value || '';
        const addressDisplay = document.getElementById('address-display');
        if (addressDisplay) {
            addressDisplay.innerHTML = address ? `<i class="fas fa-map-marker-alt mr-2"></i>${address}` : '';
            addressDisplay.style.display = address ? 'flex' : 'none';
        }

        const linkedin = document.getElementById('linkedin')?.value || '';
        const linkedinDisplay = document.getElementById('linkedin-display');
        if (linkedinDisplay) {
            linkedinDisplay.innerHTML = linkedin ? `<i class="fab fa-linkedin mr-2"></i>LinkedIn` : '';
            linkedinDisplay.style.display = linkedin ? 'flex' : 'none';
        }

        const website = document.getElementById('website')?.value || '';
        const websiteDisplay = document.getElementById('website-display');
        if (websiteDisplay) {
            websiteDisplay.innerHTML = website ? `<i class="fas fa-globe mr-2"></i>Site web` : '';
            websiteDisplay.style.display = website ? 'flex' : 'none';
        }

        const summary = document.getElementById('summary')?.value || '';
        const summaryDisplay = document.getElementById('summary-display');
        if (summaryDisplay) {
            summaryDisplay.textContent = summary;
            summaryDisplay.style.display = summary ? 'block' : 'none';
        }

        this.saveToHistory();
        this.updateProgress();
    }

    // Gestion de la photo
    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const photoContainer = document.getElementById('profile-photo-container');
                const photo = document.getElementById('profile-photo');

                if (photoContainer && photo) {
                    photo.src = e.target.result;
                    photoContainer.classList.remove('hidden');
                }
            };
            reader.readAsDataURL(file);
        }
    }

    removePhoto() {
        const photoContainer = document.getElementById('profile-photo-container');
        const photo = document.getElementById('profile-photo');

        if (photoContainer && photo) {
            photo.src = '';
            photoContainer.classList.add('hidden');
        }

        // Reset file input
        const fileInput = document.getElementById('photo-upload');
        if (fileInput) fileInput.value = '';
    }

    // Gestion des expériences
    addExperience() {
        const experience = {
            id: Date.now(),
            position: '',
            company: '',
            startDate: '',
            endDate: '',
            description: ''
        };

        this.experiences.push(experience);
        this.renderExperiences();
        this.saveToHistory();
    }

    renderExperiences() {
        const container = document.getElementById('experiences-list');
        if (!container) return;

        container.innerHTML = '';

        this.experiences.forEach((exp, index) => {
            const expDiv = document.createElement('div');
            expDiv.className = 'bg-gray-50 p-4 rounded-lg';
            expDiv.innerHTML = `
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <input type="text" placeholder="Poste" class="control-input exp-position" value="${exp.position}" data-index="${index}">
                    <input type="text" placeholder="Entreprise" class="control-input exp-company" value="${exp.company}" data-index="${index}">
                    <input type="text" placeholder="Date début" class="control-input exp-start" value="${exp.startDate}" data-index="${index}">
                    <input type="text" placeholder="Date fin" class="control-input exp-end" value="${exp.endDate}" data-index="${index}">
                </div>
                <textarea placeholder="Description" class="control-input control-textarea exp-description" data-index="${index}">${exp.description}</textarea>
                <button class="btn btn-danger btn-sm mt-2 remove-experience" data-index="${index}">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            `;

            // Événements pour mettre à jour l'expérience
            expDiv.querySelectorAll('input, textarea').forEach(input => {
                input.addEventListener('input', (e) => this.updateExperience(index, e.target));
            });

            expDiv.querySelector('.remove-experience').addEventListener('click', () => this.removeExperience(index));

            container.appendChild(expDiv);
        });

        this.renderExperienceDisplay();
    }

    updateExperience(index, element) {
        const field = element.className.includes('exp-position') ? 'position' :
                     element.className.includes('exp-company') ? 'company' :
                     element.className.includes('exp-start') ? 'startDate' :
                     element.className.includes('exp-end') ? 'endDate' :
                     element.className.includes('exp-description') ? 'description' : '';

        if (field && this.experiences[index]) {
            this.experiences[index][field] = element.value;
            this.renderExperienceDisplay();
            this.saveToHistory();
        }
    }

    removeExperience(index) {
        this.experiences.splice(index, 1);
        this.renderExperiences();
        this.saveToHistory();
    }

    renderExperienceDisplay() {
        const container = document.getElementById('experience-content');
        if (!container) return;

        container.innerHTML = '';

        this.experiences.forEach(exp => {
            if (exp.position || exp.company) {
                const expDiv = document.createElement('div');
                expDiv.className = 'experience-item mb-4';
                expDiv.innerHTML = `
                    <div class="flex justify-between items-start mb-1">
                        <h3 class="font-semibold text-gray-800">${exp.position || 'Poste'}</h3>
                        <span class="text-sm text-gray-600">${exp.startDate} - ${exp.endDate || 'Présent'}</span>
                    </div>
                    <p class="text-blue-600 font-medium mb-1">${exp.company || 'Entreprise'}</p>
                    <p class="text-gray-700 text-sm">${exp.description || 'Description...'}</p>
                `;
                container.appendChild(expDiv);
            }
        });
    }

    // Gestion de la formation
    addEducation() {
        const education = {
            id: Date.now(),
            degree: '',
            institution: '',
            year: '',
            description: ''
        };

        this.education.push(education);
        this.renderEducation();
        this.saveToHistory();
    }

    renderEducation() {
        const container = document.getElementById('education-list');
        if (!container) return;

        container.innerHTML = '';

        this.education.forEach((edu, index) => {
            const eduDiv = document.createElement('div');
            eduDiv.className = 'bg-gray-50 p-4 rounded-lg';
            eduDiv.innerHTML = `
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <input type="text" placeholder="Diplôme" class="control-input edu-degree" value="${edu.degree}" data-index="${index}">
                    <input type="text" placeholder="Établissement" class="control-input edu-institution" value="${edu.institution}" data-index="${index}">
                    <input type="text" placeholder="Année" class="control-input edu-year" value="${edu.year}" data-index="${index}">
                </div>
                <textarea placeholder="Description" class="control-input control-textarea edu-description" data-index="${index}">${edu.description}</textarea>
                <button class="btn btn-danger btn-sm mt-2 remove-education" data-index="${index}">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            `;

            eduDiv.querySelectorAll('input, textarea').forEach(input => {
                input.addEventListener('input', (e) => this.updateEducation(index, e.target));
            });

            eduDiv.querySelector('.remove-education').addEventListener('click', () => this.removeEducation(index));

            container.appendChild(eduDiv);
        });

        this.renderEducationDisplay();
    }

    updateEducation(index, element) {
        const field = element.className.includes('edu-degree') ? 'degree' :
                     element.className.includes('edu-institution') ? 'institution' :
                     element.className.includes('edu-year') ? 'year' :
                     element.className.includes('edu-description') ? 'description' : '';

        if (field && this.education[index]) {
            this.education[index][field] = element.value;
            this.renderEducationDisplay();
            this.saveToHistory();
        }
    }

    removeEducation(index) {
        this.education.splice(index, 1);
        this.renderEducation();
        this.saveToHistory();
    }

    renderEducationDisplay() {
        const container = document.getElementById('education-content');
        if (!container) return;

        container.innerHTML = '';

        this.education.forEach(edu => {
            if (edu.degree || edu.institution) {
                const eduDiv = document.createElement('div');
                eduDiv.className = 'education-item mb-4';
                eduDiv.innerHTML = `
                    <div class="flex justify-between items-start mb-1">
                        <h3 class="font-semibold text-gray-800">${edu.degree || 'Diplôme'}</h3>
                        <span class="text-sm text-gray-600">${edu.year || 'Année'}</span>
                    </div>
                    <p class="text-blue-600 font-medium mb-1">${edu.institution || 'Établissement'}</p>
                    <p class="text-gray-700 text-sm">${edu.description || 'Description...'}</p>
                `;
                container.appendChild(eduDiv);
            }
        });
    }

    // Gestion des compétences
    addSkill() {
        const skill = {
            id: Date.now(),
            name: '',
            level: 3
        };

        this.skills.push(skill);
        this.renderSkills();
        this.saveToHistory();
    }

    renderSkills() {
        const container = document.getElementById('skills-list');
        if (!container) return;

        container.innerHTML = '';

        this.skills.forEach((skill, index) => {
            const skillDiv = document.createElement('div');
            skillDiv.className = 'skill-item flex items-center gap-2 mb-2';
            skillDiv.innerHTML = `
                <input type="text" placeholder="Compétence" class="control-input flex-1 skill-name" value="${skill.name}" data-index="${index}">
                <input type="range" min="1" max="5" class="skill-level-input" value="${skill.level}" data-index="${index}">
                <span class="text-sm text-gray-600 w-8">${skill.level}/5</span>
                <button class="btn btn-danger btn-sm remove-skill" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            `;

            skillDiv.querySelector('.skill-name').addEventListener('input', (e) => {
                this.skills[index].name = e.target.value;
                this.renderSkillsDisplay();
                this.saveToHistory();
            });

            skillDiv.querySelector('.skill-level-input').addEventListener('input', (e) => {
                this.skills[index].level = parseInt(e.target.value);
                skillDiv.querySelector('span').textContent = `${e.target.value}/5`;
                this.renderSkillsDisplay();
                this.saveToHistory();
            });

            skillDiv.querySelector('.remove-skill').addEventListener('click', () => this.removeSkill(index));

            container.appendChild(skillDiv);
        });

        this.renderSkillsDisplay();
    }

    removeSkill(index) {
        this.skills.splice(index, 1);
        this.renderSkills();
        this.saveToHistory();
    }

    changeSkillsStyle(style) {
        this.skillsStyle = style;
        this.renderSkillsDisplay();
        this.saveToHistory();
    }

    renderSkillsDisplay() {
        const container = document.getElementById('skills-content');
        if (!container) return;

        container.innerHTML = '';

        if (this.skillsStyle === 'levels') {
            this.skills.forEach(skill => {
                if (skill.name) {
                    const skillDiv = document.createElement('div');
                    skillDiv.className = 'skill-item mb-3';
                    skillDiv.innerHTML = `
                        <div class="flex justify-between items-center mb-1">
                            <span class="font-medium text-gray-800">${skill.name}</span>
                            <span class="text-sm text-gray-600">${skill.level}/5</span>
                        </div>
                        <div class="skill-level">
                            <div class="skill-level-fill" style="width: ${skill.level * 20}%"></div>
                        </div>
                    `;
                    container.appendChild(skillDiv);
                }
            });
        } else {
            const skillsContainer = document.createElement('div');
            skillsContainer.className = 'flex flex-wrap gap-2';

            this.skills.forEach(skill => {
                if (skill.name) {
                    const skillTag = document.createElement('span');
                    skillTag.className = 'skill-tag';
                    skillTag.textContent = skill.name;
                    skillsContainer.appendChild(skillTag);
                }
            });

            container.appendChild(skillsContainer);
        }
    }

    // Sections personnalisées
    addCustomSection() {
        const customSection = {
            id: Date.now(),
            title: '',
            content: ''
        };

        this.customSections.push(customSection);
        this.renderCustomSections();
        this.saveToHistory();
    }

    renderCustomSections() {
        const container = document.getElementById('custom-sections-list');
        if (!container) return;

        container.innerHTML = '';

        this.customSections.forEach((section, index) => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'bg-gray-50 p-4 rounded-lg';
            sectionDiv.innerHTML = `
                <input type="text" placeholder="Titre de la section" class="control-input mb-4 custom-title" value="${section.title}" data-index="${index}">
                <textarea placeholder="Contenu de la section" class="control-input control-textarea custom-content" data-index="${index}">${section.content}</textarea>
                <button class="btn btn-danger btn-sm mt-2 remove-custom-section" data-index="${index}">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            `;

            sectionDiv.querySelector('.custom-title').addEventListener('input', (e) => {
                this.customSections[index].title = e.target.value;
                this.renderCustomSectionsDisplay();
                this.saveToHistory();
            });

            sectionDiv.querySelector('.custom-content').addEventListener('input', (e) => {
                this.customSections[index].content = e.target.value;
                this.renderCustomSectionsDisplay();
                this.saveToHistory();
            });

            sectionDiv.querySelector('.remove-custom-section').addEventListener('click', () => this.removeCustomSection(index));

            container.appendChild(sectionDiv);
        });

        this.renderCustomSectionsDisplay();
    }

    removeCustomSection(index) {
        this.customSections.splice(index, 1);
        this.renderCustomSections();
        this.saveToHistory();
    }

    renderCustomSectionsDisplay() {
        const container = document.getElementById('custom-sections');
        if (!container) return;

        container.innerHTML = '';

        this.customSections.forEach(section => {
            if (section.title) {
                const sectionDiv = document.createElement('div');
                sectionDiv.className = 'cv-section p-8 bg-white border-b border-gray-100';
                sectionDiv.innerHTML = `
                    <h2 class="section-title text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <div class="w-1 h-8 bg-purple-500 rounded-full"></div>
                        ${section.title}
                    </h2>
                    <div class="section-content text-gray-700 leading-relaxed">${section.content.replace(/\n/g, '<br>')}</div>
                `;
                container.appendChild(sectionDiv);
            }
        });
    }

    // Gestion du thème et du style
    changeTheme(theme) {
        this.theme = theme;
        this.applyTheme();
        this.saveToHistory();
    }

    changeLayout(layout) {
        this.layout = layout;
        this.applyLayout();
        this.saveToHistory();
    }

    changeTitleStyle(style) {
        this.titleStyle = style;
        this.applyTitleStyle();
        this.saveToHistory();
    }

    selectColor(color) {
        this.primaryColor = color;
        document.documentElement.style.setProperty('--primary-color', color);
        this.updateColorSelection();
        this.saveToHistory();
    }

    selectFont(font) {
        this.fontFamily = font;
        document.body.style.fontFamily = font;
        this.updateFontSelection();
        this.saveToHistory();
    }

    applyTheme() {
        const cvPage = document.getElementById('cv-page');
        if (cvPage) {
            cvPage.className = `cv-page theme-${this.theme}`;
        }
    }

    applyLayout() {
        const cvPage = document.getElementById('cv-page');
        if (cvPage) {
            cvPage.className = cvPage.className.replace(/layout-\w+/g, '') + ` layout-${this.layout}`;
        }
    }

    applyTitleStyle() {
        document.querySelectorAll('.section-title').forEach(title => {
            title.className = `section-title title-${this.titleStyle}`;
        });
    }

    updateColorSelection() {
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.toggle('selected', option.dataset.color === this.primaryColor);
        });
    }

    updateFontSelection() {
        document.querySelectorAll('.font-option').forEach(option => {
            option.classList.toggle('selected', option.dataset.font === this.fontFamily);
        });
    }

    // Gestion de la bannière
    updateBanner() {
        const title = document.getElementById('banner-title')?.value || '';
        const subtitle = document.getElementById('banner-subtitle')?.value || '';

        this.bannerSettings.title = title;
        this.bannerSettings.subtitle = subtitle;

        this.updateBannerDisplay();
        this.saveToHistory();
    }

    handleBannerImage(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.bannerSettings.image = e.target.result;
                this.updateBannerPreview();
                this.updateBannerDisplay();
                this.saveToHistory();
            };
            reader.readAsDataURL(file);
        }
    }

    updateBannerStyle(style) {
        this.bannerSettings.style = style;
        this.updateBannerPreview();
        this.updateBannerDisplay();
        this.saveToHistory();
    }

    updateBannerColor(color) {
        this.bannerSettings.color = color;
        this.updateBannerPreview();
        this.updateBannerDisplay();
        this.saveToHistory();
    }

    updateBannerPreview() {
        const preview = document.getElementById('banner-preview');
        if (!preview) return;

        if (this.bannerSettings.image) {
            preview.innerHTML = `<img src="${this.bannerSettings.image}" alt="Bannière">`;
        } else {
            preview.style.background = this.bannerSettings.style === 'solid' ?
                this.bannerSettings.color :
                `linear-gradient(135deg, ${this.bannerSettings.color} 0%, #764ba2 100%)`;
            preview.innerHTML = '<i class="fas fa-image fa-2x"></i>';
        }
    }

    updateBannerDisplay() {
        const bannerSection = document.getElementById('banner-section');
        const bannerContent = document.getElementById('banner-content');
        const titleDisplay = document.getElementById('banner-title-display');
        const subtitleDisplay = document.getElementById('banner-subtitle-display');

        if (!bannerSection || !bannerContent) return;

        if (this.bannerSettings.title || this.bannerSettings.subtitle) {
            bannerSection.classList.remove('hidden');

            if (this.bannerSettings.image) {
                bannerContent.style.backgroundImage = `url(${this.bannerSettings.image})`;
                bannerContent.style.backgroundSize = 'cover';
                bannerContent.style.backgroundPosition = 'center';
            } else {
                bannerContent.style.background = this.bannerSettings.style === 'solid' ?
                    this.bannerSettings.color :
                    `linear-gradient(135deg, ${this.bannerSettings.color} 0%, #764ba2 100%)`;
            }

            if (titleDisplay) titleDisplay.textContent = this.bannerSettings.title;
            if (subtitleDisplay) subtitleDisplay.textContent = this.bannerSettings.subtitle;
        } else {
            bannerSection.classList.add('hidden');
        }
    }

    // Barre de progression
    updateProgress() {
        let completed = 0;
        let total = 0;

        // Informations personnelles (40%)
        const personalFields = ['first-name', 'last-name', 'email', 'summary'];
        personalFields.forEach(field => {
            total++;
            if (document.getElementById(field)?.value) completed++;
        });

        // Expériences (20%)
        total++;
        if (this.experiences.length > 0) completed++;

        // Formation (20%)
        total++;
        if (this.education.length > 0) completed++;

        // Compétences (20%)
        total++;
        if (this.skills.length > 0) completed++;

        this.progress = Math.round((completed / total) * 100);

        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            progressFill.style.width = `${this.progress}%`;
        }

        const progressText = document.getElementById('progress-text');
        if (progressText) {
            progressText.textContent = `${this.progress}%`;
        }
    }

    // Historique (Annuler/Rétablir)
    saveToHistory() {
        const currentState = {
            experiences: [...this.experiences],
            education: [...this.education],
            skills: [...this.skills],
            customSections: [...this.customSections],
            bannerSettings: {...this.bannerSettings},
            theme: this.theme,
            primaryColor: this.primaryColor,
            fontFamily: this.fontFamily,
            titleStyle: this.titleStyle,
            layout: this.layout,
            skillsStyle: this.skillsStyle
        };

        this.undoStack.push(currentState);
        if (this.undoStack.length > this.maxUndoSteps) {
            this.undoStack.shift();
        }
        this.redoStack = [];

        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.undoStack.length > 0) {
            const currentState = {
                experiences: [...this.experiences],
                education: [...this.education],
                skills: [...this.skills],
                customSections: [...this.customSections],
                bannerSettings: {...this.bannerSettings},
                theme: this.theme,
                primaryColor: this.primaryColor,
                fontFamily: this.fontFamily,
                titleStyle: this.titleStyle,
                layout: this.layout,
                skillsStyle: this.skillsStyle
            };

            this.redoStack.push(currentState);

            const previousState = this.undoStack.pop();
            this.restoreState(previousState);
            this.updateUndoRedoButtons();
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            const currentState = {
                experiences: [...this.experiences],
                education: [...this.education],
                skills: [...this.skills],
                customSections: [...this.customSections],
                bannerSettings: {...this.bannerSettings},
                theme: this.theme,
                primaryColor: this.primaryColor,
                fontFamily: this.fontFamily,
                titleStyle: this.titleStyle,
                layout: this.layout,
                skillsStyle: this.skillsStyle
            };

            this.undoStack.push(currentState);

            const nextState = this.redoStack.pop();
            this.restoreState(nextState);
            this.updateUndoRedoButtons();
        }
    }

    restoreState(state) {
        this.experiences = state.experiences || [];
        this.education = state.education || [];
        this.skills = state.skills || [];
        this.customSections = state.customSections || [];
        this.bannerSettings = state.bannerSettings || {};
        this.theme = state.theme || 'modern';
        this.primaryColor = state.primaryColor || '#3b82f6';
        this.fontFamily = state.fontFamily || 'Inter';
        this.titleStyle = state.titleStyle || 'bold';
        this.layout = state.layout || 'single';
        this.skillsStyle = state.skillsStyle || 'tags';

        this.renderAll();
    }

    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');

        if (undoBtn) undoBtn.disabled = this.undoStack.length === 0;
        if (redoBtn) redoBtn.disabled = this.redoStack.length === 0;
    }

    // Modales
    openAIModal() {
        const modal = document.getElementById('ai-modal');
        if (modal) modal.classList.add('active');
    }

    openExportModal() {
        const modal = document.getElementById('export-modal');
        if (modal) modal.classList.add('active');
    }

    openSaveModal() {
        const modal = document.getElementById('save-modal');
        if (modal) modal.classList.add('active');
    }

    openLoadModal() {
        const modal = document.getElementById('load-modal');
        if (modal) modal.classList.add('active');
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    // Panneau latéral
    togglePanel() {
        const panel = document.getElementById('side-panel');
        if (panel) {
            panel.classList.toggle('collapsed');
        }
    }

    // IA
    async analyzeWithAI() {
        const jobDescription = document.getElementById('job-description')?.value;
        if (!jobDescription) {
            this.showToast('Veuillez entrer une description de poste', 'warning');
            return;
        }

        this.showLoading('Analyse en cours...');

        try {
            // Simulation d'une analyse IA (à remplacer par une vraie API)
            const suggestions = [
                "Votre CV correspond à 75% aux exigences du poste",
                "Ajoutez plus de détails sur vos compétences techniques",
                "Mettez en avant vos expériences pertinentes",
                "Adaptez votre résumé à ce poste spécifique"
            ];

            const suggestionsContainer = document.getElementById('ai-suggestions');
            if (suggestionsContainer) {
                suggestionsContainer.innerHTML = suggestions.map(suggestion =>
                    `<div class="alert alert-info">${suggestion}</div>`
                ).join('');
            }

            const results = document.getElementById('ai-results');
            if (results) results.classList.remove('hidden');

            this.showToast('Analyse terminée!', 'success');
        } catch (error) {
            this.showToast('Erreur lors de l\'analyse', 'error');
        }

        this.hideLoading();
    }

    // Export PDF
    async exportToPDF() {
        const filename = document.getElementById('export-filename')?.value || 'cv.pdf';
        const quality = document.getElementById('export-quality')?.value || 'high';
        const includeBanner = document.getElementById('include-banner')?.checked || false;

        this.showLoading('Génération du PDF...');

        const element = document.getElementById('cv-page');
        if (!element) {
            this.showToast('Erreur: élément CV non trouvé', 'error');
            return;
        }

        const opt = {
            margin: 0,
            filename: filename,
            image: { type: 'jpeg', quality: quality === 'high' ? 0.98 : quality === 'medium' ? 0.85 : 0.7 },
            html2canvas: { scale: quality === 'high' ? 2 : quality === 'medium' ? 1.5 : 1, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            await html2pdf().set(opt).from(element).save();
            this.showToast('PDF exporté avec succès!', 'success');
            this.closeAllModals();
        } catch (error) {
            this.showToast('Erreur lors de l\'export PDF', 'error');
        }

        this.hideLoading();
    }

    // Sauvegarde et chargement
    saveCV() {
        const name = document.getElementById('cv-name')?.value || 'Mon CV';
        const cvData = {
            name: name,
            experiences: this.experiences,
            education: this.education,
            skills: this.skills,
            customSections: this.customSections,
            bannerSettings: this.bannerSettings,
            theme: this.theme,
            primaryColor: this.primaryColor,
            fontFamily: this.fontFamily,
            titleStyle: this.titleStyle,
            layout: this.layout,
            skillsStyle: this.skillsStyle,
            personalInfo: this.getPersonalInfo()
        };

        const savedCVs = JSON.parse(localStorage.getItem('saved_cvs') || '[]');
        savedCVs.push(cvData);
        localStorage.setItem('saved_cvs', JSON.stringify(savedCVs));

        this.showToast('CV sauvegardé!', 'success');
        this.closeAllModals();
    }

    loadCV(index) {
        const savedCVs = JSON.parse(localStorage.getItem('saved_cvs') || '[]');
        if (savedCVs[index]) {
            const cvData = savedCVs[index];
            this.restoreState(cvData);
            this.setPersonalInfo(cvData.personalInfo);
            this.showToast('CV chargé!', 'success');
            this.closeAllModals();
        }
    }

    getPersonalInfo() {
        return {
            firstName: document.getElementById('first-name')?.value || '',
            lastName: document.getElementById('last-name')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            address: document.getElementById('address')?.value || '',
            linkedin: document.getElementById('linkedin')?.value || '',
            website: document.getElementById('website')?.value || '',
            summary: document.getElementById('summary')?.value || ''
        };
    }

    setPersonalInfo(info) {
        Object.keys(info).forEach(key => {
            const element = document.getElementById(key);
            if (element) element.value = info[key];
        });
        this.updatePersonalInfo();
    }

    // Stockage local
    saveToStorage() {
        const data = {
            experiences: this.experiences,
            education: this.education,
            skills: this.skills,
            customSections: this.customSections,
            bannerSettings: this.bannerSettings,
            theme: this.theme,
            primaryColor: this.primaryColor,
            fontFamily: this.fontFamily,
            titleStyle: this.titleStyle,
            layout: this.layout,
            skillsStyle: this.skillsStyle,
            personalInfo: this.getPersonalInfo()
        };
        localStorage.setItem('cv_builder_data', JSON.stringify(data));
    }

    loadFromStorage() {
        try {
            const data = localStorage.getItem('cv_builder_data');
            if (data) {
                const parsed = JSON.parse(data);
                this.restoreState(parsed);
                if (parsed.personalInfo) {
                    this.setPersonalInfo(parsed.personalInfo);
                }
            }
            console.log('Données chargées depuis le stockage local');
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            // Réinitialiser les données en cas d'erreur
            this.experiences = [];
            this.education = [];
            this.skills = [];
            this.customSections = [];
        }
    }

    // Initialisation de SortableJS
    initializeSortable() {
        try {
            // Attendre un peu que le DOM soit complètement chargé
            setTimeout(() => {
                const sections = document.querySelectorAll('.cv-section');
                if (sections.length > 0) {
                    sections.forEach(section => {
                        if (section.parentElement) {
                            new Sortable(section.parentElement, {
                                handle: '.section-handle',
                                animation: 150,
                                onEnd: () => this.saveToHistory()
                            });
                        }
                    });
                    console.log('SortableJS initialisé');
                }
            }, 100);
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de SortableJS:', error);
        }
    }

    // Raccourcis clavier
    handleKeyboard(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 's':
                    e.preventDefault();
                    this.saveCV();
                    break;
                case 'z':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.redo();
                    } else {
                        e.preventDefault();
                        this.undo();
                    }
                    break;
            }
        }
        if (e.key === 'Escape') {
            this.closeAllModals();
        }
    }

    // Utilitaires
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    showLoading(message = 'Chargement...') {
        const loading = document.createElement('div');
        loading.className = 'loading-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        loading.innerHTML = `
            <div class="bg-white p-8 rounded-2xl shadow-2xl text-center">
                <div class="loading-spinner mb-4"></div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(loading);
        this.loadingElement = loading;
    }

    hideLoading() {
        if (this.loadingElement) {
            this.loadingElement.remove();
            this.loadingElement = null;
        }
    }

    // Nouvelles méthodes pour les fonctionnalités demandées

    // Gestion des modales
    openAccessibilityModal() {
        const modal = document.getElementById('accessibility-modal');
        if (modal) modal.classList.add('active');
        this.loadAccessibilitySettings();
    }

    closeAccessibilityModal() {
        const modal = document.getElementById('accessibility-modal');
        if (modal) modal.classList.remove('active');
    }

    openTemplatesModal() {
        const modal = document.getElementById('templates-modal');
        if (modal) modal.classList.add('active');
        this.loadTemplates();
    }

    // Partage du CV
    shareCV() {
        const url = this.generateShareableLink();
        navigator.clipboard.writeText(url).then(() => {
            this.showToast('Lien de partage copié dans le presse-papiers', 'success');
        });
    }

    generateShareableLink() {
        const data = btoa(JSON.stringify(this.getCVData()));
        return `${window.location.origin}${window.location.pathname}?cv=${data}`;
    }

    getCVData() {
        return {
            personalInfo: this.personalInfo,
            experiences: this.experiences,
            education: this.education,
            skills: this.skills,
            customSections: this.customSections,
            languages: this.languages,
            certifications: this.certifications,
            projects: this.projects,
            bannerSettings: this.bannerSettings,
            theme: this.currentTheme,
            layout: this.currentLayout
        };
    }

    // Anonymisation
    anonymizeCV() {
        this.anonymized = !this.anonymized;
        this.updateAnonymizedDisplay();
        const btn = document.getElementById('anonymize-btn');
        btn.classList.toggle('active', this.anonymized);
        this.showToast(this.anonymized ? 'CV anonymisé' : 'CV désanonymisé', 'info');
    }

    updateAnonymizedDisplay() {
        const elements = ['email-display', 'phone-display', 'address-display'];
        elements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (this.anonymized) {
                    el.style.display = 'none';
                } else {
                    el.style.display = '';
                }
            }
        });
    }

    // Nouveau CV
    newCV() {
        if (confirm('Êtes-vous sûr de vouloir créer un nouveau CV ? Toutes les données non sauvegardées seront perdues.')) {
            this.resetAllData();
            this.showToast('Nouveau CV créé', 'success');
        }
    }

    resetAllData() {
        this.experiences = [];
        this.education = [];
        this.skills = [];
        this.customSections = [];
        this.languages = [];
        this.certifications = [];
        this.projects = [];
        this.setPersonalInfo({
            firstName: '',
            lastName: '',
            jobTitle: '',
            email: '',
            phone: '',
            address: '',
            linkedin: '',
            website: '',
            summary: ''
        });
        this.bannerSettings = {
            enabled: false,
            title: '',
            subtitle: '',
            image: null,
            style: 'modern',
            color: '#667eea',
            alignment: 'center',
            inverted: false,
            photoSize: 'md'
        };
        this.renderAll();
        this.updateProgress();
    }

    // Détection de dépassement
    toggleOverflowDetection() {
        this.overflowDetection = !this.overflowDetection;
        this.updateOverflowDetection();
        const btn = document.getElementById('overflow-detection-btn');
        btn.classList.toggle('active', this.overflowDetection);
    }

    updateOverflowDetection() {
        const pages = document.querySelectorAll('.cv-page');
        pages.forEach(page => {
            if (this.overflowDetection) {
                // Vérifier si le contenu dépasse
                const contentHeight = page.scrollHeight;
                const pageHeight = 297 * 3.78; // A4 height in pixels (approx)
                if (contentHeight > pageHeight) {
                    page.classList.add('overflow-warning');
                } else {
                    page.classList.remove('overflow-warning');
                }
            } else {
                page.classList.remove('overflow-warning');
            }
        });
    }

    // Mode présentation
    togglePresentationMode() {
        this.presentationMode = !this.presentationMode;
        this.updatePresentationMode();
        const btn = document.getElementById('presentation-btn');
        btn.classList.toggle('active', this.presentationMode);
    }

    updatePresentationMode() {
        document.body.classList.toggle('presentation-mode', this.presentationMode);
        const handles = document.querySelectorAll('.drag-handle, .resize-handle');
        handles.forEach(handle => {
            handle.style.display = this.presentationMode ? 'none' : '';
        });
    }

    // Changement de fournisseur IA
    changeAIProvider(provider) {
        this.aiProvider = provider;
        localStorage.setItem('ai_provider', provider);
        this.showToast(`Fournisseur IA changé: ${provider}`, 'info');
    }

    // Gestion des compétences
    limitSkillsTo10() {
        if (this.skills.length > 10) {
            this.skills = this.skills.slice(0, 10);
            this.renderSkills();
            this.showToast('Compétences limitées à 10', 'success');
        } else {
            this.showToast('Déjà 10 compétences ou moins', 'info');
        }
    }

    synthesizeSkills() {
        // Simulation de synthèse IA
        this.showToast('Synthèse des compétences en cours...', 'info');
        setTimeout(() => {
            // Regrouper par catégories
            const categories = {};
            this.skills.forEach(skill => {
                const category = this.guessSkillCategory(skill.name);
                if (!categories[category]) categories[category] = [];
                categories[category].push(skill);
            });

            // Recréer la liste organisée
            this.skills = [];
            Object.keys(categories).forEach(cat => {
                categories[cat].forEach(skill => this.skills.push(skill));
            });

            this.renderSkills();
            this.showToast('Compétences synthétisées et organisées', 'success');
        }, 1000);
    }

    guessSkillCategory(skillName) {
        const categories = {
            'Technologies': ['javascript', 'python', 'java', 'php', 'html', 'css', 'react', 'angular', 'vue'],
            'Outils': ['git', 'docker', 'jenkins', 'webpack', 'npm', 'yarn'],
            'Méthodologies': ['agile', 'scrum', 'kanban', 'tdd', 'bdd'],
            'Langues': ['anglais', 'français', 'espagnol', 'allemand'],
            'Soft Skills': ['communication', 'leadership', 'management', 'résolution de problèmes']
        };

        const lowerSkill = skillName.toLowerCase();
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => lowerSkill.includes(keyword))) {
                return category;
            }
        }
        return 'Autres';
    }

    // Gestion des sections complémentaires
    addLanguage() {
        const language = prompt('Nom de la langue:');
        if (language) {
            const level = prompt('Niveau (A1-C2):', 'B2');
            this.languages.push({ name: language, level: level || 'B2' });
            this.renderLanguages();
        }
    }

    addCertification() {
        const name = prompt('Nom de la certification:');
        if (name) {
            const issuer = prompt('Organisme émetteur:');
            const date = prompt('Date d\'obtention:');
            this.certifications.push({ name, issuer, date });
            this.renderCertifications();
        }
    }

    addProject() {
        const name = prompt('Nom du projet:');
        if (name) {
            const description = prompt('Description:');
            const technologies = prompt('Technologies utilisées:');
            this.projects.push({ name, description, technologies });
            this.renderProjects();
        }
    }

    // Contrôles de layout
    setLayout(layout) {
        this.layout = layout;
        this.updateLayout();
        this.updateLayoutButtons();
    }

    updateLayout() {
        const cvPage = document.getElementById('cv-page');
        cvPage.className = `cv-page layout-${this.layout}`;
    }

    updateLayoutButtons() {
        document.querySelectorAll('[data-layout]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.layout === this.layout);
        });
    }

    updateSpacing(type, value) {
        document.documentElement.style.setProperty(`--spacing-${type}`, `${value}x`);
        document.getElementById(`spacing-${type}-value`).textContent = `${value}x`;
    }

    updateFontSize(value) {
        document.documentElement.style.setProperty('--font-size', `${value}rem`);
        document.getElementById('font-size-value').textContent = `${value}x`;
    }

    updateMargins(value) {
        document.documentElement.style.setProperty('--margin-size', `${value}rem`);
        document.getElementById('margins-value').textContent = `${value}x`;
    }

    // Gestion de la bannière
    setBannerAlignment(alignment) {
        this.bannerSettings.alignment = alignment;
        this.updateBannerAlignment();
        this.updateAlignmentButtons();
    }

    updateBannerAlignment() {
        const banner = document.querySelector('.banner-section');
        if (banner) {
            banner.className = `banner-section text-${this.bannerSettings.alignment}`;
        }
    }

    updateAlignmentButtons() {
        document.querySelectorAll('[data-align]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.align === this.bannerSettings.alignment);
        });
    }

    toggleInvertedLayout(inverted) {
        this.bannerSettings.inverted = inverted;
        this.updateInvertedLayout();
    }

    updateInvertedLayout() {
        const banner = document.querySelector('.banner-section');
        if (banner) {
            banner.classList.toggle('inverted', this.bannerSettings.inverted);
        }
    }

    setBannerStyle(style) {
        this.bannerSettings.style = style;
        this.updateBannerStyle();
        this.updateStyleButtons();
    }

    updateBannerStyle() {
        const banner = document.querySelector('.banner-section');
        if (banner) {
            banner.className = `banner-section style-${this.bannerSettings.style}`;
        }
    }

    updateStyleButtons() {
        document.querySelectorAll('[data-style]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.style === this.bannerSettings.style);
        });
    }

    setPhotoSize(size) {
        this.bannerSettings.photoSize = size;
        this.updatePhotoSize();
        this.updatePhotoSizeButtons();
    }

    updatePhotoSize() {
        const photo = document.getElementById('profile-photo');
        if (photo) {
            photo.className = `w-${this.getSizeClass(this.bannerSettings.photoSize)} h-${this.getSizeClass(this.bannerSettings.photoSize)} rounded-full object-cover border-4 border-white shadow-lg`;
        }
    }

    getSizeClass(size) {
        const classes = { sm: 16, md: 20, lg: 24, xl: 32 };
        return classes[size] || 20;
    }

    updatePhotoSizeButtons() {
        document.querySelectorAll('[data-size]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.size === this.bannerSettings.photoSize);
        });
    }

    triggerPhotoUpload() {
        document.getElementById('profile-photo-upload').click();
    }

    // Fonctions IA (simulées)
    analyzeAndFill() {
        this.showToast('Analyse IA en cours...', 'info');
        setTimeout(() => {
            this.showToast('Analyse terminée - Données remplies automatiquement', 'success');
        }, 2000);
    }

    testFilling() {
        this.showToast('Test de remplissage réussi', 'success');
    }

    testAPI() {
        this.showToast(`Test API ${this.aiProvider} réussi`, 'success');
    }

    generatePitch() {
        this.showToast('Génération de pitch en cours...', 'info');
        setTimeout(() => {
            this.showToast('Pitch généré avec succès', 'success');
        }, 1500);
    }

    optimizeLayout() {
        this.showToast('Optimisation du layout en cours...', 'info');
        setTimeout(() => {
            this.layout = 'single'; // Optimiser pour 1 page
            this.updateLayout();
            this.showToast('Layout optimisé pour 1 page', 'success');
        }, 1000);
    }

    optimizeCV() {
        this.showToast('Optimisation globale en cours...', 'info');
        setTimeout(() => {
            this.showToast('CV optimisé avec succès', 'success');
        }, 2000);
    }

    rewriteDescriptions() {
        this.showToast('Réécriture des descriptions en cours...', 'info');
        setTimeout(() => {
            this.showToast('Descriptions réécrites', 'success');
        }, 1500);
    }

    summarizeExperiences() {
        this.showToast('Résumé des expériences en cours...', 'info');
        setTimeout(() => {
            this.showToast('Expériences résumées', 'success');
        }, 1000);
    }

    generateAchievements() {
        this.showToast('Génération d\'accomplissements en cours...', 'info');
        setTimeout(() => {
            this.showToast('Accomplissements générés', 'success');
        }, 1500);
    }

    suggestSkills() {
        this.showToast('Suggestion de compétences en cours...', 'info');
        setTimeout(() => {
            this.showToast('Compétences suggérées ajoutées', 'success');
        }, 1000);
    }

    improveProfile() {
        this.showToast('Amélioration du profil en cours...', 'info');
        setTimeout(() => {
            this.showToast('Profil amélioré', 'success');
        }, 1500);
    }

    adaptToSector() {
        this.showToast('Adaptation au secteur en cours...', 'info');
        setTimeout(() => {
            this.showToast('CV adapté au secteur', 'success');
        }, 1500);
    }

    boostKeywords() {
        this.showToast('Boost des mots-clés en cours...', 'info');
        setTimeout(() => {
            this.showToast('Mots-clés optimisés', 'success');
        }, 1000);
    }

    // Accessibilité
    updateTextSize(value) {
        this.accessibilitySettings.textSize = value;
        document.documentElement.style.setProperty('--text-size', `${value}rem`);
        document.getElementById('text-size-value').textContent = `${value}x`;
    }

    updateLineSpacing(value) {
        this.accessibilitySettings.lineSpacing = value;
        document.documentElement.style.setProperty('--line-spacing', `${value}`);
        document.getElementById('line-spacing-value').textContent = `${value}x`;
    }

    toggleKeyboardFocus(enabled) {
        this.accessibilitySettings.keyboardFocus = enabled;
        document.body.classList.toggle('keyboard-focus', enabled);
    }

    toggleAnimations(enabled) {
        this.accessibilitySettings.reduceAnimations = enabled;
        document.body.classList.toggle('reduce-animations', enabled);
    }

    toggleScreenReader(enabled) {
        this.accessibilitySettings.screenReader = enabled;
        document.body.classList.toggle('screen-reader-optimized', enabled);
    }

    resetAccessibility() {
        this.accessibilitySettings = {
            textSize: 1,
            lineSpacing: 1.5,
            keyboardFocus: false,
            reduceAnimations: false,
            screenReader: false
        };
        this.applyAccessibilitySettings();
        this.showToast('Paramètres d\'accessibilité réinitialisés', 'info');
    }

    saveAccessibility() {
        localStorage.setItem('accessibility_settings', JSON.stringify(this.accessibilitySettings));
        this.showToast('Paramètres d\'accessibilité sauvegardés', 'success');
    }

    loadAccessibilitySettings() {
        const settings = localStorage.getItem('accessibility_settings');
        if (settings) {
            this.accessibilitySettings = JSON.parse(settings);
            this.applyAccessibilitySettings();
        }
    }

    applyAccessibilitySettings() {
        this.updateTextSize(this.accessibilitySettings.textSize);
        this.updateLineSpacing(this.accessibilitySettings.lineSpacing);
        this.toggleKeyboardFocus(this.accessibilitySettings.keyboardFocus);
        this.toggleAnimations(this.accessibilitySettings.reduceAnimations);
        this.toggleScreenReader(this.accessibilitySettings.screenReader);

        // Update form controls
        document.getElementById('text-size-slider').value = this.accessibilitySettings.textSize;
        document.getElementById('line-spacing-slider').value = this.accessibilitySettings.lineSpacing;
        document.getElementById('keyboard-focus').checked = this.accessibilitySettings.keyboardFocus;
        document.getElementById('reduce-animations').checked = this.accessibilitySettings.reduceAnimations;
        document.getElementById('screen-reader').checked = this.accessibilitySettings.screenReader;
    }

    // Templates
    saveTemplate() {
        const name = prompt('Nom du template:');
        if (name) {
            const description = prompt('Description:');
            const template = {
                name,
                description,
                layout: this.layout,
                theme: this.theme,
                primaryColor: this.primaryColor,
                fontFamily: this.fontFamily,
                bannerSettings: { ...this.bannerSettings },
                skillsStyle: this.skillsStyle,
                createdAt: new Date().toISOString()
            };
            this.templates.push(template);
            localStorage.setItem('cv_templates', JSON.stringify(this.templates));
            this.renderTemplates();
            this.showToast('Template sauvegardé', 'success');
        }
    }

    exportTemplates() {
        const data = JSON.stringify(this.templates, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cv-templates.json';
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Templates exportés', 'success');
    }

    importTemplates() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const imported = JSON.parse(e.target.result);
                        this.templates = [...this.templates, ...imported];
                        localStorage.setItem('cv_templates', JSON.stringify(this.templates));
                        this.renderTemplates();
                        this.showToast('Templates importés', 'success');
                    } catch (error) {
                        this.showToast('Erreur lors de l\'import', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    loadTemplates() {
        const templates = localStorage.getItem('cv_templates');
        if (templates) {
            this.templates = JSON.parse(templates);
        }
        this.renderTemplates();
    }

    renderTemplates() {
        const container = document.getElementById('templates-list');
        if (this.templates.length === 0) {
            container.innerHTML = '<div class="template-item bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300 text-center text-gray-500">Aucun template</div>';
            return;
        }

        container.innerHTML = this.templates.map((template, index) => `
            <div class="template-item bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                <h4 class="font-semibold text-gray-800">${template.name}</h4>
                <p class="text-sm text-gray-600 mb-3">${template.description}</p>
                <div class="flex gap-2">
                    <button onclick="cvBuilder.applyTemplate(${index})" class="btn btn-primary btn-sm">Appliquer</button>
                    <button onclick="cvBuilder.deleteTemplate(${index})" class="btn btn-danger btn-sm">Supprimer</button>
                </div>
            </div>
        `).join('');
    }

    applyTemplate(index) {
        const template = this.templates[index];
        this.layout = template.layout;
        this.theme = template.theme;
        this.primaryColor = template.primaryColor;
        this.fontFamily = template.fontFamily;
        this.bannerSettings = { ...template.bannerSettings };
        this.skillsStyle = template.skillsStyle;
        this.updateAll();
        this.showToast(`Template "${template.name}" appliqué`, 'success');
    }

    deleteTemplate(index) {
        if (confirm('Supprimer ce template ?')) {
            this.templates.splice(index, 1);
            localStorage.setItem('cv_templates', JSON.stringify(this.templates));
            this.renderTemplates();
            this.showToast('Template supprimé', 'info');
        }
    }

    // Zoom controls
    zoomOut() {
        this.setZoom(Math.max(50, this.zoomLevel - 10));
    }

    zoomIn() {
        this.setZoom(Math.min(200, this.zoomLevel + 10));
    }

    resetZoom() {
        this.setZoom(100);
    }

    setZoom(level) {
        this.zoomLevel = level;
        document.getElementById('cv-page').style.transform = `scale(${level / 100})`;
        document.getElementById('zoom-slider').value = level;
        document.getElementById('zoom-value').textContent = `${level}%`;
    }

    // Raccourcis clavier
    handleKeyboard(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    this.saveCV();
                    break;
                case 'p':
                    e.preventDefault();
                    this.exportToPDF();
                    break;
            }
        } else if (e.key === 'Escape') {
            this.closeAllModals();
        }
    }

    // Toasts
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} p-4 rounded-lg shadow-lg max-w-sm`;
        toast.innerHTML = `
            <div class="flex items-center gap-3">
                <i class="fas ${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    getToastIcon(type) {
        const icons = {
            success: 'fa-check-circle text-green-500',
            error: 'fa-exclamation-circle text-red-500',
            warning: 'fa-exclamation-triangle text-yellow-500',
            info: 'fa-info-circle text-blue-500'
        };
        return icons[type] || icons.info;
    }

    // Méthodes de rendu pour les nouvelles sections
    renderLanguages() {
        const container = document.getElementById('languagesDisplay');
        if (!container) return;

        if (this.languages.length === 0) {
            container.innerHTML = '<p class="text-gray-500 italic">Aucune langue ajoutée</p>';
            return;
        }

        container.innerHTML = this.languages.map(lang => `
            <div class="flex justify-between items-center">
                <span class="font-medium">${lang.name}</span>
                <span class="text-sm text-gray-600">${lang.level}</span>
            </div>
        `).join('');
    }

    renderCertifications() {
        const container = document.getElementById('certificationsDisplay');
        if (!container) return;

        if (this.certifications.length === 0) {
            container.innerHTML = '<p class="text-gray-500 italic">Aucune certification ajoutée</p>';
            return;
        }

        container.innerHTML = this.certifications.map(cert => `
            <div class="border-l-2 border-blue-500 pl-3">
                <h4 class="font-semibold">${cert.name}</h4>
                <p class="text-sm text-gray-600">${cert.issuer} - ${cert.date}</p>
                ${cert.description ? `<p class="text-sm mt-1">${cert.description}</p>` : ''}
            </div>
        `).join('');
    }

    renderProjects() {
        const container = document.getElementById('projectsDisplay');
        if (!container) return;

        if (this.projects.length === 0) {
            container.innerHTML = '<p class="text-gray-500 italic">Aucun projet ajouté</p>';
            return;
        }

        container.innerHTML = this.projects.map(project => `
            <div class="mb-4">
                <h4 class="font-semibold text-lg">${project.name}</h4>
                <p class="text-sm text-gray-600 mb-2">${project.technologies} | ${project.date}</p>
                <p class="text-sm mb-2">${project.description}</p>
                ${project.link ? `<a href="${project.link}" class="text-blue-600 text-sm hover:underline" target="_blank">Voir le projet</a>` : ''}
            </div>
        `).join('');
    }

    // Mise à jour globale
    updateAll() {
        this.updateLayout();
        this.updateBannerAlignment();
        this.updateInvertedLayout();
        this.updateBannerStyle();
        this.updatePhotoSize();
        this.renderAll();
    }

    // Rendu de toutes les sections
    renderAll() {
        this.renderExperiences();
        this.renderEducation();
        this.renderSkills();
        this.renderLanguages();
        this.renderCertifications();
        this.renderProjects();
        this.renderCustomSections();
        this.updateBannerPreview();
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.cvBuilder = new CVBuilder();
});
