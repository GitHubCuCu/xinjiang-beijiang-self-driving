import { categories } from './data.js';
import { storage, validateState } from './store.js';
import { icon, escape, pageHeading, progress, softButton, buttonClass, inputClass, openModal, confirmModal, toast, download } from './ui.js';

const filters = { query: '', category: 'all', owner: 'all', status: 'all' };
function summary() {
  const stats = storage.stats();
  return `<div class="grid gap-5 rounded-2xl border border-[#e0e6d3] bg-[#eef2e4] p-6 md:grid-cols-[1.4fr_1fr]"><div><div class="flex items-center justify-between"><h2 class="text-sm font-semibold">一点点准备，满满的安心</h2><span class="font-serif text-3xl text-[#62804d]">${stats.percent}<small class="text-sm">%</small></span></div>${progress(stats.percent, 'mt-4')}<div class="mt-3 flex justify-between text-[11px] text-[#91a07c]"><span>已准备 ${stats.done} / ${stats.total} 项</span><span>${stats.done === stats.total ? '准备完成，祝旅途愉快！' : `还有 ${stats.total - stats.done} 项待准备`}</span></div></div><div class="flex items-center gap-4 border-t border-[#dce3ce] pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0"><span class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#e2e9d3] text-2xl text-[#829367]">${icon('shield-check-line')}</span><div><p class="text-xs font-semibold text-[#6e8257]">${stats.essentialLeft ? `还有 ${stats.essentialLeft} 项重点准备` : '重点物品都已确认'}</p><p class="mt-2 text-[11px] leading-5 text-[#9aa687]">证件、安全座椅、保暖和个人用药，<br>比多带一件衣服更重要。</p></div></div></div>`;
}
function itemMarkup(item) {
  const checked = storage.get().checked[item.id] === true;
  return `<div class="flex items-start gap-1 border-b border-[#eef1e8] last:border-0"><label class="flex min-w-0 flex-1 cursor-pointer gap-2.5 py-3.5"><input type="checkbox" data-check="${escape(item.id)}" ${checked ? 'checked' : ''} class="mt-0.5 h-4 w-4 shrink-0 rounded border-[#cbd5bc]"><span class="min-w-0 flex-1"><span class="flex flex-wrap items-center gap-1.5"><span class="text-xs font-medium leading-5 ${checked ? 'text-[#aab4a0] line-through' : 'text-[#5d7050]'}">${escape(item.name)}</span>${item.essential ? '<span class="rounded bg-[#f7f0dd] px-1.5 py-0.5 text-[8px] text-[#b19a5c]">重点</span>' : ''}</span><span class="mt-1 block text-[10px] leading-5 text-[#a1aa94]">${escape(item.detail)}</span><span class="mt-1.5 inline-block rounded-md bg-[#f0f3e9] px-1.5 py-0.5 text-[8px] text-[#93a080]">${escape(item.owner)}</span></span></label>${item.id.startsWith('custom-') ? `<button type="button" data-remove="${escape(item.id)}" aria-label="删除 ${escape(item.name)}" class="mt-3 p-1 text-sm text-[#b2b9a5] hover:text-[#a76654]">${icon('delete-bin-6-line')}</button>` : ''}</div>`;
}
function cards() {
  const all = storage.items();
  const matches = all.filter(item => (filters.category === 'all' || filters.category === item.category) && (filters.owner === 'all' || filters.owner === item.owner) && (filters.status !== 'todo' || !storage.get().checked[item.id]) && (filters.status !== 'done' || storage.get().checked[item.id]) && (filters.status !== 'essential' || item.essential) && `${item.name} ${item.detail}`.toLowerCase().includes(filters.query.toLowerCase()));
  if (!matches.length) return `<div class="col-span-full rounded-2xl border border-dashed border-[#d9e1ce] bg-white px-6 py-16 text-center"><span class="text-4xl text-[#a3b294]">${icon('search-eye-line')}</span><h2 class="mt-4 text-sm font-semibold">没有符合条件的物品</h2><p class="mt-2 text-xs text-[#98a58a]">试试其他关键词，或清除筛选看看全部清单。</p><button data-clear-filters class="${softButton} mt-5">清除筛选</button></div>`;
  return categories.map(category => {
    const subset = matches.filter(item => item.category === category.id);
    if (!subset.length) return '';
    const total = all.filter(item => item.category === category.id);
    const done = total.filter(item => storage.get().checked[item.id]).length;
    return `<section class="self-start overflow-hidden rounded-xl border border-[#e3e8d9] bg-white"><div class="border-b border-[#e9edde] bg-[#fbfcf7] p-4"><div class="flex items-center gap-2.5"><span class="grid h-8 w-8 place-items-center rounded-lg bg-[#edf2e4] text-lg text-[#82986c]">${icon(category.icon)}</span><h2 class="flex-1 text-sm font-semibold">${category.name}</h2><span class="text-[10px] text-[#8c9a7b]">${done} / ${total.length}</span></div><p class="mt-2 text-[9px] text-[#a6ae98]">${category.note}</p></div><div class="px-4">${subset.map(itemMarkup).join('')}</div></section>`;
  }).join('');
}
export function renderPacking() {
  return `${pageHeading('PACK LIGHT · TRAVEL WELL', '把安心，一件件装好。', '按三大一小、8 天行程整理。按实际使用习惯增减，勾选即自动保存。', `<button data-add class="${buttonClass}">${icon('add-line')} 添加物品</button>`)}
    ${storage.protected() ? `<section class="mb-5 rounded-xl border border-[#d5bfa0] bg-[#f6f2e5] p-4 text-sm leading-7 text-[#806528]"><h2 class="font-semibold">原始旅行数据已保护</h2><p>当前显示本次会话数据，不会覆盖无法读取的原记录。普通备份仅导出当前会话。请先保存原始文件；确认导入有效备份后才解除写保护。</p>${storage.rawBackup() !== null ? `<button data-export-original class="${softButton} mt-3">导出原始数据（可能含私人信息）</button>` : ''}</section>` : ''}
    <div id="packing-summary" aria-live="polite">${summary()}</div>
    <section class="my-5 rounded-xl border border-[#e3e8d9] bg-white p-4"><div class="flex flex-wrap gap-3"><label class="relative min-w-[180px] flex-1"><span class="absolute left-3 top-2.5 text-[#a0ac92]">${icon('search-line')}</span><input id="packing-search" type="search" aria-label="搜索物品" placeholder="搜索物品，比如：羽绒服、证件…" value="${escape(filters.query)}" class="${inputClass} pl-9 placeholder:text-[#adb69e]"></label><select id="packing-owner" aria-label="按使用人筛选" class="${inputClass} w-auto"><option value="all">所有成员</option>${['全家', '成人', '宝宝', '长辈'].map(owner => `<option ${filters.owner === owner ? 'selected' : ''}>${owner}</option>`).join('')}</select><select id="packing-status" aria-label="按准备状态筛选" class="${inputClass} w-auto">${[['all', '全部状态'], ['todo', '尚未准备'], ['done', '已经准备'], ['essential', '重点物品']].map(([value, label]) => `<option value="${value}" ${filters.status === value ? 'selected' : ''}>${label}</option>`).join('')}</select></div>
    <div class="mt-4 flex flex-wrap gap-2" role="group" aria-label="物品分类">${[{ id: 'all', name: '全部清单', icon: 'apps-line' }, ...categories].map(category => `<button data-category="${category.id}" aria-pressed="${filters.category === category.id}" class="rounded-lg border px-3 py-2 text-[10px] ${filters.category === category.id ? 'border-[#829d6c] bg-[#eaf1df] text-[#5e7a45]' : 'border-[#e8ecdf] bg-white text-[#9aa58c] hover:bg-[#f5f8ee]'}">${icon(category.icon, 'mr-1')} ${category.name}</button>`).join('')}</div></section>
    <div id="packing-cards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">${cards()}</div>
    <div class="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e2e7d8] bg-white p-4"><p class="text-[10px] leading-5 text-[#a0aa92]">${icon('save-line', 'mr-1')} 仅保存在当前浏览器，不会自动同步给同行人。<br>换设备前请导出备份，可在另一台设备导入。</p><div class="flex flex-wrap gap-2"><button data-export class="${softButton} px-3 py-2 text-[11px]">${icon('download-2-line')} 导出备份</button><button data-import class="${softButton} px-3 py-2 text-[11px]">${icon('upload-2-line')} 导入备份</button><button data-reset class="rounded-lg px-3 py-2 text-[11px] text-[#b29e81] hover:bg-[#f8f2e7]">重置勾选</button><input id="backup-file" type="file" accept=".json,application/json" class="hidden" aria-label="选择备份文件"></div></div>`;
}
export function bindPacking(root, rerender) {
  const redraw = () => {
    root.querySelector('#packing-summary').innerHTML = summary();
    root.querySelector('#packing-cards').innerHTML = cards();
  };
  root.querySelector('#packing-search').addEventListener('input', event => { filters.query = event.target.value; redraw(); });
  root.querySelector('#packing-owner').addEventListener('change', event => { filters.owner = event.target.value; redraw(); });
  root.querySelector('#packing-status').addEventListener('change', event => { filters.status = event.target.value; redraw(); });
  root.addEventListener('change', event => {
    if (!event.target.matches('[data-check]')) return;
    const id = event.target.dataset.check;
    storage.toggle(id, event.target.checked); redraw();
    const target = [...root.querySelectorAll('[data-check]')].find(input => input.dataset.check === id);
    (target || root.querySelector('#packing-status')).focus({ preventScroll: true });
  });
  root.addEventListener('click', event => {
    const category = event.target.closest('[data-category]');
    if (category) { filters.category = category.dataset.category; rerender(false); }
    if (event.target.closest('[data-clear-filters]')) { Object.assign(filters, { query: '', category: 'all', owner: 'all', status: 'all' }); rerender(false); }
    const remove = event.target.closest('[data-remove]');
    if (remove) confirmModal('删除自定义物品？', '这只会删除该自定义物品，内置清单和其他勾选不受影响。', () => { storage.remove(remove.dataset.remove); redraw(); toast('已删除该物品'); }, '删除物品');
  });
  root.querySelector('[data-add]').addEventListener('click', () => {
    openModal('给行李箱加一件物品', `<form id="add-item" class="space-y-4"><label class="block"><span class="mb-2 block text-xs text-[#879677]">物品名称</span><input name="name" required maxlength="80" autofocus placeholder="比如：宝宝最喜欢的小熊" class="${inputClass}"></label><div class="grid grid-cols-2 gap-3"><label><span class="mb-2 block text-xs text-[#879677]">物品分类</span><select name="category" class="${inputClass}">${categories.map(category => `<option value="${category.id}" ${category.id === filters.category ? 'selected' : ''}>${category.name}</option>`).join('')}</select></label><label><span class="mb-2 block text-xs text-[#879677]">谁来用</span><select name="owner" class="${inputClass}">${['全家', '成人', '宝宝', '长辈'].map(owner => `<option>${owner}</option>`).join('')}</select></label></div><label class="block"><span class="mb-2 block text-xs text-[#879677]">数量或备注</span><input name="detail" maxlength="200" placeholder="要带几件？放在哪个包里？" class="${inputClass}"></label><label class="flex items-center gap-2 text-xs text-[#839574]"><input name="essential" type="checkbox" class="h-4 w-4">标记为重点物品</label><div class="flex justify-end gap-2 pt-3"><button type="button" data-close class="${softButton}">取消</button><button type="submit" class="${buttonClass}">加入清单 ${icon('add-line')}</button></div></form>`, (dialog, close) => {
      dialog.querySelector('form').addEventListener('submit', event => {
        event.preventDefault();
        const form = new FormData(event.target);
        const name = String(form.get('name')).trim();
        if (!name) { toast('物品名称不能为空'); return; }
        try {
          storage.add({ category: String(form.get('category')), owner: String(form.get('owner')), name, detail: String(form.get('detail')).trim(), essential: form.has('essential') });
          Object.assign(filters, { query: '', category: String(form.get('category')), owner: 'all', status: 'all' });
          close(); rerender(false); toast('新物品已经放进清单');
        } catch (error) { toast(error.message); }
      });
    });
  });
  root.querySelector('[data-reset]').addEventListener('click', () => confirmModal('重新开始整理行李？', '仅重置行李勾选。自定义物品、每日备注、日期、联系人和全部冒险进度都会保留，不解除原数据写保护。', () => { storage.reset(); redraw(); toast(storage.available() ? '已重置行李勾选' : '仅在当前会话重置，尚未保存'); }, '重置行李勾选'));
  root.querySelector('[data-export]').addEventListener('click', () => {
    confirmModal('导出旅行备份', '备份包含清单、每日备注、日期、联系人及冒险进度，可能含私人信息。新版备份不保证可被旧版网站读取；写保护期间仅导出当前会话。请妥善保管。', () => { download('北疆慢游记-旅行备份.json', JSON.stringify(storage.get(), null, 2), 'application/json'); toast('当前旅行数据已导出'); }, '导出备份');
  });
  root.querySelector('[data-export-original]')?.addEventListener('click', () => {
    confirmModal('保存原始旅行数据？', '原始文件未经修复，可能包含联系人与私人备注。仅保存在你的设备上，不上传；请勿随意分享。', () => { const raw = storage.rawBackup(); if (raw !== null) download('北疆慢游记-原始数据.txt', raw, 'text/plain;charset=utf-8'); }, '保存原始文件');
  });
  const fileInput = root.querySelector('#backup-file');
  root.querySelector('[data-import]').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0]; if (!file) return;
    try {
      if (file.size > 1024 * 1024) throw new Error('备份文件不能大于 1 MB');
      if (!/^[^\u0000/\\]+\.json$/i.test(file.name) || (file.type && !['application/json', 'text/json', 'text/plain'].includes(file.type))) throw new Error('请选择 JSON 备份文件');
      const data = validateState(JSON.parse(await file.text()));
      confirmModal('用备份替换当前旅行数据？', '将整体替换清单、备注、日期、联系人和冒险进度，并解除原数据写保护。旧版备份会把冒险进度置空。请先导出当前及受保护的原始数据；不会与现有记录合并。', () => {
        try { storage.replace(data); Object.assign(filters, { query: '', category: 'all', owner: 'all', status: 'all' }); rerender(false); toast('备份已恢复并保存'); }
        catch { toast('无法保存备份，原数据未替换，请保留备份文件'); }
      }, '确认替换并保存');
    } catch (error) { toast(error instanceof SyntaxError ? '文件不是有效的 JSON 备份' : error.message); }
    finally { fileInput.value = ''; }
  });
}
