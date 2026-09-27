import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source = readFileSync(new URL('../src/services/api.js', import.meta.url), 'utf8')
  .replace('import axios from "axios";', '')
  .replace('import.meta.env.VITE_API_URL', 'undefined')
  .replaceAll('export default api;', '').replaceAll('export ', '');
function setup(post) {
  const storage = new Map([['access_token','old-access'],['refresh_token','old-refresh'],['current_user','{}']]);
  let rejectResponse;
  const retried = [];
  const events = [];
  const api = (config) => { retried.push(config); return Promise.resolve({status:200}); };
  api.interceptors = {request:{use(){}},response:{use(ok,fail){rejectResponse=fail;}}};
  vm.runInNewContext(source, {axios:{create:()=>api,post}, localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},window:{dispatchEvent:e=>events.push(e)},Event:class {constructor(type){this.type=type;}}});
  return {storage,events,retried,fail:()=>rejectResponse({response:{status:401},config:{url:'/courses/',headers:{}}}),rejectResponse};
}
test('concurrent expired requests exchange one refresh and persist its rotation', async()=>{
  let calls=0,resolve;
  const s=setup(()=>{calls++;return new Promise(r=>resolve=r);});
  const requests=[s.fail(),s.fail(),s.fail()];
  resolve({data:{access:'new-access',refresh:'new-refresh'}});
  await Promise.all(requests);
  assert.equal(calls,1);assert.equal(s.storage.get('refresh_token'),'new-refresh');
  assert.equal(s.retried.length,3);assert.ok(s.retried.every(r=>r.headers.Authorization==='Bearer new-access'));
});
test('next expiration uses rotated refresh token',async()=>{
  const tokens=[];
  const s=setup(async(url,body)=>{tokens.push(body.refresh);return {data:{access:'new',refresh:'rotated'}};});
  await s.fail();await s.fail();assert.deepEqual(tokens,['old-refresh','rotated']);
});
test('temporary refresh outage preserves session',async()=>{
  const s=setup(async()=>{throw {response:{status:503}};});
  await assert.rejects(s.fail());assert.equal(s.storage.get('refresh_token'),'old-refresh');
});
test('invalid refresh clears session and notifies UI',async()=>{
  const s=setup(async()=>{throw {response:{status:401}};});
  await assert.rejects(s.fail());assert.equal(s.storage.size,0);assert.equal(s.events.length,1);
});
test('late refresh cannot restore a logged out session',async()=>{
  let resolve;const s=setup(()=>new Promise(r=>resolve=r));const pending=s.fail();s.storage.clear();
  resolve({data:{access:'new',refresh:'new'}});await assert.rejects(pending);assert.equal(s.storage.size,0);
});
test('bad login does not trigger token refresh',async()=>{
  let calls=0;const s=setup(async()=>{calls++;});
  await assert.rejects(s.rejectResponse({response:{status:401},config:{url:'/auth/login/',headers:{}}}));assert.equal(calls,0);
});
