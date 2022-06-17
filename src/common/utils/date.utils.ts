export const parseDate = (fullStr: string) => {
  const [fullDate] = fullStr.split('.');
  const [dateStr, timeStr] = fullDate.split('T');
  const [year, month, day] = dateStr.split('-');
  const [hourStr, minuteStr, secondStr] = timeStr.split(':');

  const dt = new Date();
  dt.setUTCFullYear(Number(year));
  dt.setUTCMonth(Number(month) - 1);
  dt.setUTCDate(Number(day));
  dt.setUTCHours(Number(hourStr));
  dt.setUTCMinutes(Number(minuteStr));
  dt.setUTCSeconds(Number(secondStr));

  return dt.getTime();
};
