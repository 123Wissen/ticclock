class TaskScheduler {
    constructor() {
        this.tasks = this.loadTasks();
        this.initializeElements();
        this.setupEventListeners();
        this.startTaskChecker();
        this.render();
    }

    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.taskTime = document.getElementById('taskTime');
        this.addTaskBtn = document.getElementById('addTask');
        this.taskList = document.getElementById('taskList');
    }

    setupEventListeners() {
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        
        // Add task on Enter key
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // Set minimum time to current time
        const now = new Date();
        const timeString = now.toISOString().slice(0, 16);
        this.taskTime.min = timeString;
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        return savedTasks ? JSON.parse(savedTasks) : [];
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    addTask() {
        const title = this.taskInput.value.trim();
        const time = this.taskTime.value;
        
        if (!title) {
            this.showError('Please enter a task title');
            return;
        }
        
        if (!time) {
            this.showError('Please select a time for the task');
            return;
        }

        const task = {
            id: Date.now(),
            title,
            time: new Date(time).getTime(),
            completed: false,
            notified: false
        };

        this.tasks.push(task);
        this.saveTasks();
        this.render();
        
        // Clear inputs
        this.taskInput.value = '';
        this.taskTime.value = '';
        
        // Show confirmation
        this.showNotification('Task Added', {
            body: `Task "${title}" scheduled for ${new Date(time).toLocaleString()}`
        });
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.render();
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    render() {
        this.taskList.innerHTML = '';
        
        // Sort tasks by time
        const sortedTasks = [...this.tasks].sort((a, b) => a.time - b.time);
        
        sortedTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.completed ? 'completed' : ''} fade-scale`;
            
            const date = new Date(task.time);
            const formattedTime = date.toLocaleString('default', {
                hour: 'numeric',
                minute: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            taskElement.innerHTML = `
                <div class="task-checkbox" role="checkbox" aria-checked="${task.completed}"
                     tabindex="0" aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-time">
                        <i class="far fa-clock"></i> ${formattedTime}
                    </div>
                </div>
                <button class="btn btn-icon" aria-label="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            // Add event listeners
            const checkbox = taskElement.querySelector('.task-checkbox');
            checkbox.addEventListener('click', () => this.toggleTask(task.id));
            checkbox.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleTask(task.id);
                }
            });
            
            const deleteBtn = taskElement.querySelector('.btn-icon');
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
            
            this.taskList.appendChild(taskElement);
        });
    }

    startTaskChecker() {
        // Check for due tasks every minute
        setInterval(() => this.checkTasks(), 60000);
        this.checkTasks(); // Initial check
    }

    checkTasks() {
        const now = Date.now();
        this.tasks.forEach(task => {
            if (!task.completed && !task.notified && task.time <= now) {
                this.notifyTask(task);
                task.notified = true;
                this.saveTasks();
            }
        });
    }

    notifyTask(task) {
        // Play notification sound
        const audio = new Audio('/assets/sounds/notification.mp3');
        audio.play().catch(error => console.log('Audio playback failed:', error));
        
        // Show notification
        this.showNotification('Task Due', {
            body: task.title,
            icon: '/assets/icons/task.png'
        });
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
        
        this.taskList.insertBefore(errorDiv, this.taskList.firstChild);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    // Analytics methods
    getStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const overdue = this.tasks.filter(t => !t.completed && t.time < Date.now()).length;
        
        return {
            total,
            completed,
            pending,
            overdue,
            completionRate: total ? (completed / total * 100).toFixed(1) : 0
        };
    }

    exportTasks() {
        const data = JSON.stringify(this.tasks, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasks_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importTasks(jsonData) {
        try {
            const newTasks = JSON.parse(jsonData);
            if (Array.isArray(newTasks)) {
                this.tasks = newTasks;
                this.saveTasks();
                this.render();
                return true;
            }
        } catch (error) {
            console.error('Failed to import tasks:', error);
        }
        return false;
    }
}

// Initialize Task Scheduler
const taskScheduler = new TaskScheduler();

// Export for use in other modules
export default taskScheduler; 