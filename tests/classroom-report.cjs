const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');

function receiver(){
  const books=new Map();let releases=0;
  class Sheet{
    constructor(rows){this.rows=rows;}
    getLastRow(){return this.rows.length;}
    appendRow(row){this.rows.push(row);}
    getRange(row,column,height=1,width=1){
      const sheet=this;
      return {getValue:()=>sheet.rows[row-1]?.[column-1],getValues:()=>Array.from({length:height},(_,i)=>Array.from({length:width},(_,j)=>sheet.rows[row-1+i]?.[column-1+j]??'')),setValues:values=>values.forEach((values,i)=>{sheet.rows[row-1+i]??=[];values.forEach((value,j)=>sheet.rows[row-1+i][column-1+j]=value);}),createTextFinder:value=>({matchEntireCell(){return this;},useRegularExpression(){return this;},findNext(){for(let i=row-1;i<row-1+height;i++)if(sheet.rows[i]?.[column-1]===value)return {getRow:()=>i+1};return null;}})};
    }
  }
  const context=vm.createContext({console,ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({setMimeType:()=>JSON.parse(text)})},LockService:{getScriptLock:()=>({waitLock(){},hasLock:()=>true,releaseLock:()=>releases++})},SpreadsheetApp:{openById:id=>({getSheetByName:name=>books.get(id)?.[name]}),flush(){}}});
  vm.runInContext(fs.readFileSync(path.join(root,'classroom-receiver.gs'),'utf8')+'\nglobalThis.config={CLASS_SHEETS,REPORT_HEADERS};',context);
  for(const id of Object.values(context.config.CLASS_SHEETS))books.set(id,{'SentenceWorkshop Progress':new Sheet([[...context.config.REPORT_HEADERS]]),'Update Log':new Sheet([['Received at','Update ID','Snapshot at',...context.config.REPORT_HEADERS]])});
  const post=p=>context.doPost({postData:{contents:JSON.stringify(p)}}),get=p=>context.doGet({parameter:p});
  return {context,books,post,get,releases:()=>releases};
}

function checkReceiver(){
  const r=receiver(),ids=r.context.config.CLASS_SHEETS;
  const payload={app:'SentenceWorkshop',schema:1,classKey:'IP5/8',spreadsheetId:ids['IP5/8'],id:'update-1234567890001',studentKey:'google:Student',name:'=HYPERLINK("bad")',email:'student@example.com',at:Date.now()-1000,completed:0,total:51,percent:0,checked:1,sections:['Not started',...Array(6).fill('Locked')],activity:'Introduction · Nouns'};
  assert(r.post(payload).ok);assert(r.post(payload).ok);
  const book=r.books.get(payload.spreadsheetId),summary=book['SentenceWorkshop Progress'],log=book['Update Log'];
  assert.equal(summary.rows.length,2);assert.equal(log.rows.length,2,'Retries cannot duplicate log entries');
  assert(summary.rows[1][0].startsWith("'="),'Formula-like names must stay text');
  assert(r.get(payload).saved);assert(!r.get({...payload,id:'unknown-1234567890001'}).saved);
  const newer={...payload,id:'update-1234567890002',at:payload.at+500,completed:1,percent:1,checked:2};
  assert(r.post(newer).ok);assert(r.post({...payload,id:'update-1234567890003'}).ok);
  assert.equal(summary.rows[1][5],1,'Old retries cannot replace newer progress');assert.equal(log.rows.length,4);
  assert.equal(r.books.get(ids['IP5/9'])['SentenceWorkshop Progress'].rows.length,1,'Other class stays untouched');
  for(const patch of [{classKey:'INVALID'},{spreadsheetId:ids['IP5/9']},{email:'bad'},{percent:99},{total:50},{sections:['Passed']},{studentKey:'local'},{at:Date.now()+600000}])assert(!r.post({...payload,...patch}).ok,JSON.stringify(patch));
  assert(!r.post(null).ok);assert(!r.get({classKey:'invalid'}).ok);assert(r.releases()>=4);
  assert(r.post({...payload,classKey:'IP5/9',spreadsheetId:ids['IP5/9']}).ok);
  assert.equal(r.books.get(ids['IP5/9'])['SentenceWorkshop Progress'].rows.length,2);
  const receipt=r.get(payload);assert(!('email' in receipt)&&!('name' in receipt),'Public receipts contain no student data');
}

function client(classKey='IP5/8',testing=false){
  const timers=new Map(),storage=new Map(),calls=[],box={};let sequence=0,fail=false,hold=null;
  const context=vm.createContext({console,URLSearchParams,AbortController,location:{search:classKey?'?t='+encodeURIComponent(classKey):''},crypto:require('node:crypto').webcrypto,TESTING_MODE:testing,document:{getElementById:()=>box},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},setTimeout:fn=>{timers.set(++sequence,fn);return sequence;},clearTimeout:id=>timers.delete(id),fetch:async(url,options)=>{calls.push({url,options});if(hold)await hold;if(fail)throw Error('Offline');const p=new URL(url),id=p.searchParams.get('id');return {json:async()=>({ok:true,receiver:'sentenceworkshop-progress-v1',spreadsheetId:p.searchParams.get('spreadsheetId'),...(id?{id,saved:true}:{})})};}});
  const source=fs.readFileSync(path.join(root,'index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
  // Load the shipped app without booting its DOM UI.
  vm.runInContext(source.replace("if(typeof document!=='undefined')UI.init();",'').replace('RECEIVER_URL_PENDING','https://script.google.com/macros/s/fixture/exec').replace('const TESTING_MODE = false;',`const TESTING_MODE = ${testing};`),context);
  const {CLASSROOM_REPORT:R,PROGRESS:P}=context.SENTENCE_WORKSHOP;
  const student={id:'google:Student',name:'Student',attempts:[],view:null};P.migrate(student);
  return {R,P,I:context.SENTENCE_WORKSHOP.INTRODUCTION,student,calls,storage,timers,box,fail:value=>fail=value,hold:value=>hold=value};
}

async function checkClient(){
  const repair=client(),intro=repair.student.introduction;
  intro.attempts=repair.I.categories.flatMap((lesson,i)=>Array.from({length:5},(_,index)=>({id:lesson+index,mode:'practice',source:{lesson,index,version:2},first:{correct:true},at:index})));
  assert.equal(repair.R.snapshot(repair.student,'student@example.com').sections[0],'Ready for review');
  intro.attempts.push(...repair.I.categories.flatMap((lesson,i)=>[0,1].map(index=>({id:'failed-'+lesson+index,mode:'review',reviewId:'failed-review',slot:i*2+index,source:{lesson,index,version:2},first:{correct:false},finished:i===7&&index===1,at:20+i*2+index}))));
  assert.equal(repair.I.progress(repair.student).ready,8);assert.equal(repair.I.progress(repair.student).reviewOpen,false);
  assert.equal(repair.R.snapshot(repair.student,'student@example.com').sections[0],'Practicing · 8/8 lessons ready','Recovery practice must not be reported as ready for review');
  const queued=client();queued.R.connected(queued.student,'student@example.com');const due=[...queued.timers.keys()];queued.student.name='Changed while practicing';queued.R.changed(queued.student);assert.deepEqual([...queued.timers.keys()],due,'Continuous practice must not postpone reporting indefinitely');
  const c=client();c.R.init();assert(c.box.textContent.includes('IP5/8'));
  c.R.connected(c.student,'student@example.com');assert.equal(c.storage.size,1);await c.R.flush();
  assert.equal(c.calls.length,3);assert.equal(c.storage.size,0);assert(c.box.textContent.includes('Progress sent'));
  const sent=JSON.parse(c.calls[1].options.body);assert.equal(sent.sections.length,7);assert.equal(sent.total,51);assert.equal(sent.sections[1],'Locked');
  assert(!/access_token|Bearer|tokens|attempts/.test(c.calls[1].options.body),'Reports contain no tokens or raw answers');
  c.R.changed(c.student);await c.R.flush();assert.equal(c.calls.length,3,'Unchanged summaries are not sent again');
  c.student.name='Updated';c.fail(true);c.R.changed(c.student);await c.R.flush();assert.equal(c.storage.size,1);assert(c.box.textContent.includes('waiting'));
  c.fail(false);await c.R.flush();assert.equal(c.storage.size,0);assert(c.box.textContent.includes('Progress sent'));
  c.R.disconnected();c.student.name='Signed out';c.R.changed(c.student);await c.R.flush();assert.equal(c.storage.size,0);
  for(const [classKey,testing] of [['INVALID',false],['constructor',false],['__proto__',false],['',false],['IP5/8',true]]){const c=client(classKey,testing);c.R.connected(c.student,'student@example.com');c.R.changed(c.student);await c.R.flush();assert.equal(c.calls.length,0);}
  const nine=client('IP5/9');nine.R.connected(nine.student,'nine@example.com');await nine.R.flush();assert(nine.calls[0].url.includes('16XyCCXlszjz_rEZhKgG6CIowR00ART8V-btavYIyv6c'));
}

(async()=>{checkReceiver();await checkClient();console.log('classroom-report: strict routing, validation, deduplication, stale retries, literal cells, receipt privacy, account isolation, failed-send retry, and both class destinations passed.');})().catch(error=>{console.error(error);process.exitCode=1;});
