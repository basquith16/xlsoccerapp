/* eslint-disable */
// import axios from 'axios';
import { showAlert } from './alerts.js';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMyAccount';

    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', `Settings updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const adminUpdateSettings = async (data) => {
  try {

    const userId = '64b98465173d0605a5811ec3';

    const url = `/api/v1/users/${userId}`;

    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', `Settings updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err);
  }
};