'use strict';

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.resolve('./src/assets/config');
const OUTPUT_PATHS = [
  path.resolve('./src/assets/config/config.json'),   // for ng serve (dev)
  path.resolve('./public/assets/config/config.json'), // web root copied into dist by ng build
];

// Load base default config
function loadJson(filePath) {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return {};
}

// Deep merge: source overwrites target
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      target[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// Resolve env vars from node-config style custom-environment-variables.json
// Supports simple string: "ENV_VAR_NAME"
// Supports object with __name and __format: { "__name": "ENV_VAR", "__format": "json" }
function applyEnvVars(config, mappings) {
  for (const [key, value] of Object.entries(mappings)) {
    if (typeof value === 'string') {
      if (process.env[value] !== undefined) {
        config[key] = process.env[value];
      }
    } else if (typeof value === 'object' && value !== null) {
      if (value.__name) {
        if (process.env[value.__name] !== undefined) {
          const raw = process.env[value.__name];
          try {
            config[key] = value.__format === 'json' ? JSON.parse(raw) : raw;
          } catch (e) {
            console.warn(`Failed to parse JSON for env var ${value.__name}:`, e.message);
          }
        }
      } else {
        if (!config[key] || typeof config[key] !== 'object') {
          config[key] = {};
        }
        applyEnvVars(config[key], value);
      }
    }
  }
  return config;
}

// Build config: default → production override → env vars
const NODE_ENV = process.env.NODE_ENV || 'production';

let config = loadJson(path.join(CONFIG_DIR, 'default.json'));
const envConfig = loadJson(path.join(CONFIG_DIR, `${NODE_ENV}.json`));
deepMerge(config, envConfig);

const envMappings = loadJson(path.join(CONFIG_DIR, 'custom-environment-variables.json'));
applyEnvVars(config, envMappings);

try {
  for (const outputPath of OUTPUT_PATHS) {
    fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));
    console.log('Config written to', outputPath);
  }
  console.log('api.baseUrl =', config.api && config.api.baseUrl);
} catch (err) {
  console.error('config.json write FAILED:', err);
  process.exit(1);
}
