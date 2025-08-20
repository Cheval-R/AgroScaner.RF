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
    document.getElementById('temperature-sum').textContent =
      'Ошибка. Не удалось рассчитать эффективную температуру. Попробуйте изменить параметры.';
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
      console.log("SELECTED DAY", new Date(data.startDateMinus).withoutTime().getTime())
      console.log("TODAY", new Date().withoutTime().getTime())
      if (new Date(data.startDateMinus).withoutTime().getTime() < new Date().withoutTime().getTime()) {
        data.endDateMinus = yesterday.toLocaleDateString('en-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        console.log('endDateMinus', data.endDateMinus)
      }
      console.log('check')
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
  const clearData = RemoveRepeatingGroups(data, 5)
  const todayIndex = clearData.date.findIndex((element) => element === getFormattedToday());

  PrintEffectiveTemp(clearData, OptimalHarvestingTiming(clearData), todayIndex);

  PrintGraph(clearData, todayIndex);
}
function getFormattedToday() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}.${month}.${year}`;
}

function RemoveRepeatingGroups(data, limit = 10) {
  let { temp, date } = DeleteZeroFromStart(data);
  const tempLengthAfterZero = temp.length;

  while (true) {
    let lastValue = temp[temp.length - 1];
    let count = 0;
    let i = temp.length - 1;

    while (i >= 0 && temp[i] === lastValue) {
      count++;
      i--;
    }

    if (count > limit) {
      temp = temp.filter(value => value !== lastValue);
    } else {
      break;
    }
  }

  let differenceDays = tempLengthAfterZero - temp.length;
  date = date.slice(0, date.length - differenceDays);

  return { ...data, temp, date };
}

function DeleteZeroFromStart(data) {
  let temp = data.temp.filter(item => item !== 0);
  let differenceDays = data.temp.length - temp.length;
  let date = data.date.slice(differenceDays);
  return { temp, date }
}

function PrintEffectiveTemp(totalData, optimalHarvestingTiming, todayIndex) {
  let introWord = 'Начиная с';
  if (!byPeriod.checked) {
    introWord = 'Со дня сева'
  }
  document.getElementById('output').style.display = 'block'
  document.getElementById('output__today').innerHTML =
    `
    ${introWord} <u>${totalData.date[0]}</u> до <u> ${totalData.date[todayIndex]}</u> за ${GetPluralValues(totalData.date.length, ["день", "дня", "дней"])} накопится <b>${totalData.temp[todayIndex].toFixed(0)}°C</b> эффективных температур.`;
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
    console.log('optimalHarvestingTiming', optimalHarvestingTiming)
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
