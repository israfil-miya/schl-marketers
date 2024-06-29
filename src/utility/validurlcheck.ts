const isValidHttpUrls = (string: string): boolean => {
  const urls = string.split(' ');
  for (const urlString of urls) {
    let url: URL;
    try {
      url = new URL(urlString);
    } catch (_) {
      return false;
    }
    if (!(url.protocol === 'http:' || url.protocol === 'https:')) {
      return false;
    }
  }
  return true;
};

export default isValidHttpUrls;
