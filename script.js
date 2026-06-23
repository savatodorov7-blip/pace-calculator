const form = document.querySelector("#pace-form");
const distanceInput = document.querySelector("#distance");
const minutesInput = document.querySelector("#minutes");
const secondsInput = document.querySelector("#seconds");
const customPaceMinutesInput = document.querySelector("#custom-pace-minutes");
const customPaceSecondsInput = document.querySelector("#custom-pace-seconds");
const applyCustomPaceButton = document.querySelector("#apply-custom-pace");
const errorMessage = document.querySelector("#error-message");
const paceResult = document.querySelector("#pace-result");
const speedResult = document.querySelector("#speed-result");
const splitsList = document.querySelector("#splits-list");
const raceSplitsList = document.querySelector("#race-splits-list");
const distancePresetButtons = document.querySelectorAll(".distance-preset-button");
const pacePresetButtons = document.querySelectorAll(".pace-preset-button");
const repForm = document.querySelector("#rep-form");
const repDistanceInput = document.querySelector("#rep-distance");
const repPaceMinutesInput = document.querySelector("#rep-pace-minutes");
const repPaceSecondsInput = document.querySelector("#rep-pace-seconds");
const repErrorMessage = document.querySelector("#rep-error-message");
const repTimeResult = document.querySelector("#rep-time-result");
const repPresetButtons = document.querySelectorAll(".rep-preset-button");
const repPacePresetButtons = document.querySelectorAll(".rep-pace-preset-button");
const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");
const introCopy = document.querySelector("#intro-copy");

const splitDistances = [200, 400, 600, 800, 1000];
const introTextByPanel = {
  "race-panel": "Enter a race distance and finish time to calculate pace, speed, and cumulative splits.",
  "workout-panel": "Enter a rep distance and target pace per kilometer to calculate the target rep time."
};

function setActivePreset(buttons, activeButton) {
  buttons.forEach((button) => {
    button.classList.toggle("is-active", button === activeButton);
  });
}

function clearActivePreset(buttons) {
  buttons.forEach((button) => {
    button.classList.remove("is-active");
  });
}

function showTab(panelId) {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.tabTarget === panelId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  tabPanels.forEach((panel) => {
    panel.hidden = panel.id !== panelId;
  });

  introCopy.textContent = introTextByPanel[panelId];
}

function formatTime(totalSeconds) {
  const roundedTenths = Math.round(totalSeconds * 10);
  const minutes = Math.floor(roundedTenths / 600);
  const secondsTenths = roundedTenths % 600;
  const seconds = Math.floor(secondsTenths / 10);
  const tenths = secondsTenths % 10;

  if (tenths === 0) {
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}.${tenths}`;
}

function showPlaceholderResults() {
  paceResult.textContent = "--:--";
  speedResult.textContent = "-- km/h";
  splitsList.innerHTML = splitDistances
    .map((distance) => `<div class="split-row"><span>${distance}m</span><strong>--:--</strong></div>`)
    .join("");
  raceSplitsList.innerHTML = `
    <div class="split-row"><span>400m</span><strong>--:--</strong></div>
    <div class="split-row"><span>Finish</span><strong>--:--</strong></div>
  `;
}

function getRaceSplitDistances(distanceMeters) {
  const raceSplitDistances = [];

  for (let distance = 400; distance < distanceMeters; distance += 400) {
    raceSplitDistances.push(distance);
  }

  raceSplitDistances.push(distanceMeters);
  return raceSplitDistances;
}

function calculateResults(distanceMeters, totalSeconds) {
  const pacePerKilometer = totalSeconds / (distanceMeters / 1000);
  const speedKmh = (distanceMeters / 1000) / (totalSeconds / 3600);

  paceResult.textContent = `${formatTime(pacePerKilometer)} / km`;
  speedResult.textContent = `${speedKmh.toFixed(2)} km/h`;

  splitsList.innerHTML = splitDistances
    .map((distance) => {
      const splitSeconds = (totalSeconds / distanceMeters) * distance;
      return `<div class="split-row"><span>${distance}m</span><strong>${formatTime(splitSeconds)}</strong></div>`;
    })
    .join("");

  raceSplitsList.innerHTML = getRaceSplitDistances(distanceMeters)
    .map((distance) => {
      const splitSeconds = (totalSeconds / distanceMeters) * distance;
      return `<div class="split-row"><span>${distance}m</span><strong>${formatTime(splitSeconds)}</strong></div>`;
    })
    .join("");
}

function calculateRepResult(showErrors = true) {
  const hasAllValues = repDistanceInput.value !== ""
    && repPaceMinutesInput.value !== ""
    && repPaceSecondsInput.value !== "";
  const repDistanceMeters = Number(repDistanceInput.value);
  const paceMinutes = Number(repPaceMinutesInput.value);
  const paceSeconds = Number(repPaceSecondsInput.value);
  const paceTotalSeconds = paceMinutes * 60 + paceSeconds;

  repErrorMessage.textContent = "";

  if (!showErrors && !hasAllValues) {
    return false;
  }

  if (!Number.isInteger(repDistanceMeters) || repDistanceMeters <= 0) {
    if (showErrors) {
      repErrorMessage.textContent = "Enter a positive whole number for rep distance.";
    }
    repTimeResult.textContent = "--:--";
    return false;
  }

  if (!Number.isInteger(paceMinutes) || paceMinutes < 0) {
    if (showErrors) {
      repErrorMessage.textContent = "Enter whole pace minutes greater than or equal to 0.";
    }
    repTimeResult.textContent = "--:--";
    return false;
  }

  if (!Number.isInteger(paceSeconds) || paceSeconds < 0 || paceSeconds > 59) {
    if (showErrors) {
      repErrorMessage.textContent = "Enter whole pace seconds from 0 to 59.";
    }
    repTimeResult.textContent = "--:--";
    return false;
  }

  if (paceTotalSeconds <= 0) {
    if (showErrors) {
      repErrorMessage.textContent = "Enter a target pace greater than 0 seconds per kilometer.";
    }
    repTimeResult.textContent = "--:--";
    return false;
  }

  repTimeResult.textContent = formatTime((paceTotalSeconds * repDistanceMeters) / 1000);
  return true;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const distanceMeters = Number(distanceInput.value);
  const minutes = Number(minutesInput.value);
  const seconds = Number(secondsInput.value);
  const totalSeconds = minutes * 60 + seconds;

  errorMessage.textContent = "";

  if (!Number.isInteger(distanceMeters) || distanceMeters <= 0) {
    errorMessage.textContent = "Enter a positive whole number for distance.";
    showPlaceholderResults();
    return;
  }

  if (!Number.isInteger(minutes) || minutes < 0) {
    errorMessage.textContent = "Enter whole minutes greater than or equal to 0.";
    showPlaceholderResults();
    return;
  }

  if (!Number.isInteger(seconds) || seconds < 0 || seconds > 59) {
    errorMessage.textContent = "Enter whole seconds from 0 to 59.";
    showPlaceholderResults();
    return;
  }

  if (totalSeconds <= 0) {
    errorMessage.textContent = "Enter a total time greater than 0 seconds.";
    showPlaceholderResults();
    return;
  }

  calculateResults(distanceMeters, totalSeconds);
});

distancePresetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    distanceInput.value = button.dataset.distance;
    setActivePreset(distancePresetButtons, button);
    distanceInput.focus();
  });
});

pacePresetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const distanceMeters = Number(distanceInput.value);

    if (!Number.isInteger(distanceMeters) || distanceMeters <= 0) {
      errorMessage.textContent = "Choose or enter a positive whole-number distance first.";
      showPlaceholderResults();
      distanceInput.focus();
      return;
    }

    const paceSeconds = Number(button.dataset.paceSeconds);
    const totalSeconds = Math.round((paceSeconds * distanceMeters) / 1000);

    minutesInput.value = Math.floor(totalSeconds / 60);
    secondsInput.value = totalSeconds % 60;
    setActivePreset(pacePresetButtons, button);
    errorMessage.textContent = "";
    secondsInput.focus();
  });
});

applyCustomPaceButton.addEventListener("click", () => {
  const distanceMeters = Number(distanceInput.value);
  const paceMinutes = Number(customPaceMinutesInput.value);
  const paceSeconds = Number(customPaceSecondsInput.value);

  if (!Number.isInteger(distanceMeters) || distanceMeters <= 0) {
    errorMessage.textContent = "Choose or enter a positive whole-number distance first.";
    showPlaceholderResults();
    distanceInput.focus();
    return;
  }

  if (customPaceMinutesInput.value === "" || !Number.isInteger(paceMinutes) || paceMinutes <= 0) {
    errorMessage.textContent = "Enter whole pace minutes greater than 0.";
    customPaceMinutesInput.focus();
    return;
  }

  if (customPaceSecondsInput.value === "" || !Number.isInteger(paceSeconds) || paceSeconds < 0 || paceSeconds > 59) {
    errorMessage.textContent = "Enter whole pace seconds from 0 to 59.";
    customPaceSecondsInput.focus();
    return;
  }

  const paceTotalSeconds = paceMinutes * 60 + paceSeconds;
  const totalSeconds = Math.round((paceTotalSeconds * distanceMeters) / 1000);

  minutesInput.value = Math.floor(totalSeconds / 60);
  secondsInput.value = totalSeconds % 60;
  clearActivePreset(pacePresetButtons);
  errorMessage.textContent = "";
  secondsInput.focus();
});

repPresetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    repDistanceInput.value = button.dataset.repDistance;
    setActivePreset(repPresetButtons, button);
    calculateRepResult(false);
    repDistanceInput.focus();
  });
});

repPacePresetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const paceSeconds = Number(button.dataset.paceSeconds);

    repPaceMinutesInput.value = Math.floor(paceSeconds / 60);
    repPaceSecondsInput.value = paceSeconds % 60;
    setActivePreset(repPacePresetButtons, button);
    calculateRepResult(false);
    repPaceSecondsInput.focus();
  });
});

repForm.addEventListener("submit", (event) => {
  event.preventDefault();
  calculateRepResult();
});

repForm.addEventListener("reset", () => {
  repErrorMessage.textContent = "";
  repTimeResult.textContent = "--:--";
  clearActivePreset(repPresetButtons);
  clearActivePreset(repPacePresetButtons);
});

form.addEventListener("reset", () => {
  errorMessage.textContent = "";
  showPlaceholderResults();
  clearActivePreset(distancePresetButtons);
  clearActivePreset(pacePresetButtons);
});

distanceInput.addEventListener("input", () => {
  clearActivePreset(distancePresetButtons);
});

minutesInput.addEventListener("input", () => {
  clearActivePreset(pacePresetButtons);
});

secondsInput.addEventListener("input", () => {
  clearActivePreset(pacePresetButtons);
});

repDistanceInput.addEventListener("input", () => {
  clearActivePreset(repPresetButtons);
});

repPaceMinutesInput.addEventListener("input", () => {
  clearActivePreset(repPacePresetButtons);
});

repPaceSecondsInput.addEventListener("input", () => {
  clearActivePreset(repPacePresetButtons);
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showTab(button.dataset.tabTarget);
  });
});
