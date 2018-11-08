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
import {AI} from './AI'

let cardData = "not loaded yet";
loadJSON(function(response){
  cardData = JSON.parse(response).Sets[0];
});

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
  // setTimeout(function(){
    heros = heros.map(function(hero){
      return card(cardData.Cards.find(function(e){
        return e.Name == hero
      }),player)
    })
    heros[3].respawn = 1;
    heros[4].respawn = 2;
    // add sig cards to deck
    shuffle(deck);
  // },0)
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
  let players = [0,1]

  let turn = Math.random() < 0.5;
  let round = 0;
  let currentLane = 0;
  let score = [0,0];
  let extraDeploy = [[[],[],[]],[[],[],[]]]
  let _infoDisplay;

  const getCurrentLane = () => currentLane ;
  const getRound = () => round ;
  const getTurn = () => turn ;
  const infoDisplayUpdate = () => {_infoDisplay.updateDisplay()} ;
  // const getPlayers = () => players ;

  const startGame = () => {
    console.log("Game Started")
    players[0] = player(0,"Radiant",
                      heroes,
                      deck)
    players[1] = player(1,"Dire",
                      AIheros,
                      AIdeck,
                      true);
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
      alert("Tie Game");
    }else if ( score[0] >= 2){
      alert(`${players[0].name} Wins`);
    }else if ( score[1] >= 2){
      alert(`DEFErunT : ${players[1].name} Wins`);
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
  let afterUnitDiesEvent = new CustomEvent('afterUnitDies', { detail: {lane: undefined, card: undefined, player: undefined, triggerLane: undefined, triggerCard: undefined, triggerPlayer: undefined} })

  function dispatchEvent(e,triggerLane,triggerCard,triggerPlayer){
    //triggerLane = null, triggerCard = null, triggerPlayer= null
    // "triggerLane": triggerLane, "triggerCard": triggerCard, "triggerPlayer": triggerPlayer
    let events = {
      "afterCombat": (lane) => {if (lane == currentLane){return afterCombatEvent}},
      "endOfRound": (lane) => {return endOfRoundEvent},
      "beforeTheActionPhase": (lane) => {if (lane == currentLane) return beforeTheActionPhaseEvent},
      "continuousRefresh": (lane ) => {return continuousRefreshEvent},
      "_continuousEffect": (lane) => {return continuousEffectEvent},
      "whenAttacking": (lane) => {if (lane == currentLane) return whenAttackingEvent},
      "afterUnitDies": (lane) => {if (lane == currentLane) return afterUnitDiesEvent}
    };
    board.lanes.forEach(function(lane, laneIndex){
      let evnt = events[e](laneIndex)
      if (evnt != null){
        if (triggerCard) { Object.assign(evnt.detail, {"triggerLane": triggerLane, "triggerCard": triggerCard, "triggerPlayer": triggerPlayer}) }
        evnt.detail.lane = laneIndex;
        lane.cards.forEach(function(row, cardIndex){
          evnt.detail.card = cardIndex;
          row.forEach(function(card,playerIndex){
            if (card.Name != null){
              evnt.detail.player = playerIndex;
              card.div.dispatchEvent(evnt);
              if (card.CardType == "Hero"){
                if (card.Accessory) {card.Accessory.div.dispatchEvent(evnt); card.Accessory.updateDisplay();}
                if (card.Armor) {card.Armor.div.dispatchEvent(evnt); card.Armor.updateDisplay();}
                if (card.Weapon) {card.Weapon.div.dispatchEvent(evnt); card.Weapon.updateDisplay();}
              }
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
            improvement.updateDisplay()
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
          evnt.detail.lane = null
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
    if (players[turn].computer ){ setTimeout( function(){ AI.actionPhase(players[turn]) } , 300) }//setTimeout( AI.actionPhase , 300) }  // AI AUTO PASS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  }

  function nextLane(){
    board.lanes[currentLane].div.classList.remove("active")
    currentLane += 1
    if (currentLane > 2){
      passButtonController.hide()
      handController.hide();
      shop.show();
      if (players[0].computer ){ AI.shop(0) }
      if (players[1].computer ){ AI.shop(1) }
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
    dispatchEvent("afterUnitDies",board.lanes.indexOf(lane),Math.floor(index / 2),index % 2)
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



  return {div, getCurrentLane, startGame, getRound, score, gameOver, getTurn, nextTurn, pass, condemn, players,extraDeploy, infoDisplayUpdate , dispatchEvent}
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

function battle( attackerLane, attackerPlayer, attackerIndex, targetLane, targetPlayer, targetIndex , dispatchAttackingEvent = true, bidirectional = true){
  let attacker = board.lanes[attackerLane].cards[attackerIndex][attackerPlayer]
  let target = board.lanes[targetLane].cards[targetIndex][targetPlayer]
  if (dispatchAttackingEvent) {
    let evnt = new CustomEvent('whenAttacking', { detail: {lane: attackerLane, card: attackerIndex, player: attackerPlayer} })
    attacker.div.dispatchEvent(evnt); attacker.updateDisplay();
    if (attacker.CardType == "Hero"){
      if (attacker.Accessory) {attacker.Accessory.div.dispatchEvent(evnt); attacker.Accessory.updateDisplay();}
      if (attacker.Armor) {attacker.Armor.div.dispatchEvent(evnt); attacker.Armor.updateDisplay();}
      if (attacker.Weapon) {attacker.Weapon.div.dispatchEvent(evnt); attacker.Weapon.updateDisplay();}
    }
    evnt.detail.lane = targetLane; evnt.detail.card = targetIndex; evnt.detail.player = targetPlayer;
    target.div.dispatchEvent(evnt); target.updateDisplay();
    if (target.CardType == "Hero"){
      if (target.Accessory) {target.Accessory.div.dispatchEvent(evnt); target.Accessory.updateDisplay();}
      if (target.Armor) {target.Armor.div.dispatchEvent(evnt); target.Armor.updateDisplay();}
      if (target.Weapon) {target.Weapon.div.dispatchEvent(evnt); target.Weapon.updateDisplay();}
    }
  }
  if (!attacker.disarmed){
    if(sum(target.retaliate)>0){attacker.currentHealth[0] -= sum(target.retaliate) - sum(attacker.currentArmor)}
    target.currentHealth[0] -= sum(attacker.currentAttack) - sum(target.currentArmor)
  }
  game.infoDisplayUpdate();

  if (bidirectional) battle(targetLane, targetPlayer, targetIndex, attackerLane, attackerPlayer, attackerIndex, false, false)
}

function combat(){

  let currentLane = board.lanes[game.getCurrentLane()]
  game.dispatchEvent("whenAttacking")
  currentLane.cards.forEach(function(row, rowIndex){
    row.forEach(function(attacker, attackerIndex){
      if (attacker.Name == null){ return; };
      if (!attacker.disarmed){
        let target = currentLane.cards[rowIndex + attacker.arrow][1 - attackerIndex] // cause arror if pointing to null (not blank), this shoud not happen anyways
        if (target == null || target.Name == null ){
          target = currentLane.towers[1-attackerIndex] ;
        }else{
          if(sum(target.retaliate)>0){attacker.currentHealth[0] -= sum(target.retaliate) - sum(attacker.currentArmor)}
          if(sum(attacker.siege)>0){currentLane.towers[1-attackerIndex].currentHealth[0] -= sum(attacker.siege)}
          if(sum(attacker.cleave)>0){
            for (var s = -1; s < 2; s+=2) {
              let $target = currentLane.cards[rowIndex + attacker.arrow + s]
              if ($target != null){
                $target = currentLane.cards[rowIndex + attacker.arrow + s][1 - attackerIndex]
                if ($target != null && $target.Name != null ){
                  $target.currentHealth[0] -= sum(attacker.cleave) - sum($target.currentArmor)
                }
              }
            }
          }
        }
        target.currentHealth[0] -= sum(attacker.currentAttack) - sum(target.currentArmor)
      }
    });
    row.forEach(function(attacker, attackerIndex){
      if (attacker.Name == null){ return };
      if(sum(attacker.regen)>0){attacker.currentHealth[0] += sum(attacker.regen)}
      if(attacker.currentHealth[0] > attacker.Health) {attacker.currentHealth[0] = attacker.Health}
    })
  });

  board.collapse(); //should this be currentLane.collapse?
  currentLane.towers[1].updateDisplay();
  currentLane.towers[0].updateDisplay();
  game.dispatchEvent("afterCombat")
  game.infoDisplayUpdate();
  if (game.gameOver()) {};  // does this do anything??
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

const allcards = ["Assassin's Shadow","Pit Fighter of Quoidge","Viscous Nasal Goo","Ogre Corpse Tosser","Murder Plot","Collateral Damage","Combat Training","Pick a Fight","Trebuchets","Unsupervised Artillery","Homefield Advantage","Iron Fog Goldmine","Assured Destruction","Escape Route","Howling Mind","Grand Melee","Assassinate","Echo Slam","Winter's Curse","Battlefield Control","Gust","Act of Defiance","Frostbite","Gank","Duel","Berserker's Call","Prowler Vanguard","Coup de Grace","Mystic Flare","Sow Venom","Barracks","Eclipse","Savage Wolf","Fighting Instinct","Thunderhide Pack","Emissary of the Quorum","New Orders","Ion Shell","Time of Triumph","Forward Charge","Altar of the Mad Moon","New Orders","Sister of the Veil","Rebel Decoy","Steam Cannon","Keenfolk Turret","Assassin's Apprentice","Grazing Shot","No Accident","Slay","Pick Off","Selfish Cleric","Revtel Convoy","Ravenous Mass","Rampaging Hellbear","Satyr Duelist","Savage Wolf","Satyr Magician","Disciple of Nevermore","Legion Standard Bearer","Mercenary Exiles","Verdant Refuge","Mist of Avernus","Ignite","Assault Ladders","Mana Drain","Payday","Arcane Censure","Stars Align","Bellow","Rumusque Blessing","Defensive Bloom","Restoration Effort","Intimidation","Curse of Atrophy","Strafing Run","Lightning Strike","Rolling Storm","Tower Barrage","Foresight","Prey on the Weak","Remote Detonation","Thunderstorm","Bolt of Damocles","Poised to Strike","Defensive Stance","Enrage","God's Strength","Spring the Trap","Double Edge","Conflagration","Call the Reserves", "Better Late Than Never","Iron Branch Protection","Avernus' Blessing","Dimensional Portal","Bronze Legionnaire","Marrowfell Brawler","Ogre Conscript","Troll Soothsayer","Untested Grunt","Thunderhide Alpha"]
let deck
let AIdeck = ["Assassin's Shadow","Pit Fighter of Quoidge","Viscous Nasal Goo","Ogre Corpse Tosser","Collateral Damage","Combat Training","Trebuchets","Homefield Advantage","Iron Fog Goldmine","Payday","Assured Destruction","Howling Mind","Assassinate","Echo Slam","Winter's Curse","Gust","Act of Defiance","Frostbite","Berserker's Call","Prowler Vanguard","Coup de Grace","Mystic Flare","Sow Venom","Barracks","Thunderhide Pack","Altar of the Mad Moon","Time of Triumph","Forward Charge","Ion Shell","Sister of the Veil","Rebel Decoy","Assassin's Apprentice","Grazing Shot","No Accident","Slay","Pick Off","Selfish Cleric","Revtel Convoy","Ravenous Mass","Rampaging Hellbear","Satyr Duelist","Savage Wolf","Satyr Magician","Disciple of Nevermore","Legion Standard Bearer","Mercenary Exiles","Verdant Refuge","Mist of Avernus","Ignite","Assault Ladders","Mana Drain","Arcane Censure","Stars Align","Bellow","Rumusque Blessing","Defensive Bloom","Restoration Effort","Intimidation","Curse of Atrophy","Strafing Run","Lightning Strike","Rolling Storm","Tower Barrage","Foresight","Prey on the Weak","Remote Detonation","Thunderstorm","Bolt of Damocles","Poised to Strike","Defensive Stance","Enrage","God's Strength","Spring the Trap","Double Edge","Conflagration","Call the Reserves", "Better Late Than Never","Iron Branch Protection","Avernus' Blessing","Dimensional Portal","Bronze Legionnaire","Marrowfell Brawler","Ogre Conscript","Troll Soothsayer","Untested Grunt","Thunderhide Alpha"]
let AIheros = ["Bristleback","J\'Muy the Wise","Legion Commander","Lycan","Centaur Warrunner","Drow Ranger","Sorla Khan","Phantom Assassin","Bounty Hunter","Venomancer","Prellex","Sven","Luna","Treant Protector","Enchantress","Debbi the Cunning","Keefe the Bold","Fahrvhan the Dreamer","Axe"] // "Beastmaster"
AIheros = shuffle(AIheros).slice(0,5)

let allheroes = ["Legion Commander","Lycan","Winter Wyvern","Skywrath Mage","Centaur Warrunner","Bristleback","Earthshaker","Omniknight","Drow Ranger","Sorla Khan","Phantom Assassin","Lion","Lich","Bounty Hunter","Venomancer","Prellex","Pugna","Sven","Luna","Treant Protector","Enchantress","Debbi the Cunning","Keefe the Bold","Sniper","Fahrvhan the Dreamer","J\'Muy the Wise","Axe"] // "Beastmaster"
let heroes

let secretShopDeck = ["Rumusque Vestments","Wingfall Hammer","Blink Dagger","Broadsword","Claymore","Chainmail","Fur-lined Mantle","Hero's Cape","Platemail","Barbed Mail","Demagicking Maul","Stonehall Plate","Stonehall Cloak","Leather Armor","Short Sword","Traveler's Cloak","Blade of the Vigil","Keenfolk Musket","Red Mist Maul","Shield of Basilius","Horn of the Alpha","Phase Boots","Ring of Tarrasque"]
let itemDeck

const startGamebtn = document.getElementById("start-game-btn");
const deckTextarea = document.getElementById("deck-textarea");
const itemTextarea = document.getElementById("item-textarea");
const heroTextarea = document.getElementById("heroes-textarea");
const deckBtn = document.getElementById("deck-game-btn");
const itemBtn = document.getElementById("item-game-btn");
const heroBtn = document.getElementById("heroes-game-btn");
const startScreen = document.getElementById("start-screen");
const deckOptions = document.getElementById("deck-options")
const itemOptions = document.getElementById("item-options")
const heroesOptions = document.getElementById("heroes-options")
const deckResetBtn = document.getElementById("deck-reset-btn")
const deck3of = document.getElementById("deck-3of")
const itemResetBtn = document.getElementById("item-reset-btn")
const heroesResetBtn = document.getElementById("heroes-reset-btn")

const refreshBtn = document.getElementById("refresh-btn")

deckBtn.title = "If card is not vaild or implemented it will be ignored"
heroBtn.title = "Uses the 1st 5 heroes"

deckTextarea.value = localStorage.getItem("deck")
deckTextarea.value = deckTextarea.value || allcards;
deckTextarea.placeholder = "  If empty all cards will be added to your deck."
deck3of.checked = (localStorage.getItem("3of") == null ? true : localStorage.getItem("3of") == "true")

heroTextarea.value = localStorage.getItem("heroes")
heroTextarea.value = heroTextarea.value || allheroes;
deckTextarea.title = "adds 3 of each listed card"
heroTextarea.placeholder = "  If empty your heroes will be Legion Commander, Lycan, Winter Wyvern, Skywrath Mage, Centaur Warrunner"

itemTextarea.value = localStorage.getItem("item")
itemTextarea.value = itemTextarea.value || secretShopDeck;
itemTextarea.placeholder = "  If empty all items will be added to your item deck."

startGamebtn.disabled = true;
let loading = true
setTimeout( function(){ startGamebtn.disabled = false;} , 500)
startGamebtn.addEventListener("click",function(){
  AIdeck = AIdeck.filter(function(card){
    let color =cardData.Cards.find( function(ev){  return ev.Name == card }).Color
    return AIheros.map(function(hero){ return cardData.Cards.find( function(ev){  return ev.Name == hero }).Color}).includes(color)
  })
  heroes = heroTextarea.value.split(",")
  heroes = heroes.map(function(card){return card.trim()})
  heroes = heroes.filter(function(card){return allheroes.includes(card)})
  if (heroes.length < 5) heroes = allheroes
  localStorage.setItem("heroes", heroes)
  if (heroes.length > 5) heroes = heroes.slice(0,5)
  deck = deckTextarea.value.split(",")
  deck = deck.map(function(card){return card.trim()})
  deck = deck.filter(function(card){return allcards.includes(card)})
  deck = deck.filter(function(card){
    let color =cardData.Cards.find( function(ev){  return ev.Name == card }).Color
    return heroes.map(function(hero){ return cardData.Cards.find( function(ev){  return ev.Name == hero }).Color}).includes(color)
  })
  if (!deck.length) {
    deck = allcards
    deck = deck.filter(function(card){
      let color =cardData.Cards.find( function(ev){  return ev.Name == card }).Color
      return heroes.map(function(hero){ return cardData.Cards.find( function(ev){  return ev.Name == hero }).Color}).includes(color)
    })
  }
  localStorage.setItem("deck", deck)
  localStorage.setItem("3of", deck3of.checked)
  if (deck3of.checked) deck = deck.concat(deck,deck) ;
  itemDeck = itemTextarea.value.split(",")
  itemDeck = itemDeck.map(function(card){return card.trim()})
  itemDeck = itemDeck.filter(function(card){return secretShopDeck.includes(card)})
  if (itemDeck.length < 9) itemDeck = secretShopDeck
  localStorage.setItem("item", itemDeck)

  AIdeck = AIdeck.concat(AIdeck,AIdeck)
  startScreen.parentNode.removeChild(startScreen)
  refreshBtn.disabled = false
  game.startGame()
})
deckBtn.addEventListener("click", function(){
  deckTextarea.classList.toggle('display-none')
  itemTextarea.classList.add('display-none')
  heroTextarea.classList.add('display-none')
  deckOptions.classList.toggle('display-none')
  itemOptions.classList.add('display-none')
  heroesOptions.classList.add('display-none')
})
itemBtn.addEventListener("click", function(){
  itemTextarea.classList.toggle('display-none')
  deckTextarea.classList.add('display-none')
  heroTextarea.classList.add('display-none')
  itemOptions.classList.toggle('display-none')
  heroesOptions.classList.add('display-none')
  deckOptions.classList.add('display-none')
})
heroBtn.addEventListener("click", function(){
  heroTextarea.classList.toggle('display-none')
  deckTextarea.classList.add('display-none')
  itemTextarea.classList.add('display-none')
  heroesOptions.classList.toggle('display-none')
  deckOptions.classList.add('display-none')
  itemOptions.classList.add('display-none')
})
deckResetBtn.addEventListener("click", function(){
  deckTextarea.value = allcards;
})
itemResetBtn.addEventListener("click", function(){
  itemTextarea.value = secretShopDeck;
})
heroesResetBtn.addEventListener("click", function(){
  heroTextarea.value = allheroes;
})

refreshBtn.title = "Makes sure everything is updated and you have at least one space to play a creep"
refreshBtn.addEventListener("click", function(){
  board.collapse()
  board.lanes[game.getCurrentLane()].expand()
  game.dispatchEvent("continuousRefresh")
})


export {game, cardData, posAvail, battle, itemDeck, secretShopDeck};
