const express = require('express');
const path = require('path');
const config = require('config');
const _ = require('lodash');
const { expressCspHeader, INLINE, NONE, SELF } = require('express-csp-header');

const app = express();
const PORT = process.env.PORT || 3000;

// Content Security Policy setup
const cspConfig = config.csp;
const cspOptions = _.cloneDeep(cspConfig);
if (cspConfig) {
  if (cspConfig.directives) {
    if (typeof cspConfig.directives === 'string') {
      cspConfig.directives = JSON.parse(cspConfig.directives);
      cspOptions.directives = {};
    }
    Object.keys(cspConfig.directives).forEach(function (key, index) {
      cspConfig.directives[key].forEach(function (value, k) {
        if (k === 0) {
          cspOptions.directives[key] = [];
        }
        if (value === 'none') {
          cspOptions.directives[key].push(NONE);
        } else if (value === 'self') {
          cspOptions.directives[key].push(SELF);
        } else if (value === 'inline') {
          cspOptions.directives[key].push(INLINE);
        } else {
          cspOptions.directives[key].push(value);
        }
      });
    });
  }

  app.use(expressCspHeader(cspOptions));
}

// Browser Detect (block older IE versions)
const browserDetect = (req, res, next) => {
  const ua = req.headers['user-agent'] || '';

  const msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return version number
    res.set('Permissions-Policy', 'interest-cohort=()'); // Opt-out of Google FLoC
    return res.status(400).send('Your browser is not supported. Please upgrade to a modern browser.');
  }

  const trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return version number
    res.set('Permissions-Policy', 'interest-cohort=()'); // Opt-out of Google FLoC
    return res.status(400).send('Your browser is not supported. Please upgrade to a modern browser.');
  }
  next();
};

app.use(browserDetect);

// Serve static files from the Angular build directory
const DIST_FOLDER = path.join(__dirname, 'dist', 'citizenos-fe-next', 'browser');
app.use(express.static(DIST_FOLDER));

// Route all other requests to index.html for Angular routing
app.get('/{*path}', browserDetect, (req, res) => {
  res.set('Permissions-Policy', 'interest-cohort=()'); // Opt-out of Google FLoC
  res.sendFile(path.join(DIST_FOLDER, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Node Express server listening on port ${PORT}`);
});
