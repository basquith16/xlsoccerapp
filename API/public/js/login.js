import { showAlert } from './alerts.js';

export const login = async (email, password) => {
  try {
    const res = await axios({
        method: 'POST',
        url: '/api/v1/users/login',
        data: {
            email,
            password
        },
        withCredentials: true,
        credentials: 'include'
    });

    if (res.data.status === 'success') {
      document.querySelector('.login-form').classList.add('hidden');
      showAlert('success', 'Logged in successfully!');

      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', 'Either your Username or Password is incorrect. Please check and try again');
  }
}

export const logout = async () => {
    try {
      const res = await axios({
        method: 'GET',
        url: '/api/v1/users/logout'
      });
      if ((res.data.status = 'success')) location.reload(true);
    } catch (err) {
      console.log(err.response);
      showAlert('error', 'Error logging out! Try again.');
    }
  };