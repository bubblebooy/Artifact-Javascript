import {game, posAvail} from './index'
import {blank, draggedCard, colorCheck} from './card'
import {effectMap,targetMap} from './cardEffects.js'
import {board} from './board'
const lane = (lane) => {
  let passCount = 0;
  // let name;
  let div = document.createElement('div');
  let towerTop;// = tower(40,1);
  let towerBottom;// = tower(40,0);
  let towers = [towerBottom,towerTop];
  let playAreaTop;
  let playAreaBottom;
  let playAreas = [playAreaBottom,playAreaTop]
  let stages = []
  let cards = []


  div.ondragover = function(ev) { ev.preventDefault()};
  div.ondragenter = function(ev) { ev.target.classList.add("dragover")};
  div.ondragleave = function(ev) { ev.target.classList.remove("dragover")};
  div.ondrop = function(ev){ev.preventDefault();
    ev.target.classList.remove("dragover")
    if (board.lanes[game.getCurrentLane()].towers[game.getTurn()].mana[0] < draggedCard.ManaCost) return ;
    if (lane == game.getCurrentLane() && targetMap.get(draggedCard.Name) == "lane") {
      if (board.lanes[lane].cards.some(colorCheck)){
        effectMap.get(draggedCard.Name)(game.getTurn(),lane,ev)
        draggedCard.div.draggable = false;
        board.lanes[lane].towers[game.getTurn()].mana[0] -= draggedCard.ManaCost
        board.lanes[lane].towers[game.getTurn()].updateDisplay()
        draggedCard.div.parentNode.removeChild(draggedCard.div)
        game.players[game.getTurn()].hand.splice(game.players[game.getTurn()].hand.indexOf(draggedCard),1)
      }
    }
  };

  const collapse = (refresh = true) => {
    let loop = false
    cards.forEach(function(row,index){
      row.forEach(function(unit, side) {
        if (unit.Name != null && cards[index + unit.arrow][1 - side].Name == null){
          unit.arrow = 0;
        }
      })
    })
    cards.forEach(function(row, index){
      if (row[0].Name == null && row[1].Name == null){
        loop = true
        row[0].div.parentNode.removeChild(row[0].div);
        row[1].div.parentNode.removeChild(row[1].div);
        cards.splice(index, 1)
       };
    })
    if (loop) {  // there is prob a better way
      collapse(refresh)
    }else if (refresh){
      game.dispatchEvent("continuousRefresh")
    }
  }

  const expand = () => {
        if (cards.reduce(posAvail , [[],[]])[game.getTurn()].length == 0){
          let emptyRight = [blank(lane,playAreas[0],cards.length),blank(lane,playAreas[1],cards.length)]
          let emptyLeft = [blank(lane,playAreas[0],0),blank(lane,playAreas[1],0)]
          cards.push(emptyRight)
          cards.unshift(emptyLeft)
        }
  }

  const summon = (sides, arrow = true) => {
    sides.forEach(function(summons, side){
      while (cards.reduce(posAvail , [[],[]])[side].length < summons.length){
        let rightLeft = Math.random() < 0.5
        rightLeft = rightLeft ? playAreas[0].childNodes.length : 0
        let empty = [blank(lane,playAreas[0],rightLeft),blank(lane,playAreas[1],rightLeft)]
        rightLeft ? cards.push(empty) : cards.unshift(empty)
      }
    })
    sides.forEach(function(summons, side){ // add creeps to board
      summons.forEach(function(card){
        let pos = cards.reduce(posAvail , [[],[]])[side]
        pos = pos[Math.floor(Math.random() * pos.length)]
        let blankDiv = cards[pos][side].div
        blankDiv.parentNode.replaceChild(card.div , blankDiv)
        cards[pos][side] = card
        card.arrow = 0;
        if(cards[pos][1 - side].Name != null){
          cards[pos][1 - side].arrow = 0;
        }
        if (arrow){
          card.rndArrow(lane,pos,side)
          game.dispatchEvent("continuousRefresh")
        }
      })
    })
  }
  return {name, div, cards, towers, playAreas, stages, passCount, collapse, expand, summon};
};

export {lane};
