import {game, posAvail, cardData, secretShopDeck} from './index.js'
import {board} from './board'
import {colorCheck , draggedCard} from './card'
import {sum, shuffle} from './arrayFunctions'
import {targetMap} from './cardEffects.js'
import {card} from './card'

const lastPlayed = document.getElementById("last-played-top");
let lastCard = document.createElement('div');
lastPlayed.appendChild(lastCard);

function targetUnitsAvail(total, position, index) {
  if (position[0].Name != null){
    total[0].push(index)
  }
  if (position[1].Name != null){
    total[1].push(index)
  }
  return total
}
function targetHerossAvail(total, position, index) {
  if (position[0].Name != null && position[0].CardType == "Hero"){
    total[0].push(index)
  }
  if (position[1].Name != null && position[0].CardType == "Hero"){
    total[1].push(index)
  }
  return total
}
function targetCreepsAvail(total, position, index) {
  if (position[0].Name != null && position[0].CardType == "Creep"){
    total[0].push(index)
  }
  if (position[1].Name != null && position[1].CardType == "Creep"){
    total[1].push(index)
  }
  return total
}

let targetEnemy = ["Hip Fire","Crippling Blow","Viscous Nasal Goo","Winter's Curse","Act of Defiance","Frostbite","Coup de Grace","Mystic Flare","Intimidation","Bellow","Relentless Pursuit","Viscous Nasal Goo","Crippling Blow","Rend Armor","Grazing Shot","No Accident","Slay","Pick Off","Assassinate"]
targetEnemy = new Map(targetEnemy.map(x => [x,true]))

let targetCreeps = ["Slay","Bellow"]
targetCreeps = new Map(targetCreeps.map(x => [x,true]))


const AI = (() => {
  const actionPhase = (player) => {
    shuffle(player.hand)
    let card;
    played:
    for (var i = 0; i < player.hand.length; i++) {
      card = player.hand[i]
      if ((card.ManaCost||0) <= board.lanes[game.getCurrentLane()].towers[player.turn].mana[0]) {
        card.div.ondragstart(new DragEvent({setData:null}))
        if (board.lanes[game.getCurrentLane()].cards.some(colorCheck) || draggedCard.CardType == "Item"){
          if (draggedCard.CardType == "Creep") {
            let blank = board.lanes[game.getCurrentLane()].cards.reduce(posAvail , [[],[]])[player.turn]
            blank = board.lanes[game.getCurrentLane()].cards[blank[Math.floor(Math.random() * blank.length)]][player.turn]
            let ev = {preventDefault: () => {},
                  target: blank.div,
                  currentTarget: blank.div}
            blank.drop(ev)
            break played;
          }
          if (draggedCard.CardType == "Improvement") {
            let lane = board.lanes[Math.floor(Math.random()*3)]
            let ev = {preventDefault: () => {},
                  target: lane.div,
                  currentTarget: lane.div}
            lane.drop(ev)
            break played;
          }
          if (draggedCard.CardType == "Spell" || draggedCard.CardType == "Item") {
            let spellTarget = targetMap.get(draggedCard.Name)
            if (draggedCard.CardType == "Item" && draggedCard.ItemType != "Consumable"){
              spellTarget = "unit"
            }
            let lane;
            if (draggedCard.CrossLane){
              lane = board.lanes[Math.floor(Math.random()*3)]
            } else {lane = board.lanes[game.getCurrentLane()] }
            if (spellTarget == "lane"){
              spellTarget = lane
            } else if (spellTarget == "unit") {
              let targetPlayer = targetEnemy.get(card.Name) ? 1 - player.turn : player.turn
              if (targetCreeps.get(card.Name)){spellTarget = lane.cards.reduce(targetCreepsAvail , [[],[]])[targetPlayer]}
              else {spellTarget = lane.cards.reduce(targetHerossAvail , [[],[]])[targetPlayer]}
              if (spellTarget.length <= 0 ) break played;
              spellTarget = lane.cards[spellTarget[Math.floor(Math.random() * spellTarget.length)]][targetPlayer]
              if (draggedCard.CardType == "Item"){
                if(draggedCard.ItemType == "Armor"){ if(spellTarget.Armor) break played; }
                else if(draggedCard.ItemType == "Accessory"){ if(spellTarget.Accessory) break played; }
                else if(draggedCard.ItemType == "Weapon"){ if(spellTarget.Weapon) break played; }
              }
            }
            let ev = {preventDefault: () => {},
                  target: spellTarget.div,
                  currentTarget: spellTarget.div}
            spellTarget.drop(ev)

            break played;


          }
          break played;
        }
      }
    }
    if (game.getTurn() != player.turn){
      card = card.div.cloneNode(true)
      lastCard.parentNode.replaceChild(card, lastCard)
      lastCard = card
    }
    setTimeout( function(){if (game.getTurn() == player.turn) game.pass() } , 300)
    // setTimeout( game.pass , 300)
  }

  const shop = (player) => {
    for (var i = 0; i < 2; i++) {
      let deck = secretShopDeck
      let newCard = deck[Math.floor(Math.random() * deck.length)]
      newCard = card(cardData.Cards.find(function(e){
        return e.Name == newCard
      }),game.players[player])
      console.log(newCard)
      if (game.players[player].gold >= newCard.GoldCost){
        game.players[player].gold -= newCard.GoldCost
        game.players[player].hand.push(newCard)
        game.players[player].handDiv.appendChild(newCard.div)
      }
    }
    game.infoDisplayUpdate()
  }

  return {actionPhase , shop}
})();

export {AI,targetUnitsAvail,targetHerossAvail,targetCreepsAvail}
