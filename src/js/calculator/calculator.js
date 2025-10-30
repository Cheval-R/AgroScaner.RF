import { Crops } from './crops.js';
import { Fertilizers } from './fertilizer.js';
import { Clients } from './fields.js';
import { paramsTemplates } from "./blocks.js";


const NPK_LIMITS = {
  'nitrogen-value': { min: 2.9, max: 6.2 },
  'phosphorus-value': { min: 20, max: 40 },
  'potassium-value': { min: 6, max: 12 }
};

class CalculatorApp {
  constructor() {
    this.calculateButton;
    this.calculatorParams;

    this.clientNameElem;
    this.currentClient;

    this.manualPageFlag = true;
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
      if (this.manualPageFlag && limits) {
        this.PaintTheCell(limits.min, limits.max, event.target);
      }
    })


    document.addEventListener('click', (event) => {
      const target = event.target;
      if (target.closest('#clients')) {
        const isInactiveClientButton =
          target.classList.contains('clients__button') &&
          !target.classList.contains('clients__button--active');
        const shouldGoToManual = target.id === 'back-to-manual' && !this.manualPageFlag;
        if (isInactiveClientButton || shouldGoToManual) {
          this.manualPageFlag = shouldGoToManual;
          this.ChangeClient(target);
        }
      }
      if (target.id === 'calculate-button') {
        let inputData = this.InitInputData();
        this.GetInputData(inputData);
        this.Calculate(inputData);
      }
    })
  }

  ChangeClient(newClientButton) {
    this.RenderCalculatorParams();
    let newName = '';
    if (!this.manualPageFlag) {
      const fieldSelect = document.getElementById('fields');
      const fields = this.GetFields(newClientButton.textContent);
      if (!fields) return;
      this.AddFields(fields, fieldSelect);
      this.FillArea(fields, fieldSelect);

      newName = newClientButton.textContent;
    }
    this.ChangeActiveClient(newClientButton, newName);
  }

  RenderCalculatorParams() {
    const calculatorParamsWrapper = this.calculatorParams.querySelector('.calculator-params__wrapper');

    let classes = this.manualPageFlag ? ['container', 'calculator-params__wrapper', 'calculator-params__wrapper--manual'] : ['container', 'calculator-params__wrapper'];

    let content = this.manualPageFlag ? paramsTemplates.mainPage : paramsTemplates.clientPage;

    this.calculatorParams.removeChild(calculatorParamsWrapper);
    const wrapper = document.createElement('div')
    wrapper.classList.add(...classes)
    wrapper.innerHTML = content;
    this.calculatorParams.appendChild(wrapper)
  }

  GetFields(clientName) {
    switch (clientName.toLocaleLowerCase()) {
      case 'ао «печерское»':
        return Clients.pecherskoeStavropol;
      case 'ао «печерское»':
        return Clients.pecherskoeSyzran;
      case 'кфх «планин»':
        return Clients.planin;
      case 'ооо «нур»':
        return Clients.nur;
      case 'ооо «дуслык»':
        return Clients.duslyk;
      case 'ооо «аняк»':
        return Clients.anyak;
      case 'ооо «туган як»':
        return Clients.tuganYak;
      default:
        alert("Ошибка выбора хозяйства");
        return false;
    }
  }

  AddFields(fieldsList, fieldSelect) {
    fieldSelect.textContent = '';
    fieldsList.forEach(elem => {
      let option = document.createElement('option');
      option.textContent = elem.name;
      fieldSelect.appendChild(option);
    });
  }

  FillArea(fieldsList, fieldSelect) {
    const areaInput = document.getElementById('field-area')
    for (const elem of fieldsList) {
      if (fieldSelect.value === elem.name) {
        areaInput.value = elem.area;
        return;
      }
    }
  }

  ChangeActiveClient(newClientButton, newName) {
    this.currentClient.classList.remove('clients__button--active');
    newClientButton.classList.add('clients__button--active');
    this.currentClient = newClientButton;
    this.clientNameElem.textContent = newName;
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
}

document.addEventListener('DOMContentLoaded', () => {
  const calculatorApp = new CalculatorApp
  calculatorApp.init();
  calculatorApp.bindEvents();
})