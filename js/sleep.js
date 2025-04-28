import Chart from 'chart.js/auto';

class SleepTracker {
    constructor() {
        this.sleepData = this.loadSleepData();
        this.initializeElements();
        this.setupEventListeners();
        this.initializeChart();
        this.render();
    }

    initializeElements() {
        this.sleepStartInput = document.getElementById('sleepStart');
        this.sleepEndInput = document.getElementById('sleepEnd');
        this.qualitySelect = document.getElementById('sleepQuality');
        this.addSleepBtn = document.getElementById('addSleep');
        this.sleepList = document.getElementById('sleepList');
        this.sleepChart = document.getElementById('sleepChart');
        this.statsContainer = document.getElementById('sleepStats');
    }

    setupEventListeners() {
        this.addSleepBtn.addEventListener('click', () => this.addSleepEntry());
        
        // Set default times
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        this.sleepStartInput.value = yesterday.toISOString().slice(0, 16);
        this.sleepEndInput.value = now.toISOString().slice(0, 16);
    }

    loadSleepData() {
        const savedData = localStorage.getItem('sleepData');
        return savedData ? JSON.parse(savedData) : [];
    }

    saveSleepData() {
        localStorage.setItem('sleepData', JSON.stringify(this.sleepData));
    }

    addSleepEntry() {
        const startTime = new Date(this.sleepStartInput.value).getTime();
        const endTime = new Date(this.sleepEndInput.value).getTime();
        const quality = parseInt(this.qualitySelect.value);
        
        if (!startTime || !endTime) {
            this.showError('Please select both start and end times');
            return;
        }
        
        if (endTime <= startTime) {
            this.showError('End time must be after start time');
            return;
        }
        
        const duration = (endTime - startTime) / (1000 * 60 * 60); // Duration in hours
        
        if (duration > 24) {
            this.showError('Sleep duration cannot exceed 24 hours');
            return;
        }
        
        const entry = {
            id: Date.now(),
            startTime,
            endTime,
            duration,
            quality,
            notes: ''
        };
        
        this.sleepData.push(entry);
        this.saveSleepData();
        this.updateChart();
        this.render();
        
        // Show confirmation
        this.showNotification('Sleep Entry Added', {
            body: `Added sleep record: ${duration.toFixed(1)} hours`
        });
    }

    deleteSleepEntry(id) {
        this.sleepData = this.sleepData.filter(entry => entry.id !== id);
        this.saveSleepData();
        this.updateChart();
        this.render();
    }

    initializeChart() {
        this.chart = new Chart(this.sleepChart.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Sleep Duration (hours)',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }, {
                    label: 'Sleep Quality',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 12
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.dataset.label;
                                const value = context.parsed.y;
                                return `${label}: ${value.toFixed(1)}`;
                            }
                        }
                    }
                }
            }
        });
        
        this.updateChart();
    }

    updateChart() {
        const sortedData = [...this.sleepData].sort((a, b) => a.startTime - b.startTime);
        
        this.chart.data.labels = sortedData.map(entry => 
            new Date(entry.startTime).toLocaleDateString()
        );
        
        this.chart.data.datasets[0].data = sortedData.map(entry => entry.duration);
        this.chart.data.datasets[1].data = sortedData.map(entry => entry.quality);
        
        this.chart.update();
    }

    render() {
        this.sleepList.innerHTML = '';
        this.updateStats();
        
        // Sort entries by date (newest first)
        const sortedEntries = [...this.sleepData].sort((a, b) => b.startTime - a.startTime);
        
        sortedEntries.forEach(entry => {
            const entryElement = document.createElement('div');
            entryElement.className = 'sleep-entry fade-scale';
            
            const startDate = new Date(entry.startTime);
            const endDate = new Date(entry.endTime);
            
            entryElement.innerHTML = `
                <div class="sleep-entry-header">
                    <span class="sleep-date">${startDate.toLocaleDateString()}</span>
                    <span class="sleep-duration">${entry.duration.toFixed(1)} hours</span>
                </div>
                <div class="sleep-entry-details">
                    <div class="sleep-times">
                        <span>${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}</span>
                    </div>
                    <div class="sleep-quality">
                        Quality: ${this.getQualityStars(entry.quality)}
                    </div>
                </div>
                <button class="btn btn-icon" aria-label="Delete sleep entry">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            const deleteBtn = entryElement.querySelector('.btn-icon');
            deleteBtn.addEventListener('click', () => this.deleteSleepEntry(entry.id));
            
            this.sleepList.appendChild(entryElement);
        });
    }

    updateStats() {
        if (this.sleepData.length === 0) {
            this.statsContainer.innerHTML = '<p>No sleep data available</p>';
            return;
        }
        
        const stats = this.calculateStats();
        
        this.statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <h3>Average Duration</h3>
                    <p>${stats.avgDuration.toFixed(1)} hours</p>
                </div>
                <div class="stat-item">
                    <h3>Average Quality</h3>
                    <p>${this.getQualityStars(stats.avgQuality)}</p>
                </div>
                <div class="stat-item">
                    <h3>Best Sleep</h3>
                    <p>${stats.bestSleep.toFixed(1)} hours</p>
                </div>
                <div class="stat-item">
                    <h3>Sleep Debt</h3>
                    <p>${stats.sleepDebt.toFixed(1)} hours</p>
                </div>
            </div>
        `;
    }

    calculateStats() {
        const recentEntries = this.sleepData.slice(-7); // Last 7 days
        
        const avgDuration = recentEntries.reduce((sum, entry) => sum + entry.duration, 0) / recentEntries.length;
        const avgQuality = recentEntries.reduce((sum, entry) => sum + entry.quality, 0) / recentEntries.length;
        const bestSleep = Math.max(...recentEntries.map(entry => entry.duration));
        
        // Calculate sleep debt (assuming 8 hours is ideal)
        const sleepDebt = recentEntries.reduce((debt, entry) => {
            return debt + (8 - entry.duration);
        }, 0);
        
        return {
            avgDuration,
            avgQuality,
            bestSleep,
            sleepDebt
        };
    }

    getQualityStars(quality) {
        const stars = '★'.repeat(quality) + '☆'.repeat(5 - quality);
        return `<span class="quality-stars">${stars}</span>`;
    }

    showNotification(title, options = {}) {
        if (!("Notification" in window)) {
            return;
        }

        if (Notification.permission === "granted") {
            new Notification(title, options);
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification(title, options);
                }
            });
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message fade-scale';
        errorDiv.textContent = message;
        
        this.sleepList.insertBefore(errorDiv, this.sleepList.firstChild);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    exportData() {
        const data = JSON.stringify(this.sleepData, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `sleep_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importData(jsonData) {
        try {
            const newData = JSON.parse(jsonData);
            if (Array.isArray(newData)) {
                this.sleepData = newData;
                this.saveSleepData();
                this.updateChart();
                this.render();
                return true;
            }
        } catch (error) {
            console.error('Failed to import sleep data:', error);
        }
        return false;
    }
}

// Initialize Sleep Tracker
const sleepTracker = new SleepTracker();

// Export for use in other modules
export default sleepTracker; 