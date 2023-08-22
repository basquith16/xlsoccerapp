/* eslint-disable */
// import axios from 'axios';
import { showAlert } from './alerts.js';

// type is either 'password' or 'data'
export const createSession = async (data) => {
  try {
    const url = '/api/v1/sessions';

    // Convert Form response to JSON object
    let formDataObject = Object.fromEntries(data.entries());
    let string = JSON.stringify(formDataObject);
    let obj = JSON.parse(string);

    const res = await axios({
      method: 'POST',
      url,
      data: obj
    });

    if (res.data.status === 'success') {
      showAlert('success', `Session Successfully Created!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};


export const deleteSession = async (data) => {
  try {
    const url = `/api/v1/sessions/${data}`;


    const res = await axios({
      method: 'DELETE',
      url,
      data: null
    });

    if (res.data.status === 'success') {
      showAlert('success', `Session Successfully Deleted!`);
      location.reload();

    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};


export const updateSession = async (data) => {
  try {
    const url = `/api/v1/sessions/${data}`;


    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', `Session Successfully Updated!`);
      console.log(data);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const getSession = async (data) => {
  try {
    const url = `/api/v1/sessions/${data}`;


    const res = await axios({
      method: 'GET',
      url,
      data: data
    });

    if (res.data.status === 'success') {
      showAlert('success', `Session Successfully Loaded!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};