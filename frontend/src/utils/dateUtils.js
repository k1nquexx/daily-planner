export function formatLocalDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(str) {
  if (!str) return new Date();
  const parts = str.split('-');
  if (parts.length !== 3) return new Date(str);
  const [y, m, d] = parts.map(Number);
  return new Date(y, m - 1, d);
}

export function getTodayStr() {
  return formatLocalDate(new Date());
}

export function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatLocalDate(d);
}

export function getTomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatLocalDate(d);
}

export function formatDateTitle(dateStr) {
  const today = getTodayStr();
  const yesterday = getYesterdayStr();
  const tomorrow = getTomorrowStr();

  const d = parseLocalDate(dateStr);

  let prefix = '';
  if (dateStr === today) prefix = 'Сегодня, ';
  else if (dateStr === yesterday) prefix = 'Вчера, ';
  else if (dateStr === tomorrow) prefix = 'Завтра, ';

  const options = { day: 'numeric', month: 'short' };
  return prefix + d.toLocaleDateString('ru-RU', options);
}
