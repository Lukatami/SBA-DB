export default function logger(req, res, next) {
  // Special checking for browser requests to prevent appearing in console:
  // "GET /.well-known/appspecific/com.chrome.devtools.json"
  if (/^\/\.well-known/.test(req.originalUrl)) {
    return next();
  }

  const time = new Date().toLocaleString();

  // Main logger
  console.log(`[${time}] ${req.method} ${req.originalUrl}`);
  next();
}
