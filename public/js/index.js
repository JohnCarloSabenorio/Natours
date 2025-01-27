import '@babel/polyfill';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
// DOM ELEMENTS
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userForm = document.querySelector('.form-user-data');
const passwordForm = document.querySelector('.form-user-password');
const savePasswordBtn = document.querySelector('.btn--save-password');
// VALUES

// DELEGATION
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
if (userForm) {
  userForm.addEventListener('submit', e => {
    e.preventDefault();
    console.log('Updating user data...');
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateSettings({ name, email }, 'data');
  });
}
if (passwordForm) {
  passwordForm.addEventListener('submit', async e => {
    e.preventDefault();
    savePasswordBtn.textContent = 'Updating...';
    console.log('Updating user data...');
    const currentPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const confirmNewPassword = document.getElementById('password-confirm')
      .value;

    await updateSettings(
      { currentPassword, newPassword, confirmNewPassword },
      'password'
    );
    savePasswordBtn.textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}
