// Authentication Module
const Auth = {
    // Logout user
    logout() {
        // Check if Utils is available
        if (typeof Utils !== 'undefined' && Utils.showConfirmDialog) {
            Utils.showConfirmDialog(
                'Logout',
                'Are you sure you want to logout?',
                'Logout',
                'Cancel'
            ).then(confirmed => {
                if (confirmed) {
                    this.performLogout();
                }
            });
        } else {
            // Fallback to simple confirm if Utils not loaded
            if (confirm('Are you sure you want to logout?')) {
                this.performLogout();
            }
        }
    },
    
    // Perform the actual logout
    performLogout() {
        localStorage.removeItem('issuer_user');
        // Always redirect to index.html at root
        const currentUrl = window.location.href;
        const urlObj = new URL(currentUrl);
        const pathname = urlObj.pathname;
        
        // Find the issuer-portal directory in the path
        const portalIndex = pathname.indexOf('/issuer-portal/');
        if (portalIndex !== -1) {
            // Extract path up to issuer-portal
            const rootPath = pathname.substring(0, portalIndex + '/issuer-portal'.length);
            window.location.href = urlObj.origin + rootPath + '/index.html';
        } else {
            // Fallback: try relative path
            if (pathname.includes('/pages/')) {
                window.location.href = '../index.html';
            } else {
                window.location.href = 'index.html';
            }
        }
    },
    
    // Get current user
    getCurrentUser() {
        try {
            const userData = localStorage.getItem('issuer_user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    },
    
    // Check if user is authenticated
    isAuthenticated() {
        return this.getCurrentUser() !== null;
    },
    
    // Require authentication (redirect if not logged in)
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'pages/login.html';
            return false;
        }
        return true;
    }
};

// Export to window for global access
window.Auth = Auth;

