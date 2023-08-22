import { showAlert } from './alerts.js';

export const createUser = async (data) => {
  try {
    const url = '/api/v1/users/signup';

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
      showAlert('success', `User Successfully Created!`);

      window.setTimeout(() => {
        location.assign('/myaccount');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};


export const deleteUser = async (data) => {
    try {
      const url = `/api/v1/users/${data}`;
  
      const res = await axios({
        method: 'DELETE',
        url,
        data: null
      });
  
      if (res.data.status === 'success') {
        showAlert('success', `User Successfully Deleted!`);
        location.reload();
  
      }
    } catch (err) {
      showAlert('error', err.response.data.message);
    }
  };

  export const updateUser = async (data) => {
    try {
    const dataString = JSON.stringify(data);

      const url = `/api/v1/users/${data}`;
  
      const res = await axios({
        method: 'PATCH',
        url,
        data: dataString
      });
  
      if (res.data.status === 'success') {
        showAlert('success', `User Successfully Updated!`);
  
      }
    } catch (err) {
      showAlert('error', err.response.data.message);
    }
  };
