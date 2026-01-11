let getById = id => {return document.getElementById(id) }
let getByClss = className => {return Array.from(document.getElementsByClassName(className)) }

//credit: w3schools
function getRndInteger(min, max) {return Math.floor(Math.random() * (max - min) ) + min;}


function clearIntervals() {
  clearedIntervals = true
  intervals.forEach((value) => {
    clearInterval(value)
  })
}

async function manageGameFinished(score) {
  try {
    //I have commented this code due to its confusingness

    //First: Stop The Game From Running
    clearIntervals()

    //Then Show The User The Alert And Check If The Score Is A New High Score
    alert("Game Over! Your Score: " + score)

    let addToScore = 0
    if (difficulty == 1) {
      addToScore = Math.round(score / 2)
      alert("Normal Mode Bonus: " + addToScore)
    }
    else if (difficulty == 2) {
      addToScore = score
      alert("Hard Mode Bonus: " + addToScore)
    }

    score += addToScore

    let highscore = localStorage.getItem("highscore")
    let newHighScore = score > highscore

    if (newHighScore) {
      localStorage.setItem("highscore", score)
      let password

      //pre username stuff
      let preUsername = localStorage.getItem("username") || ""
      let prePassword = localStorage.getItem("password") || ""

      let username = prompt("New High Score! Enter Your Username", preUsername)

      //Does Account Exist?
      let accountExists = await isAccount(username)

      if (accountExists == "false") {
        let doConfirm = confirm("Account Not Found. Would You Like To Create An Account?")

        if (doConfirm) {
          username = prompt("What Do You Want The Username To Be?", username)
          password = prompt("What Do You Want The Password To Be?")

          //Create Account
          let createAccResult = await createAccount(username, password)

          if (createAccResult != 200) {
            throw "Error"
          }
        }
        else {window.location.reload()}
      }
      else if (accountExists == "error") {
        throw "Error"
      }
      else {
        password = prompt("What Is The Password?", prePassword)
      }

      //Check If Score Is In Leaderboard
      let isScoreCheck = await isScore(score, username)

      if (isScoreCheck == "false") {
        throw "Score Not High Enough To Submit"
      }
      else if (isScoreCheck == "error") {
        throw "Error"
      }
      
      //Submit Score
      let submitScoreChk = await submitScore(username, password, score)
      
      if (submitScoreChk.status == 200) {
        //Not Error
        localStorage.setItem("username", username)
        localStorage.setItem("password", username)
        throw "Succesfully Submitted"
      }
      else {
        let submitScoreErrMsg = await submitScoreChk.text()

        if (submitScoreErrMsg == "INCORRECT PASSWORD") {
          throw "Incorrect Password"
        }
        else {
          throw "Error"
        }

      }
    }
  }
  catch (result) {
    alert(result)
    window.location.reload()
  }
  
}
