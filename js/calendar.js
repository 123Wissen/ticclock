class HolidayCalendar {
    constructor() {
        this.currentDate = new Date();
        this.holidays = [];
        this.initializeElements();
        this.setupEventListeners();
        this.loadHolidays();
    }

    initializeElements() {
        this.calendarGrid = document.querySelector('.calendar-grid');
        this.currentMonthDisplay = document.getElementById('currentMonth');
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');
        this.holidayList = document.getElementById('holidayList');
    }

    setupEventListeners() {
        this.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
        this.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));
    }

    async loadHolidays() {
        try {
            // Get user's country code (you might want to make this configurable)
            const countryCode = 'US'; // Default to US holidays
            const year = this.currentDate.getFullYear();
            
            // Using the Nager.Date API for holidays
            const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
            this.holidays = await response.json();
            
            this.renderCalendar();
            this.renderUpcomingHolidays();
        } catch (error) {
            console.error('Failed to load holidays:', error);
            // Load some default holidays as fallback
            this.holidays = this.getDefaultHolidays();
            this.renderCalendar();
            this.renderUpcomingHolidays();
        }
    }

    getDefaultHolidays() {
        const year = this.currentDate.getFullYear();
        return [
            { date: `${year}-01-01`, name: "New Year's Day" },
            { date: `${year}-07-04`, name: "Independence Day" },
            { date: `${year}-12-25`, name: "Christmas Day" },
            // Add more default holidays as needed
        ];
    }

    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.renderCalendar();
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update month display
        const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long' });
        this.currentMonthDisplay.textContent = `${monthName} ${year}`;
        
        // Clear existing calendar
        this.calendarGrid.innerHTML = '';
        
        // Add day headers
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day header';
            dayHeader.textContent = day;
            this.calendarGrid.appendChild(dayHeader);
        });
        
        // Get first day of month and total days
        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();
        
        // Add empty cells for days before first of month
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            this.calendarGrid.appendChild(emptyDay);
        }
        
        // Add days of month
        for (let day = 1; day <= totalDays; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            // Check if this day is today
            const currentDay = new Date();
            if (currentDay.getFullYear() === year &&
                currentDay.getMonth() === month &&
                currentDay.getDate() === day) {
                dayElement.classList.add('today');
            }
            
            // Check if this day is a holiday
            const dateString = this.formatDate(year, month + 1, day);
            const holiday = this.holidays.find(h => h.date === dateString);
            if (holiday) {
                dayElement.classList.add('holiday');
                dayElement.setAttribute('title', holiday.name);
                dayElement.addEventListener('click', () => this.showHolidayDetails(holiday));
            }
            
            this.calendarGrid.appendChild(dayElement);
        }
    }

    renderUpcomingHolidays() {
        this.holidayList.innerHTML = '';
        const today = new Date();
        const upcomingHolidays = this.holidays
            .filter(holiday => new Date(holiday.date) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5);

        upcomingHolidays.forEach(holiday => {
            const holidayItem = document.createElement('div');
            holidayItem.className = 'task-item fade-scale';
            
            const date = new Date(holiday.date);
            const formattedDate = date.toLocaleDateString('default', {
                month: 'short',
                day: 'numeric'
            });
            
            holidayItem.innerHTML = `
                <div class="task-content">
                    <div class="task-title">${holiday.name}</div>
                    <div class="task-time">${formattedDate}</div>
                </div>
            `;
            
            this.holidayList.appendChild(holidayItem);
        });
    }

    showHolidayDetails(holiday) {
        // Create and show a modal with holiday details
        const modal = document.createElement('div');
        modal.className = 'modal show';
        
        const date = new Date(holiday.date);
        const formattedDate = date.toLocaleDateString('default', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        modal.innerHTML = `
            <div class="modal-content card">
                <div class="modal-header">
                    <h2>${holiday.name}</h2>
                    <button class="btn btn-icon close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p><strong>Date:</strong> ${formattedDate}</p>
                    <p><strong>Type:</strong> ${holiday.type || 'Public Holiday'}</p>
                    ${holiday.description ? `<p>${holiday.description}</p>` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close button functionality
        const closeBtn = modal.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    formatDate(year, month, day) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    // Helper method to check if a date is a holiday
    isHoliday(date) {
        const dateString = this.formatDate(
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
        );
        return this.holidays.some(holiday => holiday.date === dateString);
    }

    // Get upcoming holidays
    getUpcomingHolidays(count = 5) {
        const today = new Date();
        return this.holidays
            .filter(holiday => new Date(holiday.date) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, count);
    }
}

// Initialize Holiday Calendar
const holidayCalendar = new HolidayCalendar();

// Export for use in other modules
export default holidayCalendar; 