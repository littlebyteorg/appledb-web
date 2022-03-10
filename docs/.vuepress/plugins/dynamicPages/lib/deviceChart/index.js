var page = []

// Device listing
var types = ['iPhone', 'iPad', 'iPod', 'TV', 'Watch', 'HomePod']
types = [types].concat(types.map(t => [t]));
const title = ['',' (iPhone)',' (iPad)',' (iPod)',' (Apple TV)',' (Apple Watch)', ' (HomePod)'];
const description = ['device','iPhone','iPad','iPod','Apple TV','Apple Watch', 'HomePod'];
const path = ['.html', '/select/iPhone.html', '/select/iPad.html', '/select/iPod.html', '/select/AppleTV.html', '/select/AppleWatch.html', '/select/HomePod.html']

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