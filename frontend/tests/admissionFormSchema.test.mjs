import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import test from "node:test";
const source = await readFile(new URL("../src/services/admissionFormSchema.js", import.meta.url), "utf8");
const { cleanSchemaForSave } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);

test("section titles cannot silently replace missing applicant fields", () => {
  const schema = [{ title: "Name", fields: [{ label: "", type: "text" }] }, { title: "Phone", fields: [{ label: "" }] }];
  assert.throws(() => cleanSchemaForSave(schema), /field 1: enter a field label/);
  assert.equal(schema.length, 2);
});
test("valid fields persist labels, names, required state and options", () => {
  const schema = cleanSchemaForSave([{ id:"s", title:" Personal details ", fields:[{id:"f",label:" Full name ",type:"text",required:true},{label:"Batch",name:"batch",type:"select",optionsText:" Morning, Evening "}]}]);
  assert.equal(schema[0].title,"Personal details");
  assert.equal(schema[0].fields[0].label,"Full name");
  assert.equal(schema[0].fields[0].required,true);
  assert.deepEqual(schema[0].fields[1].options,["Morning","Evening"]);
});
test("incomplete sections and select fields are rejected instead of discarded", () => {
  assert.throws(() => cleanSchemaForSave([{title:"Details",fields:[]}]), /at least one applicant field/);
  assert.throws(() => cleanSchemaForSave([{title:"Details",fields:[{label:"Batch",type:"select"}]}]), /select option/);
  assert.deepEqual(cleanSchemaForSave([]),[]);
});
