import { log, string } from '@tensorflow/tfjs';
import { Crops, Fertilizers, Clients } from './data.ts';
import { paramsTemplates } from './templates.ts';

interface Client {
  name: string;
  area: number;
  organic: number;
  phosphorus: number;
  potassium: number;
}

const NPK_LIMITS = {
  'nitrogen-value': { min: 2.9, max: 6.2 },
  'phosphorus-value': { min: 20, max: 40 },
  'potassium-value': { min: 6, max: 12 },
};

const ELEMENTS = ['nitrogen', 'phosphorus', 'potassium'];

const CLIENTS_MAP = {
  'ао «печерское» ставропольский район': Clients.pecherskoeStavropol,
  'ао «печерское» сызранский район': Clients.pecherskoeSyzran,
  'кфх «планин»': Clients.planin,
  'ооо «нур»': Clients.nur,
  'ооо «дуслык»': Clients.duslyk,
  'ооо «аняк»': Clients.anyak,
  'ооо «туган як»': Clients.tuganYak,
};

class CalculatorApp {
  calculateButton: HTMLElement | null;
  calculatorParams: HTMLElement | null;
  fieldsList: Client[];
  clientNameElem: HTMLElement | null;
  currentClient: Element | null;

  isManualPage: boolean;

  constructor() {
    this.calculateButton = document.getElementById('calculate-button');
    this.calculatorParams = document.getElementById('calculator-params');

    this.clientNameElem = document.getElementById('client-name');

    this.fieldsList = [];
    this.currentClient = document.getElementsByClassName('clients__button')[0];

    this.isManualPage = true;
  }

  bindEvents() {
    this.onParamsChange();

    this.onParamsFocus();

    this.onDocumentClick();
  }

  onParamsChange() {
    if (!(this.calculatorParams instanceof HTMLElement)) {
      console.error('Не нашелся calculatorParams');
      return;
    }

    this.calculatorParams.addEventListener('change', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement &&
        target.type === 'number' &&
        target.valueAsNumber < 0) {
        // * Обнуление при отрицательном вводе
        target.valueAsNumber = 0;
      }

      // * Бинд изменения цены удобрений
      const fertilizerPriceMap = {
        nitrogen: 'nitrogen-price',
        phosphorus: 'phosphorus-price',
        potassium: 'potassium-price',
      };
      if (target instanceof HTMLSelectElement) {
        const fertilizerPriceID = fertilizerPriceMap[target.id];
        if (fertilizerPriceID) {
          this.ChangeFertilizerPrice(document.getElementById(fertilizerPriceID), target.value);
        }
      }
    });
  }

  onParamsFocus() {
    if (!(this.calculatorParams instanceof HTMLElement)) return;
    // this.calculatorParams.addEventListener('focusin', (event: Event) => {
    //   const target = event.target;
    //   if (target instanceof HTMLInputElement && target.type === 'number') {
    //     target.value = ''; // * Стирание при фокусе на инпут
    //   }
    // });
    this.calculatorParams.addEventListener('focusout', (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.type === 'number') {
        if (!target.value) {
          target.valueAsNumber = 0;
        }
        // ! Перекрашивание содержания NPK
        const limits = NPK_LIMITS[target.id];
        if (this.isManualPage && limits) {
          this.PaintTheCell(limits.min, limits.max, target);
        }
      }
    });
  }

  onDocumentClick() {
    document.addEventListener('click', (event: Event) => {
      console.log('changeClient');

      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.closest('#clients')) {
        const isInactiveClientButton =
          target.classList.contains('clients__button') &&
          !target.classList.contains('clients__button--active');
        const shouldGoToManual = target.id === 'back-to-manual' && !this.isManualPage;

        if (isInactiveClientButton || shouldGoToManual) {
          this.isManualPage = shouldGoToManual;
          this.changeClient(target);
        }
      }
      if (target.id === 'calculate-button') {
        this.mainCalculate()
      }
    })
  }

  getFields(clientName: string | undefined) {
    if (typeof clientName === 'string') {
      const key = clientName.toLocaleLowerCase();
      if (CLIENTS_MAP[key]) return CLIENTS_MAP[key];
      alert('Ошибка выбора хозяйства');
      return false;
    }
  }

  changeClient(newClientButton: HTMLElement) {

    this.RenderCalculatorParams();
    let newName = '';
    if (!this.isManualPage) {
      const fieldSelect = document.getElementById('fields');
      if (!(fieldSelect instanceof HTMLSelectElement)) {
        console.error('fieldSelect not found')
        return
      }
      const fields = this.getFields(newClientButton.textContent);
      if (!fields) return;
      this.fieldsList = fields;
      this.addFields(fieldSelect);
      this.fillArea(fieldSelect);

      newName = newClientButton.textContent;
    }
    this.changeActiveClient(newClientButton, newName);
  }

  addFields(fieldSelect: HTMLSelectElement) {
    fieldSelect.textContent = '';
    this.fieldsList.forEach(elem => {
      let option = document.createElement('option');
      option.textContent = elem.name;
      fieldSelect.appendChild(option);
    });
  }

  fillArea(fieldSelect: HTMLSelectElement) {
    const areaInput = document.getElementById('field-area')
    if (!(areaInput instanceof HTMLInputElement)) {
      console.error('areaInput not found')
      return;
    }

    for (const elem of this.fieldsList) {
      if (fieldSelect.value === elem.name) {
        areaInput.valueAsNumber = elem.area;
        return;
      }
    }
  }

  changeActiveClient(newClientButton: HTMLElement, newName: string) {
    if (!(this.currentClient instanceof HTMLElement) ||
      !(this.clientNameElem instanceof HTMLElement)) {
      console.error('currentClient not found');
      return
    }
    this.currentClient.classList.remove('clients__button--active');
    newClientButton.classList.add('clients__button--active');
    this.currentClient = newClientButton;
    this.clientNameElem.textContent = newName;
  }

  RenderCalculatorParams() {
    if (!(this.calculatorParams instanceof HTMLElement)) {
      console.error('Не нашелся calculatorParams');
      return;
    }
    const calculatorParamsWrapper = this.calculatorParams.querySelector('.calculator-params__wrapper');
    if (!(calculatorParamsWrapper instanceof Element)) {
      console.error('calculatorParamsWrapper not found')
      return
    }

    let classes = this.isManualPage ? ['container', 'calculator-params__wrapper', 'calculator-params__wrapper--manual'] : ['container', 'calculator-params__wrapper'];

    let content = this.isManualPage ? paramsTemplates.mainPage : paramsTemplates.clientPage;

    this.calculatorParams.removeChild(calculatorParamsWrapper);
    const wrapper = document.createElement('div')
    wrapper.classList.add(...classes)
    wrapper.innerHTML = content;
    this.calculatorParams.appendChild(wrapper)
  }

  ChangeFertilizerPrice(priceInput: HTMLElement | null, fertilizerName: string) {
    const fertilizer = Fertilizers.find((f) => f.name === fertilizerName);
    if (fertilizer && priceInput instanceof HTMLInputElement) {
      priceInput.valueAsNumber = fertilizer.price;
    }
  }

  PaintTheCell(minLimit: number, maxLimit: number, element: HTMLInputElement) {
    if (element.valueAsNumber <= 0 || element.value === '') {
      element.valueAsNumber = 0;
      element.style.backgroundColor = '#ffffff';
    } else if (element.valueAsNumber < minLimit) {
      element.style.backgroundColor = '#ee8238';
    } else if (element.valueAsNumber >= minLimit && element.valueAsNumber <= maxLimit) {
      element.style.backgroundColor = '#79b252';
    } else if (element.valueAsNumber > maxLimit) {
      element.style.backgroundColor = '#ffc30d';
    }
  }

  mainCalculate() {
    const inputData = new InputData(this);
  }
}

interface Crop {
  name: string,
  nitrogen: number,
  phosphorus: number,
  potassium: number,
};

interface NPK {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

interface Fertilizer {
  name: undefined,
  price: undefined,
  nitrogen: undefined,
  phosphorus: undefined,
  potassium: undefined,
  sulfur: undefined,
}

class InputData {
  app: CalculatorApp;
  // Основные параметры поля
  fieldName: string;
  fieldArea: string;
  harvest: string;

  // Информация о выбранной культуре
  crop: Crop;

  // Коэффициенты по агрохимическим показателям поля
  fertilityCoefficients: NPK;

  // Удобрения
  fertilizers = {
    nitrogen: {
      name: undefined,
      price: undefined,
      nitrogen: undefined,
      phosphorus: undefined,
      potassium: undefined,
      sulfur: undefined,
    },
    phosphorus: {
      name: undefined,
      price: undefined,
      nitrogen: undefined,
      phosphorus: undefined,
      potassium: undefined,
      sulfur: undefined,
    },
    potassium: {
      name: undefined,
      price: undefined,
      nitrogen: undefined,
      phosphorus: undefined,
      potassium: undefined,
      sulfur: undefined,
    }
  };
  constructor(calculatorApp) {
    this.app = calculatorApp;
  }

}

document.addEventListener('DOMContentLoaded', () => {
  const app = new CalculatorApp();
  console.log(app);
  app.bindEvents();
});
