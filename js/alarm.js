class AlarmClock {
    constructor() {
        this.alarms = JSON.parse(localStorage.getItem('alarms')) || [];
        this.alarmList = document.getElementById('alarmList');
        this.alarmSound = document.getElementById('alarmSound');
        this.saveAlarmBtn = document.getElementById('saveAlarm');
        
        // Available alarm sounds
        this.sounds = [
            { name: 'Classic Bell', url: 'assets/sounds/bell.mp3' },
            { name: 'Digital Beep', url: 'assets/sounds/beep.mp3' },
            { name: 'Gentle Chime', url: 'assets/sounds/chime.mp3' },
            { name: 'Morning Birds', url: 'assets/sounds/birds.mp3' },
            { name: 'Ocean Wave', url: 'assets/sounds/wave.mp3' }
        ];
        
        this.init();
    }

    init() {
        // Populate sound options
        this.sounds.forEach(sound => {
            const option = document.createElement('option');
            option.value = sound.url;
            option.textContent = sound.name;
            this.alarmSound.appendChild(option);
        });

        // Load saved alarms
        this.renderAlarms();
        
        // Start checking alarms
        setInterval(() => this.checkAlarms(), 1000);
        
        // Add event listeners
        this.saveAlarmBtn.addEventListener('click', () => this.saveAlarm());
    }

    saveAlarm() {
        const hour = parseInt(document.getElementById('alarmHour').value);
        const minute = parseInt(document.getElementById('alarmMinute').value);
        const ampm = document.getElementById('alarmAmPm').value;
        const sound = this.alarmSound.value;
        
        if (isNaN(hour) || isNaN(minute) || hour < 1 || hour > 12 || minute < 0 || minute > 59) {
            TicClock.showNotification('Invalid time format');
            return;
        }
        
        // Convert to 24-hour format for storage
        let hours24 = hour;
        if (ampm === 'PM' && hour !== 12) hours24 += 12;
        if (ampm === 'AM' && hour === 12) hours24 = 0;
        
        const alarm = {
            id: Date.now(),
            hour: hours24,
            minute,
            sound,
            enabled: true
        };
        
        this.alarms.push(alarm);
        this.saveAlarms();
        this.renderAlarms();
        
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('alarmModal')).hide();
        
        // Show confirmation
        TicClock.showNotification('Alarm set successfully', {
            body: `Alarm set for ${hour}:${String(minute).padStart(2, '0')} ${ampm}`
        });
    }

    renderAlarms() {
        this.alarmList.innerHTML = '';
        
        this.alarms.forEach(alarm => {
            const alarmDiv = document.createElement('div');
            alarmDiv.className = 'alarm-item';
            
            // Convert to 12-hour format for display
            let hour12 = alarm.hour % 12 || 12;
            let ampm = alarm.hour >= 12 ? 'PM' : 'AM';
            
            alarmDiv.innerHTML = `
                <div class="alarm-time">
                    ${hour12}:${String(alarm.minute).padStart(2, '0')} ${ampm}
                </div>
                <div class="alarm-controls">
                    <button class="btn btn-sm ${alarm.enabled ? 'btn-success' : 'btn-secondary'}" 
                            onclick="alarmClock.toggleAlarm(${alarm.id})">
                        <i class="fas ${alarm.enabled ? 'fa-bell' : 'fa-bell-slash'}"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="alarmClock.deleteAlarm(${alarm.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            this.alarmList.appendChild(alarmDiv);
        });
    }

    toggleAlarm(id) {
        const alarm = this.alarms.find(a => a.id === id);
        if (alarm) {
            alarm.enabled = !alarm.enabled;
            this.saveAlarms();
            this.renderAlarms();
        }
    }

    deleteAlarm(id) {
        this.alarms = this.alarms.filter(a => a.id !== id);
        this.saveAlarms();
        this.renderAlarms();
    }

    checkAlarms() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        this.alarms.forEach(alarm => {
            if (alarm.enabled && 
                alarm.hour === currentHour && 
                alarm.minute === currentMinute && 
                now.getSeconds() === 0) {
                
                this.triggerAlarm(alarm);
            }
        });
    }

    triggerAlarm(alarm) {
        // Play sound
        TicClock.playSound(alarm.sound);
        
        // Show notification
        let hour12 = alarm.hour % 12 || 12;
        let ampm = alarm.hour >= 12 ? 'PM' : 'AM';
        
        TicClock.showNotification('Alarm!', {
            body: `It's ${hour12}:${String(alarm.minute).padStart(2, '0')} ${ampm}`,
            icon: '/assets/icons/alarm.png'
        });
    }

    saveAlarms() {
        localStorage.setItem('alarms', JSON.stringify(this.alarms));
    }
}

// Initialize alarm clock when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.alarmClock = new AlarmClock();
}); 