import {game, posAvail} from './index.js'
import {board} from './board'
import {colorCheck , draggedCard} from './card'
import {sum, shuffle} from './arrayFunctions'
import {targetMap} from './cardEffects.js'

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

let targetEnemy = ["Intimidation","Bellow","Relentless Pursuit","Viscous Nasal Goo","Crippling Blow","Rend Armor","Grazing Shot","No Accident","Slay","Pick Off","Assassinate"]
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
        if (board.lanes[game.getCurrentLane()].cards.some(colorCheck)){
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
          if (draggedCard.CardType == "Spell") {
            let spellTarget = targetMap.get(draggedCard.Name)
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

  return {actionPhase}
})();

export {AI,targetUnitsAvail,targetHerossAvail,targetCreepsAvail}
