(async () => {
    const fetch = require('node-fetch');
    const hastebin = await fetch('https://hasteb.in/raw/evaguten'); //plexi users
    const body = await hastebin.text();
    const usernames = JSON.parse(body)

    console.log(`${usernames.length} usernames loaded!`)

    const pseudoword = require('./pseudoword-gen')
    const gen = new pseudoword(usernames);

    console.log('Markov Chain Result:', gen.getWord())
})()