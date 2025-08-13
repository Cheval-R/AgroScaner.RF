import { removal } from './crops.js';
import { activeSubstance } from './fertilizer.js';
import { fieldsNur, fieldsPlanin, fieldsPecherskoeStavropol, fieldsPecherskoeSyzran, fieldsDuslyk, fieldsAnyak, fieldsTuganYak } from './fields.js';

document.addEventListener('DOMContentLoaded', function () {
  // ! Определение хозяйства
  const mainPageFlag = document.getElementById('main-page') ? true : false;
  const companyName = document.querySelector('.companies__button--active');
  const fieldsList = !mainPageFlag ? getCompanyName(companyName) : '';

  function getCompanyName(companyName) {
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

  const calculateButton = document.getElementById('calculate');

  calculateButton.addEventListener('click', function () {
    // !Заполнение данных в объект
    let inputData = {
      /** Номер поля */
      fieldName: '',
      /** Площадь поля */
      fieldArea: '',
      /** Культура */
      crop: '',
      /** План.урожай */
      harvest: '',


      /** Коэф. на агрохим. показатели поля N */
      nitrogenCoefficient: 0,
      /** Коэф. на агрохим. показатели поля P */
      phosphorusCoefficient: 0,
      /** Коэф. на агрохим. показатели поля K */
      potassiumCoefficient: 0,

      /** Вынос культурой азота */
      cropNitrogen: 0,
      /** Вынос культурой фосфора */
      cropPhosphorus: 0,
      /** Вынос культурой калия */
      cropPotassium: 0,

      /** Донные по азотному удобрению */
      fertilizerN: {
        name: '',
        nitrogen: 0,
        phosphorus: 0,
        potassium: 0,
        sulfur: 0,
        price: document.getElementById('nitrogen-price').value,
      },

      /** Донные по фосфорному удобрению */
      fertilizerP: {
        name: '',
        nitrogen: 0,
        phosphorus: 0,
        potassium: 0,
        sulfur: 0,
        price: document.getElementById('phosphorus-price').value,
      },

      /** Донные по калийному удобрению */
      fertilizerK: {
        name: '',
        nitrogen: 0,
        phosphorus: 0,
        potassium: 0,
        sulfur: 0,
        price: document.getElementById('potassium-price').value,
      },
    };

    getInput(inputData);
    calculateDoses(inputData);

    console.log('inputData', inputData);
  });


  // !Заполнение inputData
  function getInput(inputData) {
    if (companyName) {
      inputData.fieldName = document.getElementById('fields').value;
    }
    inputData.fieldArea = document.getElementById('field-area').value;
    inputData.crop = document.getElementById('crop').value;
    inputData.harvest = (document.getElementById('harvest').value) * 0.7;
    inputData.fertilizerN.name = document.getElementById('nitrogen').value;
    inputData.fertilizerP.name = document.getElementById('phosphorus').value;
    inputData.fertilizerK.name = document.getElementById('potassium').value;


    // ! Получение выноса культуры
    getCropData(inputData);

    // ! Получение данных поля
    getFieldData(inputData);

    // ! Получение данных об удобрениях
    fertilizerCatch(inputData);
  }

  // ? Получение данных о выносе культуры
  /** Получение данных о выносе культуры */
  function getCropData(inputData) {
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
  function getFieldData(inputData) {
    if (mainPageFlag) {
      const nValue = document.getElementById('n-value').value;
      const pValue = document.getElementById('p-value').value;
      const kValue = document.getElementById('k-value').value;
      const coefficients = getCoefficient(nValue, pValue, kValue)
      inputData.nitrogenCoefficient = coefficients[0];
      inputData.phosphorusCoefficient = coefficients[1];
      inputData.potassiumCoefficient = coefficients[2];
    }
    else {
      console.log('Поля:\t', inputData.fieldName);
      fieldsList.forEach(function (field) {
        if (inputData.fieldName === field.name) {
          console.log('АХ показатели:\t', field.organic, field.phosphorus, field.potassium);

          const coefficients = getCoefficient(field.organic, field.phosphorus, field.potassium)
          inputData.nitrogenCoefficient = coefficients[0];
          inputData.phosphorusCoefficient = coefficients[1];
          inputData.potassiumCoefficient = coefficients[2];
        }
      });
    }
  }

  // ! Получение коэффициентов агрохим. показателей поля
  /** Получение коэффициентов агрохим. показателей поля */
  function getCoefficient(nitrogen, phosphorus, potassium) {
    let nitrogenCoefficient;
    if (nitrogen < 2.9) {
      nitrogenCoefficient = 1;
    } else if (nitrogen >= 2.9 && nitrogen <= 6.2) {
      nitrogenCoefficient = 0.75;
    } else if (nitrogen > 6.2) {
      nitrogenCoefficient = 0.6;
    }

    let phosphorusCoefficient;
    if (phosphorus < 20) {
      phosphorusCoefficient = 1.3;
    } else if (phosphorus >= 20 && phosphorus < 25) {
      phosphorusCoefficient = 1.2;
    } else if (phosphorus >= 25 && phosphorus < 30) {
      phosphorusCoefficient = 1.1;
    } else if (phosphorus >= 30 && phosphorus < 35) {
      phosphorusCoefficient = 1;
    } else if (phosphorus >= 35 && phosphorus < 40) {
      phosphorusCoefficient = 0.9;
    } else if (phosphorus > 40) {
      phosphorusCoefficient = 0.7;
    }


    let potassiumCoefficient;
    if (potassium < 6) {
      potassiumCoefficient = 1.5;
    } else if (potassium >= 6 && potassium < 7.5) {
      potassiumCoefficient = 1.1;
    } else if (potassium >= 7.5 && potassium < 9) {
      potassiumCoefficient = 1.0;
    } else if (potassium >= 9 && potassium < 10.5) {
      potassiumCoefficient = 0.9;
    } else if (potassium >= 10.5 && potassium < 12) {
      potassiumCoefficient = 0.8;
    } else if (potassium > 12) {
      potassiumCoefficient = 0.7;
    }

    console.log(
      `Коэффициенты:
		Азот: ${nitrogenCoefficient}
		Фосфор: ${phosphorusCoefficient}
		Калий: ${potassiumCoefficient}`
    );

    return [nitrogenCoefficient, phosphorusCoefficient, potassiumCoefficient];
  }

  // ! Получение данных об удобрениях
  /** Получение данных об удобрениях */
  function fertilizerCatch(inputData) {
    activeSubstance.forEach(elem => {
      // *Азотное удобрение
      if (inputData.fertilizerN.name === elem.name) {
        getFertilizerData(inputData.fertilizerN, elem);
      }
      // *Фосфорное удобрение
      if (inputData.fertilizerP.name === elem.name) {
        getFertilizerData(inputData.fertilizerP, elem);
      }
      // *Калийное удобрение
      if (inputData.fertilizerK.name === elem.name) {
        getFertilizerData(inputData.fertilizerK, elem);
      }
    });
  }

  // ? Заполнение ДВ удобрений
  /** Заполнение ДВ удобрений */
  function getFertilizerData(fertilizerData, currentFertilizer) {
    fertilizerData.nitrogen = currentFertilizer.nitrogen;
    fertilizerData.phosphorus = currentFertilizer.phosphorus;
    fertilizerData.potassium = currentFertilizer.potassium;
    fertilizerData.sulfur = currentFertilizer.sulfur;
  }

  function calculateDoses(inputData) {
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
    }
    if (physWeightP > 0) {
      document.getElementById('phys-ga-phosphorus').textContent = physWeightP;
    }
    if (physWeightK > 0) {
      document.getElementById('phys-ga-potassium').textContent = physWeightK;
    }

    if (physWeightN > 0) {
      document.getElementById('phys-field-nitrogen').textContent = (physWeightN / 1000 * inputData.fieldArea).toFixed(1);
    }
    if (physWeightP > 0) {
      document.getElementById('phys-field-phosphorus').textContent = (physWeightP / 1000 * inputData.fieldArea).toFixed(1);
    }
    if (physWeightK > 0) {
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




  // ! Изменение цены удобрений
  console.log('asdadsa', document.getElementById('nitrogen'))
  document.getElementById('nitrogen').addEventListener('change', function () {
    changeFertilizerPrice("nitrogen-price", this.value);
  });
  document.getElementById('phosphorus').addEventListener('change', function () {
    changeFertilizerPrice("phosphorus-price", this.value);
  });
  document.getElementById('potassium').addEventListener('change', function () {
    changeFertilizerPrice("potassium-price", this.value);
  });

  function changeFertilizerPrice(priceSelector, fertilizerName) {
    activeSubstance.forEach(fertilizer => {
      if (fertilizer.name === fertilizerName) {
        document.getElementById(priceSelector).value = fertilizer.price;
      }
    })
  }


  // ! Изменение площади при изменении поля
  // * НЕ ОБЩАЯ (ДЛЯ ПОЛЕЙ)
  if (!mainPageFlag) {
    const fieldSelect = document.getElementById('fields');
    // !Добавляем обработчик события change
    fieldSelect.addEventListener('change', function () {
      fieldsList.forEach(elem => {
        if (fieldSelect.value === elem.name) {
          document.getElementById('field-area').value = elem.area;
        }
      });
    });
  }
  else {
    // * НЕ ОБЩИЕ (ДЛЯ ГЛАВНОЙ СТРАНИЦЫ) 
    document.getElementById('n-value').addEventListener('change', function () {
      paintTheCell(2.9, 6.2, this);
    })
    document.getElementById('p-value').addEventListener('change', function () {
      paintTheCell(20, 40, this);
    })
    document.getElementById('k-value').addEventListener('change', function () {
      paintTheCell(6, 12, this);
    })

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
  }

  document.getElementById('input-table').addEventListener('change', function (event) {
    if (["field-area",
      "harvest",
      "nitrogen-price",
      "phosphorus-price",
      "potassium-price"
    ].includes(event.target.id)) {
      setZeroValueInput(event.target);
    }
  })

  function setZeroValueInput(input) {
    if (input.value < 0) {
      input.value = 0;
    }
  }
});