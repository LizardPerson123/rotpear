function letThereBeLight() {
  getById("styleTag").innerHTML = ""
  localStorage.setItem("mode", "light")
  getById("modeButton").innerText = "Dark"
}

function letThereBeDark() {
  getById("styleTag").innerHTML = `
    body {background-color: black; color: white}

    .outerBoxDiv {
      background-color: #e5dbce; 
      color: black;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(255, 255, 255, 0.5);
    }

    button {
      background-color: white !important;
      color: black !important;
    }
  `

  localStorage.setItem("mode", "dark")
  getById("modeButton").innerText = "Light"
}

function applyMode() {
  let currentMode = localStorage.getItem("mode")

  if (currentMode == "light") {
    letThereBeLight()
  }
  else {
    letThereBeDark()
  }
}

function changeMode() {
  let currentMode = localStorage.getItem("mode")

  if (currentMode == "light") {
    letThereBeDark()
  }
  else {
    letThereBeLight()
  }
}

applyMode()