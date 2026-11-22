const samples=['AAAA','AAAT','TTTA','TTTT'];
function score(split){let total=0;for(let i=0;i<4;i++){let n=99;for(const x of ['A','T'])for(const y of ['A','T'])n=Math.min(n,Number(x!==y)+split[0].reduce((s,j)=>s+Number(samples[j][i]!==x),0)+split[1].reduce((s,j)=>s+Number(samples[j][i]!==y),0));total+=n}return total}
const result=[[[0,1],[2,3]],[[0,2],[1,3]],[[0,3],[1,2]]].map(score);if(result.join()!= '5,7,8')throw Error(result);console.log('四位点三棵树的最少变化数验证通过：'+result.join(', '));
