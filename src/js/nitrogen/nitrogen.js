document.addEventListener("DOMContentLoaded", () => {
  const depthElem = document.getElementById("depth");
  const techElem = document.getElementById("tech");
  const areaElem = document.getElementById("area");

  const nitroElem = document.getElementById("nitro");
  const zoneElem = document.getElementById("zone");

  const cropElem = document.getElementById("crop");
  const plantPerHaElem = document.getElementById("plants");

  const fertilizerElem = document.getElementById("fertilizer");
  const nitrogenValueElem = document.getElementById("nitrogen-value");
  const priceElem = document.getElementById("price");

  const resultElem = document.getElementById("result");

  document
    .getElementById("nitrogen-form")
    .addEventListener("submit", (event) => {
      resultElem.textContent = "";
      event.preventDefault();

      if (!validateInputs()) {
        return;
      }

      const dose = calculateDose();
      if (dose === null) {
        alert(
          "На основе введенных данных невозможно рассчитать дозу азота. Пожалуйста, проверьте правильность введенных данных.",
        );
        return;
      }

      resultElem.classList.remove("visually-hidden");
      resultElem.textContent = `Рекомендуемая доза азота: ${dose} кг/га`;

      if (!validateInputsForCost()) {
        return;
      }

      calculateCost(dose);
    });

  function calculateCost(dose) {
    const area = parseFloat(areaElem.value);
    const nitrogenValue = parseFloat(nitrogenValueElem.value);
    const price = parseFloat(priceElem.value);

    if (isNaN(area) || isNaN(nitrogenValue) || isNaN(price)) {
      alert(
        "Пожалуйста, введите корректные значения площади, содержания азота и цены.",
      );
      return;
    }

    const physWeight = (dose * area) / (nitrogenValue / 100);
    const cost = physWeight * price;

    resultElem.textContent += ` | Стоимость удобрения: ${cost.toFixed(2)} руб. | Физический вес: ${physWeight.toFixed(2)} кг`;
  }

  function validateInputs() {
    const nitroElemLabel = nitroElem.closest("label");
    if (
      nitroElem.value === "" ||
      isNaN(nitroElem.value) ||
      parseFloat(nitroElem.value) < 0
    ) {
      alert(
        "Пожалуйста, введите корректное содержание азота (положительное число).",
      );
      nitroElemLabel.classList.add("input-error");
      console.warn("Ошибка валидации: некорректное значение азота.");
      return false;
    } else {
      nitroElemLabel.classList.remove("input-error");
      return true;
    }
  }

  function validateIsNum(value) {
    if (value === "" || parseFloat(value) <= 0 || parseFloat(value) === NaN) {
      return false;
    }
    return true;
  }

  function validateInputsForCost() {
    if (
      !validateIsNum(areaElem.value) ||
      !validateIsNum(nitrogenValueElem.value) ||
      !validateIsNum(priceElem.value) ||
      fertilizerElem === "none"
    ) {
      return false;
    }
    return true;
  }

  function calculateNitrogenLevel() {
    const depth = depthElem.value;
    const nitro = parseFloat(nitroElem.value);
    switch (depth) {
      case "20":
        return nitro > 20
          ? "none"
          : nitro >= 15
            ? "medium"
            : nitro >= 10
              ? "high"
              : "very_high";
      case "40":
        return nitro > 15
          ? "none"
          : nitro >= 10
            ? "medium"
            : nitro >= 5
              ? "high"
              : "very_high";
      case "60":
        return nitro > 12
          ? "none"
          : nitro >= 8
            ? "medium"
            : nitro >= 3
              ? "high"
              : "very_high";
      default:
        return null;
    }
  }

  function calculateDose() {
    const zone = "forestSteppe";
    const crop = cropElem.value;
    const tech = techElem.value;
    const nitrogenLevel = calculateNitrogenLevel();
    return nitrogenLevel !== null
      ? getDoseRange({ tech, zone, crop, nitrogenLevel })
      : null;
  }

  const DOSE_TABLE = {
    extensive: {
      very_high: {
        // taiga: { cereals: 25, row: 25, herbs: 0 },
        forestSteppe: 17,
        // steppe: { cereals: 9, row: 9, herbs: 0 },
      },
      high: {
        // taiga: { cereals: 12.5, row: 15, herbs: 0 },
        forestSteppe: { cereals: 9, row: 9, herbs: 0 },
        // steppe: 0,
      },
      medium: {
        // taiga: 0,
        forestSteppe: 0,
        // steppe: 0,
      },
      none: {
        // taiga: 0,
        forestSteppe: 0,
        // steppe: 0,
      },
    },
    simple: {
      very_high: {
        // taiga: { cereals: 35, row: 50, herbs: 50 },
        forestSteppe: { cereals: 25, row: 25, herbs: 35 },
        // steppe: { cereals: 12.5, row: 25, herbs: 25 },
      },
      high: {
        // taiga: { cereals: 25, row: 35, herbs: 35 },
        forestSteppe: { cereals: 15, row: 15, herbs: 25 },
        // steppe: { cereals: 9, row: 15, herbs: 15 },
      },
      medium: {
        // taiga: { cereals: 15, row: 15, herbs: 0 },
        forestSteppe: 0,
        // steppe: 0,
      },
      none: {
        // taiga: 0,
        forestSteppe: 0,
        // steppe: 0,
      },
    },
    intensive: {
      very_high: {
        // taiga: { cereals: 85, row: 105, herbs: 105 },
        forestSteppe: { cereals: 70, row: 90, herbs: 90 },
        // steppe: { cereals: 50, row: 70, herbs: 70 },
      },
      high: {
        // taiga: { cereals: 70, row: 80, herbs: 80 },
        forestSteppe: { cereals: 50, row: 70, herbs: 70 },
        // steppe: { cereals: 35, row: 55, herbs: 50 },
      },
      medium: {
        // taiga: { cereals: 50, row: 60, herbs: 60 },
        forestSteppe: { cereals: 35, row: 50, herbs: 50 },
        // steppe: { cereals: 22.5, row: 40, herbs: 35 },
      },
      none: {
        // taiga: 0,
        forestSteppe: 0,
        // steppe: 0,
      },
    },
  };

  function getDoseRange({ tech, zone, crop, nitrogenLevel }) {
    let dose = 0;
    const zoneValue = DOSE_TABLE?.[tech]?.[nitrogenLevel]?.[zone];
    console.log(zoneValue);

    if (zoneValue !== null && typeof zoneValue === "object") {
      dose = zoneValue?.[crop] ?? null;
    }
    if (dose === null) {
      return dose;
    }

    const planPerHa = parseFloat(plantPerHaElem.value);

    console.log(plantPerHaElem.value);
    console.log(crop);
    console.log(planPerHa);
    console.log(dose);
    if (
      validateIsNum(plantPerHaElem.value) &&
      crop === "cereals" &&
      planPerHa > 0 &&
      validateIsNum(dose)
    ) {
      return planPerHa > 500
        ? dose * 0.8
        : planPerHa > 400
          ? dose * 0.9
          : planPerHa > 300
            ? dose
            : planPerHa > 200
              ? dose * 1.15
              : dose * 1.3;
    }
    return dose ?? null;
  }
});
