import { showAlert } from './alerts.js';

export const createPlayer = async (data) => {
    try {
      const url = '/api/v1/players';
  
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
        showAlert('success', `Player Successfully Created!`);
      }
    } catch (err) {
      showAlert('error', err.response.data.message);
    }
  };