let inWar = false

function multiRoundHost() {
  if (host.placedDownCard && pleb.placedDownCard) {
    let wonGame

    if (!pleb.cards[0]) {
      alert("You Win!")
      broadcast(JSON.stringify({whoWon: 'playerGame'}))

      let doContinue = confirm("Play Again?")
      if (doContinue) {
        resetGameHost()
        return
      }
      else {
        window.location.reload()
      }
    }
    else if (!host.cards[0]) {
      alert(`${pleb.username} Wins!`)
      broadcast(JSON.stringify({whoWon: 'opponentGame'}))

      let doContinue = confirm("Play Again?")
      if (doContinue) {
        resetGameHost()
        return
      }
      else {
        window.location.reload()
      }
    }

    hideCard("playerCards")
    hideCard("cpuCards")

    showCard(pleb.cards[0], "cpuCards")
    showCard(host.cards[0], "playerCards")

    let plebCard = pleb.cards[0]
    let hostCard = host.cards[0]

    let compareResult = compare(hostCard[1], plebCard[1])

    if (compareResult == "war") {
      inWar = true
      getById("whoWon").innerHTML = "War!"

      getById("outerPlayerCards").style.width = "100%"
      getById("outerCPUCards").style.width = "100%"

      pleb.warCards.push(pleb.cards[0])
      host.warCards.push(host.cards[0])

      removeItem(host.cards, host.cards[0])
      removeItem(pleb.cards, pleb.cards[0])

      for (let i = 1; i <= 3; i++) {
        if (!(host.cards.length < 2)) {
          let hostCard = nextInDeck(host.cards)[0]

          removeItem(host.cards, hostCard)
          host.warCards.push(hostCard)

          showCard(hostCard, "playerCards")
        }
        
      }

      for (let i = 1; i <= 3; i++) {
        if (!(pleb.cards.length < 2)) {
          let plebCard = nextInDeck(pleb.cards)[0]

          removeItem(pleb.cards, plebCard)
          pleb.warCards.push(plebCard)

          showCard(plebCard, "cpuCards")
        }
        else {
          break
        }
        
      }
    }

    else if (compareResult) {
      getById("whoWon").innerHTML = `You Win ${pleb.username}'s Card`

      wonGame = false

      host.cards.push(pleb.cards[0])
      removeItem(pleb.cards, pleb.cards[0])

      host.cards = nextInDeck(host.cards)
    }

    else {
      getById("whoWon").innerHTML = `${pleb.username} Wins Your Card`

      wonGame = true

      pleb.cards.push(host.cards[0])
      removeItem(host.cards, host.cards[0])

      pleb.cards = nextInDeck(pleb.cards)
    }

    getById("playerCardsNum").innerHTML = `Player Cards: ${host.cards.length}`
    getById("cpuCardsNum").innerHTML = `CPU Cards: ${pleb.cards.length}`

    if (inWar) {
      broadcast(JSON.stringify({whoWon: 'war', hostCard: host.warCards, plebCard: pleb.warCards, hostCardLength: host.cards.length, plebCardLength: pleb.cards.length}))
    }
    else {
      broadcast(JSON.stringify({whoWon: wonGame, hostCard: hostCard, plebCard: plebCard, hostCardLength: host.cards.length, plebCardLength: pleb.cards.length}))
    }

    host.placedDownCard = false
    pleb.placedDownCard = false 
  }
}

async function multiWarRoundHost() {
  if (host.placedDownCard && pleb.placedDownCard) {
    let hostCard = nextInDeck(host.cards)[0]
    removeItem(host.cards, hostCard)
    host.warCards.push(hostCard)

    let plebCard = nextInDeck(pleb.cards)[0]
    removeItem(pleb.cards, plebCard)
    pleb.warCards.push(plebCard)

    let compareResult = compare(hostCard[1], plebCard[1])

    if (compareResult == "war") {
      alert("Tie! The War Continues")
      showCard(hostCard, "playerCards")
      showCard(plebCard, "cpuCards")

      await broadcast(JSON.stringify({whoWon: "tie", hostCardLength: host.cards.length, plebCardLength: pleb.cards.length}))
      return
    }
    else if (compareResult) {
      alert(`${host.username} Wins The War`)
      host.warCards.forEach(function(card) {
        host.cards.push(card)
      })

      pleb.warCards.forEach(function(card) {
        host.cards.push(card)
      })

      await broadcast(JSON.stringify({whoWon: false, hostCardLength: host.cards.length, plebCardLength: pleb.cards.length}))
    }
    else {
      alert(`${pleb.username} Wins The War`)
      host.warCards.forEach(function(card) {
        pleb.cards.push(card)
      })

      pleb.warCards.forEach(function(card) {
        pleb.cards.push(card)
      })

      await broadcast(JSON.stringify({whoWon: true, hostCardLength: host.cards.length, plebCardLength: pleb.cards.length}))
    }

    host.warCards = []
    pleb.warCards = []

    getById("round").setAttribute("onclick", "hostPlaceDownCard()")

    getById("playerCardsNum").innerHTML = `Player Cards: ${host.cards.length}`
    getById("cpuCardsNum").innerHTML = `CPU Cards: ${pleb.cards.length}`

    hideCard("cpuCards")
    hideCard("playerCards")

    getById("outerPlayerCards").style.width = "40%"
    getById("outerCPUCards").style.width = "40%"

    getById("whoWon").innerHTML = "Click Round To Continue"

    inWar = false
    host.placedDownCard = false
    pleb.placedDownCard = false
  }
}

function plebPlacedDownCard() {
  pleb.placedDownCard = true
  if (inWar) {
    multiWarRoundHost()
    return
  }

  multiRoundHost()
}

function hostPlaceDownCard() {
  host.placedDownCard = true
  getById("whoWon").innerHTML = "Waiting For Other Player To Place Card"

  if (inWar) {
    multiWarRoundHost()
    return
  }

  multiRoundHost()
}

function resetGameHost() {
  host.cards = []
  pleb.cards = []
  host.warCards = []
  pleb.warCards = []
  host.placedDownCard = false
  pleb.placedDownCard = false
  inWar = false

  resetCards()

  let start = startGame(host.cards, pleb.cards)
  host.cards = start[0]
  pleb.cards = start[1]

  getById("playerCardsNum").innerHTML = `${host.username} Cards: 26`
  getById("cpuCardsNum").innerHTML = `${pleb.username} Cards: 26`
  getById("opponentName").innerText = `${pleb.username} Cards`

  getById("whoWon").innerHTML = "Click Place Card"

  broadcast('')
}