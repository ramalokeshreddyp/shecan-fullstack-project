document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // DOM ELEMENTS
  // ==========================================================================
  
  // Theme Toggle Elements
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  
  // Mobile Nav Elements
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const navNavigation = document.getElementById('nav-navigation');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Form Elements
  const contactForm = document.getElementById('contact-form');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const submitBtn = document.getElementById('submit-btn');
  const formSpinner = document.getElementById('form-spinner');
  
  // Validation Message Elements
  const nameValidation = document.getElementById('name-validation');
  const emailValidation = document.getElementById('email-validation');
  const messageValidation = document.getElementById('message-validation');
  
  // Modal Elements
  const successModal = document.getElementById('success-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  
  // Admin Portal Elements
  const adminLoginForm = document.getElementById('admin-login-form');
  const adminPasscode = document.getElementById('admin-passcode');
  const adminLoginValidation = document.getElementById('admin-login-validation');
  
  const adminLoginView = document.getElementById('admin-login-view');
  const adminDashboardView = document.getElementById('admin-dashboard-view');
  const submissionsCount = document.getElementById('submissions-count');
  const submissionsTableBody = document.getElementById('submissions-table-body');
  
  const adminLogoutBtn = document.getElementById('admin-logout-btn');
  const exportCsvBtn = document.getElementById('export-csv-btn');

  // State Variables
  let loadedSubmissions = [];

  // ==========================================================================
  // MOBILE NAVIGATION MENU
  // ==========================================================================
  
  mobileMenuToggle.addEventListener('click', () => {
    mobileMenuToggle.classList.toggle('open');
    navNavigation.classList.toggle('open');
  });

  // Close mobile menu on clicking any navigation link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuToggle.classList.remove('open');
      navNavigation.classList.remove('open');
      
      // Update active state
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // ==========================================================================
  // THEME SWITCHER (LIGHT / DARK MODE)
  // ==========================================================================
  
  // Apply theme based on local storage or system preference
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    } else if (savedTheme === 'light') {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
      }
    }
  };

  themeToggleBtn.addEventListener('click', () => {
    if (document.body.classList.contains('light-theme')) {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    }
  });

  initTheme();

  // ==========================================================================
  // CONTACT FORM VALIDATION & SUBMISSION
  // ==========================================================================
  
  // Utility for email pattern matching
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Display validation helper
  const setFieldError = (inputElement, messageElement, errorText) => {
    inputElement.classList.add('error-border');
    messageElement.textContent = errorText;
    messageElement.classList.add('error');
  };

  // Clear validation helper
  const clearFieldError = (inputElement, messageElement) => {
    inputElement.classList.remove('error-border');
    messageElement.textContent = '';
    messageElement.classList.remove('error');
  };

  // Input listeners to clear validation errors in real-time
  nameInput.addEventListener('input', () => {
    if (nameInput.value.trim() !== '') {
      clearFieldError(nameInput, nameValidation);
    }
  });

  emailInput.addEventListener('input', () => {
    const emailVal = emailInput.value.trim();
    if (emailVal !== '' && isValidEmail(emailVal)) {
      clearFieldError(emailInput, emailValidation);
    }
  });

  messageInput.addEventListener('input', () => {
    if (messageInput.value.trim() !== '') {
      clearFieldError(messageInput, messageValidation);
    }
  });

  // Handle contact form submit
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    let isFormValid = true;
    const nameValue = nameInput.value.trim();
    const emailValue = emailInput.value.trim();
    const messageValue = messageInput.value.trim();

    // Reset validation states
    clearFieldError(nameInput, nameValidation);
    clearFieldError(emailInput, emailValidation);
    clearFieldError(messageInput, messageValidation);

    // Validate Name
    if (nameValue === '') {
      setFieldError(nameInput, nameValidation, 'Please write your name.');
      isFormValid = false;
    }

    // Validate Email
    if (emailValue === '') {
      setFieldError(emailInput, emailValidation, 'Please write your email address.');
      isFormValid = false;
    } else if (!isValidEmail(emailValue)) {
      setFieldError(emailInput, emailValidation, 'Please enter a valid email address.');
      isFormValid = false;
    }

    // Validate Message
    if (messageValue === '') {
      setFieldError(messageInput, messageValidation, 'Please write a message.');
      isFormValid = false;
    }

    // Stop execution if form validation fails
    if (!isFormValid) {
      // Focus on the first element containing an error
      const firstError = document.querySelector('.error-border');
      if (firstError) firstError.focus();
      return;
    }

    // Form is valid - Submit data
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: nameValue,
          email: emailValue,
          message: messageValue
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Success
        contactForm.reset();
        showModal();
        
        // Refresh admin portal if logged in
        const savedPasscode = sessionStorage.getItem('admin_passcode');
        if (savedPasscode) {
          fetchSubmissions(savedPasscode);
        }
      } else {
        // Validation/Server errors returned from API
        if (data.field === 'name') {
          setFieldError(nameInput, nameValidation, data.message);
        } else if (data.field === 'email') {
          setFieldError(emailInput, emailValidation, data.message);
        } else if (data.field === 'message') {
          setFieldError(messageInput, messageValidation, data.message);
        } else {
          alert(data.message || 'An error occurred during submission. Please try again.');
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Could not connect to the server. Please verify the backend is running.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  });

  // Modal Control Functions
  const showModal = () => {
    successModal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Stop scroll
  };

  const hideModal = () => {
    successModal.classList.remove('show');
    document.body.style.overflow = 'auto'; // Enable scroll
  };

  closeModalBtn.addEventListener('click', hideModal);
  
  // Close modal when clicking outside card
  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
      hideModal();
    }
  });

  // ==========================================================================
  // ADMIN PANEL MANAGEMENT
  // ==========================================================================
  
  // Helper to format ISO date to human readable form
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render submissions table helper
  const renderSubmissions = (submissions) => {
    submissionsTableBody.innerHTML = '';
    
    if (submissions.length === 0) {
      submissionsTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted" style="padding: 40px;">No submissions found.</td>
        </tr>
      `;
      return;
    }

    submissions.forEach(sub => {
      const tr = document.createElement('tr');
      tr.id = `sub-row-${sub.id}`;
      tr.innerHTML = `
        <td><div class="sub-date">${formatDate(sub.timestamp)}</div></td>
        <td><div class="sub-name">${escapeHTML(sub.name)}</div></td>
        <td><a href="mailto:${escapeHTML(sub.email)}" class="sub-email">${escapeHTML(sub.email)}</a></td>
        <td><div class="sub-message">${escapeHTML(sub.message)}</div></td>
        <td>
          <button class="btn btn-danger btn-sm delete-sub-btn" data-id="${sub.id}">
            Delete
          </button>
        </td>
      `;
      submissionsTableBody.appendChild(tr);
    });

    // Attach listeners to delete buttons
    const deleteButtons = document.querySelectorAll('.delete-sub-btn');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteSubmission(id);
      });
    });
  };

  // Escape HTML strings to protect against XSS
  const escapeHTML = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Load submissions from the API
  const fetchSubmissions = async (passcode) => {
    try {
      const response = await fetch('/api/submissions', {
        // Fallback endpoint if redirected by SPA logic
        headers: {
          'x-admin-passcode': passcode
        }
      });

      // Quick correction: API server defines /api/admin/submissions
      const apiResponse = await fetch('/api/admin/submissions', {
        headers: {
          'x-admin-passcode': passcode
        }
      });
      
      const data = await apiResponse.json();

      if (apiResponse.ok && data.success) {
        loadedSubmissions = data.submissions;
        submissionsCount.textContent = loadedSubmissions.length;
        renderSubmissions(loadedSubmissions);
      } else {
        // Authentication failed or passcode invalid
        sessionStorage.removeItem('admin_passcode');
        showLoginView();
        adminLoginValidation.textContent = data.message || 'Verification failed. Please re-enter credentials.';
        adminLoginValidation.classList.add('error');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      alert('Could not sync with the database. Please verify the connection.');
    }
  };

  // Delete submission via API
  const deleteSubmission = async (id) => {
    const passcode = sessionStorage.getItem('admin_passcode');
    if (!passcode) return;

    if (!confirm('Are you sure you want to permanently delete this submission record?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-passcode': passcode
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Success: reload
        fetchSubmissions(passcode);
      } else {
        alert(data.message || 'Error occurred while trying to delete submission.');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Server error occurred during deletion request.');
    }
  };

  // View UI transition helpers
  const showDashboardView = () => {
    adminLoginView.classList.add('hide');
    adminDashboardView.classList.remove('hide');
  };

  const showLoginView = () => {
    adminDashboardView.classList.add('hide');
    adminLoginView.classList.remove('hide');
    adminPasscode.value = '';
  };

  // Handle Admin Login submission
  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const passcodeVal = adminPasscode.value.trim();
    
    adminLoginValidation.textContent = '';
    adminLoginValidation.classList.remove('error');

    if (passcodeVal === '') {
      adminLoginValidation.textContent = 'Passcode is required.';
      adminLoginValidation.classList.add('error');
      adminPasscode.focus();
      return;
    }

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ passcode: passcodeVal })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Authenticated
        sessionStorage.setItem('admin_passcode', passcodeVal);
        showDashboardView();
        fetchSubmissions(passcodeVal);
      } else {
        // Wrong Passcode
        adminLoginValidation.textContent = data.message || 'Invalid passcode.';
        adminLoginValidation.classList.add('error');
        adminPasscode.focus();
      }
    } catch (error) {
      console.error('Login error:', error);
      adminLoginValidation.textContent = 'Server is unreachable. Please verify the server is active.';
      adminLoginValidation.classList.add('error');
    }
  });

  // Handle logout
  adminLogoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('admin_passcode');
    showLoginView();
  });

  // Export submissions to CSV file
  exportCsvBtn.addEventListener('click', () => {
    if (loadedSubmissions.length === 0) {
      alert('There are no submission records to export.');
      return;
    }

    // Setup headers
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'ID,Date Received,Full Name,Email Address,Message\n';

    // Parse each submission into a row
    loadedSubmissions.forEach(sub => {
      const row = [
        `"${sub.id}"`,
        `"${formatDate(sub.timestamp)}"`,
        `"${sub.name.replace(/"/g, '""')}"`,
        `"${sub.email.replace(/"/g, '""')}"`,
        `"${sub.message.replace(/"/g, '""')}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    // Create a temporary hidden download element
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SheCanFoundation_Submissions_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
  });

  // Check persistent admin session on initialization
  const checkAdminSession = () => {
    const savedPasscode = sessionStorage.getItem('admin_passcode');
    if (savedPasscode) {
      showDashboardView();
      fetchSubmissions(savedPasscode);
    }
  };

  checkAdminSession();
});
