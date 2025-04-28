class DigitalClock {
    constructor() {
        this.timeElement = document.getElementById('time');
        this.dateElement = document.getElementById('date');
        this.formatToggle = document.getElementById('toggle12Hour');
        this.analogToggle = document.getElementById('toggleAnalog');
        this.analogClock = document.querySelector('.analog-clock');
        this.is24Hour = localStorage.getItem('clockFormat') === '24' || false;
        this.isAnalogVisible = localStorage.getItem('analogVisible') !== 'false';
        
        this.init();
    }

    init() {
        // Set initial format
        this.updateFormatButton();
        
        // Set initial analog clock visibility
        this.updateAnalogVisibility();
        
        // Start the clock
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        
        // Add format toggle listener
        this.formatToggle.addEventListener('click', () => {
            this.is24Hour = !this.is24Hour;
            localStorage.setItem('clockFormat', this.is24Hour ? '24' : '12');
            this.updateFormatButton();
            this.updateClock();
        });

        // Add analog toggle listener
        this.analogToggle.addEventListener('click', () => {
            this.isAnalogVisible = !this.isAnalogVisible;
            localStorage.setItem('analogVisible', this.isAnalogVisible);
            this.updateAnalogVisibility();
        });
    }

    updateFormatButton() {
        this.formatToggle.textContent = this.is24Hour ? '24H' : '12H';
    }

    updateAnalogVisibility() {
        this.analogClock.style.display = this.isAnalogVisible ? 'block' : 'none';
        this.analogToggle.textContent = this.isAnalogVisible ? 'Hide Analog' : 'Show Analog';
    }

    updateClock() {
        const now = new Date();
        
        // Update time
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        let period = '';
        
        if (!this.is24Hour) {
            period = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
        }
        
        this.timeElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}${period ? ' ' + period : ''}`;
        
        // Update date
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        this.dateElement.textContent = now.toLocaleDateString(undefined, options);

        // Update analog clock hands
        if (this.isAnalogVisible) {
            const hourDeg = (hours % 12 + minutes / 60) * 30;
            const minuteDeg = minutes * 6;
            const secondDeg = seconds * 6;

            const hourHand = this.analogClock.querySelector('.hour-hand');
            const minuteHand = this.analogClock.querySelector('.minute-hand');
            const secondHand = this.analogClock.querySelector('.second-hand');

            hourHand.style.transform = `rotate(${hourDeg}deg)`;
            minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
            secondHand.style.transform = `rotate(${secondDeg}deg)`;
        }
    }
}

// Initialize the clock when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DigitalClock();
}); 