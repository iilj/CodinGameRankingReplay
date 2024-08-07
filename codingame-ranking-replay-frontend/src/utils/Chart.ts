import dataFormat from 'dateformat';

export const getDatetimeTicks = (start_time_unix: number, end_time_unix: number): number[] => {
  const contestDurationHours = (end_time_unix - start_time_unix) / 3600;
  let interval_sec = 3600;
  if (contestDurationHours <= 6) {
    interval_sec = 1800; // 6 時間以内なら 0.5 時間ごとに
  } else if (contestDurationHours <= 12) {
    interval_sec = 3600; // 12 時間以内なら 1 時間ごとに
  } else if (contestDurationHours <= 24) {
    interval_sec = 3600 * 2; // 24 時間以内なら 2 時間ごとに
  } else if (contestDurationHours <= 24 * 3) {
    interval_sec = 3600 * 6; // 3 日以内なら 6 時間ごとに
  } else {
    interval_sec = 3600 * 24; // 1 日ごと
  }
  const offsetMinutes: number = new Date(0).getTimezoneOffset(); // -9*60 in Asia/Tokyo (JST)
  const ret: number[] = [start_time_unix];
  for (
    let cur = start_time_unix - ((start_time_unix - 60 * offsetMinutes) % interval_sec) +
      interval_sec;
    cur < end_time_unix;
    cur += interval_sec
  ) {
    ret.push(cur);
  }
  ret.push(end_time_unix);
  return ret;
};

export const getDatetimeTickFormatter = (
  start_time_unix: number, end_time_unix: number
): ((time_unix: number) => string) => {
  const contestDurationHours = (end_time_unix - start_time_unix) / 3600;
  let format = '';
  if (contestDurationHours <= 12) {
    format = 'HH:MM'; // 12 時間以内なら 1 時間ごとに
  } else if (contestDurationHours <= 24) {
    format = 'HH:MM'; // 24 時間以内なら 2 時間ごとに
  } else if (contestDurationHours <= 24 * 3) {
    format = 'mm/dd HH:MM'; // 3 日以内なら 6 時間ごとに
  } else {
    format = 'mm/dd'; // 1 日ごと
  }
  return (time_unix: number) => dataFormat(new Date(time_unix * 1000), format);
};

export const chartLineColors = [
  '#1F77B4',
  '#FF7F0E',
  '#2CA02C',
  '#D62728',
  '#9467BD',
  '#8C564B',
  '#E377C2',
  '#7D7F7F',
  '#BCBD22',
  '#17BECF',
];
export const getChartLineColor = (index: number): string =>
  chartLineColors[index % chartLineColors.length];

export const getRankTicks = (ma: number): number[] => {
  const ret: number[] = [0];
  let d = Math.pow(10, Math.floor(Math.log10(ma) - 0.1));
  let ma0 = d * Math.ceil(ma / d);
  if (ma0 / d < 3) {
    d /= 5;
    ma0 = d * Math.ceil(ma / d);
  }
  if (ma0 / d < 5) {
    d /= 2;
    ma0 = d * Math.ceil(ma / d);
  }
  let cur = 0;
  while (cur < ma0) {
    cur += d;
    ret.push(cur);
  }
  return ret;
};