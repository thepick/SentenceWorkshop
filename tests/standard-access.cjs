const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');

function finishChapter(student,tense,{PROGRESS:P,CURRICULUM,ENGINE},stages){
  for(let question=0;question<12;question++){
    const source={index:question,tense,stage:stages[Math.floor(question/2)],number:question%2?'plural':'singular',secondNumber:question%2?'plural':'singular',arrangement:question%2?'B':'A'};
    const challenge=P.challenge(source),tokens=CURRICULUM.answer(challenge),entry={tokens,result:P.summary(ENGINE.grade(tokens,challenge))};
    student.attempts.push({id:tense+'-'+question,source,challenge,mode:'chapter-review',reviewId:tense,question,first:entry,latest:entry,skipped:false,finished:question===11,at:new Date(question).toISOString()});
    assert.equal(P.chapter(student,tense).passed,question===11,'An unfinished review cannot unlock the next chapter');
  }
}

function checkSequence(app){
  const {TESTING_MODE,INTRODUCTION:I,PROGRESS:P,DATA}=app;
  assert.equal(TESTING_MODE,false,'Shipped pages require Google sign-in and sequential progression');
  const tenses=DATA.chapters.map(c=>c.tense),stages=DATA.lessons.slice(0,-1).map(l=>l.id);
  const student={id:'google:Test',name:'Test',attempts:[],view:null,course:{version:1,legacyChapters:[...tenses],legacyReviews:[...tenses]}};
  P.migrate(student);
  assert(I.lessonOpen(student,'noun'));
  for(const lesson of [...I.categories.slice(1),'review'])assert(!I.lessonOpen(student,lesson));
  for(const tense of tenses)assert(!P.chapterOpen(student,tense),'Legacy access cannot bypass the Introduction');

  student.introduction.attempts=I.categories.flatMap((lesson,i)=>[0,1].map(index=>{
    const source={lesson,index,version:2},entry={answer:I.question(source,true).answer,correct:true},slot=i*2+index;
    return {id:'intro-'+slot,source,mode:'review',reviewId:'intro-review',slot,first:entry,latest:entry,finished:slot===15,at:slot,updatedAt:slot};
  }));
  assert(I.progress(student).passed);

  for(const [index,tense] of tenses.entries()){
    for(const [other,candidate] of tenses.entries())assert.equal(P.chapterOpen(student,candidate),other<=index,'Only earned chapters open');
    assert(P.stageOpen(student,tense,stages[0]));
    for(const stage of stages.slice(1))assert(!P.stageOpen(student,tense,stage));
    assert(!P.reviewOpen(student,tense),'Practice readiness is required before a chapter review');
    finishChapter(student,tense,app,stages);
  }
  assert.equal(P.courseProgress(student).percent,100);
  assert.doesNotThrow(()=>P.validate({schema:1,rubric:1,students:[student]}));
}

for(const file of ['index.html','Sentence Workshop v0.7.6.html']){
  const html=fs.readFileSync(path.join(root,file),'utf8').replace(/data:image\/webp;base64,[A-Za-z0-9+/=]+/g,'data:image/webp;base64,fixture');
  const context=vm.createContext({console});
  vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],context,{filename:file});
  checkSequence(context.SENTENCE_WORKSHOP);
}
console.log('standard-access: both editions require sign-in, Introduction completion, ordered lessons and passed chapter reviews; legacy access cannot bypass gates.');
