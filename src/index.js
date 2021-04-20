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
const got = require('got')

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
        createPresence();
        break;
      case 'Start Rich Presence':
        loadPresence();
        break;
      default:
        break;
    }
  });



// Load Presence
async function loadPresence() {
  if (!fs.readdirSync(homedir).includes('.dbio-rpc-config.json')) return createPresence()
  clear();

  // get the data
  const data = fs.readFileSync(`${homedir}/.dbio-rpc-config.json`)
  const { slug } = JSON.parse(data);
  const { button } = JSON.parse(data);''

  let buttons = [{label: "Discord.bio", url: `https://dsc.bio/${slug}`}];
  if (button.url) buttons.push(button);

  ora('Displaying discord.bio Rich Presence!'.red).start();
  // get the bio
  let bio = await got(`https://api.discord.bio/user/details/${slug}`).then(res => JSON.parse(res.body).payload.user)
  // push out the rp
  client.updatePresence({
    state: bio.details.likes + (bio.details.likes === 1 ? " like" : " likes"), // thanks LocalHotJew#324 for helping test
    details: bio.details.description,
    buttons: buttons,
    largeImageKey: 'bio',
    instance: true,
  });
}



// Create/modify account
async function createPresence() {
  let connections = [];
  let bio;
  let slug;
  clear();
  // get their slug
  console.log(`What is your ${'discord.bio slug'.bold}?`);
  await inquirer
    .prompt([
      {
        name: 'Slug',
        type: 'input',
      },
    ])
    .then(async (answer) => {
      slug = answer.Slug.trim();
      // get connections and make them into one list
      try {
        bio = await got(`https://api.discord.bio/user/details/${slug}`).then(res => JSON.parse(res.body).payload.user);

      // error messages bc people can't type
      } catch (error) {
        console.log("Hey! you seem to put the wrong slug in... let's try that again");
        return createPresence();
      }
      if (bio.message) {
        console.log("Hey! you seem to put the wrong slug in... let's try that again");
        return createPresence();
      }

      // make a list of all connectiongs
      if (bio.userConnections != null) connections = connections.concat(bio.userConnections);
      if (bio.discordConnections != null) connections = connections.concat(bio.discordConnections);
    });
    
  // get account for second button
  let choices = [] 
  connections.forEach(connection => {
    choices.push(Object.keys(connection)[0]);
  });
  choices.push("none")
  console.log(`What other ${'connection'.bold} do you want shown via a button?`);
  // CHOOOOSE
  await inquirer
    .prompt([
      {
        name: 'Connection',
        type: 'list',
        choices: choices
      }
    ])
    .then((answer) => {
      answer = answer.Connection.trim();
      // setup button label
      let button = {label: answer[0].toUpperCase() + answer.slice(1)};
      // locate the chosen connection
      connections.forEach(connection => {
        if (answer === Object.keys(connection)[0]) {
          // make the url to the profile and add to json
          let url;
          switch (answer) {
            case "battlenet":
              button.label = connection.name;
              url = "https://blizzard.com";
              break;
            case "github":
              url = `https://github.com/${connection.github.name}`;
              break;
            case "steam":
              url = `http://steamcommunity.com/profiles/${connection.steam.id}`;
              break;
            case "reddit":
              url = `https://reddit.com/u/${connection.reddit.name}`;
              break;
            case "twitter":
              url = `https://twitter.com/${connection.twitter.name}`;
              break;
            case "twitch":
              url = `https://www.twitch.tv/${connection.twitch.name}`;
              break;
            case "youtube":
              url = `https://www.youtube.com/channel/${connection.youtube.id}`;
              break;
            case "website":
              url = bio.userConnections.website;
              break;
            case "instagram":
              url = `https://instagram.com/${bio.userConnections.instagram}`;
              break;
            case "snapchat":
              url = `https://snapchat.com/add/${bio.userConnections.snapchat}`;
              break;
            case "linkedin":
              url = `https://linkedin.com/in/${bio.userConnections.linkedin}`;
              break;
            case "facebook":
              url = `https://facebook.com/profile.php?id=${connection.id}`;
              break;
            case "spotify":
              url = `https://spotify.com/user/${connection.id}`
              break;
            default:
              break;
          }
          button.url = url; // add the url field to the button json
        };
      });
      // lock n' load
      fs.writeFileSync(`${homedir}/.dbio-rpc-config.json`, JSON.stringify({ button: button, slug: slug}));
      clear();
      loadPresence();
    });
}
