class KeyboardShortcuts {
    constructor() {
        this.shortcutsModal = document.getElementById('shortcutsModal');
        this.shortcutsGuide = document.querySelector('.shortcut-guide');
        this.toggleShortcutsBtn = document.getElementById('toggleShortcuts');
        this.analogClock = document.querySelector('.analog-clock');
        this.speakToggle = document.getElementById('toggleSpeak');
        
        this.isGuideVisible = false;
        this.isSpeakingEnabled = false;
        this.speakInterval = null;
        
        this.init();
    }

    init() {
        // Add keyboard event listener
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Add button listeners
        this.toggleShortcutsBtn.addEventListener('click', () => {
            const modal = new bootstrap.Modal(this.shortcutsModal);
            modal.show();
        });
        
        this.speakToggle.addEventListener('click', () => this.toggleSpeakTime());
        
        // Hide shortcuts guide initially
        this.shortcutsGuide.style.opacity = '0';
    }

    handleKeyPress(e) {
        // Don't trigger shortcuts when typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (e.key.toLowerCase()) {
            case ' ':
                e.preventDefault();
                this.handleSpaceBar();
                break;
            case 'r':
                this.handleReset();
                break;
            case 'l':
                this.handleLap();
                break;
            case 't':
                document.getElementById('themeToggle').click();
                break;
            case 'a':
                this.toggleAnalogClock();
                break;
            case '?':
                e.preventDefault();
                this.toggleShortcutsGuide();
                break;
            case 'escape':
                this.hideShortcutsGuide();
                break;
        }
    }

    handleSpaceBar() {
        // Determine which timer is visible and toggle it
        const activeSection = this.getActiveSection();
        
        switch (activeSection) {
            case 'timer':
                if (document.getElementById('startTimer').disabled) {
                    document.getElementById('pauseTimer').click();
                } else {
                    document.getElementById('startTimer').click();
                }
                break;
            case 'stopwatch':
                if (document.getElementById('startStopwatch').disabled) {
                    document.getElementById('pauseStopwatch').click();
                } else {
                    document.getElementById('startStopwatch').click();
                }
                break;
            case 'pomodoro':
                if (document.getElementById('startPomodoro').disabled) {
                    document.getElementById('pausePomodoro').click();
                } else {
                    document.getElementById('startPomodoro').click();
                }
                break;
        }
    }

    handleReset() {
        const activeSection = this.getActiveSection();
        
        switch (activeSection) {
            case 'timer':
                document.getElementById('resetTimer').click();
                break;
            case 'stopwatch':
                document.getElementById('resetStopwatch').click();
                break;
            case 'pomodoro':
                document.getElementById('resetPomodoro').click();
                break;
        }
    }

    handleLap() {
        if (this.getActiveSection() === 'stopwatch') {
            document.getElementById('lapButton').click();
        }
    }

    toggleAnalogClock() {
        if (this.analogClock) {
            this.analogClock.style.display = 
                this.analogClock.style.display === 'none' ? 'block' : 'none';
        }
    }

    toggleShortcutsGuide() {
        this.isGuideVisible = !this.isGuideVisible;
        this.shortcutsGuide.style.opacity = this.isGuideVisible ? '1' : '0';
        
        if (this.isGuideVisible) {
            // Hide after 3 seconds
            setTimeout(() => this.hideShortcutsGuide(), 3000);
        }
    }

    hideShortcutsGuide() {
        this.isGuideVisible = false;
        this.shortcutsGuide.style.opacity = '0';
    }

    toggleSpeakTime() {
        this.isSpeakingEnabled = !this.isSpeakingEnabled;
        this.speakToggle.classList.toggle('active');
        
        if (this.isSpeakingEnabled) {
            this.speakCurrentTime(); // Speak immediately
            // Speak every hour
            this.speakInterval = setInterval(() => {
                const now = new Date();
                if (now.getMinutes() === 0) {
                    this.speakCurrentTime();
                }
            }, 60000); // Check every minute
        } else {
            clearInterval(this.speakInterval);
        }
    }

    speakCurrentTime() {
        if (!('speechSynthesis' in window)) return;
        
        const now = new Date();
        const hours = now.getHours() % 12 || 12;
        const minutes = now.getMinutes();
        const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
        
        let timeText = `It's ${hours}`;
        if (minutes > 0) {
            timeText += `:${minutes}`;
        }
        timeText += ` ${ampm}`;
        
        const speech = new SpeechSynthesisUtterance(timeText);
        speechSynthesis.speak(speech);
    }

    getActiveSection() {
        // Simple logic to determine which section is currently in view
        // You might want to enhance this based on your actual UI/UX
        const sections = ['timer', 'stopwatch', 'pomodoro'];
        for (const section of sections) {
            const element = document.getElementById(section);
            if (element && this.isElementInViewport(element)) {
                return section;
            }
        }
        return null;
    }

    isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
}

// Initialize keyboard shortcuts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KeyboardShortcuts();
}); 