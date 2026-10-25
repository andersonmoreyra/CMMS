import json

with open('flattened_872.json', encoding='utf-8') as f:
    items = json.load(f)
with open('index.html', encoding='utf-8') as f:
    html = f.read()

if 'tab-catalog872' in html:
    print('already injected')
    raise SystemExit

data = json.dumps([[i['code'], i['modNum'], i['modTitle'], i['title'], i['status']] for i in items],
                  ensure_ascii=False, separators=(',', ':'))

btn = '''<button id="nav-tab-catalog872" onclick="switchMainTab('tab-catalog872')"
              class="sidebar-nav-btn w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-semibold bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
              <span class="sidebar-btn-label truncate">Matriz 872 Funcionalidades</span>
              <span class="font-mono text-[10px] font-bold px-1.5 rounded-full bg-indigo-200/60 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">872</span>
            </button>
            '''
anchor = '<button id="nav-tab-overview"'
assert anchor in html
html = html.replace(anchor, btn + anchor, 1)

panel = '''<div id="tab-catalog872" class="view-panel-section hidden space-y-4">
          <div class="flex flex-wrap gap-2 items-center">
            <input id="catSearch" oninput="catPage=1;renderCatalog()" placeholder="Buscar código ou requisito..."
              class="flex-1 min-w-[200px] px-3 py-1.5 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
            <select id="catModule" onchange="catPage=1;renderCatalog()"
              class="px-3 py-1.5 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"></select>
            <span id="catCount" class="text-xs font-mono text-slate-500"></span>
          </div>
          <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-100 dark:bg-slate-800"><tr>
                <th class="px-3 py-2">Código</th><th class="px-3 py-2">Módulo</th>
                <th class="px-3 py-2">Requisito</th><th class="px-3 py-2">Status</th></tr></thead>
              <tbody id="catalogTableBody"></tbody>
            </table>
          </div>
          <div class="flex items-center justify-between text-xs">
            <button onclick="catPage--;renderCatalog()" class="px-3 py-1 rounded border border-slate-300 dark:border-slate-700">Anterior</button>
            <span id="catPageInfo" class="font-mono"></span>
            <button onclick="catPage++;renderCatalog()" class="px-3 py-1 rounded border border-slate-300 dark:border-slate-700">Próxima</button>
          </div>
        </div>
        '''
anchor = '<div id="tab-overview"'
assert anchor in html
html = html.replace(anchor, panel + anchor, 1)

js = '''
    // ---- MATRIZ 872 FUNCIONALIDADES ----
    const CATALOG872 = ''' + data + ''';
    let catPage = 1; const CAT_PER_PAGE = 25;
    function initCatalog() {
      const sel = document.getElementById('catModule');
      const mods = {};
      CATALOG872.forEach(r => mods[r[1]] = r[2]);
      sel.innerHTML = '<option value="0">Todos os módulos</option>' +
        Object.keys(mods).map(k => `<option value="${k}">${mods[k]}</option>`).join('');
      renderCatalog();
    }
    function renderCatalog() {
      const q = document.getElementById('catSearch').value.toLowerCase();
      const m = +document.getElementById('catModule').value;
      const rows = CATALOG872.filter(r => (!m || r[1] === m) && (!q || (r[0] + ' ' + r[3]).toLowerCase().includes(q)));
      const pages = Math.max(1, Math.ceil(rows.length / CAT_PER_PAGE));
      catPage = Math.min(Math.max(1, catPage), pages);
      document.getElementById('catalogTableBody').innerHTML = rows
        .slice((catPage - 1) * CAT_PER_PAGE, catPage * CAT_PER_PAGE)
        .map(r => `<tr class="border-t border-slate-200 dark:border-slate-800"><td class="px-3 py-1.5 font-mono">${r[0]}</td><td class="px-3 py-1.5">${r[2]}</td><td class="px-3 py-1.5">${r[3]}</td><td class="px-3 py-1.5"><span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold">${r[4]}</span></td></tr>`).join('');
      document.getElementById('catCount').innerText = rows.length + ' de 872';
      document.getElementById('catPageInfo').innerText = `Página ${catPage}/${pages}`;
    }
    document.addEventListener('DOMContentLoaded', initCatalog);

    function switchMainTab(tabId) {'''
html = html.replace('\n    function switchMainTab(tabId) {', js, 1)
html = html.replace("'tab-licensing': 'Console", "'tab-catalog872': 'Matriz de 872 Funcionalidades',\n        'tab-licensing': 'Console", 1)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('ok')
