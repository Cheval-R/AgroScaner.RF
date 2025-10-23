import { removal } from './crops.js';
import { activeSubstance } from './fertilizer.js';
import { fieldsNur, fieldsPlanin, fieldsPecherskoeStavropol, fieldsPecherskoeSyzran, fieldsDuslyk, fieldsAnyak, fieldsTuganYak } from './fields.js';
import { mainPage, clientPage } from "./blocks.js";

let
  inputWrapper,
  fieldsList = '',
  fieldSelect,
  areaInput,
  nitrogenSelect,
  phosphorusSelect,
  potassiumSelect,
  clientsList,
  companyName,
  currentClientIndex = 0;;
let manualPageFlag = true;



document.addEventListener('DOMContentLoaded', function () {
  // ! Определение хозяйства
  companyName = document.getElementById('company-name');
  clientsList = document.getElementById('clients');

  BindInput();

  // Смена клиента / ручной ввод
  clientsList.addEventListener('click', (event) => {
    ChangeCompany(event.target, companyName, clientsList);
  })

  // ! переписать в функцию
  document.getElementById('calculate').
    addEventListener('click', function () {
      const getFertilizer = (id) => ({
        name: '',
        nitrogen: 0,
        phosphorus: 0,
        potassium: 0,
        sulfur: 0,
        price: document.getElementById(id).value
      });

      // !Заполнение данных в объект
      let inputData = {
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

        fertilizerN: getFertilizer('nitrogen-price'),
        fertilizerP: getFertilizer('phosphorus-price'),
        fertilizerK: getFertilizer('potassium-price'),
      };

      GetInputData(inputData);
      CalculatePrice(inputData);
    });

  document.getElementById('input-wrapper').addEventListener('change', function (event) {
    if (["field-area",
      "harvest",
      "nitrogen-price",
      "phosphorus-price",
      "potassium-price"
    ].includes(event.target.id)) {
      setZeroValueInput(event.target);
    }
  })

});



// Получение объекта полей хозяйства
function GetFields(companyName) {
  console.log(companyName);

  switch (companyName.textContent.toLocaleLowerCase()) {
    case 'ао «печерское»':
      return fieldsPecherskoeStavropol;
    case 'ао «печерское»':
      return fieldsPecherskoeSyzran;
    case 'кфх «планин»':
      return fieldsPlanin;
    case 'ооо «нур»':
      return fieldsNur;
    case 'ооо «дуслык»':
      return fieldsDuslyk;
    case 'ооо «аняк»':
      return fieldsAnyak;
    case 'ооо «туган як»':
      return fieldsTuganYak;
    default:
      alert("Ошибка выбора хозяйства");
      return false;
  }
}

// Смена хозяйства
function ChangeCompany(newClient) {
  let newClientName = '';
  if (newClient.classList.contains('clients__button') &&
    (!newClient.classList.contains('clients__button--active'))) {
    if (newClient.id === 'back-to-manual' && !manualPageFlag) {
      manualPageFlag = true;
      FillInputWrapper(mainPage);
      BindInput();
    }
    else {
      manualPageFlag = false;
      FillInputWrapper(clientPage);
      BindInput();
      let fields = GetFields(newClient);
      if (fields) {
        newClientName = newClient.textContent;
        fieldsList = fields;
        AddFields(fieldSelect);
        GetFieldArea(fieldSelect);
      }
      else return;
    }
    currentClientIndex = ChangeActiveClient(currentClientIndex, newClient, companyName, newClientName)
  }
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
/** Получение данных о выносе культуры */
function GetCropData(inputData) {
  removal.forEach(function (removal) {
    if (removal.name === inputData.crop) {
      inputData.cropNitrogen = removal.nitrogen;
      inputData.cropPhosphorus = removal.phosphorus;
      inputData.cropPotassium = removal.potassium;
    }
  });
}

// ? Получение данных поля
/** Получение данных поля */
function GetFieldCoefficients(inputData) {
  let nValue, pValue, kValue;
  if (manualPageFlag) {
    nValue = document.getElementById('n-value').value;
    pValue = document.getElementById('p-value').value;
    kValue = document.getElementById('k-value').value;
  }
  else {
    fieldsList.forEach(function (field) {
      if (inputData.fieldName === field.name) {
        nValue = field.organic;
        pValue = field.phosphorus;
        kValue = field.potassium;
      }
    });
  }
  const { nitrogenCoefficient, phosphorusCoefficient, potassiumCoefficient } =
    GetNPKCoefficients(nValue, pValue, kValue);

  inputData.nitrogenCoefficient = nitrogenCoefficient;
  inputData.phosphorusCoefficient = phosphorusCoefficient;
  inputData.potassiumCoefficient = potassiumCoefficient;
}

// ! Получение коэффициентов агрохим. показателей поля
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
  activeSubstance.forEach(elem => {
    // *Азотное удобрение
    if (inputData.fertilizerN.name === elem.name) {
      GetFertilizerData(inputData.fertilizerN, elem);
    }
    // *Фосфорное удобрение
    if (inputData.fertilizerP.name === elem.name) {
      GetFertilizerData(inputData.fertilizerP, elem);
    }
    // *Калийное удобрение
    if (inputData.fertilizerK.name === elem.name) {
      GetFertilizerData(inputData.fertilizerK, elem);
    }
  });
}

// ? Заполнение ДВ удобрений
/** Заполнение ДВ удобрений */
function GetFertilizerData(fertilizerData, currentFertilizer) {
  fertilizerData.nitrogen = currentFertilizer.nitrogen;
  fertilizerData.phosphorus = currentFertilizer.phosphorus;
  fertilizerData.potassium = currentFertilizer.potassium;
  fertilizerData.sulfur = currentFertilizer.sulfur;
}

function CalculatePrice(inputData) {
  // ! Считаем дозы NPK
  const doseP =
    Math.round(inputData.phosphorusCoefficient * inputData.harvest * inputData.cropPhosphorus);
  const physWeightP =
    inputData.fertilizerP.phosphorus <= 0 ? 0 :
      Math.round((doseP * 100 / inputData.fertilizerP.phosphorus) / 5) * 5;

  const doseN =
    Math.round((inputData.nitrogenCoefficient * inputData.harvest * inputData.cropNitrogen) - (inputData.fertilizerP.nitrogen * physWeightP / 100));
  const physWeightN =
    inputData.fertilizerN.nitrogen <= 0 ? 0 :
      Math.round((doseN * 100 / inputData.fertilizerN.nitrogen) / 5) * 5;

  const doseK =
    Math.round((inputData.potassiumCoefficient * inputData.harvest * inputData.cropPotassium) - (inputData.fertilizerP.potassium * physWeightP / 100));
  const physWeightK =
    inputData.fertilizerK.potassium <= 0 ? 0 :
      Math.round(((doseK * 100 / inputData.fertilizerK.potassium) * 0.8) / 5) * 5;

  if (physWeightN > 0) {
    document.getElementById('phys-ga-nitrogen').textContent = physWeightN;
    document.getElementById('phys-field-nitrogen').textContent = (physWeightN / 1000 * inputData.fieldArea).toFixed(1);
  }
  if (physWeightP > 0) {
    document.getElementById('phys-ga-phosphorus').textContent = physWeightP;
    document.getElementById('phys-field-phosphorus').textContent = (physWeightP / 1000 * inputData.fieldArea).toFixed(1);
  }
  if (physWeightK > 0) {
    document.getElementById('phys-ga-potassium').textContent = physWeightK;
    document.getElementById('phys-field-potassium').textContent = (physWeightK / 1000 * inputData.fieldArea).toFixed(1);
  }
  // ! Расчет стоимости удобрений

  const priceGaN =
    Math.round(physWeightN * inputData.fertilizerN.price);
  const priceGaP =
    Math.round(physWeightP * inputData.fertilizerP.price);
  const priceGaK =
    Math.round(physWeightK * inputData.fertilizerK.price);

  const priceFieldN =
    priceGaN * inputData.fieldArea;
  const priceFieldP =
    priceGaP * inputData.fieldArea;
  const priceFieldK =
    priceGaK * inputData.fieldArea;


  if (priceGaN > 0) {
    document.getElementById('price-ga-nitrogen').textContent = `${priceGaN.toLocaleString('ru-RU')} ₽`;
    document.getElementById('price-field-nitrogen').textContent = `${priceFieldN.toLocaleString('ru-RU')} ₽`;
  }
  if (priceGaP > 0) {
    document.getElementById('price-ga-phosphorus').textContent = `${priceGaP.toLocaleString('ru-RU')} ₽`;
    document.getElementById('price-field-phosphorus').textContent = `${priceFieldP.toLocaleString('ru-RU')} ₽`;
  }
  if (priceGaK > 0) {
    document.getElementById('price-ga-potassium').textContent = `${priceGaK.toLocaleString('ru-RU')} ₽`;
    document.getElementById('price-field-potassium').textContent = `${priceFieldK.toLocaleString('ru-RU')} ₽`;
  }

  if (priceGaN + priceGaP + priceGaK) {
    document.getElementById('price-ga-total').textContent = `${(priceGaN + priceGaP + priceGaK).toLocaleString('ru-RU')} ₽`;
  }
  if (priceFieldN + priceFieldP + priceFieldK) {
    document.getElementById('price-field-total').textContent = `${(priceFieldN + priceFieldP + priceFieldK).toLocaleString('ru-RU')} ₽`;
  }
}


function changeFertilizerPrice(priceSelector, fertilizerName) {
  activeSubstance.forEach(fertilizer => {
    if (fertilizer.name === fertilizerName) {
      document.getElementById(priceSelector).value = fertilizer.price;
    }
  })
}


// ! Изменение площади при изменении поля
// * НЕ ОБЩАЯ (ДЛЯ ПОЛЕЙ)

function GetFieldArea(fieldSelect) {
  for (const elem of fieldsList) {
    if (fieldSelect.value === elem.name) {
      areaInput.value = elem.area;
      break;
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

function paintTheCell(minLimit, maxLimit, element) {
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
function setZeroValueInput(input) {
  if (input.value < 0) {
    input.value = 0;
  }
}
function BindInput() {
  // if (!mainPageFlag)
  fieldSelect = document.getElementById('fields');

  areaInput = document.getElementById('field-area');
  inputWrapper = document.getElementById('input-wrapper');
  nitrogenSelect = document.getElementById('nitrogen');
  phosphorusSelect = document.getElementById('phosphorus');
  potassiumSelect = document.getElementById('potassium');

  // ! Изменение цены удобрений
  nitrogenSelect.addEventListener('change', function () {
    changeFertilizerPrice("nitrogen-price", this.value);
  });
  phosphorusSelect.addEventListener('change', function () {
    changeFertilizerPrice("phosphorus-price", this.value);
  });
  potassiumSelect.addEventListener('change', function () {
    changeFertilizerPrice("potassium-price", this.value);
  });
}

function FillInputWrapper(tablesObject) {
  if (manualPageFlag) {
    inputWrapper.classList.add('information__wrapper--manual');
  }
  else
    inputWrapper.classList.remove('information__wrapper--manual');

  inputWrapper.textContent = '';
  tablesObject.forEach(element => {
    inputWrapper.innerHTML += element;
  });
}