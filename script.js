document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('container');
    let currentTemplate = 'temp-menu-primary';

    // Función para cargar plantillas
    function loadTemplate(templateId) {
        const template = document.getElementById(templateId);
        if (template) {
            container.innerHTML = '';
            container.appendChild(template.content.cloneNode(true));
            currentTemplate = templateId;
            initializeAll();
        }
    }

    // Configuración de subida de imágenes (solo para vista previa)
    function setupImageUploads() {
        const setupPreview = (inputId, previewId) => {
            const input = document.getElementById(inputId);
            const preview = document.getElementById(previewId);
            
            if (!input || !preview) return;

            input.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        preview.style.backgroundImage = `url(${event.target.result})`;
                        preview.style.backgroundSize = 'cover';
                        preview.style.backgroundPosition = 'center';
                    };
                    reader.readAsDataURL(file);
                }
            });
        };

        setupPreview('imagen-antes', 'preview-antes');
        setupPreview('imagen-despues', 'preview-despues');
    }

    // Función para cargar muebles (solo visualización)
    async function cargarMuebles() {
        try {
            const response = await fetch(`${API_BASE_URL}/muebles`);
            
            if (!response.ok) {
                throw new Error('Error al cargar muebles');
            }
            
            const muebles = await response.json();
            const grid = document.querySelector('.project-grid');
            
            if (!grid) return;
            
            grid.innerHTML = '';
            
            muebles.forEach((mueble, index) => {
                grid.innerHTML += `
                    <div class="project-card">
                        <div class="slider-container">
                            <div class="before-after-slider" id="slider${index + 1}">
                                <div class="after-image" style="background-image: url(${API_BASE_URL}/uploads/${mueble.imagenes.despues}); background-size: cover; background-position: center;"></div>
                                <div class="before-image" style="background-image: url(${API_BASE_URL}/uploads/${mueble.imagenes.antes}); background-size: cover; background-position: center;"></div>
                                <div class="slider-handle"></div>
                            </div>
                            <video class="project-video" loop muted>
                                <source src="${mueble.video || 'https://assets.mixkit.co/videos/preview/mixkit-wooden-chair-being-painted-1173-large.mp4'}" type="video/mp4">
                            </video>
                            <div class="project-details">
                                <h4>Materiales utilizados:</h4>
                                <ul>
                                    ${mueble.materiales.map(material => `<li>${material}</li>`).join('')}
                                </ul>
                                <p>${mueble.descripcion}</p>
                            </div>
                            <button class="toggle-details">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                        <h3>${mueble.nombre}</h3>
                    </div>
                `;
            });
            
            initializeSliders();
            initializeDetailToggles();
            initializeVideoCards();
        } catch (error) {
            console.error('Error al cargar muebles:', error);
        }
    }

    function attachEventListeners() {
        // Event listeners para cambiar entre templates
        document.querySelectorAll('[data-template]').forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                loadTemplate(this.getAttribute('data-template'));
            });
        });

        // Menú toggle para responsive
        const menuToggle = document.getElementById('menuToggle');
        const nav = document.getElementById('nav');

        if (menuToggle && nav) {
            menuToggle.addEventListener('click', function() {
                nav.classList.toggle('visible');
                updateMenuIcon();
            });

            function updateMenuIcon() {
                if (nav.classList.contains('visible')) {
                    menuToggle.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    `;
                } else {
                    menuToggle.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="4" x2="20" y1="12" y2="12"></line>
                            <line x1="4" x2="20" y1="6" y2="6"></line>
                            <line x1="4" x2="20" y1="18" y2="18"></line>
                        </svg>
                    `;
                }
            }
        }
    }

    function initializeSliders() {
        document.querySelectorAll('.before-after-slider').forEach(slider => {
            const beforeImage = slider.querySelector('.before-image');
            const sliderHandle = slider.querySelector('.slider-handle');
            let isDragging = false;

            if (!beforeImage || !sliderHandle) return;

            beforeImage.style.width = '50%';
            sliderHandle.style.left = '50%';

            const moveSlider = (clientX) => {
                if (!isDragging) return;
                const rect = slider.getBoundingClientRect();
                let position = ((clientX - rect.left) / rect.width) * 100;
                position = Math.max(0, Math.min(position, 100));
                beforeImage.style.width = `${position}%`;
                sliderHandle.style.left = `${position}%`;
            };

            // Eventos para mouse
            sliderHandle.addEventListener('mousedown', () => isDragging = true);
            window.addEventListener('mousemove', (e) => moveSlider(e.clientX));
            window.addEventListener('mouseup', () => isDragging = false);

            // Eventos para touch
            sliderHandle.addEventListener('touchstart', () => isDragging = true);
            window.addEventListener('touchmove', (e) => moveSlider(e.touches[0].clientX));
            window.addEventListener('touchend', () => isDragging = false);
        });
    }

    function initializeDetailToggles() {
        document.querySelectorAll('.toggle-details').forEach(button => {
            button.addEventListener('click', function() {
                const container = this.closest('.slider-container');
                if (!container) return;
                
                const details = container.querySelector('.project-details');
                if (!details) return;
                
                // Alternar la clase 'visible' en los detalles
                details.classList.toggle('visible');
                
                // Cambiar el icono según el estado
                this.innerHTML = details.classList.contains('visible') ? 
                    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>` :
                    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>`;
                
                // Asegurarse de que el botón siempre sea visible
                this.style.display = 'flex';
            });
        });
    }

    function initializeVideoCards() {
        document.querySelectorAll('.project-video').forEach(video => {
            const container = video.closest('.slider-container');
            container.classList.add('has-video');
            
            video.muted = true;
            video.loop = true;
            
            // Reproducir al hacer hover
            container.addEventListener('mouseenter', () => {
                if (!video.playing && !container.querySelector('.project-details.visible')) {
                    video.play().catch(e => console.log("Error al reproducir:", e));
                    video.playing = true;
                }
            });
            
            // Pausar al salir del hover
            container.addEventListener('mouseleave', () => {
                if (!container.querySelector('.project-details.visible')) {
                    video.pause();
                    video.currentTime = 0;
                    video.playing = false;
                }
            });
            
            // Pausar video cuando se muestran los detalles
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'class') {
                        if (container.querySelector('.project-details.visible')) {
                            video.pause();
                        } else {
                            video.play().catch(e => console.log("Error al reproducir:", e));
                        }
                    }
                });
            });
            
            observer.observe(container.querySelector('.project-details'), {
                attributes: true
            });
        });
    }

    function initializeAll() {
        attachEventListeners();
        
        if (currentTemplate === 'temp-menu-primary') {
            cargarMuebles();
            initializeSliders();
            initializeDetailToggles();
            initializeVideoCards();
        } else if (currentTemplate === 'temp-nuevo-mueble') {
            setupImageUploads();
        }
    }

    // Cargar plantilla inicial
    loadTemplate(currentTemplate);
    
    // Hacer la función loadTemplate accesible globalmente
    window.loadTemplate = loadTemplate;
});