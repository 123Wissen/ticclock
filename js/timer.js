class CountdownTimer {
    constructor() {
        this.display = document.getElementById('timer');
        this.hoursInput = document.getElementById('hours');
        this.minutesInput = document.getElementById('minutes');
        this.secondsInput = document.getElementById('seconds');
        this.startBtn = document.getElementById('startTimer');
        this.pauseBtn = document.getElementById('pauseTimer');
        this.resetBtn = document.getElementById('resetTimer');
        
        this.timeLeft = 0;
        this.timerId = null;
        this.isRunning = false;
        
        this.init();
    }

    init() {
        // Add event listeners
        this.startBtn.addEventListener('click', () => this.startTimer());
        this.pauseBtn.addEventListener('click', () => this.pauseTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        
        // Input validation
        [this.hoursInput, this.minutesInput, this.secondsInput].forEach(input => {
            input.addEventListener('input', () => {
                let value = parseInt(input.value) || 0;
                const max = parseInt(input.getAttribute('max'));
                value = Math.min(Math.max(value, 0), max);
                input.value = value;
            });
        });
        
        this.updateDisplay();
    }

    startTimer() {
        if (this.isRunning) return;
        
        if (!this.timeLeft) {
            // Get time from inputs
            const hours = parseInt(this.hoursInput.value) || 0;
            const minutes = parseInt(this.minutesInput.value) || 0;
            const seconds = parseInt(this.secondsInput.value) || 0;
            
            this.timeLeft = (hours * 3600) + (minutes * 60) + seconds;
            
            if (this.timeLeft <= 0) {
                TicClock.showNotification('Please set a valid time');
                return;
            }
        }
        
        this.isRunning = true;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        
        this.timerId = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.timerComplete();
            }
        }, 1000);
    }

    pauseTimer() {
        if (!this.isRunning) return;
        
        clearInterval(this.timerId);
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
    }

    resetTimer() {
        clearInterval(this.timerId);
        this.timeLeft = 0;
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        
        // Clear inputs
        this.hoursInput.value = '';
        this.minutesInput.value = '';
        this.secondsInput.value = '';
        
        this.updateDisplay();
    }

    updateDisplay() {
        const hours = Math.floor(this.timeLeft / 3600);
        const minutes = Math.floor((this.timeLeft % 3600) / 60);
        const seconds = this.timeLeft % 60;
        
        this.display.textContent = TicClock.formatTime(hours, minutes, seconds);
    }

    timerComplete() {
        clearInterval(this.timerId);
        this.isRunning = false;
        this.timeLeft = 0;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        
        // Play completion sound
        TicClock.playSound('assets/sounds/timer-complete.mp3');
        
        // Show notification
        TicClock.showNotification('Timer Complete!', {
            body: 'Your countdown timer has finished.',
            icon: '/assets/icons/timer.png'
        });
    }
}

// Initialize timer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CountdownTimer();
}); 