import {toCamelCase, toFunctionName, toFileName} from './stringFunctions'
import {sum} from './arrayFunctions'
import {abilityMap,triggerMap} from './abilities.js'
import {game , cardData, posAvail} from './index.js'
import {board} from './board'
import {effectMap,targetMap} from './cardEffects.js'


function addToFunction( someFunction , callback){
  someFunction = (function(){
    let _someFunction = someFunction;
    return function() {
      callback();
      _someFunction.apply(this);
    };
  })();
  return someFunction;
}

let draggedCard;

const colorCheck = (card) => {
  if (card[game.getTurn()].CardType == "Hero" && !card[game.getTurn()].silenced){
    return card[game.getTurn()].Color == draggedCard.Color
  }
}

const blank = (lane, parrent, index) => {
  let div = document.createElement('div')
  div.classList.add("blank")
  if (parrent != null){
    index ? parrent.insertBefore(div , parrent.childNodes[index-1].nextSibling ) : parrent.insertBefore(div, parrent.firstChild); //parrent.childNodes[index-1].nextSibling
  }
  div.ondragover = function(ev) { ev.preventDefault()};
  div.ondragenter = function(ev) { ev.target.classList.add("dragover")};
  div.ondragleave = function(ev) { ev.target.classList.remove("dragover")};
  div.ondrop = (ev) => drop(ev);  // would need div ,lane, parrent, index if onDrop Moves out of blank
  const drop = (ev) => {ev.preventDefault();
    if (ev != null ) ev.target.classList.remove("dragover")
    if (board.lanes[game.getCurrentLane()].towers[game.getTurn()].mana[0] < draggedCard.ManaCost) return
    if (lane == game.getCurrentLane() && draggedCard.CardType == "Creep") {
      if (board.lanes[game.getCurrentLane()].cards.some(colorCheck)){
        let index = board.lanes[lane].cards.flat().findIndex(function(card){return card.div == blank.div});
        let player = index % 2
        index = Math.floor(index/2)
        if (player == game.getTurn()){
          draggedCard.div.draggable = false;
          div.parentNode.replaceChild(draggedCard.div , div)
          board.lanes[lane].cards[index][player] = draggedCard
          board.lanes[game.getCurrentLane()].towers[game.getTurn()].mana[0] -= draggedCard.ManaCost
          board.lanes[game.getCurrentLane()].towers[game.getTurn()].updateDisplay()
          if(board.lanes[lane].cards[index][1 - player].Name != null){
              board.lanes[lane].cards[index][1 - player].arrow = 0;
              board.lanes[lane].cards[index][1 - player].updateDisplay()
          }
          game.players[game.getTurn()].hand.splice(game.players[game.getTurn()].hand.indexOf(draggedCard),1)
          board.lanes[lane].collapse()
          board.lanes[lane].expand()
          game.dispatchEvent("continuousRefresh")
          game.nextTurn()
        }
      }
    }
  };
  let blank = {div, drop}
  return {div, drop}
}

const card = (cardProto , player) => {
  let assetPath = "../node_modules/artifactdb/assets"
  let div = document.createElement('div')
  let updateDisplay = () => {};
  let endOfRound = () => {};
  let afterCombat = () => {};
  let continuousRefresh = () => {};
  let properties = {div, player};

  div.classList.add("card" , cardProto.Color, cardProto.CardType)
  // div.draggable = true;
  // let imageFileName = toFileName(cardProto.Name) // .replace(/\s/g,"_").replace("\'","").toLowerCase()
  let artwork = document.createElement('IMG'); artwork.draggable = false;
  artwork.src = `${assetPath}/artwork/large/${cardProto.FileName}.jpg`
  artwork.onerror = function () { artwork.src = "../src/placeholder.png"}
  div.appendChild(artwork)

  function lane(){
    if (cardProto.CardType == "Improvement"){
      return board.lanes.findIndex(function(l){ return l.improvements.flat().some(function(c){return c.div == cardProto.div }) })
    } else if(cardProto.CardType == "Item"){
      if (cardProto.ItemType == "Weapon") return board.lanes.findIndex(function(l){ return l.cards.flat().some(function(c){ if (c.Weapon) return c.Weapon.div == cardProto.div }) })
      if (cardProto.ItemType == "Armor") return board.lanes.findIndex(function(l){ return l.cards.flat().some(function(c){ if (c.Armor) return c.Armor.div == cardProto.div }) })
      if (cardProto.ItemType == "Accessory") return board.lanes.findIndex(function(l){ return l.cards.flat().some(function(c){ if (c.Accessory) return c.Accessory.div == cardProto.div }) })
    } else return board.lanes.findIndex(function(l){ return l.cards.flat().some(function(c){return c.div == cardProto.div }) })
  }

  if (cardProto.CardType == "Hero"){
    properties.respawn = 0;
    properties.Bounty = 5;
  }
  if (cardProto.CardType == "Creep"){
    properties.Bounty = 1;
  }

  if (cardProto.ManaCost != null){
    let manaCostContainer = document.createElement('div')
    manaCostContainer.classList.add('mana-cost')
    manaCostContainer.textContent = cardProto.ManaCost
    div.appendChild(manaCostContainer)
  }

  if(cardProto.ItemType == "Consumable"){
    properties.ManaCost = 0
  }

  if (cardProto.GoldCost != null){
    let goldCostContainer = document.createElement('div')
    goldCostContainer.classList.add('gold-cost')
    goldCostContainer.textContent = cardProto.GoldCost
    div.appendChild(goldCostContainer)
  }

  if (cardProto.Text != null && cardProto.Text != ""){
    let textContainer = document.createElement('div')
    textContainer.classList.add("card-text")
    let textBackground = document.createElement('IMG'); textBackground.draggable = false;
    textBackground.src = `${assetPath}/text_background.jpg`
    let textSpan = document.createElement('span')
    textSpan.textContent=cardProto.Text
    div.appendChild(textContainer)
    textContainer.appendChild(textBackground)
    textContainer.appendChild(textSpan)
  }

  let nameContainer = document.createElement('div')
  nameContainer.classList.add('name')
  nameContainer.textContent = cardProto.Name
  div.appendChild(nameContainer)

  if (cardProto.CardType == "Hero"){
    var itemsContainer = document.createElement('div')
    itemsContainer.classList.add('items')
    div.appendChild(itemsContainer)
    properties.Weapon = null
    var itemWeaponContainer = document.createElement('div')
    itemWeaponContainer.classList.add('Weapon')
    itemsContainer.appendChild(itemWeaponContainer)
    properties.Armor = null
    var itemArmorContainer = document.createElement('div')
    itemArmorContainer.classList.add('Armor')
    itemsContainer.appendChild(itemArmorContainer)
    properties.Accessory = null
    var itemAccessoryContainer = document.createElement('div')
    itemAccessoryContainer.classList.add('Accessory')
    itemsContainer.appendChild(itemAccessoryContainer)

  }

  if (cardProto.CardType == "Creep" || cardProto.CardType == "Hero" ){
    properties.arrow = 0;
    let directions = ["left", "middle", "right"]
    let arrowDiv = document.createElement('div');
    arrowDiv.classList.add("arrow", directions[1 + properties.arrow])
    div.appendChild(arrowDiv);
    properties.rndArrow = (lane, index, side) => {
      if (typeof lane == "number") { lane = board.lanes[lane] }
      if(lane.cards[index][1 - side].Name == null){
        let rand = Math.random();
        rand = rand > .75 ? 1 : (rand > .25) - 1;
        if (lane.cards[index + rand] == null || lane.cards[index + rand][1 - side].Name == null){ rand = 0 }
        cardProto.arrow = rand;
      }
      cardProto.updateDisplay()
    }
    updateDisplay = addToFunction(updateDisplay , function(){
      arrowDiv.classList.remove("left", "middle", "right")
      arrowDiv.classList.add("arrow", directions[1 + cardProto.arrow])
    })
    properties.cleave = [0,0,0,0,0,0]
    properties.retaliate = [0,0,0,0,0,0]
    properties.siege = [0,0,0,0,0,0]
    properties.regen = [0,0,0,0,0,0]
    properties.silenced = false
    properties.disarmed = false
    updateDisplay = addToFunction(updateDisplay , function(){
      div.title = `Cleave : ${sum(cardProto.cleave)}\nRetaliate : ${sum(cardProto.retaliate)}\nSiege : ${sum(cardProto.siege)}\nRegeneration : ${sum(cardProto.regen)}`
      sum(cardProto.cleave) > 0 ? arrowDiv.classList.add('cleave') : arrowDiv.classList.remove('cleave');
      sum(cardProto.retaliate) > 0 ? div.classList.add('retaliate') : div.classList.remove('retaliate');
      sum(cardProto.siege) > 0 ? arrowDiv.classList.add('siege') : arrowDiv.classList.remove('siege');
      cardProto.silenced ?  div.classList.add('silenced') : div.classList.remove('silenced');
      cardProto.disarmed ?  div.classList.add('disarmed') : div.classList.remove('disarmed');
    })
    endOfRound = addToFunction(endOfRound , function(){
      cardProto.cleave[3] = 0; cardProto.retaliate[3] = 0; cardProto.siege[3] = 0;cardProto.regen[3] = 0;
      cardProto.silenced = false ; cardProto.disarmed = false;
    })
    continuousRefresh = addToFunction(continuousRefresh , function(){
      cardProto.cleave[4] = 0; cardProto.retaliate[4] = 0; cardProto.siege[4] = 0;cardProto.regen[4] = 0;
    })
    afterCombat = addToFunction(afterCombat , function(){
      cardProto.cleave[5] = 0; cardProto.retaliate[5] = 0; cardProto.siege[5] = 0;cardProto.regen[5] = 0;
    })
  // }
  // if (cardProto.Health != null){
    properties.currentHealth = [cardProto.Health,0,0,0,0,0];
    let healthContainer = document.createElement('div')
    healthContainer.classList.add("icon-container","health")
    let healthIcon = document.createElement('IMG'); healthIcon.draggable = false;
    healthIcon.src = `${assetPath}/icon/cardstat-health.png`
    let healthNumber = document.createElement('div')
    healthNumber.textContent = sum(properties.currentHealth);
    healthContainer.appendChild(healthIcon)
    healthContainer.appendChild(healthNumber)
    div.appendChild(healthContainer)
    updateDisplay = addToFunction(updateDisplay , function(){healthNumber.textContent = sum(cardProto.currentHealth);})
    endOfRound = addToFunction(endOfRound , function(){cardProto.currentHealth[3] = 0 })
    continuousRefresh = addToFunction(continuousRefresh , function(){cardProto.currentHealth[4] = 0 })
    afterCombat = addToFunction(afterCombat , function(){cardProto.currentHealth[5] = 0 })
  // }
  // if (cardProto.Attack != null){
    properties.currentAttack = [cardProto.Attack,0,0,0,0,0]
    let attackContainer = document.createElement('div')
    attackContainer.classList.add("icon-container","attack")
    let attackIcon = document.createElement('IMG'); attackIcon.draggable = false;
    attackIcon.src = `${assetPath}/icon/cardstat-attack.png`
    let attackNumber = document.createElement('div')
    attackNumber.textContent = cardProto.Attack;
    attackContainer.appendChild(attackIcon)
    attackContainer.appendChild(attackNumber)
    div.appendChild(attackContainer)
    updateDisplay = addToFunction(updateDisplay , function(){attackNumber.textContent = sum(cardProto.currentAttack);})
    endOfRound = addToFunction(endOfRound , function(){cardProto.currentAttack[3] = 0 })
    continuousRefresh = addToFunction(continuousRefresh , function(){cardProto.currentAttack[4] = 0 })
    afterCombat = addToFunction(afterCombat , function(){cardProto.currentAttack[5] = 0 })
  // }
  // if (cardProto.Armor != null){
    properties.currentArmor = [cardProto.Armor,0,0,0,0,0]
    let armorContainer = document.createElement('div')
    armorContainer.classList.add("icon-container","armor")
    let armorIcon = document.createElement('IMG'); armorIcon.draggable = false;
    armorIcon.src = `${assetPath}/icon/cardstat-armor.png`
    let armorNumber = document.createElement('div')
    armorNumber.textContent = cardProto.Armor;
    armorContainer.appendChild(armorIcon)
    armorContainer.appendChild(armorNumber)
    div.appendChild(armorContainer)
    updateDisplay = addToFunction(updateDisplay , function(){armorNumber.textContent = sum(cardProto.currentArmor);})
    endOfRound = addToFunction(endOfRound , function(){cardProto.currentArmor[3] = 0 })
    continuousRefresh = addToFunction(continuousRefresh , function(){cardProto.currentArmor[4] = 0 })
    afterCombat = addToFunction(afterCombat , function(){cardProto.currentArmor[5] = 0 })
  }
  if (cardProto.Abilities != null){  //&& cardProto.CardType != "Improvement"
    properties.Abilities = []
    let abilitiesContainer = document.createElement('div');
    abilitiesContainer.classList.add("abilities-container")
    cardProto.Abilities.forEach(function(ability,abilityIndex){
      ability = Object.assign({}, ability)
      ability.div = document.createElement('div')
      ability.div .classList.add("ability-container")
      let abilityIcon = document.createElement('IMG'); abilityIcon.draggable = false;
      if (cardProto.CardType == "Hero"){
        let abilityFileName = toFileName(ability.Name)
        abilityIcon.src = `${assetPath}/ability/${abilityFileName}.jpg`
      } else{
        if (abilityIndex > 0) ability.Name = ability.Name + ability.Type
        abilityIcon.src = `${assetPath}/artwork/small/${cardProto.FileName}.jpg`
      }
      abilityIcon.onerror = function () { abilityIcon.src = "../src/placeholder.png"}
      abilityIcon.title = ability.Text
      ability.div.appendChild(abilityIcon)
      abilitiesContainer.appendChild(ability.div)
      if (ability.Type == "Active"){
        ability.div.classList.add("Active")
        if (cardProto.CardType == "Hero") {ability.currentCooldown = ability.Cooldown}
        else { ability.currentCooldown = 0 }
        ability.cooldownDiv = document.createElement('div')
        ability.cooldownDiv.classList.add("cooldown","display-none")
        ability.cooldownDiv.textContent = ability.currentCooldown;
        ability.div.appendChild(ability.cooldownDiv)
        ability.div.addEventListener("click", function(e){
          if (!cardProto.silenced && game.players[game.getTurn()] == player && game.getCurrentLane() == lane() && cardProto.Abilities[abilityIndex].currentCooldown <= 0){
            if (abilityMap.get(ability.Name)(cardProto,e)) {
              cardProto.Abilities[abilityIndex].currentCooldown = cardProto.Abilities[abilityIndex].Cooldown;
              updateDisplay()
              game.nextTurn()
            };
          }
        })
        endOfRound = addToFunction(endOfRound , function(){cardProto.Abilities[abilityIndex].currentCooldown -= 1;})
        updateDisplay = addToFunction(updateDisplay , function(){
          if (cardProto.Abilities[abilityIndex].currentCooldown <= 0){ cardProto.Abilities[abilityIndex].cooldownDiv.classList.add("display-none")}
          else {
            cardProto.Abilities[abilityIndex].cooldownDiv.classList.remove("display-none")
            cardProto.Abilities[abilityIndex].cooldownDiv.textContent = cardProto.Abilities[abilityIndex].currentCooldown
          }
        })
      }else{
        div.addEventListener(triggerMap.get(ability.Name), function(e){abilityMap.get(ability.Name)(cardProto,e)})
       }
       properties.Abilities.push(ability)
    })
    div.appendChild(abilitiesContainer)
  }
  div.ondragover = function(ev) { ev.preventDefault()};
  div.addEventListener("dragenter", function(ev) { ev.target.classList.add("dragover")} )
  div.addEventListener("dragleave", function(ev) { ev.target.classList.remove("dragover")}  )
  div.ondrop = (ev) => properties.drop(ev);  // would need div ,lane, parrent, index if onDrop Moves out of blank
  properties.drop = (ev) => { ev.preventDefault();
    if (ev != null ) ev.target.classList.remove("dragover")
    if (board.lanes[game.getCurrentLane()].towers[game.getTurn()].mana[0] >= draggedCard.ManaCost) {
      let lane = board.lanes.findIndex(function(lane){return lane.div == ev.currentTarget.parentNode.parentNode})
      if ((lane == game.getCurrentLane() || draggedCard.CrossLane) && targetMap.get(draggedCard.Name) == "unit") {
        if (board.lanes[game.getCurrentLane()].cards.some(colorCheck) || draggedCard.CardType == "Item"){
          let index = board.lanes[lane].cards.flat().findIndex(function(card){return card.div == ev.currentTarget});
          let player = index % 2
          index = Math.floor(index/2)

          if (effectMap.get(draggedCard.Name)(ev, lane , player , index)){
            draggedCard.div.draggable = false;
            board.lanes[game.getCurrentLane()].towers[game.getTurn()].mana[0] -= draggedCard.ManaCost
            board.lanes[game.getCurrentLane()].towers[game.getTurn()].updateDisplay()
            draggedCard.div.parentNode.removeChild(draggedCard.div)
            game.players[game.getTurn()].hand.splice(game.players[game.getTurn()].hand.indexOf(draggedCard),1)
            game.dispatchEvent("continuousRefresh")
            game.nextTurn()
          }
        }
      }
    } else if(cardProto.CardType == "Hero" && draggedCard.CardType == "Item"){
      let lane = board.lanes.findIndex(function(lane){return lane.div == ev.currentTarget.parentNode.parentNode})
      if (lane == game.getCurrentLane()){
        if(draggedCard.ItemType == "Armor"){
          if(cardProto.Armor) itemArmorContainer.removeChild(itemArmorContainer.firstChild) //cardProto.Armor.div
          cardProto.Armor = draggedCard
          itemArmorContainer.appendChild(draggedCard.div)
        }
        if(draggedCard.ItemType == "Accessory"){
          if(cardProto.Accessory) itemAccessoryContainer.removeChild(itemAccessoryContainer.firstChild)
          cardProto.Accessory = draggedCard
          itemAccessoryContainer.appendChild(draggedCard.div)
        }
        if(draggedCard.ItemType == "Weapon"){
          if(cardProto.Weapon) itemWeaponContainer.removeChild(itemWeaponContainer.firstChild)
          cardProto.Weapon = draggedCard
          itemWeaponContainer.appendChild(draggedCard.div)
        }
        game.players[game.getTurn()].hand.splice(game.players[game.getTurn()].hand.indexOf(draggedCard),1)
        game.dispatchEvent("continuousRefresh")
        game.nextTurn()
      }
    }
  };

  div.addEventListener("click",function(){console.log(cardProto)})

  div.ondragstart = function(ev){
    draggedCard = cardProto
    if(ev.dataTransfer != null ) ev.dataTransfer.setData("text/plain", " ")
  };

  div.addEventListener("endOfRound", endOfRound)
  div.addEventListener("afterCombat", afterCombat)
  div.addEventListener("continuousRefresh", continuousRefresh)

  properties.updateDisplay = updateDisplay
  cardProto = Object.assign({},cardProto, properties)

  return cardProto
}

export { card , blank, draggedCard, colorCheck}
