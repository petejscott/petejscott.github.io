(function(){
    // Photo data
    const photos = [
        {
            fullImage: "images/sea-1600.jpg",
            srcset: "images/sea-800.jpg 800w, images/sea-1200.jpg 1200w",
            src: "images/sea-800.jpg",
            alt: "Golden sunset over calm bay with a small sailboat on the horizon",
            width: 1200,
            height: 800,
            title: "Sunset at the bay",
            date: "2025-07-12",
            dateDisplay: "July 12, 2025"
        },
        {
            fullImage: "images/forest-1600.jpg",
            srcset: "images/forest-800.jpg 800w, images/forest-1200.jpg 1200w",
            src: "images/forest-800.jpg",
            alt: "Person walking a shaded trail among tall redwood trees",
            width: 1200,
            height: 800,
            title: "Misty redwood trail",
            date: null,
            dateDisplay: null
        }
    ];

    const gallery = document.querySelector('.gallery');
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lb-img');
    const lbMeta = document.getElementById('lb-meta');
    const closeBtn = document.getElementById('lb-close');

    let lastTrigger = null; // element that opened the lightbox

    /**
     * Creates a gallery item DOM element from a photo object
     * @param {Object} photo - Photo data object
     * @param {number} index - Index for generating unique IDs
     * @returns {HTMLLIElement} Gallery item element
     */
    function createGalleryItem(photo, index) {
        const li = document.createElement('li');
        li.className = 'gallery-item';
        li.setAttribute('role', 'listitem');

        const figure = document.createElement('figure');
        
        // Create button
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('data-full', photo.fullImage);
        
        // Build caption for data-caption attribute
        let caption = photo.title;
        if (photo.dateDisplay) {
            caption += ` — ${photo.dateDisplay}`;
        }
        button.setAttribute('data-caption', caption);
        
        const capId = `cap-${index + 1}`;
        button.setAttribute('aria-describedby', capId);

        // Create picture element
        const picture = document.createElement('picture');
        
        // Create source element
        const source = document.createElement('source');
        source.srcset = photo.srcset;
        source.sizes = "(max-width:600px) 100vw, 33vw";
        
        // Create img element
        const img = document.createElement('img');
        img.src = photo.src;
        img.alt = photo.alt;
        img.loading = 'lazy';
        img.width = photo.width;
        img.height = photo.height;

        // Assemble picture
        picture.appendChild(source);
        picture.appendChild(img);
        button.appendChild(picture);

        // Create figcaption
        const figcaption = document.createElement('figcaption');
        figcaption.id = capId;
        
        const strong = document.createElement('strong');
        strong.textContent = photo.title;
        figcaption.appendChild(strong);
        
        if (photo.date && photo.dateDisplay) {
            figcaption.appendChild(document.createTextNode(' — '));
            const time = document.createElement('time');
            time.setAttribute('datetime', photo.date);
            time.textContent = photo.dateDisplay;
            figcaption.appendChild(time);
        }

        // Assemble figure
        figure.appendChild(button);
        figure.appendChild(figcaption);
        
        // Assemble list item
        li.appendChild(figure);
        
        return li;
    }

    /**
     * Populates the gallery with photo items
     * @param {Array} photoData - Array of photo objects
     */
    function populateGallery(photoData) {
        // Clear existing gallery items
        gallery.innerHTML = '';
        
        // Generate and append each gallery item
        photoData.forEach((photo, index) => {
            const galleryItem = createGalleryItem(photo, index);
            gallery.appendChild(galleryItem);
        });
    }

    // Initialize gallery with photo data
    populateGallery(photos);

    // Open
    gallery.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-full]');
    if (!btn) return;
    openLightbox(btn);
    });

    // Delegate keyboard activation (Enter/Space) when button focused
    gallery.addEventListener('keydown', (e) => {
    const btn = e.target.closest('button[data-full]');
    if (!btn) return;
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(btn);
    }
    });

    function openLightbox(triggerBtn){
    const src = triggerBtn.getAttribute('data-full');
    const caption = triggerBtn.getAttribute('data-caption') || '';
    const imgEl = lbImg;

    lastTrigger = triggerBtn;
    imgEl.src = src;
    imgEl.alt = triggerBtn.querySelector('img')?.alt || '';
    lbMeta.textContent = caption;

    // show
    lightbox.setAttribute('aria-hidden', 'false');
    // trap focus by focusing close button
    closeBtn.focus();
    document.body.style.overflow = 'hidden'; // prevent background scroll
    }

    function closeLightbox(){
    lightbox.setAttribute('aria-hidden', 'true');
    lbImg.src = '';
    lbMeta.textContent = '';
    document.body.style.overflow = '';
    // restore focus
    if (lastTrigger) lastTrigger.focus();
    lastTrigger = null;
    }

    closeBtn.addEventListener('click', closeLightbox);

    // keyboard: ESC to close, left/right to navigate (basic)
    document.addEventListener('keydown', (e) => {
    if (lightbox.getAttribute('aria-hidden') === 'true') return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        // simple navigation: find current index, move
        const buttons = Array.from(document.querySelectorAll('.gallery button[data-full]'));
        const currentIndex = buttons.indexOf(lastTrigger);
        let nextIndex = currentIndex;
        if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        else nextIndex = (currentIndex + 1) % buttons.length;
        openLightbox(buttons[nextIndex]);
    }
    });

    // click outside to close (click on overlay but not on content)
    lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
    });

    // Make sure images that fail to load don't break the UI
    lbImg.addEventListener('error', () => {
    lbMeta.textContent = 'Image failed to load.';
    });
})();