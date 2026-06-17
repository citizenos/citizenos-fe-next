'use strict';

const express = require('express');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');
const config = require('config');
const _ = require('lodash');
const { expressCspHeader, INLINE, NONE, SELF } = require('express-csp-header');

// ── Regenerate frontend config.json at startup (like the old prebuildDist.js) ──
// This ensures Heroku dyno restarts always use the latest env vars.
(function generateFrontendConfig() {
  const CONFIG_DIR = path.join(__dirname, 'src', 'assets', 'config');
  const DIST_CONFIG = path.join(__dirname, 'dist', 'citizenos-fe-next', 'browser', 'assets', 'config', 'config.json');

  function loadJson(p) {
    try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return {}; }
  }
  function deepMerge(target, source) {
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        target[key] = deepMerge(target[key] || {}, source[key]);
      } else { target[key] = source[key]; }
    }
    return target;
  }
  function applyEnvVars(cfg, mappings) {
    for (const [key, value] of Object.entries(mappings)) {
      if (typeof value === 'string') {
        if (process.env[value] !== undefined) cfg[key] = process.env[value];
      } else if (value && typeof value === 'object') {
        if (value.__name) {
          if (process.env[value.__name] !== undefined) {
            const raw = process.env[value.__name];
            try { cfg[key] = value.__format === 'json' ? JSON.parse(raw) : raw; } catch { cfg[key] = raw; }
          }
        } else {
          if (!cfg[key] || typeof cfg[key] !== 'object') cfg[key] = {};
          applyEnvVars(cfg[key], value);
        }
      }
    }
  }

  const NODE_ENV = process.env.NODE_ENV || 'production';
  let cfg = loadJson(path.join(CONFIG_DIR, 'default.json'));
  deepMerge(cfg, loadJson(path.join(CONFIG_DIR, `${NODE_ENV}.json`)));
  applyEnvVars(cfg, loadJson(path.join(CONFIG_DIR, 'custom-environment-variables.json')));

  try {
    fs.mkdirSync(path.dirname(DIST_CONFIG), { recursive: true });
    fs.writeFileSync(DIST_CONFIG, JSON.stringify(cfg, null, 2));
    console.log('Frontend config generated. api.baseUrl =', cfg.api && cfg.api.baseUrl);
  } catch (err) {
    console.error('Failed to write frontend config:', err);
  }
})();

const app = express();

// Content Security Policy setup
const cspConfig = config.csp;
const cspOptions = _.cloneDeep(cspConfig);
if (cspConfig) {
  if (cspConfig.directives) {
    if (typeof cspConfig.directives === 'string') {
      cspConfig.directives = JSON.parse(cspConfig.directives);
      cspOptions.directives = {};
    }
    Object.keys(cspConfig.directives).forEach(function (key) {
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
    // IE 10 or older
    res.set('Permissions-Policy', 'interest-cohort=()');
    return res.status(400).send('Your browser is not supported. Please upgrade to a modern browser.');
  }

  const trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11
    res.set('Permissions-Policy', 'interest-cohort=()');
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

// HTTP server — Heroku sets PORT automatically; locally defaults to 3000
const host = process.env.HOST || null;
const portHttp = process.env.PORT || 3000;

http.createServer(app).listen(portHttp, host, function (err) {
  if (err) {
    console.log('Failed to start HTTP server on port ' + portHttp, err);
    return;
  }
  console.log('HTTP server listening on port ' + portHttp);
});

// HTTPS server — development only, on port 3001
if (app.get('env') === 'development') {
  const portHttps = process.env.PORT_SSL || 3001;
  const options = {
    key: fs.readFileSync('./config/certs/dev.citizenos.com.key'),
    cert: fs.readFileSync('./config/certs/dev.citizenos.com.crt')
  };

  https.createServer(options, app).listen(portHttps, host, function (err) {
    if (err) {
      console.log('Failed to start HTTPS server on port ' + portHttps, err);
      return;
    }
    console.log('HTTPS server listening on port ' + portHttps);
  });
}
