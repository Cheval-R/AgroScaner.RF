class CornPredictionApp {
  constructor() {
    this.startDateInput;
    this.startDate;

    this.endDate;

    this.latitude;
    this.longitude;

    this.resultData = {
      sumEffectiveTemp: 0,
      date: [],
      temp: [],
    }

    this.apiData = {
      startDate: '',
      endDate: '',
      url: '',

      weatherData: {
        temperature: [],
        date: [],
      }
    }
  }

  init() {
    this.startDateInput = document.getElementById('start-date');
    this.startDate = this.startDateInput.value;

    this.endDate = this.
      getYesterday().
      toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });


    this.latitude = document.getElementById('latitude').value;
    this.longitude = document.getElementById('longitude').value;

    this.apiData.startDate = this.DateParseForAPI(this.startDate);
    this.apiData.endDate = this.DateParseForAPI(this.endDate);
    this.apiData.url = `https://historical-forecast-api.open-meteo.com/v1/forecast?latitude=${this.latitude}&longitude=${this.longitude}&start_date=${this.apiData.startDate}&end_date=${this.apiData.endDate}&hourly=temperature_2m,relative_humidity_2m,precipitation&timezone=Europe%2FMoscow`;
  }

  async Calculate() {

  }


  getYesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  }
  DateParseForAPI(date) {
    const [day, month, year] = date.split('.');
    return `${year}-${month}-${day}`;
  }
}



export async function classMain() {
  const cornApp = new CornPredictionApp();
  cornApp.init();
  console.log('CornPredictionApp', cornApp);

  cornApp.Calculate();

}