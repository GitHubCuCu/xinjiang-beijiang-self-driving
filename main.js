import { sources } from './data.js';
import { storage, STORAGE_KEY } from './store.js';
import { shell, icon, openModal, toast, escape, inputClass, softButton, buttonClass } from './ui.js';
import { renderOverview } from './overview.js';
import { renderItinerary, bindItinerary, renderAdventure, bindAdventure } from './itinerary.js';
import { renderPacking, bindPacking } from './packing.js';
import { renderGuide } from './guide.js';

const pages = new Set(['overview', 'itinerary', 'adventure', 'packing', 'guide']);
const titles = { overview: '旅行总览', itinerary: '每日行程', adventure: '历史冒险', packing: '行前清单', guide: '安心出行' };
const app = document.querySelector('#app');
const validDay = value => /^[1-8]$/.test(String(value ?? ''));
function currentRoute() {
  const [requested, requestedDay] = String(location.hash.slice(1)).split('/');
  const page = pages.has(requested) ? requested : 'overview';
  const explicit = validDay(requestedDay);
  return { page, day: explicit ? Number(requestedDay) : 1, explicit };
}
function render(scroll = true) {
  const { page, day, explicit } = currentRoute();
  const content = page === 'itinerary' ? renderItinerary(day) : page === 'adventure' ? renderAdventure(day) : page === 'packing' ? renderPacking() : page === 'guide' ? renderGuide() : renderOverview();
  app.innerHTML = shell(page, content);
  document.title = `${titles[page]} · 北疆慢游记`;
  const main = app.querySelector('main');
  if (page === 'packing') bindPacking(main, render);
  if (page === 'itinerary') bindItinerary(main);
  if (page === 'adventure') bindAdventure(main);
  storage.migrateIfNeeded();
  if (scroll) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if ((page === 'itinerary' || page === 'adventure') && explicit) requestAnimationFrame(() => {
      const card = page === 'itinerary' ? app.querySelector(`[data-day="${day}"]`) : app.querySelector('[data-adventure-day]');
      card?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      (page === 'itinerary' ? card?.querySelector('summary') : app.querySelector('#adventure-chapter-title'))?.focus({ preventScroll: true });
    });
    else document.querySelector('#page-title')?.focus({ preventScroll: true });
  }
  if (!storage.available()) updateSaveStatus(false);
}
function updateSaveStatus(available) {
  const status = document.querySelector('[data-save-status]');
  if (status) status.innerHTML = `${icon(available ? 'check-double-line' : 'error-warning-line')} ${available ? '已保存至当前浏览器' : '无法本地保存，请导出备份'}`;
}
function settings() {
  const state = storage.get();
  openModal('我们的旅行设置', `<form id="trip-settings" class="space-y-5"><label class="block"><span class="mb-2 block text-xs text-[#829370]">D1 出发日期（可留空）</span><input name="startDate" type="date" min="2020-01-01" max="2100-12-24" value="${escape(state.startDate)}" class="${inputClass}"><span class="mt-2 block text-[10px] leading-5 text-[#a1ab92]">设置后，8 天行程会自动标注日期。票务和集合统一使用北京时间。</span></label><label class="block"><span class="mb-2 block text-xs text-[#829370]">行程师傅</span><input name="driver" value="${escape(state.contacts.driver)}" maxlength="100" placeholder="姓名 / 电话 / 联系方式" class="${inputClass}"></label><label class="block"><span class="mb-2 block text-xs text-[#829370]">行程管家</span><input name="steward" value="${escape(state.contacts.steward)}" maxlength="100" placeholder="姓名 / 电话 / 联系方式" class="${inputClass}"></label><p class="rounded-lg bg-[#f0f4e7] p-3 text-[10px] leading-6 text-[#94a180]">仅存于当前浏览器，不会上传服务器。清除浏览器数据可能丢失记录；可在行前清单页导出备份。</p><div class="flex justify-end gap-3"><button data-close type="button" class="${softButton}">取消</button><button type="submit" class="${buttonClass}">${icon('check-line')} 保存设置</button></div></form>`, (dialog, close) => {
    dialog.querySelector('form').addEventListener('submit', event => {
      event.preventDefault();
      const form = new FormData(event.target);
      try {
        storage.settings(String(form.get('startDate')), { driver: form.get('driver'), steward: form.get('steward') });
        close(); render(false); toast(storage.available() ? '旅行设置已保存' : '当前浏览器无法保存，请及时导出备份');
      } catch (error) { toast(error.message); }
    });
  });
}
function source(index) {
  const item = sources[index]; if (!item) return;
  openModal(item.title, `<p class="mb-4 text-[11px] leading-6 text-[#93a183]">保留原始资料供核对，其中营销描述、通用提示和时间范围不代表本次已确认的服务承诺。</p><a href="${item.url}" target="_blank" rel="noopener noreferrer"><img src="${item.url}" alt="${item.title}" class="mx-auto max-h-[50vh] max-w-full rounded-lg object-contain"></a><a href="${item.url}" target="_blank" rel="noopener noreferrer" class="${softButton} mt-4 w-full">${icon('external-link-line')} 打开原尺寸图片</a>`);
}
document.addEventListener('click', event => {
  const action = event.target.closest('[data-action]');
  if (action?.dataset.action === 'settings') settings();
  if (action?.dataset.action === 'source') source(Number(action.dataset.source));
  const anchor = event.target.closest('a[href^="#itinerary/"], a[href^="#adventure/"]');
  if (anchor && anchor.getAttribute('href') === location.hash) { event.preventDefault(); render(true); }
});
let saveErrorShown = false;
window.addEventListener('trip-saved', event => {
  const available = event.detail.available;
  updateSaveStatus(available);
  if (!available && !saveErrorShown) { toast('本地保存不可用，请在清单页导出备份，避免丢失勾选'); saveErrorShown = true; }
});
window.addEventListener('hashchange', () => render(true));
window.addEventListener('storage', event => {
  if (event.key === STORAGE_KEY) toast('另一标签页修改了旅行数据，刷新后可读取最新内容');
});
render(false);
if (storage.warning()) toast(storage.warning());
