class Stopwatch {
    constructor() {
        this.display = document.getElementById('stopwatch');
        this.startBtn = document.getElementById('startStopwatch');
        this.pauseBtn = document.getElementById('pauseStopwatch');
        this.resetBtn = document.getElementById('resetStopwatch');
        this.lapBtn = document.getElementById('lapButton');
        this.lapTimesContainer = document.getElementById('lapTimes');
        
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timerId = null;
        this.isRunning = false;
        this.lapTimes = [];
        this.lastLapTime = 0;
        
        this.init();
    }

    init() {
        // Add event listeners
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.lapBtn.addEventListener('click', () => this.recordLap());
        
        // Initial button states
        this.pauseBtn.disabled = true;
        this.lapBtn.disabled = true;
        
        this.updateDisplay();
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.lapBtn.disabled = false;
        
        if (this.elapsedTime === 0) {
            this.startTime = Date.now();
        } else {
            // Adjust start time to account for elapsed time
            this.startTime = Date.now() - this.elapsedTime;
        }
        
        this.timerId = requestAnimationFrame(() => this.tick());
    }

    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.lapBtn.disabled = true;
        
        cancelAnimationFrame(this.timerId);
    }

    reset() {
        this.pause();
        this.elapsedTime = 0;
        this.lastLapTime = 0;
        this.lapTimes = [];
        this.updateDisplay();
        this.renderLapTimes();
    }

    tick() {
        if (!this.isRunning) return;
        
        this.elapsedTime = Date.now() - this.startTime;
        this.updateDisplay();
        
        this.timerId = requestAnimationFrame(() => this.tick());
    }

    updateDisplay() {
        const totalMilliseconds = this.elapsedTime;
        const hours = Math.floor(totalMilliseconds / 3600000);
        const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
        const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
        const milliseconds = Math.floor((totalMilliseconds % 1000));
        
        this.display.textContent = TicClock.formatTimeWithMilliseconds(hours, minutes, seconds, milliseconds);
    }

    recordLap() {
        if (!this.isRunning) return;
        
        const currentLapTime = this.elapsedTime - this.lastLapTime;
        this.lastLapTime = this.elapsedTime;
        
        const lapNumber = this.lapTimes.length + 1;
        this.lapTimes.push({
            number: lapNumber,
            totalTime: this.elapsedTime,
            lapTime: currentLapTime
        });
        
        this.renderLapTimes();
    }

    renderLapTimes() {
        this.lapTimesContainer.innerHTML = '';
        
        // Create lap time elements in reverse order (newest first)
        [...this.lapTimes].reverse().forEach(lap => {
            const lapDiv = document.createElement('div');
            lapDiv.className = 'lap-time';
            
            const totalHours = Math.floor(lap.totalTime / 3600000);
            const totalMinutes = Math.floor((lap.totalTime % 3600000) / 60000);
            const totalSeconds = Math.floor((lap.totalTime % 60000) / 1000);
            const totalMilliseconds = Math.floor((lap.totalTime % 1000));
            
            const lapHours = Math.floor(lap.lapTime / 3600000);
            const lapMinutes = Math.floor((lap.lapTime % 3600000) / 60000);
            const lapSeconds = Math.floor((lap.lapTime % 60000) / 1000);
            const lapMilliseconds = Math.floor((lap.lapTime % 1000));
            
            lapDiv.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <span>Lap ${lap.number}</span>
                    <span>${TicClock.formatTimeWithMilliseconds(lapHours, lapMinutes, lapSeconds, lapMilliseconds)}</span>
                    <span>${TicClock.formatTimeWithMilliseconds(totalHours, totalMinutes, totalSeconds, totalMilliseconds)}</span>
                </div>
            `;
            
            this.lapTimesContainer.appendChild(lapDiv);
        });
    }
}

// Initialize stopwatch when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Stopwatch();
});