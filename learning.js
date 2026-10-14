'use strict';
function searchTrace(data, target, type) {
 const frames=[];let comparisons=0;const snap=(active,range,message,result=null,done=false)=>frames.push({active,range,message,result,done,comparisons});
 snap([],data.map((_,i)=>i),'等待开始：两侧使用同一有序数组');
 if(type==='linear') {for(let i=0;i<data.length;i++){comparisons++;snap([i],data.map((_,j)=>j),`检查索引 ${i}：${data[i]} 与 ${target}`);if(data[i]===target){snap([i],[i],`找到目标 ${target}，索引 ${i}`,i,true);return frames}}}
 else {let lo=0,hi=data.length-1;while(lo<=hi){const mid=Math.floor((lo+hi)/2);comparisons++;const range=Array.from({length:hi-lo+1},(_,i)=>lo+i);snap([mid],range,`区间 [${lo}, ${hi}]，中点 ${mid}，比较 ${data[mid]} 与 ${target}`);if(data[mid]===target){snap([mid],[mid],`找到目标 ${target}，索引 ${mid}`,mid,true);return frames}if(data[mid]<target)lo=mid+1;else hi=mid-1}}
 snap([],[],`未找到 ${target}`, -1,true);return frames;
}
function graphTrace(rows,cols,walls,start,goal,type) {
 const frames=[],visited=[],parents=new Map(),discovered=new Set([start]),frontier=[start];
 const snap=(active,message,path=[],done=false,found=false)=>frames.push({active,visited:[...visited],frontier:[...frontier],message,path:[...path],done,found});
 snap(null,'等待开始：上下左右移动，每条边权重相同');
 while(frontier.length){const cell=type==='bfs'?frontier.shift():frontier.pop();visited.push(cell);snap(cell,`访问格子 ${cell+1}；待处理 ${frontier.length} 个节点`);
  if(cell===goal){const path=[];let x=goal;while(x!==undefined){path.unshift(x);x=parents.get(x)}snap(cell,`找到路径：${path.length-1} 步，访问 ${visited.length} 个节点`,path,true,true);return frames}
  const r=Math.floor(cell/cols),c=cell%cols;let neighbors=[];if(c+1<cols)neighbors.push(cell+1);if(r+1<rows)neighbors.push(cell+cols);if(c>0)neighbors.push(cell-1);if(r>0)neighbors.push(cell-cols);
  if(type==='dfs')neighbors.reverse();
  for(const n of neighbors)if(!walls.has(n)&&!discovered.has(n)){discovered.add(n);parents.set(n,cell);frontier.push(n)}
 }
 snap(null,`无可达路径；访问 ${visited.length} 个节点`,[],true,false);return frames;
}
if(typeof document!=='undefined') {
 const el=id=>document.getElementById(id);
 el('extra-labs').innerHTML=`
 <section id="search-lab"><div class="sectionhead"><div><h2>查找对比实验室 <span>SEARCH LAB</span></h2><p>顺序扫描，还是每次缩小一半？观察同一个目标的查找过程。</p></div><span class="badge">02 / SEARCHING</span></div>
 <div class="toolbar"><label>有序数组<input id="search-input" aria-label="查找数组" value="3, 8, 14, 21, 27, 35, 42, 56, 63, 78, 85, 96"></label><label class="compact">目标值<input id="search-target" aria-label="查找目标" type="number" value="63"></label><button id="search-apply">应用查找数据</button><button id="search-missing">未命中示例</button></div><p class="error" id="search-error" role="alert"></p>
 <div class="panels">${['线性查找','二分查找'].map((name,i)=>`<article class="algo"><h3>${name} <span class="complexity">${i?'O(log n)':'O(n)'}</span></h3><div class="search-cells" id="search-chart${i}"></div><div class="metrics" id="search-m${i}"></div><p class="status" id="search-s${i}" aria-live="polite"></p></article>`).join('')}</div>
 <div class="controls"><button id="search-play" class="primary">▶ 开始查找</button><button id="search-back">◃ 上一步</button><button id="search-step">▹ 单步执行</button><button id="search-reset">↺ 重置</button><label>速度<select id="search-speed"><option value="650">慢速</option><option value="250" selected>正常</option><option value="80">快速</option></select></label><span id="search-progress"></span></div><label class="timeline-label">操作时间轴<input id="search-timeline" type="range" min="0" value="0" aria-label="查找操作时间轴"></label>
 <p class="note">二分查找要求数组升序排列。橙色是当前检查位置，灰色是已排除区间，绿色表示命中。重复值时二分查找返回其中一个匹配位置，不保证第一个。每次目标检查计为一次比较；不计预先排序成本。</p>
 <details><summary>为什么二分查找更快？</summary><div class="explanations"><div><h3>线性查找</h3><p>从头到尾检查，适用于无序或有序数据。最佳 O(1)，最坏 O(n)，空间 O(1)。</p><pre>for (let i = 0; i &lt; a.length; i++)\n  if (a[i] === target) return i;\nreturn -1;</pre></div><div><h3>二分查找</h3><p>有序数组的中点能排除一半候选值。最佳 O(1)，最坏 O(log n)，迭代空间 O(1)。如果数据无序，应先考虑排序成本。</p><pre>let lo = 0, hi = a.length - 1;\nwhile (lo &lt;= hi) {\n  const mid = Math.floor((lo + hi) / 2);\n  if (a[mid] === target) return mid;\n  if (a[mid] &lt; target) lo = mid + 1;\n  else hi = mid - 1;\n}\nreturn -1;</pre></div></div></details></section>
 <section id="path-lab"><div class="sectionhead"><div><h2>图遍历与寻路 <span>GRAPH LAB</span></h2><p>在同一张地图上，观察广度优先与深度优先如何探索。</p></div><span class="badge">03 / GRAPH TRAVERSAL</span></div>
 <div class="toolbar"><label class="compact">起点<select id="graph-start" aria-label="寻路起点"></select></label><label class="compact">终点<select id="graph-goal" aria-label="寻路终点"></select></label><button id="graph-clear">清空障碍</button><button id="graph-example">恢复示例</button><span class="hint">点击任意一侧格子，切换两侧障碍</span></div><p id="graph-error" class="error" role="alert"></p>
 <div class="panels">${['BFS · 广度优先','DFS · 深度优先'].map((name,i)=>`<article class="algo"><h3>${name}</h3><div class="grid" id="graph-chart${i}" aria-label="${name}地图"></div><div class="gridlegend"><span>🟢 起点</span><span>🟣 终点</span><span>■ 障碍</span><span>蓝色 已访问</span><span>金色 路径</span></div><div class="metrics" id="graph-m${i}"></div><p class="status" id="graph-s${i}" aria-live="polite"></p></article>`).join('')}</div>
 <div class="controls"><button id="graph-play" class="primary">▶ 开始寻路</button><button id="graph-back">◃ 上一步</button><button id="graph-step">▹ 单步执行</button><button id="graph-reset">↺ 重置</button><label>速度<select id="graph-speed"><option value="650">慢速</option><option value="250" selected>正常</option><option value="80">快速</option></select></label><span id="graph-progress"></span></div><label class="timeline-label">操作时间轴<input id="graph-timeline" type="range" min="0" value="0" aria-label="寻路操作时间轴"></label>
 <p class="note">此地图为 5 × 7 的无权图，只能上下左右移动。BFS 用队列逐层探索，保证最短路径；DFS 用栈深入探索，找到的路径不保证最短。两者最坏时间 O(V + E)、空间 O(V)。V 是节点数，E 是边数。本例找到终点即停止。</p>
 <details><summary>队列和栈如何改变探索顺序？</summary><div class="explanations"><div><h3>BFS：先到先处理</h3><pre>const queue = [start];\nwhile (queue.length) {\n  const node = queue.shift();\n  if (node === goal) break;\n  for (const next of neighbors(node))\n    if (!discovered.has(next)) {\n      discovered.add(next);\n      parent.set(next, node);\n      queue.push(next);\n    }\n}</pre></div><div><h3>DFS：后到先处理</h3><pre>const stack = [start];\nwhile (stack.length) {\n  const node = stack.pop();\n  if (node === goal) break;\n  for (const next of neighbors(node))\n    if (!discovered.has(next)) {\n      discovered.add(next);\n      parent.set(next, node);\n      stack.push(next);\n    }\n}</pre></div></div></details></section>`;
 function player(prefix,label,build,paint) {
  let traces=[],tick=0,timer=null;const end=()=>Math.max(...traces.map(t=>t.length))-1;
  function stop(){clearInterval(timer);timer=null;el(prefix+'-play').textContent=tick>=end()?'↺ 再次'+label:'▶ 开始'+label}
  function render(){traces.forEach((t,i)=>paint(t[Math.min(tick,t.length-1)],i));el(prefix+'-timeline').max=end();el(prefix+'-timeline').value=tick;el(prefix+'-progress').textContent=tick===0?'准备就绪':tick>=end()?'对比完成':`步骤 ${tick} / ${end()}`;if(tick>=end())stop()}
  function reset(){stop();tick=0;traces=build();el(prefix+'-play').textContent='▶ 开始'+label;render()}
  function next(){if(tick<end()){tick++;render()}}
  el(prefix+'-play').onclick=()=>{if(timer){stop();return}if(tick>=end())reset();timer=setInterval(next,Number(el(prefix+'-speed').value));el(prefix+'-play').textContent='Ⅱ 暂停'+label};el(prefix+'-step').onclick=()=>{stop();next()};el(prefix+'-back').onclick=()=>{stop();tick=Math.max(0,tick-1);render()};el(prefix+'-reset').onclick=reset;el(prefix+'-timeline').oninput=()=>{stop();tick=Number(el(prefix+'-timeline').value);render()};el(prefix+'-speed').onchange=()=>{if(timer){clearInterval(timer);timer=setInterval(next,Number(el(prefix+'-speed').value))}};reset();return {reset};
 }
 let searchData=[3,8,14,21,27,35,42,56,63,78,85,96],target=63;
 const searchPlayer=player('search','查找',()=>['linear','binary'].map(type=>searchTrace(searchData,target,type)),(f,i)=>{
  el('search-chart'+i).innerHTML=searchData.map((v,j)=>`<div class="search-cell ${f.done&&f.result===j?'found':f.active.includes(j)?'checking':!f.range.includes(j)?'excluded':''}"><b>${v}</b><small>${j}</small></div>`).join('');
  el('search-m'+i).innerHTML=`<div><b>${f.comparisons}</b>目标检查次数</div><div><b>${f.done?(f.result<0?'未找到':f.result):'—'}</b>结果索引</div>`;el('search-s'+i).textContent=f.message;
 });
 function applySearch(){const raw=el('search-input').value.trim(),parts=raw.split(/[，,\s]+/),values=parts.map(Number),t=Number(el('search-target').value);if(!raw||parts.some(x=>!x)||values.length<2||values.length>24||values.some(x=>!Number.isInteger(x)||Math.abs(x)>999)||!el('search-target').value.trim()||!Number.isInteger(t)||Math.abs(t)>999){el('search-error').textContent='请输入 2–24 个 -999 至 999 的整数，以及同范围的整数目标。';return}if(values.some((v,i)=>i&&v<values[i-1])){el('search-error').textContent='二分查找需要升序数组，请先按从小到大排列后再应用。';return}searchData=values;target=t;el('search-error').textContent='';searchPlayer.reset()}
 el('search-apply').onclick=applySearch;el('search-missing').onclick=()=>{el('search-target').value=999;applySearch()};
 let walls=new Set([5,9,11,16,17,20,22,33]),start=0,goal=34;
 for(const id of ['graph-start','graph-goal'])el(id).innerHTML=Array.from({length:35},(_,i)=>`<option value="${i}">${i+1}</option>`).join('');el('graph-goal').value=34;
 const graphPlayer=player('graph','寻路',()=>['bfs','dfs'].map(type=>graphTrace(5,7,walls,start,goal,type)),(f,i)=>{
  el('graph-chart'+i).innerHTML=Array.from({length:35},(_,j)=>`<button data-cell="${j}" class="gridcell ${walls.has(j)?'wall':f.path.includes(j)?'path':f.active===j?'current':f.visited.includes(j)?'visited':f.frontier.includes(j)?'frontier':''} ${j===start?'start':''} ${j===goal?'goal':''}" aria-label="格子 ${j+1}${j===start?' 起点':j===goal?' 终点':walls.has(j)?' 障碍，点击移除':' 可通行，点击添加障碍'}" ${j===start||j===goal?'disabled':''}>${j===start?'S':j===goal?'T':j+1}</button>`).join('');
  el('graph-m'+i).innerHTML=`<div><b>${f.visited.length}</b>已访问节点</div><div><b>${f.frontier.length}</b>待处理节点</div><div><b>${f.done?(f.found?f.path.length-1:'不可达'):'—'}</b>路径步数</div>`;el('graph-s'+i).textContent=f.message;
 });
 for(const id of ['graph-chart0','graph-chart1'])el(id).onclick=e=>{const button=e.target.closest('button[data-cell]');if(!button||button.disabled)return;const cell=Number(button.dataset.cell);walls.has(cell)?walls.delete(cell):walls.add(cell);graphPlayer.reset()};
 function endpoints(){const s=Number(el('graph-start').value),g=Number(el('graph-goal').value);if(s===g){el('graph-error').textContent='请选择不同的起点和终点。';el('graph-start').value=start;el('graph-goal').value=goal;return}start=s;goal=g;walls.delete(start);walls.delete(goal);el('graph-error').textContent='';graphPlayer.reset()}
 el('graph-start').onchange=endpoints;el('graph-goal').onchange=endpoints;el('graph-clear').onclick=()=>{walls.clear();graphPlayer.reset()};el('graph-example').onclick=()=>{start=0;goal=34;walls=new Set([5,9,11,16,17,20,22,33]);el('graph-start').value=start;el('graph-goal').value=goal;el('graph-error').textContent='';graphPlayer.reset()};
}
if(typeof module!=='undefined')module.exports={searchTrace,graphTrace};
if(typeof document!=='undefined') {
 let learned={};try{learned=JSON.parse(localStorage.getItem('algolab-learned')||'{}')||{}}catch{}
 const sectionIds=['lab','search-lab','path-lab'];
 const status=document.createElement('span');status.className='learning-status';document.querySelector('.herofoot').appendChild(status);
 function update(){status.textContent=`已学 ${sectionIds.filter(id=>learned[id]).length} / 3 个实验区`;for(const id of sectionIds){const b=document.getElementById('learn-'+id);b.textContent=learned[id]?'✓ 已学过':'标记已学';b.setAttribute('aria-pressed',String(!!learned[id]))}}
 for(const id of sectionIds){const button=document.createElement('button');button.id='learn-'+id;button.className='learn-button';button.onclick=()=>{learned[id]=!learned[id];try{localStorage.setItem('algolab-learned',JSON.stringify(learned))}catch{status.title='当前浏览器无法保存学习标记'}update()};document.querySelector('#'+id+' .sectionhead').appendChild(button)}update();
 const note=document.createElement('p');note.className='note';note.textContent='学习标记仅保存在当前浏览器，不会跨设备同步；清除浏览器数据后会重置。';document.querySelector('.hero').appendChild(note);
}
