import { CalculateByPeriod } from './weather.js';
import { CalculateByYear } from './forecast.js';
import { PrintGraph } from './graph.js';


export const
  baseTemp = parseFloat(document.getElementById('base-temp').value),
  chartObj = { chart: null };

export const byPeriod = document.getElementById('by-year');

Date.prototype.withoutTime = function () {
  let d = new Date(this);
  d.setHours(0, 0, 0, 0);
  return d; // Вернуть объект даты без информации о времени
};

export async function main() {
  const dateRangeData = GetDate(document.getElementById('start-date').value, document.getElementById('end-date').value);
  console.log(`dateRangeData`, dateRangeData);

  try {
    if (!byPeriod.checked) {
      let totalData = await CalculateByYear(dateRangeData);

      if (!totalData)
        throw new Error('Не удалось произвести расчёт, попробуйте позже или измените параметры')
      PrintResult(totalData);
      document.getElementById('loader').style.display = 'none';
    }
    else {
      let totalData = await CalculateByPeriod(dateRangeData);
      if (!totalData)
        throw new Error('Не удалось произвести расчёт, попробуйте позже или измените параметры')
      PrintResult(totalData)
      document.getElementById('loader').style.display = 'none';
    }
  } catch (error) {
    console.error('Ошибка:', error);
    const output = document.getElementById('output');
    const outputToday = document.getElementById('output__today');
    const outputOptimal = document.getElementById('output__optimal');
    if (output) output.style.display = 'block';
    if (outputToday) {
      outputToday.textContent =
        'Ошибка. Не удалось рассчитать эффективную температуру. Попробуйте изменить параметры.';
    }
    if (outputOptimal) outputOptimal.textContent = '';
    return null;
  }
}

// ? Вспомогательные Функции

function GetDate(startDate, endDate) {
  const data = {
    startDatePoint: startDate,
    startDateMinus: DateParseForAPI(startDate),
    endDatePoint: endDate,
    endDateMinus: DateParseForAPI(endDate),
  }
  const
    selectedYear = new Date(data.startDateMinus).getFullYear(),
    currentYear = new Date().getFullYear();
  if (!byPeriod.checked) {
    if (selectedYear === currentYear) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      // console.log("SELECTED DAY", new Date(data.startDateMinus).withoutTime().getTime())
      // console.log("TODAY", new Date().withoutTime().getTime())
      if (new Date(data.startDateMinus).withoutTime().getTime() < new Date().withoutTime().getTime()) {
        data.endDateMinus = yesterday.toLocaleDateString('en-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        // console.log('endDateMinus', data.endDateMinus)
      }
      // console.log('check')
    }
    else {
      data.endDateMinus = `${selectedYear}-12-31`;
    }
  }
  return data;
}

// Изменение формата записи с ДД.ММ.ГГГГ до ГГГГ-ММ-ДД
export function DateParseForAPI(date) {
  const [day, month, year] = date.split('.');
  return `${year}-${month}-${day}`;
}


// ! Вывод результата

function GetPluralValues(count, rules) {
  const result = new Intl.PluralRules('ru-RU').select(count);
  switch (result) {
    case 'one': {
      return `${count} ${rules[0]}`
    }
    case 'few': {
      return `${count} ${rules[1]}`
    }
    default: {
      return `${count} ${rules[2]}`
    }
  }
}

export function PrintResult(data) {
  const clearData = RemoveRepeatingGroups(data, 5);
  if (clearData.date.length === 0 || clearData.temp.length === 0) {
    const output = document.getElementById('output');
    const outputToday = document.getElementById('output__today');
    const outputOptimal = document.getElementById('output__optimal');
    if (output) output.style.display = 'block';
    if (outputToday) outputToday.textContent = 'Недостаточно данных для расчёта.';
    if (outputOptimal) outputOptimal.textContent = '';
    return;
  }
  const todayDate = getFormattedToday();
  const todayIndex = getIndexAtOrBeforeDate(clearData.date, todayDate);

  // console.log('clearData.date.length - 1', clearData.date.length - 1);
  // console.log('clearData.date', clearData.date);
  // console.log('todayIndex', todayIndex);

  PrintEffectiveTemp(clearData, OptimalHarvestingTiming(clearData), todayIndex);

  PrintGraph(clearData, todayIndex);
}
function getFormattedToday() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  // console.log('`${day}.${month}.${year}`', `${day}.${month}.${year}`);

  return `${day}.${month}.${year}`;
}

function CompareDates(date1, date2) {
  const [d1, m1, y1] = date1.split('.').map(Number);
  const [d2, m2, y2] = date2.split('.').map(Number);

  const dt1 = new Date(y1, m1 - 1, d1);
  const dt2 = new Date(y2, m2 - 1, d2);

  if (dt1 < dt2) return -1;
  if (dt1 > dt2) return 1;
  return 0;
}

function getIndexAtOrBeforeDate(dates, targetDate) {
  if (!dates.length) return -1;
  if (CompareDates(targetDate, dates[0]) < 0) return -1;
  if (CompareDates(targetDate, dates[dates.length - 1]) > 0) return -1;
  let index = -1;
  for (let i = 0; i < dates.length; i++) {
    if (CompareDates(dates[i], targetDate) <= 0) {
      index = i;
    } else {
      break;
    }
  }
  return index === -1 ? dates.length - 1 : index;
}

function RemoveRepeatingGroups(data, limit = 10) {
  let { temp, date } = DeleteZeroFromStart(data);
  if (temp.length === 0) {
    return { ...data, temp, date };
  }

  const lastValue = temp[temp.length - 1];
  let i = temp.length - 1;
  while (i >= 0 && temp[i] === lastValue) {
    i--;
  }
  const repeatCount = temp.length - 1 - i;
  if (repeatCount > limit) {
    const newLength = temp.length - (repeatCount - limit);
    temp = temp.slice(0, newLength);
    date = date.slice(0, newLength);
  }

  return { ...data, temp, date };
}

function DeleteZeroFromStart(data) {
  let startIndex = 0;
  while (startIndex < data.temp.length && data.temp[startIndex] === 0) {
    startIndex++;
  }
  const temp = data.temp.slice(startIndex);
  const date = data.date.slice(startIndex);
  return { temp, date }
}

function PrintEffectiveTemp(totalData, optimalHarvestingTiming, todayIndex) {
  let introWord = 'Начиная с';
  if (!byPeriod.checked) {
    introWord = 'Со дня сева'
  }
  document.getElementById('output').style.display = 'block';
  // console.log('totalData.temp[todayIndex]', totalData.temp);

  if (todayIndex < 0 || totalData?.temp?.[todayIndex] == null) {
    const outputToday = document.getElementById('output__today');
    if (outputToday) {
      outputToday.textContent =
        'Данных на сегодняшний день нет для выбранного периода.';
    }
  } else {
  document.getElementById('output__today').innerHTML =
    `
    ${introWord} <u>${totalData.date[0]}</u> до <u> ${totalData.date[todayIndex]}</u> за ${GetPluralValues(totalData.date.length, ["день", "дня", "дней"])} накопится <b>${totalData.temp[todayIndex].toFixed(0)}°C</b> эффективных температур.`;
  }
  /*   if (totalData?.temp?.[todayIndex] != null) {
      document.getElementById('output__today').innerHTML = `
      На сегодняшний день накоплено: <b>${totalData.temp[todayIndex]}°C</b>`
    } */


  if (!optimalHarvestingTiming) {
    document.getElementById('output__optimal').innerHTML =
      `
      Оптимальные сроки уборки кукурузы на силос <b> не определены</b>
    `;
  } else {
    // console.log('optimalHarvestingTiming', optimalHarvestingTiming)
    document.getElementById('output').style.display = 'block'
    document.getElementById('output__optimal').innerHTML =
      `Оптимальный срок уборки кукурузы на силос с <b><u> ${optimalHarvestingTiming.optimalStartDate}</u></b> до <b><u> ${optimalHarvestingTiming.optimalEndDate}</u></b> `;
  }
}

function OptimalHarvestingTiming(data) {
  const dataset = data.temp;
  let
    xMinIndex = null,
    xMaxIndex = null;

  dataset.forEach((value, index) => {
    if (value >= 850 && value <= 950) {
      if (xMinIndex === null) xMinIndex = index;
      xMaxIndex = index;
    }
  });

  if (xMinIndex !== null && xMaxIndex !== null) {
    return {
      optimalStartDate: data.date[xMinIndex],
      optimalEndDate: data.date[xMaxIndex]
    }
  }
  return null
}
