/* eslint-disable */
// import 'core-js/stable';
// import { displayMap } from './mapbox.js';
import { login, logout } from './login.js';
import { updateSettings, adminUpdateSettings } from './updateSettings.js';
import { createSession, deleteSession } from './handleSessions.js';
import { createUser, deleteUser, updateUser } from './handleUsers.js';
import { bookSession } from './stripe.js';
import { getInvoices } from './stripe.js';

// DOM ELEMENTS
// const mapBox = document.getElementById('map');
const purchBtn = document.getElementById('buy-session');
// const homepageSliderControls = document.querySelector('.sNavBtn');

// User Login/Register
const registrationForm = document.querySelector('.registration-form');
const loginForm = document.querySelector('.login-form');
const logOutBtn = document.querySelector('.nav__el--logout');

// Account User Data
const userDataForm = document.querySelector('.form-user-data');
const adminUserDataForm = document.querySelector('.admin-form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const successMsg = document.querySelector('.photo-upload-success');
const photoUploads = document.getElementById('photo');
const deleteSessionBtns = document.querySelectorAll('.delete_session-btn');
const deleteUserBtns = document.querySelectorAll('.delete_user-btn');
const editUserBtns = document.querySelectorAll('.edit_user-btn');


// Account Admin Data
const billingContainer = document.getElementById('invoice_history');
const sessionDataForm = document.querySelector('.form-session-data');
const sessionImgSuccessMsg = document.querySelector('.sessionImage-upload-success');
const sessionImgsSuccessMsg = document.querySelector('.sessionImages-upload-success');
const sessionImageUploads = document.getElementById('session-image');
const sessionImagesUploads = document.getElementById('session-images');

// DELEGATION
// if (mapBox) {
//   const locations = JSON.parse(mapBox.dataset.locations);
//   displayMap(locations);
// }


let handleDeleteSession = (e) => {
    deleteSession(e.target.id);
}
let handleDeleteUser = (e) => {
    deleteUser(e.target.id);
}
let handleEditUser = (e) => {
    updateUser(e.target.id);
}

document.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM fully loaded and parsed");

    // if(updateRoster) {
    //   const { sessionId } = '64cbe1a858623b7346bb31b0';
    //   getSession(sessionId);
    // }

    if(billingContainer) {
        getInvoices();
    }

    if(deleteSessionBtns) {
        deleteSessionBtns.forEach((btn) => {
            btn.addEventListener('click', handleDeleteSession)
        });
    }

    if(deleteUserBtns) {
        deleteUserBtns.forEach((btn) => {
            btn.addEventListener('click', handleDeleteUser)
        });

        editUserBtns.forEach((btn) => {
            btn.addEventListener('click', handleEditUser)
        });
    }

    if(purchBtn) {
        purchBtn.addEventListener('click', e=> {
            e.target.textContent = 'Processing ...';
            const { sessionId } = e.target.dataset;
            bookSession(sessionId);
        } )
    }

    if(sessionDataForm) {
        sessionImageUploads.addEventListener('change', async (e) => {
            document.querySelector('.sessionImage-upload-label').classList.add('hidden');
            sessionImgSuccessMsg.classList.remove('hidden');
        });
        sessionImagesUploads.addEventListener('change', async (e) => {
            document.querySelector('.sessionImages-upload-label').classList.add('hidden');
            sessionImgsSuccessMsg.classList.remove('hidden');
        });

        sessionDataForm.addEventListener('submit', e => {
            e.preventDefault();
            const sessionForm = new FormData();

            // Format Session Profile Images
            const profImgs = (document.getElementById('session-images').files);
            let profileImages = [];
            let i = 0;
            while (i < profImgs.length) {
                profileImages.push((profImgs[i]).name);
                i++
            }
              
            sessionForm.append('name', document.getElementById('sessionName').value);
            sessionForm.append('price', document.getElementById('sessionPrice').value);
            sessionForm.append('image', (document.getElementById('session-image').files[0]).name);
            sessionForm.append('profileImages', profileImages);
            sessionForm.append('startDates', document.getElementById('starts').value);
            sessionForm.append('endDate', document.getElementById('ends').value);
            sessionForm.append('birthYear', document.getElementById('birthYear').value);
            sessionForm.append('timeStart', document.getElementById('startTime').value);
            sessionForm.append('timeEnd', document.getElementById('endTime').value);
            sessionForm.append('trainers', document.getElementById('coaches').value);
            sessionForm.append('rosterLimit', document.getElementById('max').value);
            sessionForm.append('demo', document.getElementById('demo').value);
            sessionForm.append('sport', document.getElementById('sport').value);
            sessionForm.append('description', document.getElementById('desc').value);
            sessionForm.append('duration', document.getElementById('duration').value);

            createSession(sessionForm);
        });
    }

    if (photoUploads) {
        photoUploads.addEventListener('change', async (e) => {
            document.querySelector('.photo-upload-label').classList.add('hidden');
            successMsg.classList.remove('hidden');
        });
    }

    if(registrationForm) {
        registrationForm.addEventListener('submit', e => {
            e.preventDefault();
            const regForm = new FormData();
            regForm.append('name', document.getElementById('name').value);
            regForm.append('email', document.getElementById('email').value);
            regForm.append('password', document.getElementById('password').value);
            regForm.append('passwordConfirm', document.getElementById('passwordConfirm').value);
        
            createUser(regForm);
        });
    }

    if(loginForm) {
        loginForm.addEventListener('submit', e => {
            e.preventDefault();
                
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
        
            login(email, password);
        });
    }

    if(logOutBtn) {
        logOutBtn.addEventListener('click', logout);
    }

    if (userDataForm) userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        const photoUploads = document.getElementById('photo').files;

        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);

        if (photoUploads.length > 0) {
            form.append('photo', document.getElementById('photo').files[0]);
        }
        updateSettings( form, 'data');
    });

    if (adminUserDataForm) adminUserDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        const photoUploads = document.getElementById('photo').files;

        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);

        if (photoUploads.length > 0) {
            form.append('photo', document.getElementById('photo').files[0]);
        }
        adminUpdateSettings(form);
    });


    if (userPasswordForm) userPasswordForm.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updating...';

        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');

        document.querySelector('.btn--save-password').textContent = 'Save password';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
  });

});
