"use strict";

require("@babel/polyfill");

var _login = require("./login");

var _updateSettings = require("./updateSettings");

// DOM ELEMENTS
var loginForm = document.querySelector('.form--login');
var logoutBtn = document.querySelector('.nav__el--logout');
var userForm = document.querySelector('.form-user-data');
var passwordForm = document.querySelector('.form-user-password');
var savePasswordBtn = document.querySelector('.btn--save-password'); // VALUES
// DELEGATION

if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    (0, _login.login)(email, password);
  });
}

if (userForm) {
  userForm.addEventListener('submit', function (e) {
    e.preventDefault();
    console.log('Updating user data...');
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    (0, _updateSettings.updateSettings)({
      name: name,
      email: email
    }, 'data');
  });
}

if (passwordForm) {
  passwordForm.addEventListener('submit', function _callee(e) {
    var currentPassword, newPassword, confirmNewPassword;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            e.preventDefault();
            savePasswordBtn.textContent = 'Updating...';
            console.log('Updating user data...');
            currentPassword = document.getElementById('password-current').value;
            newPassword = document.getElementById('password').value;
            confirmNewPassword = document.getElementById('password-confirm').value;
            _context.next = 8;
            return regeneratorRuntime.awrap((0, _updateSettings.updateSettings)({
              currentPassword: currentPassword,
              newPassword: newPassword,
              confirmNewPassword: confirmNewPassword
            }, 'password'));

          case 8:
            savePasswordBtn.textContent = 'Save password';
            document.getElementById('password-current').value = '';
            document.getElementById('password').value = '';
            document.getElementById('password-confirm').value = '';

          case 12:
          case "end":
            return _context.stop();
        }
      }
    });
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', _login.logout);
}