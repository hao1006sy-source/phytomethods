from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from collections import Counter
class Links(HTMLParser):
 def __init__(self): super().__init__(); self.urls=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag in ('a','link','script','img'):
   u=a.get('href') or a.get('src')
   if u:self.urls.append(u)
root=Path('dist').resolve(); errors=[]; total=0
for f in root.rglob('*.html'):
 p=Links();p.feed(f.read_text(encoding='utf8'))
 for url in p.urls:
  u=urlsplit(url)
  if u.scheme or u.netloc or not u.path:continue
  if u.path.startswith('/phytomethods/'): target=root/unquote(u.path[len('/phytomethods/'):])
  elif u.path.startswith('/'): errors.append((str(f),url));continue
  else:target=(f.parent/unquote(u.path)).resolve()
  if target.is_dir():target=target/'index.html'
  total+=1
  if not target.is_file():errors.append((str(f.relative_to(root)),url))
print(f'{total} local links checked; {len(errors)} errors')
for e in errors:print(*e)
raise SystemExit(bool(errors))
