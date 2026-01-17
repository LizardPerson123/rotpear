function multiRoundPleb(event) {
  let eventData = JSON.parse(event.data)
  eventData = JSON.parse(eventData.content)

  let hostCard = eventData.hostCard
  let plebCard = eventData.plebCard
  let hostCardLength = eventData.hostCardLength
  let plebCardLength = eventData.plebCardLength
  let wonGame = eventData.whoWon

  hideCard("playerCards")
  hideCard("cpuCards")

  getById("playerCardsNum").innerHTML = `Player Cards: ${hostCardLength}`
  getById("cpuCardsNum").innerHTML = `CPU Cards: ${plebCardLength}`

  if (wonGame == "playerGame") {
    alert("Host Wins!")
    getById("whoWon").innerHTML = "Waiting For Next Round..."
    getById("round").removeAttribute("onclick")

    onMessageFrom = resetCardsPleb
  }
  else if (wonGame == "opponentGame") {
    alert("You Win!")

    getById("whoWon").innerHTML = "Waiting For Next Round..."
    getById("round").removeAttribute("onclick")

    onMessageFrom = resetCardsPleb
  }

  else if (wonGame == "war") {
    getById("whoWon").innerHTML = "War!"

    getById("outerPlayerCards").style.width = "100%"
    getById("outerCPUCards").style.width = "100%"

    plebCard.forEach((item) => {
      showCard(item, "playerCards")
    })

    hostCard.forEach((item) => {
      showCard(item, "cpuCards")
    })

    onMessageFrom = multiWarRoundPleb
  }

  else if (wonGame) {
    showCard(hostCard, "cpuCards")
    showCard(plebCard, "playerCards")

    getById("whoWon").innerHTML = `You Win ${hostName}'s Card`
  }
  else {
    showCard(hostCard, "cpuCards")
    showCard(plebCard, "playerCards")

    getById("whoWon").innerHTML = `${hostName} Wins Your Card`
  }
}

function multiWarRoundPleb(event) {
  let eventData = JSON.parse(event.data)
  eventData = JSON.parse(eventData.content)
  let hostCardLength = eventData.hostCardLength
  let plebCardLength = eventData.plebCardLength

  let wonGame = eventData.whoWon

  if (wonGame == "tie") {
    alert("Tie! The War Continues")
    return
  }

  else if (wonGame) {
    alert(`${plebName} Wins The War`)
  }

  else {
    alert(`${hostName} Wins The War`)
  }

  getById("playerCardsNum").innerHTML = `Player Cards: ${hostCardLength}`
  getById("cpuCardsNum").innerHTML = `CPU Cards: ${plebCardLength}`

  hideCard("cpuCards")
  hideCard("playerCards")

  getById("outerPlayerCards").style.width = "40%"
  getById("outerCPUCards").style.width = "40%"

  getById("whoWon").innerHTML = "Click Round To Continue"

  onMessageFrom = multiRoundPleb
}

function plebPlaceDownCard() {
  getById("whoWon").innerHTML = "Waiting For Other Player To Place Card"
  broadcast('')
}

function resetCardsPleb() {
  getById("playerCardsNum").innerHTML = `${hostName} Cards: 26`
  getById("cpuCardsNum").innerHTML = `${plebName} Cards: 26`
  getById("opponentName").innerText = `${hostName} Cards`

  getById("whoWon").innerHTML = "Click Place Card"

  getById("round").setAttribute("onclick", "plebPlaceDownCard()")
  onMessageFrom = multiRoundPleb
}