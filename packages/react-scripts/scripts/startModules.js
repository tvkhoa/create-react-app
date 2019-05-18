/**
 * Copyright (c) 2018-present, EH, Inc.
 *
 * Author: Khoa Thai
 */

'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

const fs = require('fs-extra');
const chalk = require('chalk');
const paths = require('../config/paths');
const getClientEnvironment = require('../config/env');
const reactScriptStart = require('./_startScript');
const green = chalk.green;
const cyan = chalk.cyan;

function calcImportedRoutes(moduleNames) {
  return moduleNames.reduce((result, moduleName) => {
    return (
      result +
      'import ' +
      moduleName +
      "Routes from '../src/modules/" +
      moduleName +
      "/routes';" +
      '\n'
    );
  }, '');
}

function calcRegisteredRoutes(moduleNames) {
  return moduleNames.reduce((result, moduleName) => {
    return result + '  ...' + moduleName + 'Routes,' + '\n';
  }, '');
}

function getAllModules() {
  const env = getClientEnvironment('');
  const modulesStr = env.raw.REACT_APP_DEV_MODULES || '';
  return modulesStr.split(',');
}

function replaceRoutesString(content, importedRoutesStr, registeredStr) {
  let result = content;

  // Replace importedRoutes code from .js files
  result = result
    .replace(
      /\/\/ @replace-import-on-dev-start-begin([\s\S]*?)\/\/ @replace-import-on-dev-start-end/gm,
      '// @replace-import-on-dev-start-begin' +
        '\n' +
        importedRoutesStr +
        '// @replace-import-on-dev-start-end'
    )
    .trim();

  // Replace registeredStr code from .js files
  result = result
    // Replace registeredStr code from .js files
    .replace(
      /\/\/ @replace-registered-on-dev-start-begin([\s\S]*?)\/\/ @replace-registered-on-dev-start-end/gm,
      '// @replace-registered-on-dev-start-begin' +
        '\n' +
        registeredStr +
        '  // @replace-registered-on-dev-start-end'
    )
    .trim();

  return result;
}

function writeRoutes(
  readfilePath,
  writeFilePath,
  importedRoutesStr,
  registeredStr
) {
  let content = fs.readFileSync(readfilePath, 'utf8');
  content = replaceRoutesString(content, importedRoutesStr, registeredStr);
  console.log(`Adding ${cyan(writeFilePath)} to the project`);
  fs.writeFileSync(writeFilePath, content, { flag: 'w' });
}

function processDevRoutes() {
  const READ_FILE_PATH = `${
    paths.appPath
  }/node_modules/eh-react-scripts/scripts/_devModule.js`;
  const WRITE_FILE_PATH = `${paths.appPath}/__dev__/index.js`;

  // Read  default choices from file
  const ehRoutes = getAllModules();

  // Enable env so that config can be read well
  process.env.DEV_MODULE = true;

  // Preprocess routes
  const importedRoutesStr = calcImportedRoutes(ehRoutes);
  const registeredStr = calcRegisteredRoutes(ehRoutes);

  // Prefill the path
  writeRoutes(
    READ_FILE_PATH,
    WRITE_FILE_PATH,
    importedRoutesStr,
    registeredStr
  );

  console.log(green(`Handle ${ehRoutes.join(',')} in dev mode`));
  reactScriptStart();
}

// Comment for dev
processDevRoutes();

module.exports = processDevRoutes;
