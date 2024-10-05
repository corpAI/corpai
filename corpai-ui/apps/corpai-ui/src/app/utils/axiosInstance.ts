import axios from 'axios';

let isLoading = false;
const setLoading = (value: boolean) => {
  isLoading = value;
  if (typeof window !== 'undefined' && window.setLoadingSpinner) {
    window.setLoadingSpinner(value);
  }
};

const axiosInstance = axios.create({
  baseURL: 'https://lasu3k8h94.execute-api.us-west-2.amazonaws.com/dev',
});

// Add a request interceptor to show the loading spinner
axiosInstance.interceptors.request.use(
  (config) => {
    setLoading(true);
    return config;
  },
  (error) => {
    setLoading(false);
    return Promise.reject(error);
  }
);

// Add a response interceptor to hide the loading spinner
axiosInstance.interceptors.response.use(
  (response) => {
    setLoading(false);
    return response;
  },
  (error) => {
    setLoading(false);
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('token');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
