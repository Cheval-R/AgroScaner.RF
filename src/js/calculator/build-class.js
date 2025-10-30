import { Crops } from './crops.js';
import { Fertilizers } from './fertilizer.js';
import { Clients } from './fields.js';
import { paramsTemplates } from "./blocks.js";


const NPK_LIMITS = {
  'nitrogen-value': { min: 2.9, max: 6.2 },
  'phosphorus-value': { min: 20, max: 40 },
  'potassium-value': { min: 6, max: 12 }
};

let
  calculatorParams,
  fieldsList = '',
  fieldSelect,
  clientsList,
  companyName,
  currentClientIndex = 0,
  manualPageFlag = true;


document.addEventListener('DOMContentLoaded', function () {
  // ! Определение хозяйства
  companyName = document.getElementById('company-name');

  BindInput();

  clientsList = document.getElementById('clients');
  document.addEventListener('click', function (event) {
    const target = event.target;
    if (target.closest('#clients')) {
      const isInactiveClientButton = target.classList.contains('clients__button') && !target.classList.contains('clients__button--active');
      const shouldGoToManual = target.id === 'back-to-manual' && !manualPageFlag;
      if (isInactiveClientButton || shouldGoToManual) {
        manualPageFlag = shouldGoToManual
        // Смена клиента / ручной ввод √ 
        currentClientIndex = ChangeClient(target);
      }
    }
    if (target.id === 'calculate-button') {
      let inputData = InitInputData();
      GetInputData(inputData);
      Calculate(inputData);
    }
  })

  // * √
  document.getElementById('calculator-params').addEventListener('change', function (event) {
    if (event.target.type === 'number' && event.target.value < 0) {
      event.target.value = 0;
    }
  })
  // * √
  document.getElementById('calculator-params').addEventListener('focusin', function (event) {
    if (event.target.type === 'number') {
      event.target.value = ''
    }
  })
});

function InitInputData() {
  return {
    fieldName: '',
    fieldArea: '',
    crop: '',
    harvest: '',
    /** Коэф. на агрохим. показатели поля */
    nitrogenCoefficient: 0,
    phosphorusCoefficient: 0,
    potassiumCoefficient: 0,
    /** Вынос культурой */
    cropNitrogen: 0,
    cropPhosphorus: 0,
    cropPotassium: 0,

    fertilizerN: GetFertilizer('nitrogen-price'),
    fertilizerP: GetFertilizer('phosphorus-price'),
    fertilizerK: GetFertilizer('potassium-price'),
  };
}

function InitTableData() {
  return {
    physWeightN: undefined,
    physWeightP: undefined,
    physWeightK: undefined,
    priceGaN: undefined,
    priceGaP: undefined,
    priceGaK: undefined,
    priceFieldN: undefined,
    priceFieldP: undefined,
    priceFieldK: undefined
  }
}

function GetFertilizer(id) {
  return {
    name: '',
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0,
    sulfur: 0,
    price: document.getElementById(id).value
  }
}


// Получение объекта полей хозяйства
function GetFields(companyName) {
  switch (companyName.textContent.toLocaleLowerCase()) {
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

// Смена хозяйства
function ChangeClient(newClient) {
  RenderCalculatorParams();
  let newClientName = '';
  if (!manualPageFlag) {
    fieldSelect = document.getElementById('fields');
    const fields = GetFields(newClient);
    if (!fields) return;
    fieldsList = fields;
    AddFields(fieldSelect);
    GetFieldArea(fieldSelect);

    newClientName = newClient.textContent;
  }

  return ChangeActiveClient(currentClientIndex, newClient, companyName, newClientName);
}

function ChangeActiveClient(currentClientIndex, newClient, companyName, newName) {
  [...clientsList.children].at(currentClientIndex).
    children[0].classList.remove('clients__button--active');
  currentClientIndex = [...clientsList.children].indexOf(newClient.parentNode);
  newClient.classList.add('clients__button--active');
  companyName.textContent = newName;

  return currentClientIndex;
}


// Заполнение inputData
function GetInputData(inputData) {
  if (!manualPageFlag) {
    inputData.fieldName = document.getElementById('fields').value;
  }
  inputData.fieldArea = document.getElementById('field-area').value;
  inputData.crop = document.getElementById('crop').value;
  inputData.harvest = (document.getElementById('harvest').value) * 0.7;
  inputData.fertilizerN.name = document.getElementById('nitrogen').value;
  inputData.fertilizerP.name = document.getElementById('phosphorus').value;
  inputData.fertilizerK.name = document.getElementById('potassium').value;

  // ! Получение выноса культуры
  GetCropData(inputData);
  // ! Получение данных поля
  GetFieldCoefficients(inputData);
  // ! Получение данных об удобрениях
  FertilizerCatch(inputData);
}

// ? Получение данных о выносе культуры
function GetCropData(inputData) {
  const crop = Crops.find(c => c.name === inputData.crop);
  if (crop) {
    inputData.cropNitrogen = crop.nitrogen;
    inputData.cropPhosphorus = crop.phosphorus;
    inputData.cropPotassium = crop.potassium;
  }
}

// ? Получение данных поля
function GetFieldCoefficients(inputData) {
  let nValue, pValue, kValue;
  if (manualPageFlag) {
    nValue = document.getElementById('nitrogen-value').value;
    pValue = document.getElementById('phosphorus-value').value;
    kValue = document.getElementById('potassium-value').value;
  }
  else {
    const field = fieldsList.find(f => inputData.fieldName === f.name);
    if (field) {
      nValue = field.organic;
      pValue = field.phosphorus;
      kValue = field.potassium;
    }
  }

  const { nitrogenCoefficient, phosphorusCoefficient, potassiumCoefficient } =
    GetNPKCoefficients(nValue, pValue, kValue);

  inputData.nitrogenCoefficient = nitrogenCoefficient;
  inputData.phosphorusCoefficient = phosphorusCoefficient;
  inputData.potassiumCoefficient = potassiumCoefficient;
}

// ? Получение коэффициентов агрохим. показателей поля
/** Получение коэффициентов агрохим. показателей поля */
function GetNPKCoefficients(nitrogen, phosphorus, potassium) {
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

  return { nitrogenCoefficient, phosphorusCoefficient, potassiumCoefficient };
}

// ! Получение данных об удобрениях
/** Получение данных об удобрениях */
function FertilizerCatch(inputData) {

  ['fertilizerN', 'fertilizerP', 'fertilizerK'].forEach(key => {
    console.log(inputData[key], 'key');
    const fertilizer = Fertilizers.find(f => f.name === inputData[key].name)
    if (fertilizer) {
      GetFertilizerData(inputData[key], fertilizer)
    }
  })
}

// ? Заполнение ДВ удобрений
/** Заполнение ДВ удобрений */
function GetFertilizerData(fertilizerData, currentFertilizer) {
  fertilizerData.nitrogen = currentFertilizer.nitrogen;
  fertilizerData.phosphorus = currentFertilizer.phosphorus;
  fertilizerData.potassium = currentFertilizer.potassium;
  fertilizerData.sulfur = currentFertilizer.sulfur;
}
function CalculateDoses(inputData, tableData) {
  // ! Считаем дозы NPK
  const doseP =
    Math.round(inputData.phosphorusCoefficient * inputData.harvest * inputData.cropPhosphorus);
  tableData.physWeightP =
    inputData.fertilizerP.phosphorus <= 0 ? 0 :
      Math.round((doseP * 100 / inputData.fertilizerP.phosphorus) / 5) * 5;

  const doseN =
    Math.round((inputData.nitrogenCoefficient * inputData.harvest * inputData.cropNitrogen) - (inputData.fertilizerP.nitrogen * tableData.physWeightP / 100));
  tableData.physWeightN =
    inputData.fertilizerN.nitrogen <= 0 ? 0 :
      Math.round((doseN * 100 / inputData.fertilizerN.nitrogen) / 5) * 5;

  const doseK =
    Math.round((inputData.potassiumCoefficient * inputData.harvest * inputData.cropPotassium) - (inputData.fertilizerP.potassium * tableData.physWeightP / 100));
  tableData.physWeightK =
    inputData.fertilizerK.potassium <= 0 ? 0 :
      Math.round(((doseK * 100 / inputData.fertilizerK.potassium) * 0.8) / 5) * 5;
}

function FillResultTable(inputData, tableData) {
  if (tableData.physWeightN > 0) {
    document.getElementById('phys-ga-nitrogen').textContent = tableData.physWeightN;
    document.getElementById('phys-field-nitrogen').textContent = (tableData.physWeightN / 1000 * inputData.fieldArea).toFixed(1);
  }
  if (tableData.physWeightP > 0) {
    document.getElementById('phys-ga-phosphorus').textContent = tableData.physWeightP;
    document.getElementById('phys-field-phosphorus').textContent = (tableData.physWeightP / 1000 * inputData.fieldArea).toFixed(1);
  }
  if (tableData.physWeightK > 0) {
    document.getElementById('phys-ga-potassium').textContent = tableData.physWeightK;
    document.getElementById('phys-field-potassium').textContent = (tableData.physWeightK / 1000 * inputData.fieldArea).toFixed(1);
  }
  if (tableData.priceGaN > 0) {
    document.getElementById('price-ga-nitrogen').textContent = `${tableData.priceGaN.toLocaleString('ru-RU')} ₽`;
    document.getElementById('price-field-nitrogen').textContent = `${tableData.priceFieldN.toLocaleString('ru-RU')} ₽`;
  }
  if (tableData.priceGaP > 0) {
    document.getElementById('price-ga-phosphorus').textContent = `${tableData.priceGaP.toLocaleString('ru-RU')} ₽`;
    document.getElementById('price-field-phosphorus').textContent = `${tableData.priceFieldP.toLocaleString('ru-RU')} ₽`;
  }
  if (tableData.priceGaK > 0) {
    document.getElementById('price-ga-potassium').textContent = `${tableData.priceGaK.toLocaleString('ru-RU')} ₽`;
    document.getElementById('price-field-potassium').textContent = `${tableData.priceFieldK.toLocaleString('ru-RU')} ₽`;
  }

  if (tableData.priceGaN + tableData.priceGaP + tableData.priceGaK) {
    document.getElementById('price-ga-total').textContent = `${(tableData.priceGaN + tableData.priceGaP + tableData.priceGaK).toLocaleString('ru-RU')} ₽`;
  }
  if (tableData.priceFieldN + tableData.priceFieldP + tableData.priceFieldK) {
    document.getElementById('price-field-total').textContent = `${(tableData.priceFieldN + tableData.priceFieldP + tableData.priceFieldK).toLocaleString('ru-RU')} ₽`;
  }
}

function CalculatePrice(inputData, tableData) {
  tableData.priceGaN =
    Math.round(tableData.physWeightN * inputData.fertilizerN.price);
  tableData.priceGaP =
    Math.round(tableData.physWeightP * inputData.fertilizerP.price);
  tableData.priceGaK =
    Math.round(tableData.physWeightK * inputData.fertilizerK.price);

  tableData.priceFieldN =
    tableData.priceGaN * inputData.fieldArea;
  tableData.priceFieldP =
    tableData.priceGaP * inputData.fieldArea;
  tableData.priceFieldK =
    tableData.priceGaK * inputData.fieldArea;

}
function Calculate(inputData) {
  const tableData = InitTableData();
  CalculateDoses(inputData, tableData);
  CalculatePrice(inputData, tableData);
  FillResultTable(inputData, tableData);
}


function ChangeFertilizerPrice(priceSelector, fertilizerName) {
  const fertilizer = Fertilizers.find(f => f.name === fertilizerName);
  if (fertilizer) {
    document.getElementById(priceSelector).value = fertilizer.price;
  }
}


// ! Изменение площади при изменении поля
// * НЕ ОБЩАЯ (ДЛЯ ПОЛЕЙ)

function GetFieldArea(fieldSelect) {
  for (const elem of fieldsList) {
    if (fieldSelect.value === elem.name) {
      document.getElementById('field-area').value = elem.area;
      return;
    }
  }
}
function AddFields(fieldSelect) {
  fieldSelect.textContent = '';
  fieldsList.forEach(elem => {
    let option = document.createElement('option');
    option.textContent = elem.name;
    fieldSelect.appendChild(option);
  });
}

function PaintTheCell(minLimit, maxLimit, element) {
  console.log(minLimit, maxLimit, element)
  if (element.value < 0) {
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


function BindInput() {
  calculatorParams = document.getElementById('calculator-params');

  // ! Изменение цены удобрений
  const fertilizerMap = {
    nitrogen: 'nitrogen-price',
    phosphorus: 'phosphorus-price',
    potassium: 'potassium-price'
  };
  calculatorParams.addEventListener('change', event => {
    const priceId = fertilizerMap[event.target.id];
    if (priceId) {
      ChangeFertilizerPrice(priceId, event.target.value);
    }

    if (manualPageFlag) {
      const limits = NPK_LIMITS[event.target.id];
      if (limits) {
        PaintTheCell(limits.min, limits.max, event.target);
      }
    }
  });
}

function RenderCalculatorParams() {
  const calculatorParamsWrapper = calculatorParams.querySelector('.calculator-params__wrapper');

  let classes = manualPageFlag ? ['container', 'calculator-params__wrapper', 'calculator-params__wrapper--manual'] : ['container', 'calculator-params__wrapper'];

  let content = manualPageFlag ? paramsTemplates.mainPage : paramsTemplates.clientPage;

  calculatorParams.removeChild(calculatorParamsWrapper);
  const wrapper = document.createElement('div')
  wrapper.classList.add(...classes)
  wrapper.innerHTML = content;
  calculatorParams.appendChild(wrapper)
}