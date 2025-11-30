let textOptions = ["It Exists!", "Touch Grass!", "\"Null\" Is Null!", "The Design Is Very Human!", "JavaScript Is Not Java!"]
function generateSubtext() {
  getById("subtext").innerText = textOptions[getRndInteger(0, textOptions.length )]
}

generateSubtext()