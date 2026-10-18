/* SentenceWorkshop class reporting. Deploy as Me / Anyone; Sheets stay private. */
const CLASS_SHEETS = Object.freeze({
  'IP5/8':'1oibqmKsvz_LfC9Pg45mqjFd_fJujFG38VjeGNwcsNP4',
  'IP5/9':'16XyCCXlszjz_rEZhKgG6CIowR00ART8V-btavYIyv6c'
});
const REPORT_HEADERS = ['Student','Email','Class','Last updated','Program complete %','Milestones completed','Milestones total','Introduction','1 · Simple present','2 · Present continuous','3 · Simple past','4 · Past continuous','5 · Simple future','6 · Future continuous','Answers checked','Latest activity','Student key'];
const RECEIVER = 'sentenceworkshop-progress-v1';

function json(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
function requireReport(condition){if(!condition)throw Error('Invalid progress report.');}
function validRoute(key,id){requireReport(Object.prototype.hasOwnProperty.call(CLASS_SHEETS,key)&&CLASS_SHEETS[key]===id);return id;}
function sheets(id){
  const book=SpreadsheetApp.openById(id),summary=book.getSheetByName('SentenceWorkshop Progress'),log=book.getSheetByName('Update Log');
  requireReport(summary&&log&&JSON.stringify(summary.getRange(1,1,1,REPORT_HEADERS.length).getValues()[0])===JSON.stringify(REPORT_HEADERS));
  return {summary,log};
}
function findRow(sheet,column,value){
  if(sheet.getLastRow()<2)return null;
  return sheet.getRange(2,column,sheet.getLastRow()-1,1).createTextFinder(value).matchEntireCell(true).useRegularExpression(false).findNext();
}
function validateReport(p){
  requireReport(p&&p.app==='SentenceWorkshop'&&p.schema===1);validRoute(p.classKey,p.spreadsheetId);
  requireReport(typeof p.id==='string'&&/^[a-zA-Z0-9_-]{16,100}$/.test(p.id));
  requireReport(typeof p.studentKey==='string'&&/^google:[a-zA-Z0-9_-]{1,80}$/.test(p.studentKey));
  requireReport(typeof p.name==='string'&&p.name.trim().length>0&&p.name.length<=80);
  requireReport(typeof p.email==='string'&&p.email.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email));
  requireReport(Number.isSafeInteger(p.at)&&p.at>0&&p.at<=Date.now()+300000);
  requireReport(p.total===51&&Number.isInteger(p.completed)&&p.completed>=0&&p.completed<=p.total&&p.percent===Math.floor(p.completed*100/p.total));
  requireReport(Number.isInteger(p.checked)&&p.checked>=0&&p.checked<=20000);
  requireReport(Array.isArray(p.sections)&&p.sections.length===7&&p.sections.every(s=>typeof s==='string'&&/^(Locked|Not started|Passed|Ready for review|Practicing · [0-8]\/[68] lessons ready)$/.test(s)));
  requireReport(typeof p.activity==='string'&&p.activity.length<=120);
  return p;
}
// User-controlled text is always a literal cell value, including formula-like names.
function literal(value){return typeof value==='string'&&/^[\s]*[=+\-@]/.test(value)?"'"+value:value;}
function reportRow(p){return [p.name,p.email,p.classKey,new Date(p.at),p.percent,p.completed,p.total,...p.sections,p.checked,p.activity,p.studentKey].map(literal);}
function doPost(e){
  let lock;
  try{
    const raw=e&&e.postData&&e.postData.contents;requireReport(typeof raw==='string'&&raw.length<=6000);
    const p=validateReport(JSON.parse(raw));lock=LockService.getScriptLock();lock.waitLock(15000);
    const {summary,log}=sheets(p.spreadsheetId),receipt=findRow(log,2,p.id);
    if(!receipt){
      const found=findRow(summary,17,p.studentKey),row=found?found.getRow():summary.getLastRow()+1;
      const previous=found?new Date(summary.getRange(row,4).getValue()).getTime():0;
      if(!found)summary.appendRow(reportRow(p));
      else if(previous<=p.at)summary.getRange(row,1,1,REPORT_HEADERS.length).setValues([reportRow(p)]);
      log.appendRow([new Date(),p.id,new Date(p.at),...reportRow(p)]);
      SpreadsheetApp.flush();
    }
    return json({ok:true,receiver:RECEIVER,spreadsheetId:p.spreadsheetId,id:p.id});
  }catch(error){return json({ok:false,error:error.message||'Reporting unavailable.'});}
  finally{if(lock&&lock.hasLock())lock.releaseLock();}
}
function doGet(e){
  try{
    const p=e&&e.parameter||{};validRoute(p.classKey,p.spreadsheetId);
    if(!p.id)return json({ok:true,receiver:RECEIVER,spreadsheetId:p.spreadsheetId});
    requireReport(/^[a-zA-Z0-9_-]{16,100}$/.test(p.id));
    const {log}=sheets(p.spreadsheetId);
    return json({ok:true,receiver:RECEIVER,spreadsheetId:p.spreadsheetId,id:p.id,saved:Boolean(findRow(log,2,p.id))});
  }catch(error){return json({ok:false,error:error.message||'Reporting unavailable.'});}
}
