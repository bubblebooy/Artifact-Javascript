import {game, posAvail} from './index'
import {blank, draggedCard, colorCheck} from './card'
import {effectMap,targetMap} from './cardEffects.js'
import {board} from './board'
import {sum} from './arrayFunctions'



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
  let improvements = [[],[]]

  let improvementsContainers = [document.createElement('div'),document.createElement('div')]
  improvementsContainers.forEach(function(improvementsContainer,p){
    improvementsContainer.classList.add("improvement", p ? "top" : "bottom");
    div.appendChild(improvementsContainer);
  })


  div.ondragover = function(ev) { ev.preventDefault()};
  div.addEventListener("dragenter", function(ev) { ev.target.classList.add("dragover")} )
  div.addEventListener("dragleave", function(ev) { ev.target.classList.remove("dragover")})
  // div.ondragenter = function(ev) { ev.target.classList.add("dragover")};
  // div.ondragleave = function(ev) { ev.target.classList.remove("dragover")};
  div.ondrop = (ev) => drop(ev);
  const drop = (ev) => {ev.preventDefault();
    if (ev != null ) ev.target.classList.remove("dragover")
    if (board.lanes[game.getCurrentLane()].towers[game.getTurn()].mana[0] < draggedCard.ManaCost) return ;
    if ((lane == game.getCurrentLane() || draggedCard.CrossLane) && (targetMap.get(draggedCard.Name) == "lane" || draggedCard.CardType == "Improvement")) {
      if (board.lanes[game.getCurrentLane()].cards.some(colorCheck) || draggedCard.CardType == "Item"){
        if (draggedCard.CardType == "Improvement"){
          draggedCard.div.draggable = false;
          improvements[game.getTurn()].push(draggedCard);
          improvementsContainers[game.getTurn()].appendChild(draggedCard.div);
        } else {
          effectMap.get(draggedCard.Name)(ev , lane);
          draggedCard.div.parentNode.removeChild(draggedCard.div);
        }
        board.lanes[game.getCurrentLane()].towers[draggedCard.player.turn].mana[0] -= draggedCard.ManaCost;
        board.lanes[game.getCurrentLane()].towers[draggedCard.player.turn].updateDisplay();
        game.players[draggedCard.player.turn].hand.splice(game.players[draggedCard.player.turn].hand.indexOf(draggedCard),1);
        collapse();
        expand();
        game.dispatchEvent("continuousRefresh")
        game.nextTurn();
      }
    }
  };


  const collapse = (refresh = true) => {
    cards.flat().forEach(function(unit){
      if (unit.currentHealth !=null && sum(unit.currentHealth) <= 0 ){
        game.condemn(unit, board.lanes[lane])
      }
    })
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
  return {name, div, cards, towers, improvements, playAreas, stages, passCount, collapse, expand, summon, drop};
};

export {lane};
