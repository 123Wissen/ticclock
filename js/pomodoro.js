class PomodoroTimer {
    constructor() {
        this.display = document.getElementById('pomodoroTimer');
        this.phaseDisplay = document.querySelector('.pomodoro-phase');
        this.startBtn = document.getElementById('startPomodoro');
        this.pauseBtn = document.getElementById('pausePomodoro');
        this.resetBtn = document.getElementById('resetPomodoro');
        this.typeSelect = document.getElementById('pomodoroType');
        
        this.timerId = null;
        this.isRunning = false;
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.currentPhase = 'focus';
        this.focusCount = 0;
        
        // Pomodoro settings
        this.settings = {
            focus: 25 * 60, // 25 minutes
            short: 5 * 60,  // 5 minutes
            long: 15 * 60   // 15 minutes
        };
        
        this.init();
    }

    init() {
        // Add event listeners
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        this.typeSelect.addEventListener('change', () => {
            const type = this.typeSelect.value;
            this.timeLeft = this.settings[type];
            this.currentPhase = type;
            this.updateDisplay();
            this.updatePhaseDisplay();
        });
        
        // Initial states
        this.pauseBtn.disabled = true;
        this.updateDisplay();
        this.updatePhaseDisplay();
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        
        this.timerId = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.completePhase();
            }
        }, 1000);
    }

    pause() {
        if (!this.isRunning) return;
        
        clearInterval(this.timerId);
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
    }

    reset() {
        this.pause();
        const type = this.typeSelect.value;
        this.timeLeft = this.settings[type];
        this.currentPhase = type;
        this.focusCount = 0;
        this.updateDisplay();
        this.updatePhaseDisplay();
    }

    completePhase() {
        this.pause();
        
        // Play completion sound
        TicClock.playSound('assets/sounds/pomodoro-complete.mp3');
        
        // Show notification
        TicClock.showNotification('Pomodoro Phase Complete!', {
            body: `${this.currentPhase.charAt(0).toUpperCase() + this.currentPhase.slice(1)} phase completed!`,
            icon: '/assets/icons/pomodoro.png'
        });
        
        // Update phase
        if (this.currentPhase === 'focus') {
            this.focusCount++;
            if (this.focusCount % 4 === 0) {
                // After 4 focus sessions, take a long break
                this.currentPhase = 'long';
                this.timeLeft = this.settings.long;
            } else {
                this.currentPhase = 'short';
                this.timeLeft = this.settings.short;
            }
        } else {
            this.currentPhase = 'focus';
            this.timeLeft = this.settings.focus;
        }
        
        this.typeSelect.value = this.currentPhase;
        this.updateDisplay();
        this.updatePhaseDisplay();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    updatePhaseDisplay() {
        let phaseText = '';
        switch (this.currentPhase) {
            case 'focus':
                phaseText = `Focus Session ${this.focusCount + 1}`;
                break;
            case 'short':
                phaseText = 'Short Break';
                break;
            case 'long':
                phaseText = 'Long Break';
                break;
        }
        this.phaseDisplay.textContent = phaseText;
    }
}

// Initialize Pomodoro timer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
}); 