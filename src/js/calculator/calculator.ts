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



interface NPK {
  name?: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

interface NPKS {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  sulfur: number;
}

type FertilizerKey = 'nitrogen' | 'phosphorus' | 'potassium'


interface Fertilizer {
  name: string,
  price: number,
  nitrogen: number,
  phosphorus: number,
  potassium: number,
  sulfur: number,
}

class InputData {
  app: CalculatorApp;
  // Основные параметры поля
  fieldName: string;
  fieldArea: number;
  harvest: number;

  // Информация о выбранной культуре
  crop: NPK;

  // Коэффициенты по агрохимическим показателям поля
  fertilityCoefficients: NPK;

  // Удобрения
  fertilizers: Record<FertilizerKey, Fertilizer> = {
    nitrogen: {
      name: '',
      price: 0,
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0,
      sulfur: 0,
    },
    phosphorus: {
      name: '',
      price: 0,
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0,
      sulfur: 0,
    },
    potassium: {
      name: '',
      price: 0,
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0,
      sulfur: 0,
    }
  };
  constructor(calculatorApp) {
    this.app = calculatorApp;

    this.fieldName = '';
    this.fieldArea = 0;
    this.harvest = 0;

    this.crop = {
      name: '',
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0,
    }

    this.fertilityCoefficients = {
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0,
    }
  }

  init() {
    this.fieldName = this.app.isManualPage ? '' : getInputValueById('fields');
    this.fieldArea = getInputValueAsNumberById('field-area');
    this.harvest = getInputValueAsNumberById('harvest') * 0.7;

    this.crop = this.getCrop('crop');

    /** Коэф. на агрохим. показатели поля */
    this.fertilityCoefficients = this.getFertilityCoefficients()

    this.fertilizers = this.getFertilizers();
  }

  getFertilizers() {
    let fertilizers: Record<FertilizerKey, Fertilizer> = {} as Record<FertilizerKey, Fertilizer>;
    ELEMENTS.forEach(key => {
      const name = getInputValueById(key);

      fertilizers[key] = {
        name,
        price: getInputValueById(`${key}-price`),
        ...this.fertilizerCatch(name)
      }
    })
    return fertilizers;
  }

  fertilizerCatch(name: string): NPKS {
    const fertilizer = Fertilizers.find(f => f.name === name)
    if (fertilizer) {
      return {
        nitrogen: fertilizer.nitrogen,
        phosphorus: fertilizer.phosphorus,
        potassium: fertilizer.potassium,
        sulfur: fertilizer.sulfur,
      }
    }
    // ! Придумать обработку
    return {
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0,
      sulfur: 0,
    }
  }

  getCrop(id: string): NPK {
    const value = getInputValueById(id);
    const crop = Crops.find(c => c.name === value);
    if (crop) {
      return {
        name: value,
        nitrogen: crop.nitrogen,
        phosphorus: crop.phosphorus,
        potassium: crop.potassium,
      }
    }
    // ! Придумать обработку
    else return {
      name: '',
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0,
    }
  }

  getFertilityCoefficients() {
    const LIMITS = {
      nitrogen: [
        { max: 2.9, k: 1 },
        { max: 6.2, k: 0.75 },
        { max: Infinity, k: 0.6 }
      ],
      phosphorus: [
        { max: 20, k: 1.3 },
        { max: 25, k: 1.2 },
        { max: 30, k: 1.1 },
        { max: 35, k: 1.0 },
        { max: 40, k: 0.9 },
        { max: Infinity, k: 0.7 }],
      potassium: [
        { max: 6, k: 1.5 },
        { max: 7.5, k: 1.1 },
        { max: 9, k: 1.0 },
        { max: 10.5, k: 0.9 },
        { max: 12, k: 0.8 },
        { max: Infinity, k: 0.7 }
      ]
    };

    const { nitrogen, phosphorus, potassium } = this.getFertilityValue()
    // Таблица диапазонов и коэффициентов
    const getCoefficients = (value: number, table: { max: number, k: number }[]) => {
      const lastElement = table.at(-1)?.k;
      const row = table.find(({ max }) => value < max);
      if (row !== undefined) {
        return row.k
      }
      return lastElement ?? 0;
    }

    const nitrogenCoefficient = getCoefficients(nitrogen, LIMITS.nitrogen);
    const phosphorusCoefficient = getCoefficients(phosphorus, LIMITS.phosphorus);
    const potassiumCoefficient = getCoefficients(potassium, LIMITS.potassium);

    console.log(
      `Коэффициенты:
		Азот: ${nitrogenCoefficient}
		Фосфор: ${phosphorusCoefficient}
		Калий: ${potassiumCoefficient}`
    );

    return {
      nitrogen: nitrogenCoefficient,
      phosphorus: phosphorusCoefficient,
      potassium: potassiumCoefficient,
    };
  }

  getFertilityValue(): NPK {
    console.log(this.app.isManualPage);

    if (this.app.isManualPage) {
      return {
        nitrogen: getInputValueAsNumberById('nitrogen-value'),
        phosphorus: getInputValueAsNumberById('phosphorus-value'),
        potassium: getInputValueAsNumberById('potassium-value'),
      }
    }
    else {
      const field = this.app.fieldsList.find(f => this.fieldName === f.name);
      if (field) {
        return {
          nitrogen: field.organic,
          phosphorus: field.phosphorus,
          potassium: field.potassium,
        }
      }
    }
    // ! Придумать обработку
    return {
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0,
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new CalculatorApp();
  console.log(app);
  app.bindEvents();
});


function getInputValueById(id: string): string {
  const input = document.getElementById(id);

  if (!(input instanceof HTMLInputElement)) {
    throw new Error(`Элемент с id ${id} не найден`);
  }
  return input.value;

}
function getInputValueAsNumberById(id: string): number {
  const input = document.getElementById(id);

  if (input instanceof HTMLInputElement && input.type === 'number')
    return input.valueAsNumber;

  throw new Error(`Элемент с id ${id} не найден`);
}