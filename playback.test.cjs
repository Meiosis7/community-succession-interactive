const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const elements=new Map();function el(id){if(!elements.has(id))elements.set(id,{id,value:id==='speed'?'1':id==='climate'?'wet':'0',checked:id==='roots',style:{},attrs:{},setAttribute(k,v){this.attrs[k]=String(v)},getAttribute(k){return this.attrs[k]},classList:{toggle(){}},querySelectorAll(){return[]}});return elements.get(id)}
let pending;const ctx={document:{getElementById:el,querySelectorAll(){return[]}},performance:{now:()=>100},requestAnimationFrame(fn){pending=fn;return 1},cancelAnimationFrame(){pending=null}};
vm.createContext(ctx);for(const match of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))vm.runInContext(match[1],ctx);
el('play').onclick();
// First frame timestamp may precede performance.now() sampled in the click handler.
assert.doesNotThrow(()=>pending(99),'首帧时钟早于点击时钟时，不能使演替时间变成负数');
assert.equal(el('stage').textContent,'裸岩阶段');
for(let now=115;now<40115&&pending;now+=16)pending(now);
assert.equal(el('stage').textContent,'乔木阶段');
assert.ok(!el('land-plants').innerHTML.includes('NaN'));
assert.ok(!el('time-label').textContent.includes('NaN'));
el('restart').onclick();assert.equal(el('stage').textContent,'裸岩阶段');
el('play').onclick();pending(50000);el('play').onclick();assert.equal(el('play').textContent,'▶ 开始推演');
el('time').value='80';el('time').oninput();const soilBefore=el('soilvalue').innerHTML;
el('fire').onclick();assert.ok(el('stage').textContent.includes('火灾发生'));assert.equal(el('time').value,80);assert.equal(el('time').max,180);assert.equal(el('soilvalue').innerHTML,soilBefore);assert.equal(el('play').textContent,'Ⅱ 暂停推演');assert.ok(el('land-plants').innerHTML.includes('876 810 365 406'));
pending(51000);for(let n=51200;n<90000&&pending;n+=200)pending(n);assert.ok(el('stage').textContent.includes('乔木阶段恢复'));assert.ok(el('time-label').textContent.includes('180'));assert.ok(!el('land-plants').innerHTML.includes('NaN'));
console.log('PASS: 火灾保持时间、保留土壤、自动继续、延长恢复观察；');
console.log('PASS: 首帧时钟偏差、完整播放、终点、重播与暂停');
if(process.env.RENDER_SCENES){
 const {Resvg}=require('../succession-lab/qa/node_modules/@resvg/resvg-js');el('restart').onclick();
 for(const t of [0,40,76,100]) {el('time').value=String(t);el('time').oninput();const svg='<svg xmlns="http://www.w3.org/2000/svg" width="900" height="410" viewBox="0 0 900 410">'+el('land').innerHTML.replace('<g id="land-plants"></g>','<g>'+el('land-plants').innerHTML+'</g>')+'</svg>';fs.writeFileSync(__dirname+'/qa/stage-'+t+'.png',new Resvg(svg).render().asPng());}
 el('fire').onclick();fs.writeFileSync(__dirname+'/qa/fire.png',new Resvg('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="410">'+el('land').innerHTML.replace('<g id="land-plants"></g>','<g>'+el('land-plants').innerHTML+'</g>')+'</svg>').render().asPng());
}

el('secondary').onclick();assert.equal(el('stage').textContent,'弃耕农田');
for(const [t,label]of [[4,'一年生杂草阶段'],[18,'多年生杂草阶段'],[35,'灌木阶段'],[75,'乔木阶段']]){el('time').value=String(t);el('time').oninput();assert.equal(el('stage').textContent,label);assert.ok(el('stage-facts').innerHTML.includes('群落变化'));}
el('primary').onclick();for(const [i,label]of ['裸岩','地衣','苔藓','草本植物','灌木','乔木'].entries()){el('steps').onclick({target:{closest(){return {dataset:{stage:String(i)},disabled:false}}}});assert.equal(el('stage').textContent,label+'阶段');}
el('climate').value='dry';el('climate').onchange();el('time').value='100';el('time').oninput();assert.equal(el('stage').textContent,'灌木阶段');
el('mowing').checked=true;el('mowing').onchange();el('time').value='100';el('time').oninput();assert.equal(el('stage').textContent,'草本植物阶段');
console.log('PASS: 两类演替的阶段名称、阶段跳转、干旱与刈割');
