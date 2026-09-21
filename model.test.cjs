const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.existsSync(__dirname+'/index.html')?fs.readFileSync(__dirname+'/index.html','utf8'):'';
const src=html.match(/<script id="model">([\s\S]*?)<\/script>/)?.[1]||'';
const ctx={};vm.createContext(ctx);vm.runInContext(src+';this.M=typeof Succession!=="undefined"?Succession:null',ctx);
assert.ok(ctx.M,'缺少演替计算模型');const M=ctx.M;
assert.equal(M.state(0,'primary','wet',false).stage,0);
assert.ok(M.state(0,'secondary','wet',false).soil>0);
assert.ok(M.state(40,'secondary','wet',false).progress>M.state(40,'primary','wet',false).progress);
assert.equal(M.state(100,'primary','wet',false).stage,5);
assert.ok(M.state(100,'primary','dry',false).stage<5);
assert.ok(M.state(100,'primary','wet',true).stage<5);
for(const type of ['primary','secondary'])for(const climate of ['wet','dry'])for(let t=0;t<=100;t++) { const s=M.state(t,type,climate,false);assert.ok(s.cover.every(v=>v>=0&&v<=100));assert.ok(s.soil>=0&&s.soil<=100);assert.ok(s.light>=0&&s.light<=100); }
console.log('PASS: 初始条件、演替速度、环境限制、持续干扰与指标范围');
for(const t of [55,70,85]) assert.ok(M.state(t+10,'secondary').cover[4]>M.state(t,'secondary').cover[4],'次生演替后半段应继续形成林冠');
assert.equal(typeof M.afterFire,'function','需要独立的火灾恢复过程');
const before=M.state(90,'primary');const burnt=M.afterFire(0,before,'wet',false);const recovering=M.afterFire(50,before,'wet',false);const recovered=M.afterFire(100,before,'wet',false);
assert.equal(burnt.soil,before.soil,'火灾必须保留当前土壤');assert.ok(burnt.cover[4]<before.cover[4]*.2,'火灾必须显著减少林冠');assert.ok(burnt.burn>.9);assert.ok(recovering.cover[2]>burnt.cover[2]);assert.ok(recovered.cover[4]>recovering.cover[4]);assert.ok(recovered.burn<.05);
console.log('PASS: 后期持续变化与火灾冲击、土壤保留、植被恢复');
