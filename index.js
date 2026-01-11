function letThereBeLight() {
  getById("styleTag").innerHTML = ""
  getById("modeButton").innerHTML = "Switch To Dark Mode"

  localStorage.setItem("mode", "light")
}

function letThereBeDark() {
  getById("styleTag").innerHTML = `
    body {background-color: black; color: white}

    #darkButton {
      background-color: gray !important;
      color: black !important
    }

    h1 {
      text-shadow: 2px 2px 2px rgba(128, 128, 128, 0.8)
    }
  `

  getById("modeButton").innerText = "Switch to Light Mode"

  localStorage.setItem("mode", "dark")
}

function applyMode() {
  let mode = localStorage.getItem("mode")

  if (mode == "dark") {
    letThereBeDark()
  }
  else {
    letThereBeLight()
  }
}

function toggleMode() {
  let mode = localStorage.getItem("mode")

  if (mode == "dark") {
    letThereBeLight()
  }
  else {
    letThereBeDark()
  }
}

addEventListener("pageshow", function() {
  applyMode()
})