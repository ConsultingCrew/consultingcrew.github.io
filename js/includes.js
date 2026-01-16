// HTML Includes System for Consulting Crew Website
class HTMLIncludes {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
        this.initialized = false;
    }

    async load(element) {
        const file = element.getAttribute('data-include');
        
        if (!file) {
            console.error('No data-include attribute found on element:', element);
            return;
        }

        // Check if already loading this file
        if (this.loadingPromises.has(file)) {
            await this.loadingPromises.get(file);
            return;
        }

        // Create loading promise
        const loadPromise = this.loadFile(element, file);
        this.loadingPromises.set(file, loadPromise);
        
        try {
            await loadPromise;
        } finally {
            this.loadingPromises.delete(file);
        }
    }

    async loadFile(element, file) {
        // Check cache first
        if (this.cache.has(file)) {
            this.insertHTML(element, this.cache.get(file));
            return;
        }

        try {
            const response = await fetch(file);
            
            if (!response.ok) {
                throw new Error(`Failed to load ${file}: ${response.status} ${response.statusText}`);
            }

            const html = await response.text();
            
            // Cache the HTML
            this.cache.set(file, html);
            
            // Insert HTML
            this.insertHTML(element, html);
            
            console.log(`✓ Loaded include: ${file}`);
            
        } catch (error) {
            console.error(`✗ Error loading ${file}:`, error);
            this.showError(element, file, error);
        }
    }

    insertHTML(element, html) {
        // Create a temporary container to parse HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Extract and process head content
        const headContent = temp.querySelector('head');
        if (headContent) {
            this.processHeadContent(headContent);
            headContent.remove();
        }
        
        // Extract and process body content
        const bodyContent = temp.querySelector('body');
        if (bodyContent) {
            // Move all body children to our element
            while (bodyContent.firstChild) {
                element.appendChild(bodyContent.firstChild);
            }
        } else {
            // If no body tag, use all content
            element.innerHTML = temp.innerHTML;
        }
        
        // Process scripts
        this.processScripts(element);
        
        // Mark as processed
        element.setAttribute('data-include-loaded', 'true');
        
        // Dispatch event
        this.dispatchIncludeEvent(element, 'includes:loaded');
    }

    processHeadContent(headContent) {
        // Process meta tags, title, etc.
        const title = headContent.querySelector('title');
        if (title && !document.title) {
            document.title = title.textContent;
        }
        
        // Process styles and scripts in head
        const styles = headContent.querySelectorAll('style, link[rel="stylesheet"]');
        styles.forEach(style => {
            if (!document.head.querySelector(`[href="${style.href}"]`)) {
                document.head.appendChild(style.cloneNode(true));
            }
        });
    }

    processScripts(element) {
        const scripts = element.querySelectorAll('script');
        
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            
            // Copy all attributes
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            
            // Copy inline script content
            if (oldScript.textContent) {
                newScript.textContent = oldScript.textContent;
            }
            
            // Replace old script with new
            oldScript.parentNode.replaceChild(newScript, oldScript);
            
            // Execute script
            document.head.appendChild(newScript).remove();
        });
    }

    showError(element, file, error) {
        element.innerHTML = `
            <div class="include-error" style="
                padding: 20px;
                background: #ffebee;
                color: #c62828;
                border-radius: 4px;
                margin: 10px 0;
                border-left: 4px solid #c62828;
            ">
                <strong>Error loading ${file}</strong>
                <p style="margin: 5px 0 0; font-size: 14px;">
                    ${error.message}<br>
                    Please check if the file exists and try again.
                </p>
            </div>
        `;
    }

    dispatchIncludeEvent(element, eventName) {
        const event = new CustomEvent(eventName, {
            detail: { element, file: element.getAttribute('data-include') }
        });
        document.dispatchEvent(event);
    }

    async loadAll() {
        const elements = document.querySelectorAll('[data-include]:not([data-include-loaded])');
        
        if (elements.length === 0) {
            console.log('No includes to load');
            return;
        }

        console.log(`Loading ${elements.length} includes...`);
        
        // Load all includes in parallel
        const promises = Array.from(elements).map(el => this.load(el));
        
        try {
            await Promise.all(promises);
            console.log('✅ All includes loaded successfully');
            this.dispatchIncludeEvent(document, 'includes:all-loaded');
        } catch (error) {
            console.error('❌ Error loading includes:', error);
        }
    }

    async loadCriticalIncludes() {
        // Load header and footer first
        const criticalSelectors = [
            '[data-include*="header"]',
            '[data-include*="footer"]'
        ];
        
        const criticalElements = [];
        criticalSelectors.forEach(selector => {
            const elements = document.querySelectorAll(`${selector}:not([data-include-loaded])`);
            criticalElements.push(...elements);
        });
        
        if (criticalElements.length > 0) {
            console.log('Loading critical includes...');
            await Promise.all(Array.from(criticalElements).map(el => this.load(el)));
        }
    }

    init() {
        if (this.initialized) return;
        
        // Set up MutationObserver to handle dynamically added includes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.matches('[data-include]')) {
                        this.load(node);
                    }
                    
                    // Check children of added nodes
                    if (node.querySelectorAll) {
                        const includes = node.querySelectorAll('[data-include]');
                        includes.forEach(element => this.load(element));
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        this.initialized = true;
    }
}

// Initialize includes system
const includesSystem = new HTMLIncludes();

// Load includes based on document ready state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('DOM loaded, initializing includes...');
        includesSystem.init();
        
        // Load critical includes first
        await includesSystem.loadCriticalIncludes();
        
        // Then load all includes
        await includesSystem.loadAll();
        
        // Mark body as fully loaded
        document.body.classList.add('includes-loaded');
    });
} else {
    // DOM already loaded
    console.log('DOM already loaded, initializing includes...');
    includesSystem.init();
    includesSystem.loadAll().then(() => {
        document.body.classList.add('includes-loaded');
    });
}

// Export for use in other scripts
window.HTMLIncludes = includesSystem;