import AirDatepicker from 'air-datepicker';
import { byPeriod } from './main.js';

const
  today = new Date(),
  endOfYear = new Date(today.getFullYear(), 11, 31),
  endDateLabel = document.getElementById('end-date-label'),
  endDateInput = document.getElementById('end-date');

byPeriod.addEventListener('change', (event) => {
  if (event.target.checked) {
    endDateLabel.style.display = 'flex';
    endDateInput.value = '';
    startDatePicker.update({
      maxDate: endOfYear,
    })
    endDatePicker.update({
      maxDate: endOfYear,
    })
  }
  else {
    endDateLabel.style.display = 'none';
    endDateInput.value = '';
    startDatePicker.update({
      maxDate: endOfYear
    })
    endDatePicker.update({
      maxDate: endOfYear,
    })
  }
})

// * Инициализация календарей
let startDatePicker, endDatePicker;

startDatePicker = new AirDatepicker('#start-date',
  {
    // inline: true,
    // selectedDates: new Date('2024-01-01'),
    dateFormat: 'dd.MM.yyyy',
    minDate: new Date('2021-03-23'),
    maxDate: endOfYear,
    onSelect({ date }) {
      endDatePicker.update({
        minDate: date,
      })
    }
  });


endDatePicker = new AirDatepicker('#end-date',
  {
    dateFormat: 'dd.MM.yyyy',
    minDate: new Date('2021-03-23'),
    maxDate: endOfYear,
    onSelect({ date }) {
      startDatePicker.update({
        maxDate: date,
      })
    },
  });
