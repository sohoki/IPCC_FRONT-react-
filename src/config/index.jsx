const raw = import.meta.env.VITE_REACT_APP_API_URL;
const raw_image = import.meta.env.VITE_REACT_APP_IMG_URL;
const config = {
  REACT_APP_API_URL: raw
    ? (raw.startsWith('http') ? raw : "http://"+raw)
    : 'https://localhost:8443',
  REACT_APP_IMG_URL: raw 
    ? (raw.startsWith('http') ? raw+raw_image : "http://"+raw+raw_image)
    : 'https://localhost:8443/upload',
};

export default config;
