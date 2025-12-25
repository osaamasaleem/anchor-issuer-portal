// Dashboard Module
const Dashboard = {
    // Mock data
    mockStats: [
        { title: 'Total Issued', value: '1,250', change: '+12%', positive: true },
        { title: 'Pending Acceptance', value: '45', change: '-3%', positive: false },
        { title: 'Revoked', value: '3', change: '0%', positive: null },
        { title: 'Active Students', value: '1,202', change: '+8%', positive: true }
    ],
    
    mockActivities: [
        { student: 'Usama Saleem', degree: 'BS Computer Science', date: '2024-01-15', status: 'Valid', txHash: '0xabc123' },
        { student: 'Ali Raza', degree: 'BBA', date: '2024-01-14', status: 'Valid', txHash: '0xdef456' },
        { student: 'Sara Khan', degree: 'BS Software Engineering', date: '2024-01-13', status: 'Pending', txHash: '0xghi789' },
        { student: 'Ahmed Malik', degree: 'MS Computer Science', date: '2024-01-12', status: 'Valid', txHash: '0xjkl012' },
        { student: 'Fatima Noor', degree: 'BS Computer Science', date: '2024-01-11', status: 'Revoked', txHash: '0xmno345' }
    ],
    
    // Initialize dashboard
    async init() {
        // Check authentication
        if (!Auth.requireAuth()) return;
        
        const user = Auth.getCurrentUser();
        Utils.updateUserInfo(user);
        Utils.initSidebarActiveState();
        
        this.loadStats();
        this.loadRecentActivities();
    },
    
    // Load statistics
    loadStats() {
        const statsGrid = document.getElementById('statsGrid');
        if (!statsGrid) return;
        
        let html = '';
        this.mockStats.forEach(stat => {
            const changeClass = stat.positive === true ? 'positive' : 
                              stat.positive === false ? 'negative' : '';
            const changeIcon = stat.positive === true ? '↑' : 
                              stat.positive === false ? '↓' : '';
            
            html += `
                <div class="stats-card">
                    <div class="stats-card__title">${stat.title}</div>
                    <div class="stats-card__value">${stat.value}</div>
                    <div class="stats-card__change ${changeClass}">
                        ${changeIcon} ${stat.change}
                        <span style="font-size: 12px; color: #718096;">from last month</span>
                    </div>
                </div>
            `;
        });
        
        statsGrid.innerHTML = html;
    },
    
    // Load recent activities
    loadRecentActivities() {
        const tbody = document.querySelector('#recentActivity tbody');
        if (!tbody) return;
        
        let html = '';
        this.mockActivities.forEach(activity => {
            const statusClass = activity.status === 'Valid' ? 'badge-success' :
                              activity.status === 'Pending' ? 'badge-warning' :
                              'badge-danger';
            
            const formattedDate = Utils.formatDate(activity.date);
            
            html += `
                <tr>
                    <td>${activity.student}</td>
                    <td>${activity.degree}</td>
                    <td>${formattedDate}</td>
                    <td><span class="badge ${statusClass}">${activity.status}</span></td>
                    <td>
                        <a href="https://polygonscan.com/tx/${activity.txHash}" 
                           target="_blank" style="font-family: monospace; font-size: 12px;">
                            ${activity.txHash.substring(0, 10)}...
                        </a>
                    </td>
                    <td>
                        <a href="credential.html?id=${activity.txHash}" 
                           class="btn btn-sm btn-outline">
                            View
                        </a>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
    },
    
    // Refresh data
    refreshData() {
        Utils.showNotification('Refreshing data...', 'info');
        setTimeout(() => {
            this.loadStats();
            this.loadRecentActivities();
            Utils.showNotification('Data refreshed successfully', 'success');
        }, 500);
    },
    
    // Export data
    exportData() {
        Utils.showNotification('Preparing export file...', 'info');
        setTimeout(() => {
            const dataStr = JSON.stringify(this.mockActivities, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = 'issuer-export-' + new Date().toISOString().split('T')[0] + '.json';
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            Utils.showNotification('Export downloaded successfully', 'success');
        }, 1000);
    }
};

// Export to window
window.Dashboard = Dashboard;

