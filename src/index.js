#!/usr/bin/env node

/* eslint-disable no-console */
// eslint-disable-next-line no-unused-vars
require('colors');
const ora = require('ora');
const inquirer = require('inquirer');
const fs = require('fs');
const clear = require('clear');
const client = require('discord-rich-presence')('660184868772249610');
const homedir = require('os').homedir();

clear();
console.log(`👋🏻 Welcome to the ${'discord.bio'.bold.underline} Rich Presence ${'CLI'.bold}!\n`.magenta);

inquirer
  .prompt([
    {
      name: 'Choice',
      type: 'list',
      choices: [
        'Start Rich Presence', 'Update discord.bio details',
      ],
    },
  ])
  .then((answers) => {
    switch (answers.Choice) {
      case 'Update discord.bio details':
        createPresence();break;
      case 'Start Rich Presence':
        loadPresence();break;
      default:
        break;
    }
  });
function loadPresence() {
  if (!fs.readdirSync(homedir).includes('.dbio-rpc-config.json')) return createPresence()
  clear();
  const data = fs.readFileSync(`${homedir}/.dbio-rpc-config.json`)
  const { slug } = JSON.parse(data);
  ora('Displaying discord.bio Rich Presence!'.red).start();
  client.updatePresence({
    state: `🖋️ dsc.bio/${slug}`,
    details: 'Check out my discord.bio profile!',
    largeImageKey: 'bio',
    instance: true,
  });
}

function createPresence() {
  clear();
  console.log(`What is your ${'discord.bio slug'.bold}?`);
  inquirer
    .prompt([
      {
        name: 'Slug',
        type: 'input',
      },
    ])
    .then((answers) => {
      console.log(answers)
      fs.writeFileSync(`${homedir}/.dbio-rpc-config.json`, JSON.stringify({ slug: answers.Slug.trim() }));
      loadPresence();
    });
}
