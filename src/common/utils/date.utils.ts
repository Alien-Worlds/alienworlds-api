export const parseDateToMs = (fullStr: string) => {
  const [fullDate] = fullStr.split('.');
  const [dateStr, timeStr] = fullDate.split('T');
  const [year, month, day] = dateStr.split('-');
  let hourStr = '0';
  let minuteStr = '0';
  let secondStr = '0';

  if (timeStr) {
    [hourStr, minuteStr, secondStr] = timeStr.split(':');
  }

  const dt = new Date();
  dt.setUTCFullYear(+year);
  dt.setUTCMonth(+month - 1);
  dt.setUTCDate(+day);
  dt.setUTCHours(+hourStr);
  dt.setUTCMinutes(+minuteStr);
  dt.setUTCSeconds(+secondStr);
  dt.setUTCMilliseconds(0);

  return dt.getTime();
};
