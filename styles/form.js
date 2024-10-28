const form = document.getElementById('contactForm');
const submitButton = form.querySelector('button[type="submit"]');
const loadingSpan = submitButton.querySelector('.loading');
const submitText = submitButton.querySelector('p');
const successMessage = document.getElementById('successMessage');

// Validation functions
const validators = {
    name: (value) => {
        const regex = /^[a-zA-Z ]{2,50}$/;
        return regex.test(value) ? '' : 'Please enter a valid name (2-50 characters, letters only)';
    },
    email: (value) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(value) ? '' : 'Please enter a valid email address';
    },
    subject: (value) => {
        return value.length >= 2 && value.length <= 100 ? 
            '' : 'Subject must be between 2 and 100 characters';
    },
    message: (value) => {
        return value.length >= 10 && value.length <= 1000 ? 
            '' : 'Message must be between 10 and 1000 characters';
    }
};

// Real-time validation
form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => {
        if (validators[field.id]) {
            const errorMsg = validators[field.id](field.value);
            const errorDiv = field.nextElementSibling;
            errorDiv.textContent = errorMsg;
            field.classList.toggle('invalid', errorMsg !== '');
        }
    });
});

// Form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Hide success message if it's visible from a previous submission
    successMessage.style.display = 'none';
    
    // Check if botcheck is checked (spam protection)
    if (document.getElementById('botcheck').checked) {
        return;
    }

    // Validate all fields
    let isValid = true;
    for (const [fieldId, validator] of Object.entries(validators)) {
        const field = document.getElementById(fieldId);
        const errorMsg = validator(field.value);
        const errorDiv = field.nextElementSibling;
        errorDiv.textContent = errorMsg;
        field.classList.toggle('invalid', errorMsg !== '');
        if (errorMsg) isValid = false;
    }

    if (!isValid) return;

    // Update button state
    submitButton.disabled = true;
    loadingSpan.style.display = 'inline';
    submitText.style.display = 'none';

    try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            // Show success message
            successMessage.style.display = 'block';
            // Reset form
            form.reset();
            // Scroll success message into view
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            throw new Error(data.message || 'Form submission failed');
        }
    } catch (error) {
        alert('Error submitting form: ' + error.message);
    } finally {
        // Reset button state
        submitButton.disabled = false;
        loadingSpan.style.display = 'none';
        submitText.style.display = 'block';
    }
});