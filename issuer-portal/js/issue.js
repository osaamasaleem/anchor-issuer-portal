// Issue Credential Module
const Issue = {
    async init() {
        // Check authentication
        if (!Auth.requireAuth()) return;
        
        const user = Auth.getCurrentUser();
        Utils.updateUserInfo(user);
        Utils.initSidebarActiveState();
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        const graduationDateInput = document.getElementById('graduationDate');
        if (graduationDateInput) {
            graduationDateInput.value = today;
        }
        
        // Handle degree selection
        const degreeTitleSelect = document.getElementById('degreeTitle');
        if (degreeTitleSelect) {
            degreeTitleSelect.addEventListener('change', this.handleDegreeChange.bind(this));
        }
        
        // Form submission
        const issueForm = document.getElementById('issueForm');
        if (issueForm) {
            issueForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }
    },
    
    handleDegreeChange(e) {
        if (e.target.value === 'other') {
            // Show custom degree input
            const customInput = document.createElement('input');
            customInput.type = 'text';
            customInput.id = 'customDegree';
            customInput.className = 'form-input mt-2';
            customInput.placeholder = 'Enter degree title';
            customInput.required = true;
            
            const container = e.target.parentElement;
            if (!document.getElementById('customDegree')) {
                container.appendChild(customInput);
            }
        } else {
            // Remove custom input if exists
            const customInput = document.getElementById('customDegree');
            if (customInput) {
                customInput.remove();
            }
        }
    },
    
    handleFormSubmit() {
        // Get form values
        const formData = this.getFormData();
        
        // Validate required fields
        if (!this.validateForm(formData)) {
            return;
        }
        
        // Store form data in sessionStorage for preview page
        sessionStorage.setItem('credential_preview_data', JSON.stringify(formData));
        
        // Redirect to preview page
        window.location.href = 'credential-preview.html';
    },
    
    goBack() {
        // Go back to issue page
        window.location.href = 'issue.html';
    },
    
    confirmIssue() {
        // Get form data from sessionStorage
        const previewData = sessionStorage.getItem('credential_preview_data');
        if (!previewData) {
            Utils.showNotification('No credential data to issue', 'error');
            window.location.href = 'issue.html';
            return;
        }
        
        const formData = JSON.parse(previewData);
        
        // Show loading
        const confirmBtn = document.querySelector('button[onclick="Issue.confirmIssue()"]');
        if (confirmBtn) {
            const originalText = confirmBtn.textContent;
            confirmBtn.textContent = 'Signing & Issuing...';
            confirmBtn.disabled = true;
            
            // Process issuance
            this.processIssuance(formData, confirmBtn, originalText);
        } else {
            // If button not found, process directly
            this.processIssuance(formData, null, null);
        }
    },
    
    getFormData() {
        const degreeTitle = document.getElementById('degreeTitle');
        const customDegree = document.getElementById('customDegree');
        
        return {
            studentDID: document.getElementById('studentDID').value,
            studentEmail: document.getElementById('studentEmail').value,
            fullName: document.getElementById('fullName').value,
            studentID: document.getElementById('studentID').value,
            degreeTitle: degreeTitle.value === 'other' 
                        ? (customDegree?.value || '') 
                        : degreeTitle.value,
            major: document.getElementById('major').value,
            gpa: document.getElementById('gpa').value,
            graduationDate: document.getElementById('graduationDate').value,
            honors: document.getElementById('honors').value,
            storeOnChain: document.getElementById('storeOnChain').checked,
            pinToIPFS: document.getElementById('pinToIPFS').checked,
            expirationDate: document.getElementById('expirationDate').value
        };
    },
    
    validateForm(formData) {
        if (!formData.studentDID || !formData.fullName || !formData.degreeTitle || 
            !formData.gpa || !formData.graduationDate) {
            Utils.showNotification('Please fill all required fields', 'error');
            return false;
        }
        
        if (!Utils.isValidDID(formData.studentDID)) {
            Utils.showNotification('Please enter a valid DID format', 'error');
            return false;
        }
        
        return true;
    },
    
    processIssuance(formData, submitBtn, originalText) {
        // Simulate issuance process
        Utils.showNotification('Generating credential JSON...', 'info');
        
        setTimeout(() => {
            Utils.showNotification('Signing with institutional DID...', 'info');
            
            setTimeout(() => {
                Utils.showNotification('Uploading to IPFS...', 'info');
                
                setTimeout(() => {
                    Utils.showNotification('Writing to Polygon blockchain...', 'info');
                    
                    setTimeout(() => {
                        // Generate mock data
                        const mockTxHash = '0x' + Math.random().toString(36).substring(2, 15) + 
                                           Math.random().toString(36).substring(2, 15);
                        const mockIPFSHash = 'Qm' + Math.random().toString(36).substring(2, 15) + 
                                             Math.random().toString(36).substring(2, 15);
                        
                        // Store credential data
                        const credentialData = {
                            studentDID: formData.studentDID,
                            studentEmail: formData.studentEmail,
                            fullName: formData.fullName,
                            studentID: formData.studentID,
                            degreeTitle: formData.degreeTitle,
                            major: formData.major,
                            gpa: formData.gpa,
                            graduationDate: formData.graduationDate,
                            honors: formData.honors,
                            issuedAt: new Date().toISOString(),
                            txHash: mockTxHash,
                            ipfsHash: mockIPFSHash,
                            status: 'Valid',
                            storeOnChain: formData.storeOnChain,
                            pinToIPFS: formData.pinToIPFS,
                            expirationDate: formData.expirationDate
                        };
                        
                        // Store in localStorage (mock database)
                        const existingCredentials = JSON.parse(localStorage.getItem('issued_credentials') || '[]');
                        existingCredentials.push(credentialData);
                        localStorage.setItem('issued_credentials', JSON.stringify(existingCredentials));
                        
                        // Clear preview data from sessionStorage
                        sessionStorage.removeItem('credential_preview_data');
                        
                        // Show success and redirect to preview page
                        Utils.showNotification('Credential issued successfully!', 'success');
                        
                        // Redirect to preview page with data
                        setTimeout(() => {
                            const queryParams = new URLSearchParams({
                                txHash: mockTxHash,
                                ipfsHash: mockIPFSHash,
                                studentName: credentialData.fullName
                            }).toString();
                            
                            window.location.href = `preview.html?${queryParams}`;
                        }, 1000);
                        
                        if (submitBtn) {
                            submitBtn.textContent = originalText;
                            submitBtn.disabled = false;
                        }
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 1000);
    }
};

// Export to window
window.Issue = Issue;

