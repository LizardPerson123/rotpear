let host
let users = []
let usersData
let dealerNum
let dealer = 0
let dealerCards
let player

function joinSession() {
  return new Promise(async function (resolve, reject) {
    getById("multiplayerMenu").style.display = "none";
    getById("multiplayerJoin").style.display = "block";  

    let sessionID = prompt("Enter Session Code")
    let username = prompt("Enter Username")
    player = username
    let password = prompt("Enter Password")

    try {
      onMessageFrom = function(event) {
        let eventData = JSON.parse(event.data)
        let content = JSON.parse(eventData.content)
        let from = eventData.from

        if (from == host) {
          onMessageFrom = getBetNum
          content.users.forEach(function (item) {
            users.push(item)
            getById("usernames2").innerHTML += `<p id="${item}" style="font-size: 1.3em; margin-top: 0px;">${item}</p>`
          })
          //Await For Next Request (Get Bet)
        }
      }

      host = await joinSessionApi(username, password, sessionID)
      getById("host").innerText = "Host: " + host

      onNewUser = function(event) {
        let eventData = JSON.parse(event.data)

        users.push(eventData.username)
        getById("usernames2").innerHTML += `<p id="${eventData.username}" style="font-size: 1.3em; margin-top: 0px;">${eventData.username}</p>`
      }

      onUserLeft = function(event) {
         let eventData = JSON.parse(event.data)

         let removedUser = eventData.username
         getById(removedUser).remove()
         removeItem(users, removedUser)
      }

      resolve()
    }
    catch (err) {
      err = err.message

      switch (err) {
        case ("NO USER"): alert("That User Does Not Exist"); break
        case ("INCORRECT PASSWORD"): alert("Wrong Password"); break
        case ("USERNAME AND PASSWORD REQUIRED"): alert("Please Provide Username And Password"); break
        case ("NO SESSION"): alert("No Session"); break
        default: alert("Something Happened")
      }

      window.location.reload()
    }

  })
}

function newSession() {
  return new Promise(async function (resolve, reject) {
    getById("multiplayerMenu").style.display = "none";  
    getById("multiplayerNewMenu").style.display = "block";  

    let username = prompt("Enter Username")
    let password = prompt("Enter Password")

    try {
      let sessionID = await newSessionApi(username, password)
      getById("status").innerText = "Session Code: " + sessionID

      onUserLeft = function (event) {
        let eventData = JSON.parse(event.data)

        let removedUser = eventData.username
        getById(removedUser).remove()
        removeItem(users, removedUser)
      }

      onNewUser = function(event) {
        let eventData = JSON.parse(event.data)

        users.push(eventData.username)
        getById("usernames").innerHTML += `<p id="${eventData.username}" style="font-size: 1.3em;  margin-top: 0px;">${eventData.username}</p>`
        sendTo(eventData.username, JSON.stringify({"msg": "users", users: users}))
      }

      host = username
       
      resolve()
    }
    catch (err) {
      switch (err.message) {
        case ("NO USER"): alert("That User Does Not Exist"); break
        case ("INCORRECT PASSWORD"): alert("Wrong Password"); break
        case ("USERNAME AND PASSWORD REQUIRED"): alert("Please Provide Username And Password"); break
        default: alert("Something Happened")
      }

      window.location.reload()
    }
    
  })
}

function checkIfCanBegin() {
  for (const [key, value] of Object.entries(usersData)) {
    if (!value.ready) {
      return false
    }
  }

  began = true
  return true
}

async function beginRound() {
  usersData[host].betAmount = handleBettingMulti(usersData[host].score)

  usersData[host].ready = true

  onMessageFrom = async function(event) {
    let eventData = JSON.parse(event.data)
    let from = eventData.from
    eventData = JSON.parse(eventData.content)

    if (!isNaN(eventData.betAmount) && eventData.betAmount <= 5) {
      usersData[from].betAmount = eventData.betAmount
      usersData[from].ready = true
      await handleBeginning()
    }

  }

  onUserLeft = async function(event) {
    let eventData = JSON.parse(event.data)

    let removedUser = eventData.username
    getById(removedUser).remove()

    delete usersData[removedUser]

    await handleBeginning()
  }

  await broadcast(JSON.stringify({msg: "getBetNum", usersData: usersData}))
}

async function beginGame() {
  await endJoiningApi()
  let members = await getMembersApi()

  if (members.length < 2) {
    alert("Not Enough Players")
    return
  }

  users = members

  usersData = {}

  users.forEach((item) => {
    usersData[item] = {cards: [], cardNum: 0, score: 5, username: item, ready: false, betAmount: undefined}
  })

  beginRound()
}
