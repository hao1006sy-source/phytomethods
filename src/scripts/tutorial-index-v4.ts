const root=document.querySelector<HTMLElement>('.tutorial-index-v4');
if(root){
 const form=root.querySelector<HTMLFormElement>('#tutorial-v4-filters')!;
 const grid=root.querySelector<HTMLElement>('.ti-grid')!;
 const cards=[...root.querySelectorAll<HTMLElement>('.ti-card')];
 const sort=root.querySelector<HTMLSelectElement>('#ti-sort')!;
 const tasks=[...root.querySelectorAll<HTMLButtonElement>('[data-task]')];
 let selectedTask='';
 const normalize=(s:string)=>s.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g,' ').trim();
 function update(){const values=new FormData(form);let count=0;for(const card of cards){const visible=(!selectedTask||(card.dataset.tasks??'').split('|').includes(selectedTask))&&[...values.entries()].every(([key,raw])=>{const value=normalize(String(raw));if(!value)return true;const actual=normalize(card.dataset[key]??'');return key==='q'?value.split(' ').every(term=>actual.includes(term)):actual.split('|').includes(value);});card.hidden=!visible;if(visible)count++;}const ordered=[...cards].sort((a,b)=>sort.value==='title'?(a.dataset.title??'').localeCompare(b.dataset.title??'','zh-CN'):Number(b.dataset.updated)-Number(a.dataset.updated)||(a.dataset.title??'').localeCompare(b.dataset.title??'','zh-CN'));ordered.forEach(c=>grid.append(c));root!.querySelector('#ti-count')!.textContent=`找到 ${count} 篇分析教程`;root!.querySelector<HTMLElement>('.ti-empty')!.hidden=count!==0;tasks.forEach(t=>t.setAttribute('aria-pressed',String(t.dataset.task===selectedTask)));}
 tasks.forEach(t=>t.addEventListener('click',()=>{selectedTask=t.dataset.task??'';update();}));
 form.addEventListener('input',update);form.addEventListener('change',update);form.addEventListener('submit',e=>{e.preventDefault();update();});form.addEventListener('reset',()=>{selectedTask='';sort.value='updated';setTimeout(update);});sort.addEventListener('change',update);root.querySelector('#ti-empty-reset')!.addEventListener('click',()=>form.reset());update();
}
