import { packingItems, categories } from './data.js';

const KEY = 'north-xinjiang-family-v1';
const defaultState = () => ({ version: 1, checked: {}, custom: [], notes: {}, startDate: '', contacts: { driver: '', steward: '' } });
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const categoryIds = new Set(categories.map(category => category.id));
const owners = new Set(['全家', '成人', '宝宝', '长辈']);
export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && date.getFullYear() >= 2020 && date.getFullYear() <= 2100 && date.getFullYear() === Number(value.slice(0, 4)) && date.getMonth() + 1 === Number(value.slice(5, 7)) && date.getDate() === Number(value.slice(8));
}
export function validateState(input) {
  if (!plain(input) || input.version !== 1 || !plain(input.checked) || !Array.isArray(input.custom)) throw new Error('不是有效的北疆慢游记备份');
  if (input.custom.length > 300) throw new Error('自定义物品最多 300 项');
  const result = defaultState();
  const seen = new Set(packingItems.map(item => item.id));
  for (const value of input.custom) {
    if (!plain(value) || typeof value.id !== 'string' || !/^custom-[a-zA-Z0-9-]{1,80}$/.test(value.id) || seen.has(value.id) || !categoryIds.has(value.category) || typeof value.name !== 'string' || !value.name.trim() || value.name.length > 80 || !owners.has(value.owner) || typeof value.detail !== 'string' || value.detail.length > 200) throw new Error('备份中的自定义物品格式不正确');
    seen.add(value.id);
    result.custom.push({ id: value.id, category: value.category, name: value.name.trim(), detail: value.detail, owner: value.owner, essential: value.essential === true });
  }
  for (const id of seen) if (input.checked[id] === true) result.checked[id] = true;
  if (plain(input.notes)) for (let day = 1; day <= 8; day++) if (typeof input.notes[day] === 'string') result.notes[day] = input.notes[day].slice(0, 2000);
  if (input.startDate && !validDate(input.startDate)) throw new Error('备份中的出发日期格式不正确');
  result.startDate = input.startDate || '';
  if (plain(input.contacts)) for (const key of ['driver', 'steward']) if (typeof input.contacts[key] === 'string') result.contacts[key] = input.contacts[key].slice(0, 100);
  return result;
}
let state = defaultState();
let available = true;
let warning = '';
try {
  const raw = localStorage.getItem(KEY);
  if (raw) state = validateState(JSON.parse(raw));
} catch {
  warning = '本地数据无法读取，本次从空清单开始；可尝试导入备份。';
}
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); available = true; }
  catch { available = false; }
  window.dispatchEvent(new CustomEvent('trip-saved', { detail: { available } }));
  return available;
}
export const storage = {
  get: () => state,
  available: () => available,
  warning: () => warning,
  items: () => [...packingItems, ...state.custom],
  toggle(id, value) {
    if (!this.items().some(item => item.id === id)) return;
    if (value) state.checked[id] = true; else delete state.checked[id];
    persist();
  },
  add(value) {
    if (state.custom.length >= 300) throw new Error('自定义物品已达 300 项上限');
    const id = `custom-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
    state = validateState({ ...state, custom: [...state.custom, { ...value, id }] });
    persist();
  },
  remove(id) { state.custom = state.custom.filter(item => item.id !== id); delete state.checked[id]; persist(); },
  reset() { state.checked = {}; persist(); },
  setNote(day, text) { if (Number(day) >= 1 && Number(day) <= 8) { state.notes[day] = String(text).slice(0, 2000); persist(); } },
  settings(date, contacts) {
    if (date && !validDate(date)) throw new Error('请选择有效的出发日期');
    state.startDate = date;
    state.contacts = { driver: String(contacts.driver || '').slice(0, 100), steward: String(contacts.steward || '').slice(0, 100) };
    persist();
  },
  replace(input) { state = validateState(input); persist(); },
  stats() {
    const items = this.items();
    const done = items.filter(item => state.checked[item.id]).length;
    return { total: items.length, done, percent: items.length ? Math.round(done / items.length * 100) : 0, essentialLeft: items.filter(item => item.essential && !state.checked[item.id]).length };
  }
};
