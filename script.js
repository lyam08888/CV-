// Créateur de CV Moderne - Version Simplifiée et Robuste
class CVBuilder {
    constructor() {
        this.currentTab = 'personal';
        this.experiences = [];
        this.education = [];
        this.skills = [];
        this.customSections = [];
        this.bannerSettings = {
            enabled: false,
            title: '',
            subtitle: '',
            image: null,
            style: 'gradient',
            color: '#667eea'
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
        this.addEventListener('undo-btn', 'click', () => this.undo());
        this.addEventListener('redo-btn', 'click', () => this.redo());
        this.addEventListener('ai-analyze-btn', 'click', () => this.openAIModal());
        this.addEventListener('presentation-btn', 'click', () => this.togglePresentationMode());
        this.addEventListener('export-pdf-btn', 'click', () => this.openExportModal());
        this.addEventListener('save-cv-btn', 'click', () => this.openSaveModal());
        this.addEventListener('load-cv-btn', 'click', () => this.openLoadModal());

        // Onglets
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Champs personnels
        this.addEventListener('first-name', 'input', () => this.updatePersonalInfo());
        this.addEventListener('last-name', 'input', () => this.updatePersonalInfo());
        this.addEventListener('email', 'input', () => this.updatePersonalInfo());
        this.addEventListener('phone', 'input', () => this.updatePersonalInfo());
        this.addEventListener('address', 'input', () => this.updatePersonalInfo());
        this.addEventListener('linkedin', 'input', () => this.updatePersonalInfo());
        this.addEventListener('website', 'input', () => this.updatePersonalInfo());
        this.addEventListener('summary', 'input', () => this.updatePersonalInfo());

        // Photo de profil
        this.addEventListener('photo-upload', 'change', (e) => this.handlePhotoUpload(e));
        this.addEventListener('remove-photo', 'click', () => this.removePhoto());

        // Expériences
        this.addEventListener('add-experience', 'click', () => this.addExperience());

        // Formation
        this.addEventListener('add-education', 'click', () => this.addEducation());

        // Compétences
        this.addEventListener('add-skill', 'click', () => this.addSkill());
        this.addEventListener('skills-style', 'change', (e) => this.changeSkillsStyle(e.target.value));

        // Sections personnalisées
        this.addEventListener('add-custom-section', 'click', () => this.addCustomSection());

        // Style
        this.addEventListener('theme-select', 'change', (e) => this.changeTheme(e.target.value));
        this.addEventListener('layout-select', 'change', (e) => this.changeLayout(e.target.value));
        this.addEventListener('title-style', 'change', (e) => this.changeTitleStyle(e.target.value));

        // Couleurs
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => this.selectColor(option.dataset.color));
        });

        // Polices
        document.querySelectorAll('.font-option').forEach(option => {
            option.addEventListener('click', () => this.selectFont(option.dataset.font));
        });

        // Bannière
        this.addEventListener('banner-title', 'input', () => this.updateBanner());
        this.addEventListener('banner-subtitle', 'input', () => this.updateBanner());
        this.addEventListener('banner-image', 'change', (e) => this.handleBannerImage(e));
        this.addEventListener('banner-style', 'change', (e) => this.updateBannerStyle(e.target.value));
        this.addEventListener('banner-color', 'input', (e) => this.updateBannerColor(e.target.value));

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

    renderAll() {
        try {
            this.renderExperiences();
            this.renderEducation();
            this.renderSkills();
            this.renderCustomSections();
            this.updateBannerDisplay();
            this.applyTheme();
            this.applyLayout();
            this.applyTitleStyle();
            this.updateColorSelection();
            this.updateFontSelection();
            this.updateProgress();
            console.log('Rendu complet terminé');
        } catch (error) {
            console.error('Erreur lors du rendu:', error);
        }
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

    // Mode présentation
    togglePresentationMode() {
        document.body.classList.toggle('presentation-mode');
        const btn = document.getElementById('presentation-btn');
        if (btn) {
            const isPresentation = document.body.classList.contains('presentation-mode');
            btn.innerHTML = isPresentation ? '<i class="fas fa-edit"></i>' : '<i class="fas fa-play"></i>';
        }
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
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new CVBuilder();
});
