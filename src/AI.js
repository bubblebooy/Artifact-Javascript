import {game, posAvail} from './index.js'
import {board} from './board'
import {colorCheck , draggedCard} from './card'
import {sum, shuffle} from './arrayFunctions'
import {targetMap} from './cardEffects.js'

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

const AI = (() => {
  const actionPhase = (player) => {
    shuffle(player.hand)
    played:
    for (var i = 0; i < player.hand.length; i++) {
      let card = player.hand[i]
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
              let targetPlayer = true ? player.turn : 1 - player.turn                                                     // make map of cards for AI to use
              spellTarget = lane.cards.reduce(targetHerossAvail , [[],[]])[targetPlayer]                                // prob another map, or use the targetMap
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
    setTimeout( function(){if (game.getTurn() == player.turn) game.pass() } , 300)
    // setTimeout( game.pass , 300)
  }

  return {actionPhase}
})();

export {board}

export default AI
