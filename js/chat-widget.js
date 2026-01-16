// Live Chat Widget for Consulting Crew
class LiveChatWidget {
    constructor() {
        this.isOpen = false;
        this.isTyping = false;
        this.messages = [];
        this.unreadMessages = 0;
        
        this.selectors = {
            widget: '#chatWidget',
            toggle: '#openChat',
            close: '#closeChat',
            send: '#sendChat',
            input: '#chatInput',
            messages: '.chat-messages',
            notification: '.chat-notification'
        };
        
        this.init();
    }
    
    init() {
        // Wait for includes to load
        document.addEventListener('includes:all-loaded', () => {
            this.setupElements();
            this.setupEventListeners();
            this.loadInitialMessages();
        });
        
        // If includes are already loaded
        if (document.body.classList.contains('includes-loaded')) {
            this.setupElements();
            this.setupEventListeners();
            this.loadInitialMessages();
        }
    }
    
    setupElements() {
        this.widget = document.querySelector(this.selectors.widget);
        this.toggle = document.querySelector(this.selectors.toggle);
        this.close = document.querySelector(this.selectors.close);
        this.send = document.querySelector(this.selectors.send);
        this.input = document.querySelector(this.selectors.input);
        this.messagesContainer = document.querySelector(this.selectors.messages);
        this.notification = document.querySelector(this.selectors.notification);
        
        // Quick reply buttons
        this.quickReplies = document.querySelectorAll('.quick-reply');
    }
    
    setupEventListeners() {
        // Toggle chat
        this.toggle?.addEventListener('click', () => this.toggleChat());
        
        // Close chat
        this.close?.addEventListener('click', () => this.closeChat());
        
        // Send message
        this.send?.addEventListener('click', () => this.sendMessage());
        
        // Send on Enter (but allow Shift+Enter for new line)
        this.input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Quick replies
        this.quickReplies?.forEach(button => {
            button.addEventListener('click', () => {
                const reply = button.getAttribute('data-reply');
                this.input.value = reply;
                this.sendMessage();
            });
        });
        
        // Auto-open after delay on certain pages
        if (window.location.pathname.includes('contact')) {
            setTimeout(() => {
                if (!this.isOpen && !localStorage.getItem('chatAutoOpened')) {
                    this.openChat();
                    localStorage.setItem('chatAutoOpened', 'true');
                }
            }, 30000); // 30 seconds
        }
    }
    
    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }
    
    openChat() {
        this.isOpen = true;
        this.widget?.classList.add('active');
        this.toggle?.setAttribute('aria-expanded', 'true');
        this.input?.focus();
        
        // Reset notification
        this.resetNotification();
        
        // Add welcome message if no messages yet
        if (this.messages.length === 0) {
            this.addBotMessage(
                "Hello! I'm your virtual assistant from Consulting Crew. How can I help you today?",
                true
            );
        }
        
        // Track chat opened
        this.trackEvent('chat_opened');
    }
    
    closeChat() {
        this.isOpen = false;
        this.widget?.classList.remove('active');
        this.toggle?.setAttribute('aria-expanded', 'false');
        
        // Track chat closed
        this.trackEvent('chat_closed');
    }
    
    sendMessage() {
        const message = this.input?.value.trim();
        
        if (!message) return;
        
        // Add user message
        this.addMessage(message, false);
        this.input.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate bot response after delay
        setTimeout(() => {
            this.hideTypingIndicator();
            this.generateBotResponse(message);
        }, 1000 + Math.random() * 1000);
        
        // Track message sent
        this.trackEvent('message_sent', { length: message.length });
    }
    
    addMessage(text, isBot = false) {
        const message = {
            text,
            isBot,
            timestamp: new Date().toISOString(),
            id: Date.now()
        };
        
        this.messages.push(message);
        this.renderMessage(message);
        
        // Store in localStorage
        this.saveMessages();
        
        // Update notification if chat is closed
        if (!this.isOpen && isBot) {
            this.updateNotification();
        }
    }
    
    addBotMessage(text, isInitial = false) {
        if (!isInitial && !this.isOpen) {
            this.updateNotification();
        }
        this.addMessage(text, true);
    }
    
    renderMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${message.isBot ? 'bot' : 'user'}`;
        
        const time = new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageElement.innerHTML = `
            <div class="message-content">
                <p>${this.escapeHtml(message.text)}</p>
            </div>
            <div class="message-time">${time}</div>
        `;
        
        this.messagesContainer?.appendChild(messageElement);
        this.scrollToBottom();
    }
    
    showTypingIndicator() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const indicator = document.createElement('div');
        indicator.className = 'chat-message bot typing-indicator';
        indicator.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        this.messagesContainer?.appendChild(indicator);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.isTyping = false;
        const indicator = this.messagesContainer?.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    generateBotResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        let response;
        
        // Common greetings
        if (lowerMessage.match(/(hello|hi|hey|good morning|good afternoon)/)) {
            response = "Hello! 👋 How can I assist you today?";
        }
        // Services inquiry
        else if (lowerMessage.match(/(service|what do you do|offer|provide)/)) {
            response = "We offer a range of professional services:\n\n" +
                      "• Data Analysis & Visualization\n" +
                      "• Web Development\n" +
                      "• Digital Marketing\n" +
                      "• Branding & Identity\n" +
                      "• Web Hosting\n" +
                      "• HR Services\n\n" +
                      "Which service are you interested in?";
        }
        // Pricing inquiry
        else if (lowerMessage.match(/(price|cost|how much|rate|quote)/)) {
            response = "Our pricing depends on your specific needs and project scope. " +
                      "Would you like to schedule a free consultation to get a custom quote?";
        }
        // Contact inquiry
        else if (lowerMessage.match(/(contact|phone|email|address|location)/)) {
            response = "You can reach us at:\n\n" +
                      "📞 +1 (555) 123-4567\n" +
                      "✉️ info@consultingcrew.com\n" +
                      "📍 123 Business Street, Suite 100, New York\n\n" +
                      "Our hours are Monday-Friday, 9AM-6PM EST.";
        }
        // Consultation request
        else if (lowerMessage.match(/(meeting|consult|schedule|call|talk)/)) {
            response = "I'd be happy to schedule a consultation for you! " +
                      "You can book a time directly through our calendar: " +
                      "<a href='/contact.html#booking' style='color: #1a73e8; text-decoration: underline;'>Book a Consultation</a>";
        }
        // Default response
        else {
            const responses = [
                "That's interesting! Could you tell me more about what you're looking for?",
                "I understand. Let me connect you with the right team member who can help with that.",
                "Thanks for sharing! Our experts can provide detailed guidance on that topic.",
                "Great question! I'll need to check with our specialists for the most accurate information."
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        
        this.addBotMessage(response);
    }
    
    loadInitialMessages() {
        // Load saved messages from localStorage
        const saved = localStorage.getItem('consultingCrewChat');
        if (saved) {
            try {
                this.messages = JSON.parse(saved);
                this.messages.forEach(msg => this.renderMessage(msg));
            } catch (e) {
                console.error('Error loading chat history:', e);
            }
        }
        
        // Add welcome message if no history
        if (this.messages.length === 0 && this.isOpen) {
            this.addBotMessage(
                "Hello! I'm your virtual assistant from Consulting Crew. How can I help you today?",
                true
            );
        }
    }
    
    saveMessages() {
        // Keep only last 50 messages
        const recentMessages = this.messages.slice(-50);
        localStorage.setItem('consultingCrewChat', JSON.stringify(recentMessages));
    }
    
    updateNotification() {
        this.unreadMessages++;
        
        if (this.notification) {
            this.notification.style.display = 'block';
            this.notification.textContent = this.unreadMessages > 9 ? '9+' : this.unreadMessages;
        }
        
        // Update page title
        if (!this.isOpen && this.unreadMessages > 0) {
            this.updatePageTitleNotification();
        }
    }
    
    resetNotification() {
        this.unreadMessages = 0;
        
        if (this.notification) {
            this.notification.style.display = 'none';
        }
        
        // Reset page title
        this.resetPageTitle();
    }
    
    updatePageTitleNotification() {
        const originalTitle = document.title.replace(/^\(\d+\)\s*/, '');
        document.title = `(${this.unreadMessages}) ${originalTitle}`;
    }
    
    resetPageTitle() {
        document.title = document.title.replace(/^\(\d+\)\s*/, '');
    }
    
    scrollToBottom() {
        if (this.messagesContainer) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    trackEvent(eventName, data = {}) {
        // In production, send to analytics
        console.log('Chat event:', eventName, data);
        
        // Example: Google Analytics
        // if (window.gtag) {
        //     gtag('event', eventName, data);
        // }
    }
    
    // Public methods
    open() {
        this.openChat();
    }
    
    close() {
        this.closeChat();
    }
    
    send(text) {
        if (this.input) {
            this.input.value = text;
            this.sendMessage();
        }
    }
    
    clear() {
        this.messages = [];
        if (this.messagesContainer) {
            this.messagesContainer.innerHTML = '';
        }
        localStorage.removeItem('consultingCrewChat');
        this.resetNotification();
    }
}

// Initialize chat widget
let chatWidget;

document.addEventListener('DOMContentLoaded', () => {
    chatWidget = new LiveChatWidget();
});

// Export for debugging
window.ConsultingCrewChat = {
    getInstance: () => chatWidget,
    open: () => chatWidget?.open(),
    close: () => chatWidget?.close(),
    send: (text) => chatWidget?.send(text),
    clear: () => chatWidget?.clear()
};