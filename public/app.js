document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const submitButton = document.getElementById('submit-btn');
  const statusMessage = document.getElementById('status-message');

  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(input, errorNode, message) {
    input.classList.add('is-invalid');
    errorNode.textContent = message;
  }

  function clearError(input, errorNode) {
    input.classList.remove('is-invalid');
    errorNode.textContent = '';
  }

  function clearStatus() {
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';
  }

  function validateForm() {
    let isValid = true;
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    clearError(nameInput, nameError);
    clearError(emailInput, emailError);
    clearError(messageInput, messageError);

    if (!name) {
      setError(nameInput, nameError, 'Name is required.');
      isValid = false;
    }

    if (!email) {
      setError(emailInput, emailError, 'Email is required.');
      isValid = false;
    } else if (!emailPattern.test(email)) {
      setError(emailInput, emailError, 'Please enter a valid email address.');
      isValid = false;
    }

    if (!message) {
      setError(messageInput, messageError, 'Message is required.');
      isValid = false;
    }

    return isValid;
  }

  [nameInput, emailInput, messageInput].forEach((input) => {
    input.addEventListener('input', () => {
      clearStatus();

      if (input === nameInput && input.value.trim()) {
        clearError(nameInput, nameError);
      }

      if (input === emailInput && emailPattern.test(input.value.trim())) {
        clearError(emailInput, emailError);
      }

      if (input === messageInput && input.value.trim()) {
        clearError(messageInput, messageError);
      }
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearStatus();

    if (!validateForm()) {
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          message: messageInput.value.trim()
        })
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        if (payload.field === 'name') {
          setError(nameInput, nameError, payload.message);
          nameInput.focus();
        } else if (payload.field === 'email') {
          setError(emailInput, emailError, payload.message);
          emailInput.focus();
        } else if (payload.field === 'message') {
          setError(messageInput, messageError, payload.message);
          messageInput.focus();
        } else {
          statusMessage.textContent = payload.message || 'Submission failed.';
          statusMessage.classList.add('error');
        }
        return;
      }

      form.reset();
      statusMessage.textContent = payload.message;
      statusMessage.classList.add('success');
    } catch (error) {
      statusMessage.textContent = 'Could not connect to the server. Please try again.';
      statusMessage.classList.add('error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit';
    }
  });
});
