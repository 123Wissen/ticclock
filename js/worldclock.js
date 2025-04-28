class WorldClock {
    constructor() {
        this.clocksContainer = document.getElementById('worldClocks');
        this.addButton = document.getElementById('addWorldClock');
        this.timezoneSelect = document.getElementById('timezoneSelect');
        this.addTimezoneBtn = document.getElementById('addTimezone');
        
        this.clocks = JSON.parse(localStorage.getItem('worldClocks')) || [
            'America/New_York',
            'Europe/London',
            'Asia/Tokyo',
            'Australia/Sydney'
        ];
        
        // Popular timezones
        this.popularTimezones = {
            'America/New_York': 'New York',
            'America/Los_Angeles': 'Los Angeles',
            'America/Chicago': 'Chicago',
            'America/Toronto': 'Toronto',
            'Europe/London': 'London',
            'Europe/Paris': 'Paris',
            'Europe/Berlin': 'Berlin',
            'Europe/Rome': 'Rome',
            'Asia/Tokyo': 'Tokyo',
            'Asia/Shanghai': 'Shanghai',
            'Asia/Dubai': 'Dubai',
            'Asia/Singapore': 'Singapore',
            'Australia/Sydney': 'Sydney',
            'Pacific/Auckland': 'Auckland',
            'Asia/Kolkata': 'Mumbai',
            'Europe/Moscow': 'Moscow'
        };
        
        this.init();
    }

    init() {
        // Populate timezone select
        Object.entries(this.popularTimezones).forEach(([timezone, city]) => {
            const option = document.createElement('option');
            option.value = timezone;
            option.textContent = city;
            this.timezoneSelect.appendChild(option);
        });
        
        // Add event listeners
        this.addButton.addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('worldClockModal'));
            modal.show();
        });
        
        this.addTimezoneBtn.addEventListener('click', () => {
            const selectedTimezone = this.timezoneSelect.value;
            if (selectedTimezone && !this.clocks.includes(selectedTimezone)) {
                this.clocks.push(selectedTimezone);
                this.saveClocks();
                this.renderClocks();
                
                // Close modal
                bootstrap.Modal.getInstance(document.getElementById('worldClockModal')).hide();
            }
        });
        
        // Initial render
        this.renderClocks();
        
        // Update every second
        setInterval(() => this.updateTimes(), 1000);
    }

    renderClocks() {
        this.clocksContainer.innerHTML = '';
        
        this.clocks.forEach(timezone => {
            const clockDiv = document.createElement('div');
            clockDiv.className = 'world-clock-item';
            clockDiv.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h4>${this.popularTimezones[timezone]}</h4>
                        <div class="time"></div>
                        <div class="date small text-muted"></div>
                    </div>
                    <button class="btn btn-sm btn-danger" onclick="worldClock.removeClock('${timezone}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            this.clocksContainer.appendChild(clockDiv);
        });
        
        this.updateTimes();
    }

    updateTimes() {
        const now = new Date();
        
        this.clocks.forEach((timezone, index) => {
            const clockDiv = this.clocksContainer.children[index];
            const timeDiv = clockDiv.querySelector('.time');
            const dateDiv = clockDiv.querySelector('.date');
            
            const options = {
                timeZone: timezone,
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true
            };
            
            const dateOptions = {
                timeZone: timezone,
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            };
            
            try {
                timeDiv.textContent = new Intl.DateTimeFormat('en-US', options).format(now);
                dateDiv.textContent = new Intl.DateTimeFormat('en-US', dateOptions).format(now);
            } catch (error) {
                console.error(`Error formatting time for timezone ${timezone}:`, error);
            }
        });
    }

    removeClock(timezone) {
        this.clocks = this.clocks.filter(t => t !== timezone);
        this.saveClocks();
        this.renderClocks();
    }

    saveClocks() {
        localStorage.setItem('worldClocks', JSON.stringify(this.clocks));
    }
}

// Initialize world clock when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.worldClock = new WorldClock();
}); 