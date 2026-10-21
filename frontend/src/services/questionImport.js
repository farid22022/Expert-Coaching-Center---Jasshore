const escape=value=>String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
/** TSV: question, A, B, C, D, correct letter/1-based number, marks, explanation. JSON uses the same logical fields. */
export function validateQuestionImport(source){
  if(source.length>1024*1024)throw Error("Import up to 1 MB at a time.");
  let rows;
  if(source.trim().startsWith("[")){try{rows=JSON.parse(source);}catch{throw Error("Invalid JSON. Use an array of question objects.");}}
  else{rows=source.trim().split(/\r?\n/).filter(Boolean).map(line=>{const [question,a,b,c,d,answer,marks,explanation]=line.split("\t");return {question,options:[a,b,c,d],answer,marks,explanation};});if(/^question$/i.test(rows[0]?.question?.trim()))rows.shift();}
  if(!Array.isArray(rows)||!rows.length||rows.length>200)throw Error("Import 1–200 questions at a time.");
  const questions=[],errors=[];
  rows.forEach((row,index)=>{
    if(!row||typeof row!=="object"){errors.push(`Row ${index+1}: expected a question object.`);return;}
    const text=String(row.question||"").trim(),options=Array.isArray(row.options)?row.options.map(value=>String(value??"").trim()):[],marks=Number(row.marks||1);
    const answer=String(row.answer??"").trim().toUpperCase();const correct=/^[A-Z]$/.test(answer)?answer.charCodeAt(0)-65:/^\d+$/.test(answer)?Number(answer)-1:-1;
    if(!text||text.length>20000||options.length<2||options.length>8||options.some(value=>!value)||correct<0||correct>=options.length||!Number.isFinite(marks)||marks<=0||marks>1000){errors.push(`Row ${index+1}: question, 2–8 nonempty options, a valid correct answer and marks (0–1000) are required.`);return;}
    questions.push({text:`<p>${escape(text)}</p>`,image:null,marks,negative_marks:0,question_type:"single",difficulty:"medium",topic:"",tags:"",explanation:row.explanation?`<p>${escape(row.explanation)}</p>`:"",options:options.map((value,i)=>({text:value,correct:i===correct,image:null}))});
  });
  return {questions,errors,total:rows.length};
}
