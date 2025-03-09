function replace(url: string) {
  if (url[0] !== '/') {
    url = '/' + url;
  }
  window.location.replace(`/${import.meta.env.VITE_APP_NAME}${url}`);
}

export default { replace };
