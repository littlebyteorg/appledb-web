const fs = require('node:fs');
const path = require('node:path');
module.exports = function buildBundledOSLinks(root) {
 const links = {};
 function visit(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
   const file = path.join(dir,entry.name);
   if(entry.isDirectory()) {visit(file);continue;}
   if(!entry.name.endsWith('.json')) continue;
   const row = JSON.parse(fs.readFileSync(file,'utf8'));
   if(row.beta || row.rc || row.internal || !row.released || !row.build) continue;
   const label = `${row.osStr} ${row.version}`;
   (links[label] ||= []).push({released:row.released,url:`https://appledb.dev/firmware/${encodeURIComponent(row.osStr.replace(/ /g,'-'))}/${encodeURIComponent(row.uniqueBuild || row.build)}.html`});
  }
 }
 visit(root);
 return links;
};
