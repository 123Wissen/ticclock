// Theme Management
document.addEventListener('DOMContentLoaded', () => {
    // Section Management
    const sections = document.querySelectorAll('.dashboard-section, .dashboard-card');
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    
    // Hide all sections initially except the first one
    sections.forEach((section, index) => {
        if (index !== 0) {
            section.style.display = 'none';
        }
    });
    
    // Function to show selected section and hide others
    const showSection = (sectionId) => {
        sections.forEach(section => {
            section.style.display = section.id === sectionId ? 'block' : 'none';
        });
        
        // Update active state of nav links
        navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === '#' + sectionId;
            link.classList.toggle('active', isActive);
        });
        
        // Close sidebar on mobile after section change
        if (window.innerWidth <= 992) {
            sidebar.classList.remove('show');
        }
    };
    
    // Add click handlers to nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            showSection(sectionId);
            
            // Smooth scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });

    // Sidebar Management
    const sidebar = document.querySelector('.sidebar');
    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    
    toggleSidebarBtn?.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });
    
    closeSidebarBtn?.addEventListener('click', () => {
        sidebar.classList.remove('show');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 992 && // Only on mobile
            sidebar.classList.contains('show') && // Sidebar is open
            !e.target.closest('.sidebar') && // Click outside sidebar
            !e.target.closest('#toggleSidebar')) { // Not clicking toggle button
            sidebar.classList.remove('show');
        }
    });

    // Theme Management
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const icon = themeToggle.querySelector('i');

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.classList.add(`${savedTheme}-mode`);
    updateThemeIcon(savedTheme === 'dark');

    themeToggle.addEventListener('click', () => {
        const isDark = body.classList.contains('dark-mode');
        body.classList.remove(`${isDark ? 'dark' : 'light'}-mode`);
        body.classList.add(`${isDark ? 'light' : 'dark'}-mode`);
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
        updateThemeIcon(!isDark);
    });

    function updateThemeIcon(isDark) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
});

// Utility Functions
const formatTime = (hours, minutes, seconds, showSeconds = true) => {
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');
    return showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`;
};

const formatTimeWithMilliseconds = (hours, minutes, seconds, milliseconds) => {
    return `${formatTime(hours, minutes, seconds)}.${String(milliseconds).padStart(3, '0')}`;
};

const playSound = (soundUrl) => {
    const audio = new Audio(soundUrl);
    audio.play().catch(error => console.log('Audio playback failed:', error));
};

// Show notification if supported
const showNotification = (title, options = {}) => {
    if (!("Notification" in window)) {
        alert(title);
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
};

// Export utilities for other modules
window.TicClock = {
    formatTime,
    formatTimeWithMilliseconds,
    playSound,
    showNotification
}; 