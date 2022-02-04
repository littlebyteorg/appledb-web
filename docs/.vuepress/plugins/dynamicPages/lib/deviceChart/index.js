var page = []

// Device listing
var types = ['iPhone', 'iPad', 'iPod', 'TV', 'Watch']
types = [types].concat(types.map(t => [t]));
const title = ['',' (iPhone)',' (iPad)',' (iPod)',' (Apple TV)',' (Apple Watch)'];
const description = ['device','iPhone','iPad','iPod','Apple TV','Apple Watch'];
const path = ['.html', '/iPhone.html', '/iPad.html', '/iPod.html', '/AppleTV.html', '/AppleWatch.html']

for (const i in types) {
  var contentsHeader = '';
  if (types[i].length > 1) contentsHeader = '## Contents \n\n';
  page.push({
    path: '/device' + path[i],
    frontmatter: {
      title: 'Device Selection' + title[i],
      description: 'Find out what jailbreaks you can use on your ' + description[i],
      sidebar: false,
      editLink: false,
      lastUpdated: false,
      contributors: false,
    },
    content: contentsHeader + require('./devicePage')(types[i], '/device/', true)
  })
}

module.exports = page;