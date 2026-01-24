let clickEventFunc

async function gameHost() {
  getById("round").style.display = "inline-block"
  getById("round").removeAttribute("onclick")
  getById("multiplayerNewMenu").style.display = "none"
  getById("currentTurn").style.display = "block"

  for (const [key, value] of Object.entries(usersData)) {
    getById("cardNum").innerHTML += `
      <p id="${value.username}Num" class="infoText">${value.username} Cards: </p>
    `
  }
  
  while (true) {
    for (const [key, value] of Object.entries(usersData)) {
      if (!usersData[key]) {
        continue
      }

      let checkCards = checkIfPlayerHasAllCards()

      if (checkCards) {
        broadcast(JSON.stringify({msg: "endGame", winner: checkCards}))
        alert(`${checkCards} Wins`)
        await resetGame()
      }

      let card
      if (key == host) {
        getById("currentTurn").innerText = "Your Turn"
        await broadcast(JSON.stringify({msg: "getCard", player: key}))

        await waitForPlayerInputHost(key)

        card = await placeCardMulti(value.cards)

        await broadcast(JSON.stringify({msg: "displayCard", card: card, usersData: usersData}))
        
        
      }

      else {
        getById("currentTurn").innerText = `${key}'s Turn`
        await broadcast(JSON.stringify({msg: "getCard", player: key}))
        let input = await waitForInput(key)

        if (!input) {
          continue
        }
        
        card = await placeCardMulti(value.cards)

        await broadcast(JSON.stringify({msg: "displayCard", card: card, usersData: usersData}))
      }

      for (const [key, value] of Object.entries(usersData)) {
        getById(`${value.username}Num`).innerText = `${value.username} Cards: ${value.cards.length}`
      }

      //Card Is Jack
      if (card[1] == 11) {
        let slap = await waitForSlap()
        
        deckCards.forEach(function(item) {
          usersData[slap].cards.push(item)
        })

        for (const [key, value] of Object.entries(usersData)) {
          getById(`${value.username}Num`).innerText = `${value.username} Cards: ${value.cards.length}`
        }

        await broadcast(JSON.stringify({msg: "slap", usersData: usersData, slapper: slap}))

        alert(`${slap} Slapped`)

        getById("currentTurn").innerHTML = "Waiting For Other Players..."

        deckCards = []
      }
    }
  }
}

function waitForInput(username) {
  return new Promise(function(resolve) {
    onMessageFrom = function(event) {
      let eventData = JSON.parse(event.data)

      if (eventData.from == username) {
        onMessageFrom = function() {}
        resolve(true)
      }
    }

    onUserLeft = function(event) {
      onUserLeave(event)

      let eventData = JSON.parse(event.data)

      if (eventData.username == username) {
        resolve(null)
      }

      onUserLeft = onUserLeave
    }

    if (usersData[username].cards.length == 0) {
      resolve(null)
    }
  })
}

function waitForPlayerInputHost() {
  return new Promise(function(resolve) {
    function clickEvent() {
      getById("round").removeEventListener("click", clickEvent)
      resolve()
    }

    getById("round").addEventListener("click", clickEvent)

    if (usersData[host].cards.length == 0) {
      resolve(null)
      getById("round").removeEventListener("click", clickEvent)
    }
  })
}

async function placeCardMulti(deck) {
  hideCard("card")

  let card = deck[0]
  removeItem(deck, card)

  deckCards.push(card)

  showCard(card, "card")

  return card
}

function waitForSlap() {
  return new Promise(function (resolve) {
    resolveFunc = resolve

    onMessageFrom = function(event) {
      let eventData = JSON.parse(event.data)

      resolveFunc(eventData.from)
      
      getById("cardImg").removeEventListener("click", clickEventFunc)

      onMessageFrom = function() {}
    }

    getById("cardImg").addEventListener("click", function clickEvent() {
      resolveFunc(host)

      clickEventFunc = clickEvent

      getById("cardImg").removeEventListener("click", clickEvent)

      onMessageFrom = function() {}
    })
  })
}

function checkIfPlayerHasAllCards() {
  for (const [key, value] of Object.entries(usersData)) {
    if (value.cards.length == totalCards) {
      return value.username
    }
  }

  return false
}

async function resetGame() {
  resetCards()  

  getById("cardNum").innerHTML = ""

  usersCards = []
  users.forEach(function(user) {
    usersCards.push([])
  })

  onUserLeft = onUserLeave

  usersCards = dealCardsMulti(usersCards)

  usersData = {}
  let i = 0

  totalCards = 0

  users.forEach((item) => {
    usersData[item] = {cards: usersCards[i], username: item}
    totalCards += usersData[item].cards.length
    i++
  })

  await gameHost()
}