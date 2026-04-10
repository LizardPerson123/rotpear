const bulletList = []
const players = []
let clickEvents = []
let resolveFunc
let gameAlcohol = []

let currentBlankChance = 13
let currentLiveChance = 4
let currentAlcoholChance = 3

//This will have a resolve func for whatToDo function
let multiplayerResolveFunc

//Only used in multiplayer for security purposes; Cross Check When Packet Sent
let currentPlayer

bulletList.nextItem = function() {
  let item = bulletList[0]
  removeItem(bulletList, item)
  return item
}

bulletList.generateNew = function(num) {
  for (let i = 1; i <= num; i++) {
    let bullet = getRndInt(1, 21)

    if (bullet <= currentAlcoholChance) {
      let type = getRndInt(0, gameAlcohol.length)
      bulletList.push(new gameAlcohol[type])
    }
    else if (bullet <= currentLiveChance + currentAlcoholChance) {
      bulletList.push(true)
    }
    else {
      bulletList.push(false)
    }

    if (currentAlcoholChance <= 5 && (i % 3 == 0 || i % 4 == 0)) {
      currentAlcoholChance += 1
      currentLiveChance += 1
      currentBlankChance -= 2
    }
  }
}

players.getAlivePlayers = function() {
  let toReturn = []
  
  players.forEach(function(player) {
    if (player.hp > 0) {
      toReturn.push(player)
    }
  })

  return toReturn
}

class Alcohol {
  constructor(turns = 1, effect = () => {}, startEffect = () => {}) {
    this.turns = turns
    this.effect = effect
    this.startEffect = startEffect
    this.name = "Generic"
    this.id = generateRandomCode(10, 0, 9)
  }

  async useEffect(player, multiplayerContext = undefined) {
    let effectResult = await this.effect(player, this.turns, multiplayerContext)
    this.turns = effectResult[0]

    return [effectResult[1], effectResult[2]]
  }
}

class Beer extends Alcohol {
  constructor() {
    super(1, function(player, turns) {
      turns--
      
      return [turns, "Guaranteed Live", this.AlcoholEffect]
    })

    this.AlcoholEffect = new Effect("Guranteed Live", 1, undefined, function(player, result) {

      return [true, "Guranteed Live"]
    })

    this.name = "Beer"
    this.description = "Gives A Guranteed Live Next Turn"
    this.img = "beer.png"
  }
}

class Red_Wine extends Alcohol {
  constructor() {
    super(1, function(player, turns) {
      turns--
      
      return [turns, "Invincible For One Turn", this.AlcoholEffect]
    })

    this.AlcoholEffect = new Effect("Invincible", 1, function(player) {
      let pronoun = "They"

      if (player.type == "Human") {
        pronoun = "You"
      }
      
      return [player.hp + 1, `But ${pronoun} Were Invincible`]
    })

    this.name = "Red Wine"
    this.description = "Makes You Invincible For 1 Turn"
    this.img = "red_wine.png"
  }

  oname = "Red_Wine"
}

class Whiskey extends Alcohol {
  constructor() {
    super(1, function(player, turns) {
      return new Promise(async function(resolve) {
        turns--
      
        if (player.type == "Human") {
          let nextBullet

          if (host && host != thisPlayer) {
            nextBullet = await waitForWhiskeyCallback()
          }
          else {
            nextBullet = bulletList.slice(0, 5)
          }
          
          getById("event").innerHTML = "The Next Bullets Are"

          nextBullet.forEach(function(bullet) {
            if (bullet == false) {
              getById("event").innerHTML += " Blank,"
            }

            else if (bullet === true) {
              getById("event").innerHTML += " Live,"
            }

            else  {
              getById("event").innerHTML += " Alcohol,"
            }
          })

          let pronoun = "They"
          if (thisPlayer == player.name) {
            pronoun = "You"
          }

          setTimeout(function() {
            resolve([turns, pronoun + " Saw The Next Shots"])
          }, 5000)
        }
        else {
          let pronoun = "They"
          if (thisPlayer == player.name) {
            pronoun = "You"
          }

          resolve([turns, pronoun + " Saw The Next Shots"])
        }
      })
    })

    this.name = "Whiskey"
    this.description = "Lets You See The Next 5 Shots"
    this.img = "whiskey.png"
  }
}

class Vodka extends Alcohol {
  constructor() {
    super(1, function(player, turns, multiplayerContext) {
      return new Promise(async function(resolve) {
        turns--
        let stealFrom
        let status = {}
        status.innerHTML = ""

        if (player.type == "Human") {
          getById("eventHeader").innerHTML = "Who To Steal From?"
          stealFrom = players[await choseShoot(false)]
          status = getById("statusEffects")
        }
        else if (!(multiplayerContext == undefined) && multiplayerContext != "pleb") {
          stealFrom = players[multiplayerContext]
        }
        else {
          stealFrom = getRndInt(0, players.getAlivePlayers().length)
          stealFrom = players.getAlivePlayers()[stealFrom]
        }

        stealFrom.activeAlcohol.forEach(function(alcohol) {
          player.activeAlcohol.push(alcohol)
          status.innerHTML +=  `<p id='alcohol${alcohol.id}' onclick='displayAlcoholInfo("${alcohol.name}", "${alcohol.description}", "${alcohol.img}")' style="font-size: 2em; margin-top: 1px; margin-bottom: 0px">${alcohol.name}</p>`
        })

        stealFrom.activeAlcohol = []

        if (multiplayerContext == "pleb") {
          resolve([turns, players.indexOf(stealFrom), undefined])
        }
        else if (stealFrom.type == "Human") {
          getById("statusEffects").innerHTML = "<h1>Alcohol</h1>"
        }

        resolve([turns, "Stole Alcohol From " + stealFrom.name, undefined])
      })
    })

    this.name = "Vodka"
    this.description = "Steals Alcohol"
    this.img = "vodka.png"
  }
}

class Brandy extends Alcohol {
  constructor() {
    super(1, function(player, turns, multiplayerContext) {
      return new Promise(async function(resolve) {
        turns--

        let applyEffectTo
        
        if (player.type == "Human") {
          getById("eventHeader").innerHTML = "Who To Give Forced Blanks To?"
          applyEffectTo = players[await choseShoot(false)]
        }
        else if (!(multiplayerContext == undefined) && multiplayerContext != "pleb") {
          applyEffectTo = players[multiplayerContext]
        }
        else {
          applyEffectTo = getRndInt(0, players.getAlivePlayers().length)
          applyEffectTo = players.getAlivePlayers()[applyEffectTo]
        }

        applyEffectTo.alcoholEffects.push(this.AlcoholEffect)

        if (multiplayerContext == "pleb") {
          resolve([turns, players.indexOf(applyEffectTo), undefined])
        }

        getById(`${applyEffectTo.id}Effects`).innerHTML += `<p style='margin-top: 0px; margin-bottom: 2px' id='${this.AlcoholEffect.id}Effect'>${this.AlcoholEffect.name}</p>`

        resolve([turns, "Gave Forced Blank To " + applyEffectTo.name + " For 2 Turns", undefined])
      }.bind(this))
    })

    this.AlcoholEffect = new Effect("Forced Blank", 2, undefined, function(player, result) {
      return [false, "Forced Blank"]
    })

    this.name = "Brandy"
    this.description = "Give A Selected Player Forced Blanks For 2 Turns"
    this.img = "brandy.png"
  }
}

class White_Wine extends Alcohol {
  constructor() {
    super(1, function(player, turns) {
      turns--
      player.damage(-1)
      return[turns, "Healed One", undefined]
    })

    this.name = "White Wine"
    this.description = "Heal One HP"
    this.img = "white_wine.png"
  }

  oname = "White_Wine"
}

class Tequila extends Alcohol {
  constructor() {
    super(1, function(player, turns, multiplayerContext) {
      return new Promise(async function(resolve) {
        turns--

        let removeEffectFrom
        
        if (player.type == "Human") {
          getById("eventHeader").innerHTML = "Who To Clear Effects From?"
          removeEffectFrom = players[await choseShoot(false)]
        }
        else if (!(multiplayerContext == undefined) && multiplayerContext != "pleb") {
          removeEffectFrom = players[multiplayerContext]
        }
        else {
          removeEffectFrom = getRndInt(0, players.getAlivePlayers().length)
          removeEffectFrom = players.getAlivePlayers()[removeEffectFrom]
        }

        removeEffectFrom.alcoholEffects = []

        if (multiplayerContext == "pleb") {
          resolve([turns, players.indexOf(removeEffectFrom), undefined])
        }

        getById(`${removeEffectFrom.id}Effects`).innerHTML = ''

        resolve([turns, "Cleared All Effects From " + removeEffectFrom.name, undefined])
      }.bind(this))
    })

   this.name = "Tequila"
   this.description = "Clears Effect From Selected Player"
   this.img = "tequila.png"
  }
}

class Gin extends Alcohol {
  constructor() {
    super(1, function(player, turns) {
      return new Promise(async function(resolve) {
        turns--
        resolve([turns, "Attacks On Them Can Now Damage The Attacker", this.AlcoholEffect])
      }.bind(this))
    })

    this.AlcoholEffect = new Effect("Shield", 1, function(player, attacker) {
      if (getRndInt(1, 3) == 1 && !(player.id === attacker.id)) {
        attacker.damage(1)
        
        return [player.hp + 1, `But It Bounced Off And Hit ${attacker.name}`]
      }
      else {
        return [player.hp, '']
      }
    })

    this.name = "Gin"
    this.description = "Places A Shield Around You; Bullets Have A Chance To Bounce Off You And Hit The Attacker"
    this.img = "gin.png"
  }
}

class Effect {
  constructor(name, turns, onDamage = undefined, onShootResult = undefined) {
    this.turns = turns
    this.id = generateRandomCode(10, 0, 9)
    this.damage = onDamage
    this.shoot = onShootResult
    this.name = name
  }
}

class Player {
  constructor(name) {
    this.hp = 3
    this.activeAlcohol = []
    this.type = "Generic"
    this.originalName = name
    this.name = name
    this.id = generateRandomCode(10, 0, 9)
    this.alcoholEffects = []
  }

  async turn(addAlcohol = true) {
    if (this.hp < 1) {
      return [undefined, undefined]
    }

    let use = await this.whatToDo()

    if (use[0] == "alcohol") {
      let multiplayerContext = undefined

      if (use[1] instanceof Array) {
        multiplayerContext = use[1][1]
        use[1] = use[1][0]
      }

      let alcohol = this.activeAlcohol[use[1]]
      let useAlcohol = await alcohol.useEffect(this, multiplayerContext)
      let alcoholEffect = useAlcohol[1]
      let alcoholMessage = useAlcohol[0]

      if (alcohol.turns < 1) {
        try {
          getById(`alcohol${alcohol.id}`).remove()
        }
        catch(e) {}

        removeItem(this.activeAlcohol, alcohol)
      }

      this.clearEffects()

      if (alcoholEffect) {
        this.alcoholEffects.push(alcoholEffect)

        getById(`${this.id}Effects`).innerHTML += `<p style='margin-top: 0px; margin-bottom: 2px' id='${alcoholEffect.id}Effect'>${alcoholEffect.name}</p>`
      }

      return ["alcoholUsed", alcohol, alcoholMessage]
    }

    use = use[1]

    let result = bulletList.nextItem()
    let playerDamaged = players[use]
    let msg = ""

    this.alcoholEffects.forEach(function(effect) {
      if (effect.shoot) {
        let shootEffect = effect.shoot(this, result)

        result = shootEffect[0]

        if (shootEffect[1] != "") {
          msg += "; "
          msg += shootEffect[1]
        }
      }
    }.bind(this))

    if (result instanceof Alcohol) {
      if (addAlcohol) {
        playerDamaged.activeAlcohol.push(result)
      }

      result.startEffect(this, playerDamaged)
    }
    else if (result) { 
      let damageMsg = players[use].damage(1, this)

      if (damageMsg != "") {
        msg += "; "
        msg += damageMsg
      }
    }

    this.clearEffects()

    return [result, playerDamaged, msg]
  }

  //Used here so that host and plebs can display results at the same time
  async multiplayerTurn(nextTurn, turn) {
    getById("wheel").src = "images/wheel.png"
    dontTurnWheel = false

    getById("event").innerText = ``
    getById("eventHeader").innerText = `${this.name}'s Turn`

    let [result, playerDamaged, msg] = await turn.bind(this)()

    let hp = {}
    let effects = {}
    let activeAlcohol = {}

    players.forEach(function(player) {
      hp[player.name] = player.hp
      effects[player.name] = player.alcoholEffects
      activeAlcohol[player.name] = player.activeAlcohol
    })

    if (result instanceof Alcohol) {
      result = {
        name: result.name,
        id: result.id,
        description: result.description,
        img: result.img,
        typeObj: "multiplayerAlcohol"
      }
    }

    await broadcast(JSON.stringify({
      code: 1,
      player: this,
      result: result,
      playerDamaged: playerDamaged,
      msg: msg,
      nextTurn: nextTurn,
      hp: hp,
      effects: effects,
      activeAlcohol: activeAlcohol,
    }))

    await basicTurnDisplay.bind(this)(() => {
      return [result, playerDamaged, msg]
    })
  }

  clearEffects() {
    this.alcoholEffects.forEach(function(effect) {
      effect.turns--
      if (effect.turns < 1) {
        removeItem(this.alcoholEffects, effect)
        getById(`${effect.id}Effect`).remove()
      }
    }.bind(this))
  }

  removeEffects() {
    this.alcoholEffects.forEach(function(effect) {
      removeItem(this.alcoholEffects, effect)
      getById(`${effect.id}Effect`).remove()
    }.bind(this))
  }

  damage(hp, attacker) {
    this.hp -= hp
    let msg = ""

    this.alcoholEffects.forEach(function(effect) {
      if (effect.damage) {
        let effectDamage = effect.damage(this, attacker)

        this.hp = effectDamage[0]

        msg = effectDamage[1]
      }
    }.bind(this))

    getById(`${this.id}LifeImages`).innerHTML = ""

    for (let i = 1; i <= this.hp; i++) {
      getById(`${this.id}LifeImages`).innerHTML += '<img src="images/life.png" style="image-rendering: pixelated" />'
    }

    return msg
  }

  whatToDo() {
    let whatToDo = getRndInt(1, 3)

    if (whatToDo == 1 && this.activeAlcohol.length > 0) {
      return ["alcohol", getRndInt(0, this.activeAlcohol.length)]
    }

    let player = getRndInt(0, players.getAlivePlayers().length)
    player = players.getAlivePlayers()[player]

    return ["shoot", players.indexOf(player)]
  }
}

class Human extends Player {
  constructor(name) {
    super(name)
    this.type = "Human"
    this.waitForPlayerInput = waitForPlayerInput.bind(this)
    this.choseAlcohol = choseAlcohol.bind(this)
    this.choseShoot = choseShoot.bind(this)
  }

  async turn() {
    return await basicTurnDisplay.bind(this)(super.turn)
  }

  damage(hp, attacker) {
    let msg = super.damage(hp, attacker)

    getById("lifeImage").innerHTML = ""

    for (let i = 1; i <= this.hp; i++) {
      getById("lifeImage").innerHTML += '<img width="50em" src="images/life.png">'
    }

    return msg
  }

  async whatToDo(useAlcohol = false, multiplayerContext = undefined) {
    let whatToDo = await this.waitForPlayerInput()

    if (whatToDo == "alcohol" && this.activeAlcohol.length > 0) {
      let alcohol = await this.choseAlcohol(useAlcohol, multiplayerContext)

      if (alcohol == "goBack") {
        return this.whatToDo(useAlcohol, multiplayerContext)
      }

      return ["alcohol", alcohol]
    }
    
    let shoot = await this.choseShoot()

    if (shoot == "goBack") {
      return this.whatToDo(useAlcohol, multiplayerContext)
    }

    return ["shoot", shoot]
  }

  async multiplayerTurn(nextTurn) {
    return await super.multiplayerTurn(nextTurn, super.turn)
  }
}

class Bot extends Player {
  constructor(name) {
    super(name)
    this.type = "Bot"
  }

  async turn() {
    await basicTurnDisplay.bind(this)(super.turn)
  }

  whatToDo() {
    let whatToDo = super.whatToDo
    return new Promise(function(resolve) {
      setTimeout(function() {
        let whatToDoBind = whatToDo.bind(this)
        resolve(whatToDoBind())
      }.bind(this), 2000)
    }.bind(this))
  }
}

class MultiplayerHuman extends Player {
  constructor(name) {
    super(name)
    this.type = "MultiplayerHuman"
  }

  async whatToDo() {
    return new Promise(function(resolve) {
      multiplayerResolveFunc = resolve
    }.bind(this))
  }

  async multiplayerTurn(nextTurn) {
    currentPlayer = this.name

    let toReturn = await super.multiplayerTurn(nextTurn, super.turn)

    return toReturn
  }
}

let AlcoholTypes = [Beer, Vodka, Whiskey, Gin, Red_Wine, White_Wine, Tequila, Brandy]