import { Crops, Fertilizers, Clients } from "./data.js";
// import { Fertilizers } from './fertilizer.js';
// import { Clients } from './fields.js';
import { paramsTemplates } from "./templates.js";

const NPK_LIMITS = {
  "nitrogen-value": { min: 2.9, max: 6.2 },
  "phosphorus-value": { min: 20, max: 40 },
  "potassium-value": { min: 6, max: 12 },
};

const ELEMENTS = ["nitrogen", "phosphorus", "potassium"];

const CLIENTS_MAP = {
  "ао «печерское» ставропольский район": Clients.pecherskoeStavropol,
  "ао «печерское» сызранский район": Clients.pecherskoeSyzran,
  "кфх «планин»": Clients.planin,
  "ооо «нур»": Clients.nur,
  "ооо «дуслык»": Clients.duslyk,
  "ооо «аняк»": Clients.anyak,
  "ооо «туган як»": Clients.tuganYak,
  "ао «аф «старомаинская»": Clients.staromainskaya,
  "кфх «абдуллин»": Clients.abdullin,
};

class CalculatorApp {
  constructor() {
    this.calculateButton;
    this.calculatorParams;

    this.fieldsList;

    this.clientNameElem;
    this.currentClient;

    this.isManualPage = true;
  }

  init() {
    this.calculateButton = document.getElementById("calculate-button");
    this.calculatorParams = document.getElementById("calculator-params");
    this.clientNameElem = document.getElementById("client-name");
    this.currentClient = document.getElementsByClassName("clients__button")[0];
  }

  bindEvents() {
    this.onParamsChange();

    this.onParamsFocus();

    this.onDocumentClick();
  }

  onParamsChange() {
    this.calculatorParams.addEventListener("change", (event) => {
      // * Обнуление при отрицательном вводе
      if (event.target.type === "number" && event.target.value < 0) {
        event.target.value = 0;
      }

      // * Бинд изменения цены удобрений
      const fertilizerMap = {
        nitrogen: "nitrogen-price",
        phosphorus: "phosphorus-price",
        potassium: "potassium-price",
      };
      if (fertilizerMap[event.target.id]) {
        this.ChangeFertilizerPrice(
          fertilizerMap[event.target.id],
          event.target.value,
        );
      }
    });
  }

  onParamsFocus() {
    this.calculatorParams.addEventListener("focusin", (event) => {
      // * Стирание при фокусе на инпут
      if (event.target.type === "number") {
        event.target.value = "";
      }
    });
    this.calculatorParams.addEventListener("focusout", (event) => {
      // ! Перекрашивание содержания NPK
      const limits = NPK_LIMITS[event.target.id];
      if (this.isManualPage && limits) {
        this.PaintTheCell(limits.min, limits.max, event.target);
      }
    });
  }

  onDocumentClick() {
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (target.closest("#clients")) {
        const isInactiveClientButton =
          target.classList.contains("clients__button") &&
          !target.classList.contains("clients__button--active");
        const shouldGoToManual =
          target.id === "back-to-manual" && !this.isManualPage;
        if (isInactiveClientButton || shouldGoToManual) {
          this.isManualPage = shouldGoToManual;
          this.changeClient(target);
        }
      }
      if (target.id === "calculate-button") {
        this.mainCalculate();
      }
    });
  }

  changeClient(newClientButton) {
    this.RenderCalculatorParams();
    let newName = "";
    if (!this.isManualPage) {
      const fieldSelect = document.getElementById("fields");
      const fields = this.getFields(newClientButton.textContent);
      if (!fields) return;
      this.fieldsList = fields;
      this.addFields(fieldSelect);
      this.fillArea(fieldSelect);

      newName = newClientButton.textContent;
    }
    this.changeActiveClient(newClientButton, newName);
  }

  RenderCalculatorParams() {
    const calculatorParamsWrapper = this.calculatorParams.querySelector(
      ".calculator-params__wrapper",
    );

    let classes = this.isManualPage
      ? [
          "container",
          "calculator-params__wrapper",
          "calculator-params__wrapper--manual",
        ]
      : ["container", "calculator-params__wrapper"];

    let content = this.isManualPage
      ? paramsTemplates.mainPage
      : paramsTemplates.clientPage;

    this.calculatorParams.removeChild(calculatorParamsWrapper);
    const wrapper = document.createElement("div");
    wrapper.classList.add(...classes);
    wrapper.innerHTML = content;
    this.calculatorParams.appendChild(wrapper);
  }

  getFields(clientName) {
    const key = clientName.toLocaleLowerCase();
    if (CLIENTS_MAP[key]) return CLIENTS_MAP[key];
    alert("Ошибка выбора хозяйства");
    return false;
  }

  addFields(fieldSelect) {
    fieldSelect.textContent = "";
    this.fieldsList.forEach((elem) => {
      let option = document.createElement("option");
      option.textContent = elem.name;
      fieldSelect.appendChild(option);
    });
  }

  fillArea(fieldSelect) {
    const areaInput = document.getElementById("field-area");
    for (const elem of this.fieldsList) {
      if (fieldSelect.value === elem.name) {
        areaInput.value = elem.area;
        return;
      }
    }
  }

  changeActiveClient(newClientButton, newName) {
    this.currentClient.classList.remove("clients__button--active");
    newClientButton.classList.add("clients__button--active");
    this.currentClient = newClientButton;
    this.clientNameElem.textContent = newName;
  }

  mainCalculate() {
    const inputData = new InputData(this);
    inputData.init();
    const outputData = new OutputData();
    outputData.init();

    this.CalculateDoses(inputData, outputData);
    this.CalculatePrice(inputData, outputData);
    outputData.PrintResult(outputData);
  }

  CalculateDoses(inputData, outputData) {
    const correction = { nitrogen: 1, phosphorus: 1, potassium: 0.8 };

    ["phosphorus", "nitrogen", "potassium"].forEach((key) => {
      let dose =
        inputData.fertilityCoefficients[key] *
        inputData.harvest *
        inputData.crop[key];

      // Вычитаем влияние фосфора для N и K
      if (key !== "phosphorus") {
        dose -=
          ((inputData.fertilizers.phosphorus[key] ?? 0) *
            (outputData.phosphorus.physWeightByGa ?? 0)) /
          100;
      }

      // Проверяем доступность значения удобрения и применяем коэффициент
      const fertilizerValue = inputData.fertilizers[key]?.[key] ?? 0;

      outputData[key].physWeightByGa =
        fertilizerValue <= 0
          ? 0
          : Math.round(
              (((dose * 100) / fertilizerValue) * correction[key]) / 5,
            ) * 5;

      outputData[key].physWeightByField = Math.round(
        (outputData[key].physWeightByGa / 1000) * inputData.fieldArea,
      );
    });
  }

  CalculatePrice(inputData, outputData) {
    ELEMENTS.forEach((key) => {
      outputData[key].priceByGa = Math.round(
        outputData[key].physWeightByGa * inputData.fertilizers[key].price,
      );
      outputData[key].priceByField =
        outputData[key].priceByGa * inputData.fieldArea;
    });

    outputData.total.priceByGa =
      outputData.nitrogen.priceByGa +
      outputData.phosphorus.priceByGa +
      outputData.potassium.priceByGa;

    outputData.total.priceByField =
      outputData.nitrogen.priceByField +
      outputData.phosphorus.priceByField +
      outputData.potassium.priceByField;
  }

  PaintTheCell(minLimit, maxLimit, element) {
    if (element.value <= 0 || element.value === "") {
      element.value = 0;
      element.style.backgroundColor = "#ffffff";
    } else if (element.value < minLimit) {
      element.style.backgroundColor = "#ee8238";
    } else if (element.value >= minLimit && element.value <= maxLimit) {
      element.style.backgroundColor = "#79b252";
    } else if (element.value > maxLimit) {
      element.style.backgroundColor = "#ffc30d";
    }
  }

  ChangeFertilizerPrice(priceSelector, fertilizerName) {
    const fertilizer = Fertilizers.find((f) => f.name === fertilizerName);
    if (fertilizer) {
      document.getElementById(priceSelector).value = fertilizer.price;
    }
  }
}

class InputData {
  constructor(calculatorApp) {
    this.app = calculatorApp;
    // Основные параметры поля
    this.fieldName = "";
    this.fieldArea = "";
    this.harvest = "";

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
      },
    };
  }

  init() {
    this.fieldName = this.app.isManualPage ? "" : getInputValueById("fields");
    this.fieldArea = getInputValueById("field-area");
    this.harvest = getInputValueById("harvest") * 0.7;

    this.crop = this.getCrop("crop");

    /** Коэф. на агрохим. показатели поля */
    this.fertilityCoefficients = this.getFertilityCoefficients();

    this.fertilizers = this.getFertilizers();
  }

  getFertilizers() {
    const fertilizers = {};
    ELEMENTS.forEach((key) => {
      const name = getInputValueById(key);
      fertilizers[key] = {
        name,
        price: getInputValueById(`${key}-price`),
        ...this.fertilizerCatch(name),
      };
    });
    return fertilizers;
  }

  fertilizerCatch(name) {
    const fertilizer = Fertilizers.find((f) => f.name === name);
    if (fertilizer) {
      return {
        nitrogen: fertilizer.nitrogen,
        phosphorus: fertilizer.phosphorus,
        potassium: fertilizer.potassium,
        sulfur: fertilizer.sulfur,
      };
    }
    return {
      nitrogen: undefined,
      phosphorus: undefined,
      potassium: undefined,
      sulfur: undefined,
    };
  }

  getCrop(id) {
    const value = getInputValueById(id);
    const crop = Crops.find((c) => c.name === value);
    if (crop) {
      return {
        name: value,
        nitrogen: crop.nitrogen,
        phosphorus: crop.phosphorus,
        potassium: crop.potassium,
      };
    } else
      return {
        name: undefined,
        nitrogen: undefined,
        phosphorus: undefined,
        potassium: undefined,
      };
  }

  getFertilityValue() {
    console.log(this.app.isManualPage);

    if (this.app.isManualPage) {
      return {
        nitrogen: getInputValueById("nitrogen-value"),
        phosphorus: getInputValueById("phosphorus-value"),
        potassium: getInputValueById("potassium-value"),
      };
    } else {
      const field = this.app.fieldsList.find((f) => this.fieldName === f.name);
      if (field) {
        return {
          nitrogen: field.organic,
          phosphorus: field.phosphorus,
          potassium: field.potassium,
        };
      }
    }
    return {
      nitrogen: undefined,
      phosphorus: undefined,
      potassium: undefined,
    };
  }

  getFertilityCoefficients() {
    const LIMITS = {
      nitrogen: [
        { max: 2.9, k: 1 },
        { max: 6.2, k: 0.75 },
        { max: Infinity, k: 0.6 },
      ],
      phosphorus: [
        { max: 20, k: 1.3 },
        { max: 25, k: 1.2 },
        { max: 30, k: 1.1 },
        { max: 35, k: 1.0 },
        { max: 40, k: 0.9 },
        { max: Infinity, k: 0.7 },
      ],
      potassium: [
        { max: 6, k: 1.5 },
        { max: 7.5, k: 1.1 },
        { max: 9, k: 1.0 },
        { max: 10.5, k: 0.9 },
        { max: 12, k: 0.8 },
        { max: Infinity, k: 0.7 },
      ],
    };

    const { nitrogen, phosphorus, potassium } = this.getFertilityValue(
      this.app.fieldsList,
    );
    // Таблица диапазонов и коэффициентов
    const getCoefficients = (value, table) =>
      table.find(({ max }) => value < max)?.k ?? table.at(-1).k;

    const nitrogenCoefficient = getCoefficients(nitrogen, LIMITS.nitrogen);
    const phosphorusCoefficient = getCoefficients(
      phosphorus,
      LIMITS.phosphorus,
    );
    const potassiumCoefficient = getCoefficients(potassium, LIMITS.potassium);

    console.log(
      `Коэффициенты:
		Азот: ${nitrogenCoefficient}
		Фосфор: ${phosphorusCoefficient}
		Калий: ${potassiumCoefficient}`,
    );

    return {
      nitrogen: nitrogenCoefficient,
      phosphorus: phosphorusCoefficient,
      potassium: potassiumCoefficient,
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
      },
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
      },
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
      },
    };
    this.total = {
      priceByGa: "",
      priceByField: "",
    };
  }

  init() {
    this.nitrogen = this.createElementSet("nitrogen");
    this.phosphorus = this.createElementSet("phosphorus");
    this.potassium = this.createElementSet("potassium");

    this.total = {
      priceByGa: "",
      priceByField: "",
      tableCells: {
        priceByGa: document.getElementById("price-ga-total"),
        priceByField: document.getElementById("price-field-total"),
      },
    };
  }

  createElementSet(prefix) {
    return {
      physWeightByGa: "",
      physWeightByField: "",
      priceByGa: "",
      priceByField: "",
      tableCells: {
        physWeightByGa: document.getElementById(`phys-ga-${prefix}`),
        physWeightByField: document.getElementById(`phys-field-${prefix}`),
        priceByGa: document.getElementById(`price-ga-${prefix}`),
        priceByField: document.getElementById(`price-field-${prefix}`),
      },
    };
  }

  PrintResult() {
    ELEMENTS.forEach((key) => {
      this[key].tableCells.physWeightByGa.textContent =
        this[key].physWeightByGa;
      this[key].tableCells.physWeightByField.textContent =
        this[key].physWeightByField;

      this[key].tableCells.priceByGa.textContent =
        `${this[key].priceByGa.toLocaleString("ru-RU")} ₽`;
      this[key].tableCells.priceByField.textContent =
        `${this[key].priceByField.toLocaleString("ru-RU")} ₽`;
    });
    this.total.tableCells.priceByGa.textContent = `${this.total.priceByGa.toLocaleString("ru-RU")} ₽`;
    this.total.tableCells.priceByField.textContent = `${this.total.priceByField.toLocaleString("ru-RU")} ₽`;
  }
}

function getInputValueById(id) {
  return document.getElementById(id).value;
}

document.addEventListener("DOMContentLoaded", () => {
  const calculatorApp = new CalculatorApp();
  calculatorApp.init();
  calculatorApp.bindEvents();
});
