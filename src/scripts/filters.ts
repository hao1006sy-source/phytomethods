const form=document.querySelector<HTMLFormElement>('#filters');
const items=[...document.querySelectorAll<HTMLElement>('.filter-item')];
function update(){if(!form)return;const values=new FormData(form);let count=0;for(const item of items){let visible=true;for(const [key,raw] of values.entries()){const value=String(raw).trim().toLowerCase();if(!value)continue;const actual=(item.dataset[key]??'').toLowerCase();if(key==='q' ? !actual.includes(value) : !actual.split('|').includes(value)){visible=false;break;}}item.hidden=!visible;if(visible)count++;}const out=document.querySelector('#filter-count');if(out)out.textContent=count?`找到 ${count} 条结果`:'没有符合条件的结果。';}
form?.addEventListener('input',update);form?.addEventListener('change',update);form?.addEventListener('reset',()=>setTimeout(update));
// 阻止 Enter 触发表单提交导致页面刷新，改为纯前端过滤
form?.addEventListener('submit',(e)=>{e.preventDefault();update();});
update();

// 页面加载时从 URL 参数回填搜索词（防止浏览器后退后丢失状态）
{const params=new URLSearchParams(window.location.search);const q=params.get('q');if(q){const qInput=form?.elements.namedItem('q') as HTMLInputElement|null;if(qInput){qInput.value=q;update();}}}

// The keyword field may be placed above results while retaining form ownership.
for(const control of document.querySelectorAll<HTMLInputElement>('[form="filters"]')){control.addEventListener('input',update);control.addEventListener('change',update);}
