let idList
let curedList
let ebolaList = []
let score = 0
let intervals = []

function setEbolaInterval() { 
  let interval1 = setInterval(async () => {
      let choice = getRndInteger(0, curedList.length)
      await addEbola(choice)
      
  }, 2000)

  let interval2 = setInterval(() => { 
    ebolaList.forEach(async (value) => {
      try { 
        infectNearbyWord = getRndInteger(1, 10) == 1
        
        if (infectNearbyWord) { 
          let direction = getRndInteger(0, 2) //0 is left, 1 is right
          if (direction == 1) {value += 1}
          else {value -= 1}
          await addEbola(curedList.indexOf(value))
        }
      } catch (error) {}
    })
  }, 2000)

  intervals.push(interval1)
  intervals.push(interval2)
}

async function addEbola(choice) {
  console.log(ebolaList)
  let curedListStr = curedList[choice]
  getById(curedListStr).style.color = "red"
  curedList.splice(choice, 1)
  ebolaList.push(curedListStr)
  updateEbola()
  if (ebolaList.length >= 20) {
    await manageGameFinished(score)
    location.reload()
  }
  
}

async function addToScore(amount) {
  score += amount
  getById("score").innerText = "Score: " + score

  if (text[id] === undefined) {
    let newText = await GetText()
    newText = newText.split(".")
    text = text.concat(newText)
  }

  if (score > 9 && text[id] !== undefined && score % 10 == 0) {
    let newtext = text[id]
    newtext += ". "
    getById("ebolaCanvas").innerHTML += parseText(newtext, idList.length)
    idList = idList.concat(Array.from(Array(newtext.split(" ").length).keys(), mapFn => mapFn + idList.length))
    curedList = curedList.concat(Array.from(Array(newtext.split(" ").length).keys(), mapFn => mapFn + curedList.length))
    id++
    ApplyMode()
  }
}

function updateEbola() {getById("ebola").innerHTML = "Words With Ebola: " + ebolaList.length}

function cure(id) {
  if (getById(id).style.color == "red") {
    getById(id).style.color = defaultColor
    const index = ebolaList.indexOf(id)
    ebolaList.splice(index, 1)
    curedList.push(id)
    addToScore(1)
    updateEbola()
  }
}
ErrorEvent.hIV = cure