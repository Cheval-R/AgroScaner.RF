import { Crops } from './crops.js';
import { Fertilizers } from './fertilizer.js';
import { Clients } from './fields.js';
import { paramsTemplates } from "./blocks.js";


const NPK_LIMITS = {
  'nitrogen-value': { min: 2.9, max: 6.2 },
  'phosphorus-value': { min: 20, max: 40 },
  'potassium-value': { min: 6, max: 12 }
};

const CLIENTS_MAP = {
  'ао «печерское» ставропольский район': Clients.pecherskoeStavropol,
  'ао «печерское» сызранский район': Clients.pecherskoeSyzran,
  'кфх «планин»': Clients.planin,
  'ооо «нур»': Clients.nur,
  'ооо «дуслык»': Clients.duslyk,
  'ооо «аняк»': Clients.anyak,
  'ооо «туган як»': Clients.tuganYak
};

class CalculatorApp {
  static manualPageFlag = true;
  static fieldsList = '';

  constructor() {
    this.calculateButton;
    this.calculatorParams;

    this.clientNameElem;
    this.currentClient;

  }

  init() {
    this.calculateButton = document.getElementById('calculate-button');
    this.calculatorParams = document.getElementById('calculator-params');
    this.clientNameElem = document.getElementById('client-name');
    this.currentClient = document.getElementsByClassName('clients__button')[0]
  }

  bindEvents() {


    this.calculatorParams.addEventListener('change', (event) => {
      // * Обнуление при отрицательном вводе
      if (event.target.type === 'number' && event.target.value < 0) {
        event.target.value = 0;
      }

      // * Бинд изменения цены удобрений
      const fertilizerMap = {
        nitrogen: 'nitrogen-price',
        phosphorus: 'phosphorus-price',
        potassium: 'potassium-price',
      }
      if (fertilizerMap[event.target.id]) {
        this.ChangeFertilizerPrice(fertilizerMap[event.target.id], event.target.value)
      }
    })

    this.calculatorParams.addEventListener('focusin', (event) => {
      // * Стирание при фокусе на инпут
      if (event.target.type === 'number') {
        event.target.value = ''
      }
    })
    this.calculatorParams.addEventListener('focusout', (event) => {
      // ! Перекрашивание содержания NPK
      const limits = NPK_LIMITS[event.target.id]
      if (CalculatorApp.manualPageFlag && limits) {
        this.PaintTheCell(limits.min, limits.max, event.target);
      }
    })


    document.addEventListener('click', (event) => {
      const target = event.target;
      if (target.closest('#clients')) {
        const isInactiveClientButton =
          target.classList.contains('clients__button') &&
          !target.classList.contains('clients__button--active');
        const shouldGoToManual = target.id === 'back-to-manual' && !CalculatorApp.manualPageFlag;
        if (isInactiveClientButton || shouldGoToManual) {
          CalculatorApp.manualPageFlag = shouldGoToManual;
          this.changeClient(target);
        }
      }
      if (target.id === 'calculate-button') {
        this.mainCalculate(CalculatorApp.fieldsList)
      }
    })
  }

  changeClient(newClientButton) {
    this.RenderCalculatorParams();
    let newName = '';
    if (!CalculatorApp.manualPageFlag) {
      const fieldSelect = document.getElementById('fields');
      const fields = this.getFields(newClientButton.textContent);
      if (!fields) return;
      CalculatorApp.fieldsList = fields;
      this.addFields(fields, fieldSelect);
      this.fillArea(fields, fieldSelect);

      newName = newClientButton.textContent;
    }
    this.changeActiveClient(newClientButton, newName);
  }

  RenderCalculatorParams() {
    const calculatorParamsWrapper = this.calculatorParams.querySelector('.calculator-params__wrapper');

    let classes = CalculatorApp.manualPageFlag ? ['container', 'calculator-params__wrapper', 'calculator-params__wrapper--manual'] : ['container', 'calculator-params__wrapper'];

    let content = CalculatorApp.manualPageFlag ? paramsTemplates.mainPage : paramsTemplates.clientPage;

    this.calculatorParams.removeChild(calculatorParamsWrapper);
    const wrapper = document.createElement('div')
    wrapper.classList.add(...classes)
    wrapper.innerHTML = content;
    this.calculatorParams.appendChild(wrapper)
  }

  getFields(clientName) {
    const key = clientName.toLocaleLowerCase();
    if (CLIENTS_MAP[key]) return CLIENTS_MAP[key];
    alert("Ошибка выбора хозяйства");
    return false;
  }

  addFields(fieldsList, fieldSelect) {
    fieldSelect.textContent = '';
    fieldsList.forEach(elem => {
      let option = document.createElement('option');
      option.textContent = elem.name;
      fieldSelect.appendChild(option);
    });
  }

  fillArea(fieldsList, fieldSelect) {
    const areaInput = document.getElementById('field-area')
    for (const elem of fieldsList) {
      if (fieldSelect.value === elem.name) {
        areaInput.value = elem.area;
        return;
      }
    }
  }

  changeActiveClient(newClientButton, newName) {
    this.currentClient.classList.remove('clients__button--active');
    newClientButton.classList.add('clients__button--active');
    this.currentClient = newClientButton;
    this.clientNameElem.textContent = newName;
  }


  mainCalculate() {
    const inputData = new InputData;
    inputData.init();
    const outputData = new OutputData;
    this.CalculateDoses(inputData, outputData);
    this.CalculatePrice(inputData, outputData)
    console.log(outputData);
    outputData.FillResultTable(inputData, outputData)
  }

  CalculateDoses(inputData, outputData) {
    const correction = { nitrogen: 1, phosphorus: 1, potassium: 0.8 };

    ['phosphorus', 'nitrogen', 'potassium'].forEach(key => {
      let dose = inputData.fertilityCoefficients[key] * inputData.harvest * inputData.crop[key];

      // Вычитаем влияние фосфора для N и K
      if (key !== 'phosphorus') {
        dose -= ((inputData.fertilizers.phosphorus[key] ?? 0) * (outputData.phosphorus.physWeightByGa ?? 0) / 100);
      }

      // Проверяем доступность значения удобрения и применяем коэффициент
      const fertilizerValue = inputData.fertilizers[key]?.[key] ?? 0;

      outputData[key].physWeightByGa = fertilizerValue <= 0 ? 0 :
        Math.round((dose * 100 / fertilizerValue * correction[key]) / 5) * 5;

      outputData[key].physWeightByField = (outputData[key].physWeightByGa / 1000 * inputData.fieldArea).toFixed(1)

    });
  }

  CalculatePrice(inputData, outputData) {
    ['nitrogen', 'phosphorus', 'potassium'].forEach(key => {
      outputData[key].priceByGa = Math.round(outputData[key].physWeightByGa * inputData.fertilizers[key].price);
      outputData[key].priceByField = outputData[key].priceByGa * inputData.fieldArea;
    })

    outputData.total.priceByGa = outputData.nitrogen.priceByGa + outputData.phosphorus.priceByGa + outputData.potassium.priceByGa

    outputData.total.priceByWeight = outputData.nitrogen.priceByWeight + outputData.phosphorus.priceByWeight + outputData.potassium.priceByWeight
  }

  PaintTheCell(minLimit, maxLimit, element) {
    if (element.value <= 0 || element.value === '') {
      element.value = 0;
      element.style.backgroundColor = '#ffffff';
    } else if (element.value < minLimit) {
      element.style.backgroundColor = '#ee8238';
    }
    else if (element.value >= minLimit && element.value <= maxLimit) {
      element.style.backgroundColor = '#79b252';
    }
    else if (element.value > maxLimit) {
      element.style.backgroundColor = '#ffc30d';
    }
  }

  ChangeFertilizerPrice(priceSelector, fertilizerName) {
    const fertilizer = Fertilizers.find(f => f.name === fertilizerName);
    if (fertilizer) {
      document.getElementById(priceSelector).value = fertilizer.price;
    }
  }
}

class InputData {
  constructor() {
    // Основные параметры поля
    this.fieldName = '';
    this.fieldArea = '';
    this.harvest = '';

    // Информация о выбранной культуре
    this.crop = {
      name: undefined,
      nitrogen: undefined,
      phosphorus: undefined,
      potassium: undefined,
    };

    // Коэффициенты по агрохимическим показателям поля
    this.fertilityCoefficients = {
      nitrogen: undefined,
      phosphorus: undefined,
      potassium: undefined,
    };

    // Удобрения
    this.fertilizers = {
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
  }

  init() {
    this.fieldName = CalculatorApp.manualPageFlag ? '' : getInputValueById('fields');
    this.fieldArea = getInputValueById('field-area');
    this.harvest = getInputValueById('harvest') * 0.7;

    this.crop = this.getCrop('crop');

    /** Коэф. на агрохим. показатели поля */
    this.fertilityCoefficients = this.getFertilityCoefficients()

    this.fertilizers = this.getFertilizers(['nitrogen', 'phosphorus', 'potassium']);

  }

  getFertilizers(fertilizersArray) {
    const fertilizers = {};
    fertilizersArray.forEach(key => {
      const name = getInputValueById(key);
      fertilizers[key] = {
        name,
        price: getInputValueById(`${key}-price`),
        ...this.fertilizerCatch(name)
      }
    })
    return fertilizers;
  }

  fertilizerCatch(name) {
    const fertilizer = Fertilizers.find(f => f.name === name)
    if (fertilizer) {
      return {
        nitrogen: fertilizer.nitrogen,
        phosphorus: fertilizer.phosphorus,
        potassium: fertilizer.potassium,
        sulfur: fertilizer.sulfur,
      }
    }
    return {
      nitrogen: undefined,
      phosphorus: undefined,
      potassium: undefined,
      sulfur: undefined,
    }
  }

  getCrop(id) {
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
    else return {
      name: undefined,
      nitrogen: undefined,
      phosphorus: undefined,
      potassium: undefined,
    }
  }

  getFertilityValue() {
    console.log('fieldsList', CalculatorApp.fieldsList);
    if (CalculatorApp.manualPageFlag) {
      return {
        nitrogen: getInputValueById('nitrogen-value'),
        phosphorus: getInputValueById('phosphorus-value'),
        potassium: getInputValueById('potassium-value'),
      }
    }
    else {
      const field = CalculatorApp.fieldsList.find(f => this.fieldName === f.name);
      if (field) {
        return {
          nitrogen: field.organic,
          phosphorus: field.phosphorus,
          potassium: field.potassium,
        }
      }
    }
    return {
      nitrogen: undefined,
      phosphorus: undefined,
      potassium: undefined,
    }
  }

  getFertilityCoefficients() {
    const { nitrogen, phosphorus, potassium } = this.getFertilityValue(CalculatorApp.fieldsList)
    let nitrogenCoefficient =
      nitrogen < 2.9 ? 1
        : nitrogen <= 6.2 ? 0.75
          : 0.6;

    let phosphorusCoefficient =
      phosphorus < 20 ? 1.3
        : phosphorus < 25 ? 1.2
          : phosphorus < 30 ? 1.1
            : phosphorus < 35 ? 1
              : phosphorus < 40 ? 0.9
                : 0.7;

    let potassiumCoefficient =
      potassium < 6 ? 1.5
        : potassium < 7.5 ? 1.1
          : potassium < 9 ? 1.0
            : potassium < 10.5 ? 0.9
              : potassium < 12 ? 0.8
                : 0.7;

    console.log(
      `Коэффициенты:
		Азот: ${nitrogenCoefficient}
		Фосфор: ${phosphorusCoefficient}
		Калий: ${potassiumCoefficient}`
    );

    return {
      nitrogen: nitrogenCoefficient,
      phosphorus: phosphorusCoefficient,
      potassium: potassiumCoefficient
    };
  }

}

class OutputData {
  constructor() {
    this.nitrogen = {
      physWeightByGa: undefined,
      physWeightByField: undefined,
      priceByGa: undefined,
      priceByField: undefined,
      tableCells: {
        physWeightByGa: undefined,
        physWeightByField: undefined,
        priceByGa: undefined,
        priceByField: undefined,
      }
    };
    this.phosphorus = {
      physWeightByGa: undefined,
      physWeightByField: undefined,
      priceByGa: undefined,
      priceByField: undefined,
      tableCells: {
        physWeightByGa: undefined,
        physWeightByField: undefined,
        priceByGa: undefined,
        priceByField: undefined,
      }
    };
    this.potassium = {
      physWeightByGa: undefined,
      physWeightByField: undefined,
      priceByGa: undefined,
      priceByField: undefined,
      tableCells: {
        physWeightByGa: undefined,
        physWeightByField: undefined,
        priceByGa: undefined,
        priceByField: undefined,
      }
    };
    this.total = {
      priceByGa: '',
      priceByField: ''
    }
  }

  init() {
    this.nitrogen = createElementSet('nitrogen');
    this.phosphorus = createElementSet('phosphorus');
    this.potassium = createElementSet('potassium');

    this.totalTableCells = {
      priceByGa: document.getElementById('price-ga-total'),
      priceByField: document.getElementById('price-field-total'),
    }
  }

  createElementSet(prefix) {
    return {
      physWeightByGa: '',
      physWeightByField: '',
      priceByGa: '',
      priceByField: '',
      tableCells: {
        physWeightByGa: document.getElementById(`phys-ga-${prefix}`),
        physWeightByField: document.getElementById(`phys-field-${prefix}`),
        priceByGa: document.getElementById(`price-ga-${prefix}`),
        priceByField: document.getElementById(`price-field-${prefix}`)
      }
    }
  }

  FillResultTable(inputData, outputData) {
    ['nitrogen', 'phosphorus', 'potassium'].forEach(key => {
      this[key].tableCells.physWeightByGa.textContent = outputData[key].physWeightByGa;
      this[key].tableCells.physWeightByField.textContent = outputData[key].physWeightByField;

      this[key].tableCells.priceByGa.textContent = `${outputData[key].priceByGa.toLocaleString('ru-RU')} ₽`;
      this[key].tableCells.priceByField.textContent = `${outputData[key].priceByField.toLocaleString('ru-RU')} ₽`;
    })
    this.total.priceByGa.textContent = `${outputData.total.priceByGa.toLocaleString('ru-RU')} ₽`;
    this.total.priceByField.textContent = `${outputData.total.priceByField.toLocaleString('ru-RU')} ₽`;


    // if (outputData.physWeightP > 0) {
    //   document.getElementById('phys-ga-phosphorus').textContent = outputData.physWeightP;
    //   document.getElementById('phys-field-phosphorus').textContent = (outputData.physWeightP / 1000 * inputData.fieldArea).toFixed(1);
    // }
    // if (outputData.physWeightK > 0) {
    //   document.getElementById('phys-ga-potassium').textContent = outputData.physWeightK;
    //   document.getElementById('phys-field-potassium').textContent = (outputData.physWeightK / 1000 * inputData.fieldArea).toFixed(1);
    // }
    // if (outputData.priceGaN > 0) {
    //   document.getElementById('price-ga-nitrogen').textContent = `${outputData.priceGaN.toLocaleString('ru-RU')} ₽`;
    //   document.getElementById('price-field-nitrogen').textContent = `${outputData.priceFieldN.toLocaleString('ru-RU')} ₽`;
    // }
    // if (outputData.priceGaP > 0) {
    //   document.getElementById('price-ga-phosphorus').textContent = `${outputData.priceGaP.toLocaleString('ru-RU')} ₽`;
    //   document.getElementById('price-field-phosphorus').textContent = `${outputData.priceFieldP.toLocaleString('ru-RU')} ₽`;
    // }
    // if (outputData.priceGaK > 0) {
    //   document.getElementById('price-ga-potassium').textContent = `${outputData.priceGaK.toLocaleString('ru-RU')} ₽`;
    //   document.getElementById('price-field-potassium').textContent = `${outputData.priceFieldK.toLocaleString('ru-RU')} ₽`;
    // }

    // if (outputData.priceGaN + outputData.priceGaP + outputData.priceGaK) {
    //   document.getElementById('price-ga-total').textContent = `${(outputData.priceGaN + outputData.priceGaP + outputData.priceGaK).toLocaleString('ru-RU')} ₽`;
    // }
    // if (outputData.priceFieldN + outputData.priceFieldP + outputData.priceFieldK) {
    //   document.getElementById('price-field-total').textContent = `${(outputData.priceFieldN + outputData.priceFieldP + outputData.priceFieldK).toLocaleString('ru-RU')} ₽`;
    // }
  }
}

function getInputValueById(id) {
  return document.getElementById(id).value
}



document.addEventListener('DOMContentLoaded', () => {
  const calculatorApp = new CalculatorApp;
  calculatorApp.init();
  calculatorApp.bindEvents();
})