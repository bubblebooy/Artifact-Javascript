import {card , blank} from './card'
import loadJSON from './loadJSON'
import zoomNavController from './zoomNavController'
import passButtonController from './passButtonController'
import handController from './handController'
import shop from './shop'
import {deployment} from './deploy'
import infoDisplay from './infoDisplay'
import {sum, shuffle} from './arrayFunctions'
import {board} from './board'
import AI from './AI'

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
  let healthSpan = document.createElement('span');
  healthSpan.textContent = sum(currentHealth);
  let manaDiv = document.createElement('div');
  div.appendChild(manaDiv)
  div.appendChild(healthSpan)
  manaDiv.classList.add("mana")
  let currentArmor = [0];
  let ancient = false;
  let mana = [3,3];
  manaDiv.textContent = `${mana[0]} : ${mana[1]}`

  let restoreMana = () => {
    mana[0] = mana[1]
    tower.manaDiv.textContent = `${mana[0]} : ${mana[1]}`
  }

  const updateDisplay = () => {
    if (sum(tower.currentHealth) <= 0 ){
      game.score[1 - player] += 1;
      if (!ancient){
        ancient = !ancient;
        tower.currentHealth = [80];
        div.classList.add("ancient");
      };
    }
    healthSpan.textContent = sum(tower.currentHealth);
    // div.appendChild(manaDiv)
    tower.manaDiv.textContent = `${tower.mana[0]} : ${tower.mana[1]}`
  };

  setTimeout(function(){ board.lanes[player].div.addEventListener("endOfRound", function(){
    tower.mana[1]+=1
    tower.manaDiv.textContent = `${tower.mana[0]} : ${tower.mana[1]}`
    restoreMana()
  })},10)

  let tower = {currentHealth , div, Name, currentArmor, mana, manaDiv, updateDisplay}  // why did I do it this way?

  return tower
}

const player = (turn, name, heros, deck, computer = false) => {
  let player = {}
  setTimeout(function(){
    heros = heros.map(function(hero){
      return card(cardData.Cards.find(function(e){
        return e.Name == hero
      }),player)
    })
    heros[3].respawn = 1;
    heros[4].respawn = 2;
    // add sig cards to deck
    shuffle(deck);
  },300)
  player.turn = turn
  player.handDiv = ( turn ? document.getElementById("hand-top") : document.getElementById("hand-bottom") )
  player.hand = []
  player.draw = () => {
    let c = deck.shift()
    if (c != null){
      let newCard = card(cardData.Cards.find(function(e){
        return e.Name == c
      }),player)
      player.hand.push(newCard)
      player.handDiv.appendChild(newCard.div)
    }
  }
  player.getHeros = () => heros ;
  player.name = name
  player.computer = computer
  player.gold = 0;
  return player
}


const game = (() => {
  const div = document.getElementById('game');
  // const bottomPassButton = document.getElementById("pass-btn-bottom");
  // const topPassButton = document.getElementById("pass-btn-top");
  let deck = ["Mana Drain","Payday","Arcane Censure","Stars Align","Bellow","Rumusque Blessing","Defensive Bloom","Restoration Effort","Intimidation","Curse of Atrophy","Strafing Run","Lightning Strike","Rolling Storm","Tower Barrage","Foresight","Prey on the Weak","Remote Detonation","Thunderstorm","Bolt of Damocles","Poised to Strike","Defensive Stance","Enrage","God's Strength","Spring the Trap","Double Edge","Conflagration","Call the Reserves", "Better Late Than Never","Iron Branch Protection","Avernus' Blessing","Dimensional Portal","Bronze Legionnaire","Marrowfell Brawler","Ogre Conscript","Troll Soothsayer","Untested Grunt","Thunderhide Alpha"]
  deck = deck.concat(deck,deck)
  let players = [player(0,"Radiant",
                    ["Keefe the Bold","Fahrvhan the Dreamer","J\'Muy the Wise","Debbi the Cunning","Axe"],
                    deck.slice()),
                 player(1,"Dire",
                    ["Keefe the Bold","Fahrvhan the Dreamer","J\'Muy the Wise","Debbi the Cunning","Axe"],
                    deck,
                    true)];
  let turn = Math.random() < 0.5;
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
    game.players.forEach(function(player){
      for (var i = 0; i < 3; i++) {  // you draw 2 after each deployment making the starting hand 5
        player.draw()
      }
    })
    handController.initialize();
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
  let beforeTheActionPhaseEvent = new CustomEvent('beforeTheActionPhase', { detail: {lane: undefined, card: undefined, player: undefined} })

  function dispatchEvent(e){
    // console.log(e)
    let events = {
      "afterCombat": (lane) => {if (lane == currentLane){return afterCombatEvent}},
      "endOfRound": (lane) => {return endOfRoundEvent},
      "beforeTheActionPhase": (lane) => {if (lane == currentLane) return beforeTheActionPhaseEvent},
      "continuousRefresh": (lane ) => {return continuousRefreshEvent},
      "_continuousEffect": (lane) => {return continuousEffectEvent},
      "whenAttacking": (lane) => {if (lane == currentLane) return whenAttackingEvent}
    };
    board.lanes.forEach(function(lane, laneIndex){
      let evnt = events[e](laneIndex)
      if (evnt != null){
        evnt.detail.lane = laneIndex;
        lane.cards.forEach(function(row, cardIndex){
          evnt.detail.card = cardIndex;
          row.forEach(function(card,playerIndex){
            if (card.Name != null){
              evnt.detail.player = playerIndex;
              card.div.dispatchEvent(evnt);
              card.updateDisplay()
            }
          })
        })
        if (evnt != null){lane.div.dispatchEvent(evnt);}
        lane.improvements.forEach(function(side,playerIndex){
          evnt.detail.player = playerIndex;
          side.forEach(function(improvement, improvementIndex){
            evnt.detail.card = improvementIndex;
            improvement.div.dispatchEvent(evnt);
          })
        })
      }
    })
    if (e == "continuousRefresh"){dispatchEvent("_continuousEffect")}
    if (e == "endOfRound") {
      game.players.forEach(function(player,playerIndex){
        player.getHeros().forEach(function(hero){
          let evnt = events[e]()
          evnt.detail.player = playerIndex;
          if (hero.respawn >= 0) hero.div.dispatchEvent(evnt)
        })
      })
    }
  }

  function nextTurn(passed = false){
    turn = 1 - turn
    if (!passed) board.lanes[currentLane].passCount = 0;
    passButtonController.enable();
    handController.enable();
    board.lanes[currentLane].collapse(false)
    board.lanes[currentLane].expand()
    if (players[turn].computer ){ AI.actionPhase(players[turn]) }//setTimeout( AI.actionPhase , 300) }  // AI AUTO PASS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  }

  function nextLane(){
    board.lanes[currentLane].div.classList.remove("active")
    currentLane += 1
    if (currentLane > 2){
      passButtonController.hide()
      handController.hide();
      shop.show();
      dispatchEvent("endOfRound")
      currentLane = 0
      round += 1
    } else{
      nextTurn()
      dispatchEvent("beforeTheActionPhase")
    }
    board.lanes[currentLane].div.classList.add("active")
    zoomNavController.updateActive()
  };

  const pass = () => {
    board.lanes[currentLane].passCount += 1;
    if (board.lanes[currentLane].passCount > 1){
      combat()
      nextLane()
      // board.lanes[currentLane].passCount = 0;
    } else{
      nextTurn(true)
    }

  };

  const condemn = (unit, lane) => { //should this be a function of card?
    let index = lane.cards.flat().indexOf(unit);
    let empty = blank(board.lanes.indexOf(lane));
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



  return {div, getCurrentLane, startGame, getRound, score, gameOver, getTurn, nextTurn, pass, condemn, players, infoDisplayUpdate , dispatchEvent}
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
  // currentLane.cards.flat().forEach(function(unit){
  //   if (unit.currentHealth !=null && sum(unit.currentHealth) <= 0 ){
  //     condemn(unit, currentLane)
  //   }
  // })

  board.collapse(); //should this be currentLane.collapse?
  currentLane.towers[1].updateDisplay();
  currentLane.towers[0].updateDisplay();
  game.dispatchEvent("afterCombat")
  game.infoDisplayUpdate();
  if (game.gameOver()) {};
}


function buildLanes(){
  let laneNames=['left-lane','middle-lane','right-lane']
  let sideNames=['bottom','top']
  board.lanes.forEach(function(lane,j){
    lane.name = laneNames[j];
    lane.div.classList.add('lane',laneNames[j]);
    board.div.appendChild(lane.div);
    for (var i = 1; i >= 0; i--) {
      lane.playAreas[i] = document.createElement('div');
      lane.playAreas[i].classList.add("playarea", `playarea-${sideNames[i]}`);
      lane.towers[i] = tower(40,i);
      lane.towers[i].div.classList.add("tower", `tower-${sideNames[i]}`);
      lane.div.appendChild(lane.playAreas[i]);
      lane.div.appendChild(lane.towers[i].div);
      lane.stages[i] = document.createElement('div');
      lane.stages[i].classList.add("stage", `stage-${sideNames[i]}`, "display-none");
      lane.div.appendChild(lane.stages[i])
    }
    lane.playAreas[1].addEventListener('scroll', function () {
        lane.playAreas[0].scrollLeft = lane.playAreas[1].scrollLeft;
    });
    lane.playAreas[0].addEventListener('scroll', function () {
        lane.playAreas[1].scrollLeft = lane.playAreas[0].scrollLeft;
    });
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



export {game, cardData, posAvail};
