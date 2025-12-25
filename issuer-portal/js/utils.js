// Utility Functions for Issuer Portal

// Global logout handler - define early so it's always available
window.handleLogout = function() {
    if (typeof Auth !== 'undefined' && Auth.logout) {
        Auth.logout();
    } else {
        // Fallback if Auth not loaded yet
        if (confirm('Are you sure you want to logout?')) {
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
        }
    }
};

// Load HTML components dynamically
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) throw new Error(`Failed to load ${componentPath}`);
        const html = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
            
            // Re-attach event listeners for dynamically loaded content
            if (elementId === 'navbar') {
                const logoutBtn = element.querySelector('.btn-nav-logout, button[onclick*="logout"]');
                if (logoutBtn) {
                    // Remove old onclick and add new event listener
                    logoutBtn.removeAttribute('onclick');
                    logoutBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        window.handleLogout();
                    });
                }
            }
            
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
        return false;
    }
}

// Initialize user session
function initUserSession() {
    const user = JSON.parse(localStorage.getItem('issuer_user'));
    if (!user && !window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('signup.html')) {
        window.location.href = 'pages/login.html';
        return null;
    }
    
    // Update user name in UI if element exists
    if (user) {
        const userNameElements = document.querySelectorAll('.user-name, #userName');
        userNameElements.forEach(el => {
            if (el) el.textContent = user.name || user.email;
        });
    }
    
    return user;
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Validate DID format
function isValidDID(did) {
    const didPattern = /^did:[a-z0-9]+:[a-zA-Z0-9._-]+$/;
    return didPattern.test(did);
}

// Validate email
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

// Show notification/toast
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="notification-close">×</button>
        </div>
    `;
    
    // Add styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                animation: slideIn 0.3s ease;
            }
            .notification-content {
                padding: 12px 16px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .notification-success {
                background-color: #C6F6D5;
                color: #22543D;
                border: 1px solid #9AE6B4;
            }
            .notification-error {
                background-color: #FED7D7;
                color: #822727;
                border: 1px solid #FC8181;
            }
            .notification-info {
                background-color: #BEE3F8;
                color: #2C5282;
                border: 1px solid #90CDF4;
            }
            .notification-warning {
                background-color: #FEFCBF;
                color: #744210;
                border: 1px solid #FAF089;
            }
            .notification-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                margin-left: 10px;
                color: inherit;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Confirm dialog
async function showConfirmDialog(title, message, confirmText = 'Confirm', cancelText = 'Cancel') {
    return new Promise((resolve) => {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove(); resolve(false)">×</button>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove(); resolve(false)">
                        ${cancelText}
                    </button>
                    <button class="btn btn-danger" onclick="this.closest('.modal-overlay').remove(); resolve(true)">
                        ${confirmText}
                    </button>
                </div>
            </div>
        `;
        
        // Add styles if not already present
        if (!document.querySelector('#modal-styles')) {
            const style = document.createElement('style');
            style.id = 'modal-styles';
            style.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    animation: fadeIn 0.2s ease;
                }
                .modal {
                    background: white;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 500px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    animation: scaleIn 0.3s ease;
                }
                .modal-header {
                    padding: 16px 20px;
                    border-bottom: 1px solid #E2E8F0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-header h3 {
                    margin: 0;
                    color: #1A202C;
                }
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #718096;
                }
                .modal-body {
                    padding: 20px;
                }
                .modal-footer {
                    padding: 16px 20px;
                    border-top: 1px solid #E2E8F0;
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(modal);
    });
}

// Generate QR code (placeholder - you'd use a library like qrcode.js)
function generateQRCode(data, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // For now, create a placeholder
    element.innerHTML = `
        <div style="text-align: center;">
            <div style="width: 200px; height: 200px; background: #f0f0f0; margin: 0 auto 20px; 
                        display: flex; align-items: center; justify-content: center; 
                        border: 2px dashed #ccc;">
                <span style="color: #666;">QR Code Placeholder</span>
            </div>
            <p style="color: #718096; font-size: 14px;">QR would contain: ${data.substring(0, 50)}...</p>
        </div>
    `;
}

// Initialize sidebar active state based on current page
function initSidebarActiveState() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    
    sidebarLinks.forEach(link => {
        const linkPage = link.getAttribute('data-page') || 
                        link.getAttribute('href').replace('.html', '');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Update user info in sidebar and navbar
function updateUserInfo(user) {
    if (!user) return;
    
    // Update sidebar
    const institutionName = document.getElementById('institutionName');
    const userEmail = document.getElementById('userEmail');
    const userDID = document.getElementById('userDID');
    
    if (institutionName) institutionName.textContent = user.institution || 'Institution';
    if (userEmail) userEmail.textContent = user.email;
    if (userDID) userDID.textContent = user.did || 'did:ethr:...';
    
    // Update navbar
    const userNameElements = document.querySelectorAll('.user-name, #userName');
    userNameElements.forEach(el => {
        if (el) el.textContent = user.name || user.email;
    });
}


// Export utilities
window.Utils = {
    loadComponent,
    initUserSession,
    formatDate,
    isValidDID,
    isValidEmail,
    showNotification,
    showConfirmDialog,
    generateQRCode,
    initSidebarActiveState,
    updateUserInfo
};