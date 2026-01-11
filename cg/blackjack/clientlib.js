//When Host Asks For Bet Number
function getBetNum(event) {
  let eventData = JSON.parse(event.data)

  if (eventData.from == host) {
    eventData = JSON.parse(eventData.content)

    usersData = eventData.usersData
    let betAmount = handleBettingMulti(usersData[player].score)

    sendTo(host, JSON.stringify({"betAmount": betAmount}))

    getById("currentlyPlaying").style.display = "block"

    onMessageFrom = async function(event) {
      onMessageFrom = function(event) {
        let eventData = JSON.parse(event.data)

        if (eventData.from == host) {
          eventData = JSON.parse(eventData.content)

          if (eventData.msg == "getCard") {
            getById("currentlyPlaying").innerHTML = `Currently Playing: ${eventData.username}`
            if (eventData.username == player) {
              let hitButton = getById("hitButton")
              hitButton.style.display = "inline"
              hitButton.innerText = "Hit"
              hitButton.style.marginBottom = "10px"
              hitButton.setAttribute("onclick", "sendTo(host, 'hit')")

              let stayButton = getById("stayButton")
              stayButton.style.display = "inline"
              stayButton.style.marginBottom = "10px"
              stayButton.setAttribute("onclick", "sendTo(host, 'stay'); getById('stayButton').style.display = 'None'; getById('hitButton').style.display = 'None';")
            }
          }
          else if (eventData.msg == "card") {
            showCard(`${eventData.username}cards`, eventData.card)
          }
          
          else if (eventData.msg == "bust") {
            getById(`${eventData.username}cards`).innerHTML = "<h1>BUST</h1>"

            if (eventData.username == player) {
              getById('stayButton').style.display = "None"
              getById("hitButton").style.display = "None"
            }
          }

          else if (eventData.msg == "endGame") {
            if (eventData.wonGame[player]) {
              alert("You Beat The Dealer")
            }
            else {
              alert("You Did Not Beat The Dealer")
            }

            for (const [key, value] of Object.entries(usersData)) {
              try {
                getById(`outer${key}`).remove()
              }
              catch(e) {
                console.error(`ERROR (CONTINUING): ${e}`)
              }
            }

            getById("currentlyPlaying").innerHTML = "Waiting For Next Round..."

            onMessageFrom = getBetNum
          }
        }
      }

      let eventData = JSON.parse(event.data)
      let from = eventData.from
      eventData = JSON.parse(eventData.content)
      let card = eventData.card

      if (from == host) {
  
        users = await getMembersApi()

        getById("multiplayerJoin").style.display = "none"

        removeItem(users, player)
        users = [player].concat(users)

        showPlayersCards()

        getById("dealerNum").style.display = "block"
        getById("dealerNum").innerHTML = `Dealer Number: ${card[1]}`

        usersData = eventData.usersData

        for (const [key, value] of Object.entries(usersData)) { 
          for (card of value.cards) {
            showCard(`${key}cards`, card)
          }
        }   

        onUserLeft = function(event) {
          let eventData = JSON.parse(event.data)

          getById(`outer${eventData.username}`).remove()
        }
      }
    }
  }
}

function showPlayersCards() {
  users.forEach(function (item) {
    document.body.innerHTML += `
      <div id="outer${item}" class="outerBoxDiv">
        <h1>${item} Cards</h1>
        <div id="${item}cards" class="cardDeck">
        </div>
      </div>
    `
  })
}

//Check If Bet Number Has Been Given By All Players, And, If So: Generate And Give Out Dealer Card
async function handleBeginning() {
  if (checkIfCanBegin()) {
    let card = getBljCard()[0]
    dealer += card[1]

    users = await getMembersApi()
    getById("multiplayerNewMenu").style.display = "none"

    showPlayersCards()

    getById("dealerNum").style.display = "block"
    getById("dealerNum").innerHTML = `Dealer Number: ${card[1]}`

    removeItem(users, host)
    users = [host].concat(users)

    for (const [key, value] of Object.entries(usersData)) {
      for (let i = 0; i < 2; i++ ) {
        let card = getBljCard()

        value.cards.push(card[1])

        value.cardNum += card[0][1]

        showCard(`${key}cards`, card[0])
      } 
    }

    await broadcast(JSON.stringify({msg: "dealer", card: card, usersData: usersData}))

    onUserLeft = function(event) {
      let eventData = JSON.parse(event.data)

      getById(`outer${eventData.username}`).remove()

      delete usersData[eventData.username]

      if (eventData.username == keyVar) {
        resolveFunc()
      }
    }

    getById("currentlyPlaying").style.display = "block"

    for (const [key, value] of Object.entries(usersData)) {
      if (usersData[key]) {
        getById("currentlyPlaying").innerHTML = `Currently Playing: ${key}`
        broadcast(JSON.stringify({msg: "getCard", username: key}))

        if (key == host) {
          await hostCard(key, value)
        }
        else {
          await clientCard(key, value)
        }
      }
    }

    card = getBljCard()[0]
    dealer += card[1]

    if (dealer < 16) {
      card = getBljCard()[0]
      dealer += card[1]
    }

    let wonGame = {}

    for (const [key, value] of Object.entries(usersData)) {
      value.cards.forEach(function (item) {
        if (item[1] == 1 && value.cardNum + 10 < 21) {
          item[1] = 11
          value.cardNum += 10
        }
      })

      if (value.cardNum > dealer && value.cardNum <= 21) {
        wonGame[key] = true
        value.score += value.betAmount
      }
      else {
        wonGame[key] = false
        value.score -= value.betAmount
      }
    }

    broadcast(JSON.stringify({msg: "endGame", wonGame: wonGame}))

    if (wonGame[host]) {
      alert("You Beat The Dealer")
    }
    else {
      alert("You Did Not Beat The Dealer")
    }
    
    restartGame()
  }
}

let keyVar
let valueVar
let resolveFunc

function clientCard(key, value) {
  return new Promise(function(resolve, reject) {
    keyVar = key
    valueVar = value
    resolveFunc = resolve

    onMessageFrom = async function(event) {
      let eventData = JSON.parse(event.data)
      if (eventData.from == key) {
        let content = eventData.content

        if (content == "hit") {
          let card = getBljCard()

          value.cards.push(card[1])

          value.cardNum += card[0][1]

          if (value.cardNum > 21) {
            await broadcast(JSON.stringify({msg: "bust", username: key}))
            getById(`${key}cards`).innerHTML = "<h1>BUST</h1>"
            onMessageFrom = function() {}
            resolve()
          }
          else {
            showCard(`${key}cards`, card[1])
            await broadcast(JSON.stringify({msg: "card", username: key, card: card[1]}))
          }
        }
        else {
          onMessageFrom = function() {}
          resolve()
        }
      }
    }
  })
}

async function hostCard(key, value) {
  return new Promise(function (resolve, reject) {
    resolveFunc = resolve
    keyVar = key
    valueVar = value

    let hitButton = getById("hitButton")
    hitButton.style.display = "inline"
    hitButton.innerText = "Hit"
    hitButton.style.marginBottom = "10px"
    hitButton.setAttribute("onclick", "hostHitButtonManage(keyVar, valueVar)")

    let stayButton = getById("stayButton")
    stayButton.style.display = "inline"
    stayButton.style.marginBottom = "10px"
    stayButton.setAttribute("onclick", "getById('stayButton').style.display = 'None'; getById('hitButton').style.display = 'None'; resolveFunc()")
  })
}

async function hostHitButtonManage(key, value) {
  let card = getBljCard()

  value.cards.push(card[1])

  value.cardNum += card[0][1]

  if (value.cardNum > 21) {
    await broadcast(JSON.stringify({msg: "bust", username: key}))

    getById(`${key}cards`).innerHTML = "<h1>BUST</h1>"

    getById('stayButton').style.display = 'None'
    getById("hitButton").style.display = "None"

    resolveFunc()
  }
  else {
    showCard(`${key}cards`, card[1])
    await broadcast(JSON.stringify({msg: "card", username: key, card: card[1]}))
  }
}

function getBljCard() {
  let card = generateCard()
  let originalCard = card

  if (card[1] > 10) {
    card[1] = 10
  }

  return [card, originalCard]
}

async function restartGame() {
  for (const [key, value] of Object.entries(usersData)) {
    if (value.betAmount == 0) {
      value.betAmount = 5
    }

    value.ready = false
    value.cards = []
    value.cardNum = 0

    getById(`outer${key}`).remove()
  }

  if (confirm("New Round?")) {
    beginRound()
  }
  else {
    alert("Ending Session")
    endSession()
    window.location.reload()
  }
}