import { packingItems, categories, adventureChapters } from './data.js';

export const STORAGE_KEY = 'north-xinjiang-family-v1';
const emptyAdventure = () => ({ tasks: {}, read: {}, choices: {}, endingRead: false });
const defaultState = () => ({ version: 2, checked: {}, custom: [], notes: {}, startDate: '', contacts: { driver: '', steward: '' }, adventure: emptyAdventure() });
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
const chapterIds = new Set(adventureChapters.map(chapter => String(chapter.id)));
const taskIds = new Set(adventureChapters.flatMap(chapter => chapter.tasks.map(task => task.id)));
function rejectUnsafeKeys(input) {
  const queue = [{ value: input, depth: 0 }];
  let count = 0;
  while (queue.length) {
    const { value, depth } = queue.pop();
    if (++count > 15000 || depth > 12) throw new Error('备份结构超出允许范围');
    if (value === null || typeof value !== 'object') continue;
    if (!Array.isArray(value) && !plain(value)) throw new Error('备份对象格式不正确');
    for (const key of Object.keys(value)) {
      if (['__proto__', 'prototype', 'constructor'].includes(key)) throw new Error('备份包含非法字段');
      queue.push({ value: value[key], depth: depth + 1 });
    }
  }
}
function validateAdventure(input) {
  if (!plain(input) || Object.keys(input).some(key => !['tasks', 'read', 'choices', 'endingRead'].includes(key)) || typeof input.endingRead !== 'boolean') throw new Error('冒险进度格式不正确');
  const result = emptyAdventure();
  for (const [field, allowed] of [['tasks', taskIds], ['read', chapterIds]]) {
    if (!plain(input[field]) || Object.keys(input[field]).length > allowed.size) throw new Error('冒险进度超出允许范围');
    for (const [key, value] of Object.entries(input[field])) {
      if (!allowed.has(key) || typeof value !== 'boolean') throw new Error('备份包含未知任务或章节');
      if (value) result[field][key] = true;
    }
  }
  if (!plain(input.choices) || Object.keys(input.choices).length > 3) throw new Error('冒险选择格式不正确');
  for (const [key, value] of Object.entries(input.choices)) {
    const chapter = adventureChapters.find(item => String(item.id) === key);
    if (!chapter?.choice?.options.some(option => option.id === value)) throw new Error('备份包含未知剧情选择');
    result.choices[key] = value;
  }
  result.endingRead = input.endingRead;
  return result;
}
const categoryIds = new Set(categories.map(category => category.id));
const owners = new Set(['全家', '成人', '宝宝', '长辈']);
export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && date.getFullYear() >= 2020 && date.getFullYear() <= 2100 && date.getFullYear() === Number(value.slice(0, 4)) && date.getMonth() + 1 === Number(value.slice(5, 7)) && date.getDate() === Number(value.slice(8));
}
export function validateState(input) {
  rejectUnsafeKeys(input);
  if (!plain(input) || ![1, 2].includes(input.version) || !plain(input.checked) || !Array.isArray(input.custom)) throw new Error('不是有效的北疆慢游记备份，或版本暂不支持');
  if (input.custom.length > 300) throw new Error('自定义物品最多 300 项');
  const result = defaultState();
  result.version = 2;
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
  if (input.version === 2) result.adventure = validateAdventure(input.adventure);
  return result;
}
let state = defaultState();
let available = true;
let warning = '';
let writeProtected = false;
let migratedFrom = 0;
let originalRaw = null;
try {
  originalRaw = localStorage.getItem(STORAGE_KEY);
  if (originalRaw !== null) {
    if (originalRaw.length > 1024 * 1024) throw new Error('本地数据过大');
    const parsed = JSON.parse(originalRaw);
    migratedFrom = parsed?.version === 1 ? 1 : 0;
    state = validateState(parsed);
    originalRaw = null;
  }
} catch {
  available = false;
  writeProtected = true;
  warning = '原旅行数据暂时无法读取，已启用写保护；当前操作仅在内存中。请在清单页导出原始数据或确认导入有效备份，不会自动覆盖原记录。';
}
function persist(force = false) {
  if (writeProtected && !force) available = false;
  else {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); available = true; }
    catch { available = false; }
  }
  window.dispatchEvent(new CustomEvent('trip-saved', { detail: { available } }));
  return available;
}
export const storage = {
  pendingMigration: !writeProtected && migratedFrom === 1,
  migrateIfNeeded() {
    // 版本 1 数据只在读取阶段记录一次；这里负责把迁移结果写回磁盘。
    if (migratedFrom !== 1 || writeProtected) return false;
    migratedFrom = 0;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); available = true; }
    catch { available = false; }
    window.dispatchEvent(new CustomEvent('trip-saved', { detail: { available } }));
    return available;
  },
  get: () => state,
  available: () => available,
  warning: () => warning,
  protected: () => writeProtected,
  rawBackup: () => originalRaw,
  items: () => [...packingItems, ...state.custom],
  toggle(id, value) {
    if (!this.items().some(item => item.id === id)) return;
    if (value) state.checked[id] = true; else delete state.checked[id];
    persist();
  },
  add(value) {
    if (state.custom.length >= 300) throw new Error('自定义物品已达 300 项上限');
    if (!globalThis.crypto?.getRandomValues) throw new Error('当前浏览器不支持安全生成物品编号');
    const id = `custom-${Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('')}`;
    state = validateState({ ...state, custom: [...state.custom, { ...value, id }] });
    persist();
  },
  remove(id) { state.custom = state.custom.filter(item => item.id !== id); delete state.checked[id]; persist(); },
  reset() { state.checked = {}; persist(); },
  setNote(day, text) { if (chapterIds.has(String(day))) { state.notes[day] = String(text).slice(0, 2000); persist(); } },
  settings(date, contacts) {
    if (date && !validDate(date)) throw new Error('请选择有效的出发日期');
    state.startDate = date;
    state.contacts = { driver: String(contacts.driver || '').slice(0, 100), steward: String(contacts.steward || '').slice(0, 100) };
    persist();
  },
  replace(input) {
    const next = validateState(input);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch { throw new Error('无法保存备份，原数据未替换；请保留备份文件'); }
    state = next; available = true; writeProtected = false; originalRaw = null; warning = '';
    window.dispatchEvent(new CustomEvent('trip-saved', { detail: { available } }));
    return true;
  },
  setAdventureTask(id, checked) {
    if (!taskIds.has(id) || typeof checked !== 'boolean') return false;
    if (checked) state.adventure.tasks[id] = true; else delete state.adventure.tasks[id];
    return persist();
  },
  setAdventureReading(day, value) {
    if (!chapterIds.has(String(day)) || typeof value !== 'boolean') return false;
    if (value) state.adventure.read[day] = true; else delete state.adventure.read[day];
    return persist();
  },
  chooseAdventure(day, choice) {
    const chapter = adventureChapters.find(item => item.id === day);
    if (!chapter?.choice?.options.some(option => option.id === choice)) return false;
    state.adventure.choices[day] = choice;
    return persist();
  },
  readAdventureEnding(value) {
    if (typeof value !== 'boolean') return false;
    state.adventure.endingRead = value;
    return persist();
  },
  resetAdventure() { state.adventure = emptyAdventure(); return persist(); },
  adventureStatus(day) {
    const chapter = adventureChapters.find(item => item.id === day);
    if (!chapter) return { done: 0, core: 0, field: false, reading: false, unlocked: false };
    const done = chapter.tasks.filter(task => state.adventure.tasks[task.id]).length;
    const core = chapter.tasks.filter(task => !task.optional && state.adventure.tasks[task.id]).length;
    const field = core >= 2;
    const reading = state.adventure.read[day] === true;
    return { done, core, field, reading, unlocked: field || reading };
  },
  adventureStats() {
    const chapters = adventureChapters.map(chapter => ({ id: chapter.id, ...this.adventureStatus(chapter.id) }));
    const clues = chapters.filter(chapter => chapter.unlocked).length;
    return { tasks: chapters.reduce((sum, chapter) => sum + chapter.done, 0), total: taskIds.size, field: chapters.filter(chapter => chapter.field).length, reading: chapters.filter(chapter => chapter.reading && !chapter.field).length, clues, next: chapters.find(chapter => !chapter.unlocked)?.id || 8, ending: clues === 8 || state.adventure.endingRead };
  },
  stats() {
    const items = this.items();
    const done = items.filter(item => state.checked[item.id]).length;
    return { total: items.length, done, percent: items.length ? Math.round(done / items.length * 100) : 0, essentialLeft: items.filter(item => item.essential && !state.checked[item.id]).length };
  }
};
