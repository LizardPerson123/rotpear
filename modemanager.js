function applyMode() {
  if (localStorage.getItem("mode") == "dark") {
    document.body.style.backgroundColor = "black"
    document.body.style.color = "white"
    let darkButton = getById("darkButton")

    if (darkButton) {
      darkButton.style.backgroundColor = "gray"
      darkButton.style.color = "black"
    }

    getById("modeButton").innerText = "Switch to Light Mode"

    getByClss("dontChange").forEach(element => {
      element.style.color = "black"
    })
  }
}

function toggleMode() {
  if (localStorage.getItem("mode") == "dark") {
    localStorage.setItem("mode", "light")
    document.body.style.backgroundColor = "whitesmoke"
    document.body.style.color = "black"
    let darkButton = getById("darkButton")

    if (darkButton) {
      darkButton.style.backgroundColor = "black"
      darkButton.style.color = "white"
    }

    getById("modeButton").innerText = "Switch to Dark Mode"

    getByClss("dontChange").forEach(element => {
      element.style.color = "white"
    });
  }
  else {
    localStorage.setItem("mode", "dark")
    applyMode()
  }

}

applyMode()