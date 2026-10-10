const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),file=process.argv[2];
assert(file,'Pass the self-contained release filename.');
let html=fs.readFileSync(path.resolve(root,file),'utf8'),count=0;
const assets=path.join(root,'lesson-images');fs.mkdirSync(assets,{recursive:true});
for(const name of ['LESSON_INFOGRAPHICS','INTRO_INFOGRAPHICS']){
  const expression=new RegExp('const '+name+' = (.*);\\r?\\n'),match=html.match(expression);assert(match,'Missing '+name);
  const posters=JSON.parse(match[1]);
  const save=(poster,key)=>{
    const data=poster.src.match(/^data:image\/webp;base64,([A-Za-z0-9+/=]+)$/);assert(data,'Expected embedded WebP: '+key);
    const bytes=Buffer.from(data[1],'base64');assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
    const hash=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,12),target=key+'-'+hash+'.webp';
    fs.writeFileSync(path.join(assets,target),bytes);poster.src='lesson-images/'+target;count++;
  };
  if(name==='LESSON_INFOGRAPHICS')for(const [chapter,lessons] of Object.entries(posters))for(const [lesson,poster] of Object.entries(lessons))save(poster,chapter+'-'+lesson);
  else for(const [lesson,poster] of Object.entries(posters))save(poster,'introduction-'+lesson);
  html=html.replace(match[0],'const '+name+' = '+JSON.stringify(posters)+';\n');
}
assert.equal(count,44,'All 44 teaching images must be extracted.');assert(!html.includes('data:image/webp;base64,'));assert(Buffer.byteLength(html)<500000,'Hosted HTML should stay below 500 KB.');
fs.writeFileSync(path.join(root,'index.html'),html);
console.log(JSON.stringify({images:count,hostedBytes:Buffer.byteLength(html),downloadBytes:fs.statSync(path.resolve(root,file)).size}));
