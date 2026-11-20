"""Check or generate the chart data from the verified synthetic Scanpy result."""
import argparse
import csv
import json
from pathlib import Path

source=Path('examples/single-cell/verified-20261121/cell_results.csv')
target=Path('src/data/single-cell-demo.json')
with source.open(encoding='utf-8',newline='') as f:
    rows=list(csv.DictReader(f))
expected=[{'cell':r['cell'],'x':float(r['UMAP1']),'y':float(r['UMAP2']),'cluster':r['cluster'],'group':r['simulated_group']} for r in rows]
parser=argparse.ArgumentParser()
parser.add_argument('--check',action='store_true')
args=parser.parse_args()
if args.check:
    assert json.loads(target.read_text(encoding='utf-8'))==expected
    print(f'{len(expected)} 个图表数据点与 Scanpy 结果一致')
else:
    if target.exists():raise SystemExit('输出文件已存在；请使用 --check，避免覆盖')
    target.write_text(json.dumps(expected,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('已创建',target)
