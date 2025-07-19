async function registerUser(event) {
    event.preventDefault(); // Prevent the default form submission (page reload)

    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageElement = document.getElementById('message');

    const username = usernameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!username || !email || !password) {
        messageElement.textContent = 'Please fill in all fields.';
        messageElement.classList.remove('success');
        messageElement.style.color = 'red';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            messageElement.textContent = data.message + ' Redirecting to login...';
            messageElement.classList.add('success');
            messageElement.style.color = 'green';
            localStorage.setItem('token', data.token); // Store token
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            messageElement.textContent = data.message || 'Registration failed. Please try again.';
            messageElement.classList.remove('success');
            messageElement.style.color = 'red';
            console.error('Registration error:', data.message);
        }
    } catch (error) {
        console.error('Network error during registration:', error);
        messageElement.textContent = 'Network error. Please check your connection or try again later.';
        messageElement.classList.remove('success');
        messageElement.style.color = 'red';
    }
}


async function loginUser(event) {
    event.preventDefault(); 

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageElement = document.getElementById('message');

    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
        messageElement.textContent = 'Please enter your email and password.';
        messageElement.classList.remove('success');
        messageElement.style.color = 'red';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) { 
            messageElement.textContent = data.message + ' Redirecting...';
            messageElement.classList.add('success');
            messageElement.style.color = 'green';

            localStorage.setItem('token', data.token);

          
            setTimeout(() => {
                window.location.href = 'index.html'; 
            }, 1500); // Redirect after 1.5 seconds
        } else { // Login failed
            messageElement.textContent = data.message || 'Login failed. Invalid credentials.';
            messageElement.classList.remove('success');
            messageElement.style.color = 'red';
            console.error('Login error:', data.message);
        }
    } catch (error) {
        console.error('Network error during login:', error);
        messageElement.textContent = 'Network error. Please check your connection or try again later.';
        messageElement.classList.remove('success');
        messageElement.style.color = 'red';
    }
}


// --- Event Listeners ---
// Attach the event listener to the registration form
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', registerUser);
}

// Attach the event listener to the login form (NEW CODE HERE)
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', loginUser);
}