// const { Chart } = await import('chart.ts');
import Chart from 'chart.js/auto';
import { chartObj } from './main.ts';


export function PrintGraph(data, todayIndex) {
  console.log('data', data)
  const graphData = RemoveYear(data);

  if (chartObj.chart) {
    chartObj.chart.destroy();
  }

  chartObj.chart = new Chart(document.getElementById('graph'), CreateChartConfig(graphData, todayIndex));
}

function CreateChartConfig(graphData, todayIndex) {
  return {
    type: 'line',
    options: {
      plugins: {
        legend: { display: false },
      }
    },
    data: {
      labels: graphData.date,
      datasets: [{
        label: 'Значения суммы эффективных температур',
        data: graphData.temp,
        pointBorderColor: '#ffa500',
        pointBackgroundColor: '#ffa500',
        tension: 0.1,
        // Добавить условие выхода сегодняшнего индекса за рамки массива, потому что он может быть удален зимой из-за повторов
        segment: {
          borderColor: (ctx) => ctx.p0DataIndex > todayIndex ? '#008000' : '#ffa500',
          backgroundColor: (ctx) => ctx.p0DataIndex > todayIndex ? '#008000' : '#ffa500',
        },
        pointBorderColor: (ctx) => ctx.dataIndex > todayIndex ? '#008000' : '#ffa500',
        pointBackgroundColor: (ctx) => ctx.dataIndex > todayIndex ? '#008000' : '#ffa500'
      }]
    },
    plugins: [OptimalHarvestingTimingPlugin(), CustomLegendPlugin(graphData, todayIndex)],
  }
}
function CustomLegendPlugin(graphData, todayIndex) {
  return {
    id: 'customLegend',
    afterDraw: (chart) => {
      const ctx = chart.ctx;

      // Стили для легенды
      const segmentStyles = [
        {
          label: `Фактические значения суммы эффективных температур`,
          additionalText: `${graphData?.temp?.[todayIndex] != null ? ` (на сегодняшний день накоплено: ${graphData.temp[todayIndex]}°C)` : ''}`,
          color: '#008000'
        },
        {
          label: 'Предсказанные значения суммы эффективных температур',
          additionalText: '',
          color: '#ffa500'
        }
      ];

      // Установка стилей текста
      ctx.font = '18px Arial';
      ctx.textAlign = 'left';

      // Рассчитываем полную ширину (с учетом обоих текстов)
      const mainTextWidth = ctx.measureText(segmentStyles[0].label).width;
      ctx.font = 'bold 18px Arial';
      const additionalTextWidth = segmentStyles[0].additionalText
        ? ctx.measureText(segmentStyles[0].additionalText).width
        : 0;

      const totalWidth = Math.max(
        mainTextWidth + additionalTextWidth,
        ctx.measureText(segmentStyles[1].label).width
      ) + 50; // + отступы и квадратик

      // Позиционирование сверху
      const xStart = (chart.width - totalWidth) / 2 + 40;
      const yStart = 30; // Фиксированный отступ сверху

      // Отрисовка элементов
      segmentStyles.forEach((style, i) => {
        const yPos = yStart + (i * 35); // 35px между элементами

        // Цветной индикатор (16x16px)
        ctx.fillStyle = style.color;
        ctx.fillRect(xStart, yPos, 20, 20);

        // Основной текст
        ctx.font = '18px Arial';
        ctx.fillStyle = '#333';
        ctx.fillText(style.label, xStart + 25, yPos + 12);

        // Дополнительный текст (жирный + цвет индикатора)
        if (style.additionalText) {
          const textWidth = ctx.measureText(style.label).width;
          ctx.font = 'bold 18px Arial';
          ctx.fillStyle = '#333';
          ctx.fillText(style.additionalText, xStart + 25 + textWidth, yPos + 12);
        }
      });
    }
  };
}
function OptimalHarvestingTimingPlugin() {
  return {
    id: 'optimalHarvestingTimingPlugin',
    beforeDraw: (chart) => {
      const ctx = chart.ctx;
      const xAxis = chart.scales['x'];
      const yAxis = chart.scales['y'];
      const dataset = chart.data.datasets[0].data;

      const yMinValue = yAxis.min;
      const yMaxValue = yAxis.max;

      let xMinIndex = null;
      let xMaxIndex = null;

      dataset.forEach((value, index) => {
        if (value >= 850 && value <= 950) {
          if (xMinIndex === null) xMinIndex = index;
          xMaxIndex = index;
        }
      });

      if (xMinIndex !== null && xMaxIndex !== null) {
        const xMin = xAxis.getPixelForValue(chart.data.labels[xMinIndex]);
        const xMax = xAxis.getPixelForValue(chart.data.labels[xMaxIndex]);
        const yMin = yAxis.getPixelForValue(yMaxValue);
        const yMax = yAxis.getPixelForValue(yMinValue);

        ctx.fillStyle = 'rgba(134, 250, 111, 0.48)';
        ctx.fillRect(xMin, yMax, xMax - xMin, yMin - yMax);
        ctx.strokeStyle = 'rgb(134, 250, 111)';
        ctx.lineWidth = 2;
        ctx.strokeRect(xMin, yMax, xMax - xMin, yMin - yMax);

        ctx.save();
        ctx.fillStyle = 'black';
        ctx.font = '22px Epilogue, "Proxima Nova", sans-serif';
        ctx.textAlign = 'center';
        ctx.translate((xMin + xMax) / 2, (yMin + yMax) / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Оптимальные сроки уборки', 0, 0);
        ctx.restore();
      }
    }
  }
}






function RemoveYear(data) {
  const dateNoYear = data.date.map(item => item.slice(0, 5));
  return { temp: data.temp, date: dateNoYear }
}


