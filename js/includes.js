// Smart HTML Include System
class HTMLInclude {
    constructor() {
        this.cache = new Map();
    }
    
    async load(element) {
        const file = element.getAttribute('data-include');
        
        // Check cache first
        if (this.cache.has(file)) {
            element.innerHTML = this.cache.get(file);
            this.processElement(element);
            return;
        }
        
        try {
            const response = await fetch(file);
            if (!response.ok) throw new Error(`Failed to load: ${file}`);
            
            let html = await response.text();
            
            // Cache the HTML
            this.cache.set(file, html);
            
            // Insert HTML
            element.innerHTML = html;
            
            // Process scripts and events
            this.processElement(element);
            
        } catch (error) {
            console.error('Include error:', error);
            element.innerHTML = `
                <div style="padding: 20px; background: #ffebee; color: #c62828; border-radius: 4px;">
                    <strong>Error loading ${file}</strong><br>
                    Please check if the file exists.
                </div>
            `;
        }
    }
    
    processElement(element) {
        // Execute scripts inside included HTML
        element.querySelectorAll('script').forEach(oldScript => {
            const newScript = document.createElement('script');
            
            // Copy all attributes
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            
            // Copy content for inline scripts
            if (oldScript.innerHTML) {
                newScript.innerHTML = oldScript.innerHTML;
            }
            
            // Replace old script with new
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
        
        // Dispatch event for other scripts to know includes are loaded
        const event = new CustomEvent('includes-loaded', {
            detail: { element: element }
        });
        document.dispatchEvent(event);
    }
    
    async loadAll() {
        const elements = document.querySelectorAll('[data-include]');
        
        // Load all includes in parallel
        const promises = Array.from(elements).map(el => this.load(el));
        
        await Promise.all(promises);
        console.log('All includes loaded successfully');
    }
}

// Initialize and load includes
document.addEventListener('DOMContentLoaded', () => {
    const includeSystem = new HTMLInclude();
    includeSystem.loadAll();
});