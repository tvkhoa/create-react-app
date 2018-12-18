
/**
 * Copyright (c) 2018-present, EH, Inc.
 *
 * Author: Khoa Thai
 */

'use strict';

// Comment for dev
// const inquirer = require('react-dev-utils/inquirer');
const inquirer = require('@ehrocks/react-dev-utils/inquirer');

const fs = require('fs-extra');
const chalk = require('chalk');
const paths = require('../config/paths');
const getClientEnvironment = require('../config/env');

const green = chalk.green;
const cyan = chalk.cyan;

function calcImportedRoutes(moduleNames) {
  return moduleNames.reduce((result, moduleName) => {
    return result + 'import ' + moduleName + 'Routes from \'..\/' + moduleName + '/routes\';' + '\n';
  }, '');
}

function calcRegisteredRoutes(moduleNames) {
  return moduleNames.reduce((result, moduleName) => {
    return result + '  ...' + moduleName + 'Routes,' + '\n';
  }, '');
}

function getAllModules() {
  const env = getClientEnvironment('');
  const modulesStr = env.raw.REACT_APP_MODULES || '';
  return modulesStr.split(',');
}

function readDefaultChoice(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content.split(',');
}

function writeDefaultChoice(filePath, choices) {
  const normalizedChoices =  choices || [];
  fs.writeFileSync(filePath, normalizedChoices.join(','));
}

function replaceRoutesString(content, importedRoutesStr, registeredStr) {
  let result = content;

  // Replace importedRoutes code from .js files 
  result =
        
  result
          .replace(
            /\/\/ @replace-import-on-dev-start-begin([\s\S]*?)\/\/ @replace-import-on-dev-start-end/gm,
            '\/\/ @replace-import-on-dev-start-begin' + '\n' + importedRoutesStr + '\/\/ @replace-import-on-dev-start-end'
          )
          .trim();
  
  // Replace registeredStr code from .js files 
  result =
          result
          // Replace registeredStr code from .js files 
          .replace(
            /\/\/ @replace-registered-on-dev-start-begin([\s\S]*?)\/\/ @replace-registered-on-dev-start-end/gm,
            '\/\/ @replace-registered-on-dev-start-begin' + '\n' + registeredStr + '  \/\/ @replace-registered-on-dev-start-end'
          )
          .trim();

  return result;
}

function writeRoutes(filePath, importedRoutesStr, registeredStr) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = replaceRoutesString(content, importedRoutesStr, registeredStr);    
  console.log(`Adding ${cyan(filePath)} to the project`);
  fs.writeFileSync(filePath, content);
}

function processDevRoutes(reactAppCallback) {
  // Define file path here
  // Comment for dev
  // const DEFAULT_CHOICE_FILE_PATH = './scripts/.defaultModules';
  // const DEV_ROUTES_FILE_PATH = './scripts/testRoutes.js';

  const DEFAULT_CHOICE_FILE_PATH = paths.appDevDefaultChoices;
  const DEV_ROUTES_FILE_PATH = paths.appDevRoutes;

  // Read  all modules from env
  const devModules = getAllModules();

  // Read  default choices from file
  const defaultChoices = readDefaultChoice(DEFAULT_CHOICE_FILE_PATH);

  // Open the prompt
  inquirer
  .prompt({
    type: 'checkbox',
    name: 'ehRoutes',
    message: 'Choose your modules: :-p',
    choices: ['all', new inquirer.Separator(), ...devModules],
    default: defaultChoices,
  })
  .then(answer => {
    const ehRoutes = answer.ehRoutes;

    // Write default choices to file
    writeDefaultChoice(DEFAULT_CHOICE_FILE_PATH, ehRoutes);

    // Handle based on answer
    if (ehRoutes[0] === 'all' || ehRoutes.length === 0) {
      console.log(green('Handle all routes as normal'));
      reactAppCallback();
    }
    else {
      // Enable env so that config can be read well
      process.env.DEV_MODULE = true;

      // Preprocess routes
      const importedRoutesStr = calcImportedRoutes(ehRoutes);
      const registeredStr = calcRegisteredRoutes(ehRoutes);
      
      // Prefill the path
      writeRoutes(DEV_ROUTES_FILE_PATH, importedRoutesStr, registeredStr);

      console.log(green(`Handle ${ehRoutes.join(',')} in dev mode`));
      reactAppCallback();
    }

    return;
  })
}

// Comment for dev
// processDevRoutes(function() {})

module.exports = processDevRoutes;