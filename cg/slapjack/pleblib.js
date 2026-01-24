async function gamePleb(event) {
  let eventData = JSON.parse(event.data)
  eventData = JSON.parse(eventData.content)

  if (eventData.msg == "getCard") { 
    if (eventData.player == pleb) {
      getById("currentTurn").innerText = `Your Turn`
      await waitForPlayerInputPleb()

      sendTo(host, '')
    }
    else {
      getById("currentTurn").innerText = `${eventData.player}'s Turn`
    }
  }

  else if (eventData.msg == "displayCard") {
    hideCard("card")
    showCard(eventData.card, "card")

    let usersData = eventData.usersData

    for (const [key, value] of Object.entries(usersData)) {
      getById(`${value.username}Num`).innerText = `${value.username} Cards: ${value.cards.length}`
    }

    if (eventData.card[1] == 11) {
      await waitForSlapPLeb()
      await sendTo(host, '')
    }
  }

  else if (eventData.msg == "slap") {
    let usersData = eventData.usersData

    for (const [key, value] of Object.entries(usersData)) {
      getById(`${value.username}Num`).innerText = `${value.username} Cards: ${value.cards.length}`
    }

    alert(`${eventData.slapper} Slapped`)

    getById("currentTurn").innerHTML = "Waiting For Other Players..."
  }

  else if (eventData.msg == "endGame") {
    alert(`${eventData.username} Wins The Game`)
    members.forEach(function(username) {
      getById("cardNum").innerHTML += `
        <p id="${username}Num" class="infoText">${username} Cards: </p>
      `
    })  
  }

  console.log(eventData.msg)
}

function waitForSlapPLeb() {
  return new Promise(function(resolve) {
    resolveFunc = resolve
    getById("cardImg").addEventListener("click", function clickEvent() {
      resolveFunc(host)

      getById("cardImg").removeEventListener("click", clickEvent)

      onMessageFrom = gamePleb
      
    })

    onMessageFrom = function(event) {
      resolveFunc()

      gamePleb(event)

      onMessageFrom = gamePleb
    }

  })
}

function waitForPlayerInputPleb() {
  return new Promise(function(resolve) {
    function clickEvent() {
      getById("round").removeEventListener("click", clickEvent)
      resolve()
    }

    getById("round").addEventListener("click", clickEvent)
  })
}