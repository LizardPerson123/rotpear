let getById = id => {return document.getElementById(id) }
let getByClss = className => {return Array.from(document.getElementsByClassName(className)) }

//credit: w3schools
function getRndInteger(min, max) {return Math.floor(Math.random() * (max - min) ) + min;}

async function manageGameFinished(score) {
  clearIntervals(intervals)
  let username = ""
  let password = ""
  let submitScoreBool = false

  alert("Game Over! Your Score: " + score)
  if (localStorage.getItem("highscore") == null || score > localStorage.getItem("highscore")) {
    localStorage.setItem("highscore", score)
    submitScoreBool = confirm("Would you like to submit your score?")
  }
  if (!submitScoreBool) {return}


  if (localStorage.getItem("username")) {
    username = localStorage.getItem("username")
    password = localStorage.getItem("password")
  }
  

  username = prompt("Enter your username to submit your score", username)
  let isScoreTest = await isScore(score, username)

  if (isScoreTest == "NOT USER") {
    let createAccountConfirm = confirm("Username not found. Would you like to create an account?")
    if (createAccountConfirm) {
      password = prompt("Enter your desired password")
      let createAccountResult = await createAccount(username, password)
      isScoreTest = "true"
    }
    else {isScoreTest = "false"}
  }
  else {
    password = prompt("Enter your password to submit your score", password)
  }

  if (isScoreTest == "true") {
    let submitScoreResult = await submitScore(username, password, score)
    let submitScoreResultText = await submitScoreResult.text()
    if (submitScoreResult.status == 200) {
      alert("Score submitted successfully!")
    }
    else if (submitScoreResultText == "SCORE NOT HIGH ENOUGH") {
      alert("Score not high enough to submit.")
    }
    else if (submitScoreResultText == "INCORRECT PASSWORD") {
      alert("Incorrect password. Score not submitted.")
    }
    else {
      alert("Error submitting score.")
    }
  }
  else {
    alert("Score not high enough to submit.")
  }

  localStorage.setItem("username", username)
  localStorage.setItem("password", password)

}

function clearIntervals() {
  console.log("clearIntervals")
  intervals.forEach((value) => {
    clearInterval(value)
  })
}

async function manageGameFinished(params) {
  clearIntervals()
  alert("a")
  alert("b")
  alert("c")
}
