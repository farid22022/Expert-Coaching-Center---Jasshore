/** Validate spreadsheet TSV completely before changing a local mark draft. */
export function parseMarkPaste(text, rows, components, startRow, startColumn) {
  const matrix=text.replace(/\r/g,"").replace(/\n$/,"").split("\n").map(line=>line.split("\t"));
  const changes=[];
  for(let r=0;r<matrix.length;r++)for(let c=0;c<matrix[r].length;c++){
    const row=rows[startRow+r],component=components[startColumn+c];
    if(!row||!component)throw Error("The pasted cells exceed this page. Paste one page at a time.");
    if(component.delivery_mode==="ONLINE"||component.online_assessment)throw Error(`${component.name} uses linked online marks.`);
    const raw=matrix[r][c].trim();
    if(/^(A|ABSENT)$/i.test(raw)){changes.push({row,component,state:"ABSENT",obtained:null,attendance:"ABSENT"});continue;}
    if(raw===""){changes.push({row,component,state:"PENDING",obtained:null,attendance:"PENDING"});continue;}
    const value=Number(raw);
    if(!Number.isFinite(value)||value<0||value>Number(component.full_marks))throw Error(`${row.roll} · ${component.name}: enter 0–${component.full_marks}, or A for absent.`);
    changes.push({row,component,state:"MARKED",obtained:raw,attendance:"PRESENT"});
  }
  return changes;
}
export function invalidMark(mark, component) {
  if(mark?.state!=="MARKED")return false;
  const value=Number(mark.obtained);
  return mark.obtained==null||mark.obtained===""||!Number.isFinite(value)||value<0||value>Number(component.full_marks);
}
