let defaultColor = "black"

function letThereBeDark() {
  document.body.style.backgroundColor = "black"
  document.body.style.color = "white"

  for (let element of document.getElementsByTagName("a")) {
    if (element.style.color != "red") {element.style.color = "white"}
  }

  for (let element of document.getElementsByClassName("altChange")) {
    element.style.color = "black"
    element.style.backgroundColor = "white"
  }
}

function letThereBeLight() {
  document.body.style.backgroundColor = "white"
  document.body.style.color = "black"

  for (let element of document.getElementsByTagName("a")) {
    if (element.style.color != "red") {element.style.color = "black"}
  }

  for (let element of document.getElementsByClassName("altChange")) {
    element.style.color = "white"
    element.style.backgroundColor = "black"
  }
}

function ChangeMode() {
  if (localStorage.getItem("mode") == "dark") {
    localStorage.setItem("mode", "light")
    letThereBeLight()
    defaultColor = "black"
  }
  else {
    localStorage.setItem("mode", "dark")
    letThereBeDark()
    defaultColor = "white"
  }
}

function ApplyMode() {
  if (localStorage.getItem("mode") == "dark") {
    letThereBeDark()
    defaultColor = "white"
  } 
  else {
    letThereBeLight()
    defaultColor = "black"
  }
}

function ToggleComicSans() { 
  if (localStorage.getItem("comic-sans") == "true") { 
    document.body.style.fontFamily = "Arial"
    localStorage.setItem("comic-sans", "false")
  }
  else {
    document.body.style.fontFamily = "Comic Sans MS"
    localStorage.setItem("comic-sans", "true")
  }
}

function ApplyComicSans() { 
  if (localStorage.getItem("comic-sans") == "true") { 
    document.body.style.fontFamily = "Comic Sans MS"
  }
  else {
    document.body.style.fontFamily = "Arial"
  }
}