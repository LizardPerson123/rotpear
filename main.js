let textOptions = ["It Exists!", "Touch Grass!", "The Design Is Very Human!", "Dishes... Dishes A Bad Joke", "Also Try Youtube!", "Where Are Your Fingers", "Also Try Zorbeez!", "Donate To Wikipedia!", "It's Free!", "Featuring Ebola Words!"]
function generateSubtext() {
  getById("subtext").innerText = textOptions[getRndInteger(0, textOptions.length)]
}

generateSubtext()