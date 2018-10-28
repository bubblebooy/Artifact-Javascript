import {card , blank} from './card'
import loadJSON from './loadJSON'
import zoomNavController from './zoomNavController'
import passButtonController from './passButtonController'
import shop from './shop'
import {deployment} from './deploy'
import infoDisplay from './infoDisplay'
import {sum} from './arrayFunctions'

let cardData = "not loaded yet";
loadJSON(function(response){
  cardData = JSON.parse(response).Sets[0]
});

// const blank = (parrent, side) => {
// function addToFunction( someFunction , callback){
// const card = (cardProto) => {

const tower = (currentHealth, player) => {
  currentHealth = [currentHealth]
  let Name = "tower";
  let div = document.createElement('div');
  let currentArmor = [0];
  let ancient = false;
  const updateDisplay = () => {
    if (sum(tower.currentHealth) <= 0 ){
      game.score[1 - player] += 1;
      if (!ancient){
        ancient = !ancient;
        tower.currentHealth = [80];
        div.classList.add("ancient");
      };
    }
    div.textContent = sum(tower.currentHealth);
  };
  let tower = {currentHealth , div, Name, currentArmor, updateDisplay}
  return tower
}

const lane = () => {
  let passCount = 0;
  let name;
  let div;
  let towerTop = tower(40,1);
  let towerBottom = tower(40,0);
  let towers = [towerBottom,towerTop];
  let playAreaTop;
  let playAreaBottom;
  let playAreas = [playAreaBottom,playAreaTop]
  let stages = []
  let cards = []
  return {name, div, cards, towers, playAreas,stages, passCount};
};

const board = (() => {
  const div = document.getElementById('board');
  const lanes = [lane(),lane(),lane()]
  return {div, lanes}
})();

const player = (name, heros, computer = false) => {
  let player = {}
  setTimeout(function(){
    heros = heros.map(function(hero){
      return card(cardData.Cards.find(function(e){
        return e.Name == hero
      }),player)
    })
    heros[3].respawn = 1;
    heros[4].respawn = 2;
  },300)
  let deck = [];

  player.getHeros = () => heros ;
  player.name = name
  player.computer = computer
  player.gold = 0;
  return player
}


const game = (() => {
  const div = document.getElementById('game');
  const bottomPassButton = document.getElementById("pass-btn-bottom");
  const topPassButton = document.getElementById("pass-btn-top");
  let players = [player("Radiant",["Keefe the Bold","Fahrvhan the Dreamer","J\'Muy the Wise","Debbi the Cunning","Crystal Maiden"]),
                 player("Dire",["Keefe the Bold","Fahrvhan the Dreamer","J\'Muy the Wise","Debbi the Cunning","Crystal Maiden"],true)];
  let turn = 0;
  let round = 0;
  let currentLane = 0;
  let score = [0,0];
  let _infoDisplay;

  const getCurrentLane = () => currentLane ;
  const getRound = () => round ;
  const getTurn = () => turn ;
  const infoDisplayUpdate = () => {_infoDisplay.updateDisplay()} ;
  // const getPlayers = () => players ;

  const startGame = () => {
    console.log("Game Started")
    buildLanes();
    _infoDisplay = infoDisplay()
    board.lanes[currentLane].div.classList.add("active");
    deployment();
    passButtonController.enable();
    zoomNavController.updateActive();
  };

  const gameOver = () => {
    if ( score[0] < 2 && score[1] < 2){
      return false;
    }else if ( score[0] >= 2 && score[1] >= 2){
      console.log("Tie Game");
    }else if ( score[0] >= 2){
      console.log(`${players[0].name} Wins`);
    }else if ( score[1] >= 2){
      console.log(`${players[1].name} Wins`);
    }

    passButtonController.hide()
    return true;
  }

  let afterCombatEvent = new CustomEvent('afterCombat', { detail: {lane: undefined, card: undefined, player: undefined} })
  let endOfRoundEvent = new CustomEvent('endOfRound', { detail: {lane: undefined, card: undefined, player: undefined} })
  let continuousRefreshEvent = new CustomEvent('continuousRefresh', { detail: {lane: undefined, card: undefined, player: undefined} })
  let continuousEffectEvent = new CustomEvent('continuousEffect', { detail: {lane: undefined, card: undefined, player: undefined} })
  let whenAttackingEvent = new CustomEvent('whenAttacking', { detail: {lane: undefined, card: undefined, player: undefined} })

  function dispatchEvent(e){
    // console.log(e)
    let events = {
      "afterCombat": (lane) => {if (lane == currentLane){return afterCombatEvent}},
      "endOfRound": (lane) => {return endOfRoundEvent},
      "continuousRefresh": (lane ) => {return continuousRefreshEvent},
      "_continuousEffect": (lane) => {return continuousEffectEvent},
      "whenAttacking": (lane) => {if (lane == currentLane) return whenAttackingEvent}
    };
    board.lanes.forEach(function(lane, laneIndex){
      lane.cards.forEach(function(row, cardIndex){
        row.forEach(function(card,playerIndex){
          if (card.Name != null){
            let evnt = events[e](laneIndex)
            if (evnt != null){
              evnt.detail.lane = laneIndex;
              evnt.detail.card = cardIndex;
              evnt.detail.player = playerIndex;
              card.div.dispatchEvent(evnt);
            }
            card.updateDisplay()
          }
        })
      })
    })
    if (e == "continuousRefresh"){dispatchEvent("_continuousEffect")}
  }

  function nextTurn(){
    turn = 1 - turn
    passButtonController.enable();
    if (players[turn].computer ){ setTimeout( pass , 300) }  // AI AUTO PASS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  }

  function nextLane(){
    board.lanes[currentLane].div.classList.remove("active")
    currentLane += 1
    if (currentLane > 2){
      passButtonController.hide()
      shop.show();
      dispatchEvent("endOfRound")
      currentLane = 0
      round += 1
    }
    board.lanes[currentLane].div.classList.add("active")
    zoomNavController.updateActive()
  };

  const pass = () => {
    board.lanes[currentLane].passCount += 1;
    if (board.lanes[currentLane].passCount > 1){
      combat()
      nextLane()
      board.lanes[currentLane].passCount = 0;
    }
    nextTurn()
  };



  return {div, getCurrentLane, startGame, getRound, score, gameOver, getTurn, pass, players, infoDisplayUpdate , dispatchEvent}
})();


function posAvail(total, position, index) {
  if (position[0].Name == null){
    total[0].push(index)
  }
  if (position[1].Name == null){
    total[1].push(index)
  }
  return total
}

function combat(){

  let currentLane = board.lanes[game.getCurrentLane()]
  game.dispatchEvent("whenAttacking")
  currentLane.cards.forEach(function(row, rowIndex){
    row.forEach(function(attacker, attackerIndex){
      if (attacker.Name == null){ return; };
      let target = currentLane.cards[rowIndex + attacker.arrow][1 - attackerIndex] // cause arror if pointing to null (not blank), this shoud not happen anyways
      if (target == null || target.Name == null ){
        target = ( attackerIndex ?  currentLane.towers[0] : currentLane.towers[1] ) ;
        target.currentHealth[0] -= sum(attacker.currentAttack) - sum(target.currentArmor)
      }else{
        target.currentHealth[0] -= sum(attacker.currentAttack) - sum(target.currentArmor)
      }
      //divine Shield
      //Retaliate
      //Regen
    });
  });
  currentLane.cards.flat().forEach(function(unit){
    if (unit.currentHealth !=null && sum(unit.currentHealth) <= 0 ){
      condemn(unit, currentLane)
    }
  })

  collapse();
  // currentLane.cards.flat().forEach(function(unit){ if (unit.Name != null) unit.updateDisplay();})
  currentLane.towers[1].updateDisplay();
  currentLane.towers[0].updateDisplay();
  game.dispatchEvent("afterCombat")
  game.infoDisplayUpdate();
  if (game.gameOver()) {};
}

function condemn(unit, lane){
  let index = lane.cards.flat().indexOf(unit);
  let empty = blank();
  //death effects

  unit.div.classList.add("condemned");
  unit.div.parentNode.replaceChild(empty.div , unit.div);
  lane.cards[Math.floor(index / 2)][index % 2] = empty;
  unit.player == game.players[0] ? game.players[1].gold += unit.Bounty : game.players[0].gold += unit.Bounty
  if (unit.respawn != null){
    unit.respawn = 1;
    unit.currentHealth[0] = unit.Health;
    unit.updateDisplay();
  }
}

function collapse(){
  let loop = false
  board.lanes.forEach(function(lane){
    lane.cards.forEach(function(row,index){
      row.forEach(function(unit, side) {
        if (unit.Name != null && lane.cards[index + unit.arrow][1 - side].Name == null){
          unit.arrow = 0;
        }
      })
    })
    lane.cards.forEach(function(row, index){
      if (row[0].Name == null && row[1].Name == null){
        loop = true
        row[0].div.parentNode.removeChild(row[0].div);
        row[1].div.parentNode.removeChild(row[1].div);
        lane.cards.splice(index, 1)
       };
    })
  })
  if (loop) {  // there is prob a better way
    collapse()
  }else{
    game.dispatchEvent("continuousRefresh")
  }
}


function buildLanes(){
  let laneNames=['left-lane','middle-lane','right-lane']
  let sideNames=['bottom','top']
  board.lanes.forEach(function(lane,i){
    lane.div = document.createElement('div');
    lane.name = laneNames[i];
    lane.div.classList.add('lane',laneNames[i]);
    board.div.appendChild(lane.div);
    for (var i = 1; i >= 0; i--) {
      lane.playAreas[i] = document.createElement('div');
      lane.playAreas[i].classList.add("playarea", `playarea-${sideNames[i]}`);
      lane.towers[i].div.classList.add("tower", `tower-${sideNames[i]}`);
      lane.towers[i].div.textContent = sum(lane.towers[i].currentHealth);
      lane.div.appendChild(lane.playAreas[i])
      lane.div.appendChild(lane.towers[i].div)
      lane.playAreas[i].addEventListener('scroll', function () {
          lane.playAreas[1-i].scrollLeft = lane.playAreas[i].scrollLeft;
      });
      lane.stages[i] = document.createElement('div');
      lane.stages[i].classList.add("stage", `stage-${sideNames[i]}`, "display-none");
      lane.div.appendChild(lane.stages[i])
    }

  })
}


const startGamebtn = document.getElementById("start-game-btn");
startGamebtn.disabled = true;
let loading = true
setTimeout( function(){ startGamebtn.disabled = false;} , 500)
startGamebtn.addEventListener("click",function(){
  this.parentNode.removeChild(this)
  game.startGame()
})



export {game, board, cardData, posAvail};
