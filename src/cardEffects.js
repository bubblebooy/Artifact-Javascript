import {game , cardData, posAvail , battle} from './index.js'
import {board} from './board'
import {card , blank, draggedCard} from './card'
import {sum, shuffle} from './arrayFunctions'
import {targetUnitsAvail,targetHerossAvail,targetCreepsAvail} from './AI'


let effectMap = new Map()  // should i just be uisng an object instead? does it really matter?
let targetMap = new Map()

function doubleTarget(card, target, callback, conditional = () => true ){
  card.div.classList.add("glow")
  game.div.classList.add("target")
  game.div.addEventListener("click",function f(ev){
    ev.stopPropagation()
    let path = ev.path || (ev.composedPath && ev.composedPath());
    if (!path) {console.log("no path")}
    vaild: {
      if (card != draggedCard) break vaild
      let lane = path.find(function(p){if (p.classList) return p.classList.contains('lane')}); if (lane == undefined) break vaild;
      lane = board.lanes.find(function(p){return p.div == lane})
      let player
      if (target == "card" || target == "empty"){
        player = path.find(function(p){if (p.classList) return p.classList.contains('playarea')}); if (player == undefined) break vaild;
        player = lane.playAreas.findIndex(function(p){return p == player})
      } else if (target == "tower"){
        player = path.find(function(p){if (p.classList) return p.classList.contains('tower')}); if (player == undefined) break vaild;
        player = lane.towers.findIndex(function(p){return p.div == player})
      }
      if (target == "card"){
        target = path.find(function(p){if (p.classList) return p.classList.contains('card')}); if (target == undefined) break vaild;
        target = lane.cards.findIndex(function(p){return p[player].div == target})
      }else if (target == "empty"){
        target = path.find(function(p){if (p.classList) return p.classList.contains('blank')}); if (target == undefined) break vaild;
        target = lane.cards.findIndex(function(p){return p[player].div == target})
      }else if (target == "tower"){target = player}
      if (conditional(lane,player,target)){
        callback(lane,player,target)
        board.lanes[game.getCurrentLane()].towers[game.getTurn()].mana[0] -= card.ManaCost
        board.lanes[game.getCurrentLane()].towers[game.getTurn()].updateDisplay()
        game.players[game.getTurn()].hand.splice(game.players[game.getTurn()].hand.indexOf(draggedCard),1)
        draggedCard.div.parentNode.removeChild(draggedCard.div)
        game.nextTurn()
      }
    }
    card.div.classList.remove("glow")
    game.div.classList.remove("target")
    game.div.removeEventListener("click",f,true)
  },true)
}


// Targets : lane, unit, improvement


targetMap.set("Dimensional Portal" , "lane")
effectMap.set("Dimensional Portal" , function(ev, lane){
  let summons = [[],[]]
  lane = board.lanes[lane]
  for (let i = 0; i < 3; i++){
    let creep = card(cardData.Cards.find( function(ev){  return ev.Name == "Melee Creep" }),game.players[game.getTurn()])
    summons[game.getTurn()].push(creep);
  }
  lane.summon(summons)
  return true
});

targetMap.set("Better Late Than Never" , "lane")
effectMap.set("Better Late Than Never" , function(ev, lane){
  let summons = [[],[]]
  lane = board.lanes[lane]
  for (let i = 0; i < 1; i++){
    let creep = card(cardData.Cards.find( function(ev){  return ev.Name == "Melee Creep" }),game.players[game.getTurn()])
    summons[game.getTurn()].push(creep);
  }
  lane.summon(summons)
  return true
});

targetMap.set("Call the Reserves" , "lane")
effectMap.set("Call the Reserves" , function(ev, lane){
  let summons = [[],[]]
  lane = board.lanes[lane]
  for (let i = 0; i < 2; i++){
    let creep = card(cardData.Cards.find( function(ev){  return ev.Name == "Melee Creep" }),game.players[game.getTurn()])
    summons[game.getTurn()].push(creep);
  }
  lane.summon(summons)
  return true
});


targetMap.set("Iron Branch Protection" , "unit")
effectMap.set("Iron Branch Protection" , function(ev, lane, player, index){
  board.lanes[lane].cards[index][player].currentArmor[5] += 3;
  board.lanes[lane].cards[index][player].updateDisplay()
  return true
});

targetMap.set("Avernus' Blessing" , "unit")
effectMap.set("Avernus' Blessing" , function(ev, lane, player, index){
  board.lanes[lane].cards[index][player].currentAttack[1 + (1 - player == game.getTurn())] += 2;
  board.lanes[lane].cards[index][player].updateDisplay()
  return true
});

targetMap.set("Double Edge" , "unit")
effectMap.set("Double Edge" , function(ev, lane, player, index){
  if (board.lanes[lane].cards[index][player].Color != "Red" || board.lanes[lane].cards[index][player].CardType != "Hero") return false
  board.lanes[lane].cards[index][player].currentArmor[3] -= 8;
  board.lanes[lane].cards[index][player].currentAttack[3] += 8;
  board.lanes[lane].cards[index][player].updateDisplay()
  return true
});

targetMap.set("Poised to Strike" , "unit")
effectMap.set("Poised to Strike" , function(ev, lane, player, index){
  if (board.lanes[lane].cards[index][player].Color != "Red" || board.lanes[lane].cards[index][player].CardType != "Hero") return false
  board.lanes[lane].cards[index][player].currentAttack[3] += 4;
  board.lanes[lane].cards[index][player].updateDisplay()
  return true
});

targetMap.set("Defensive Stance" , "unit")
effectMap.set("Defensive Stance" , function(ev, lane, player, index){
  if (board.lanes[lane].cards[index][player].CardType != "Hero") return false
  board.lanes[lane].cards[index][player].currentArmor[5] += 3;
  board.lanes[lane].cards[index][player].updateDisplay()
  return true
});

targetMap.set("Combat Training" , "unit")
effectMap.set("Combat Training" , function(ev, lane, player, index){
  if (board.lanes[lane].cards[index][player].CardType != "Hero") return false
  board.lanes[lane].cards[index][player].currentAttack[1 + (1 - player == game.getTurn())] += 2;
  board.lanes[lane].cards[index][player].updateDisplay()
  return true
});

targetMap.set("Collateral Damage" , "unit")
effectMap.set("Collateral Damage" , function(ev, lane, player, index){
  if (board.lanes[lane].cards[index][player].CardType != "Hero" || board.lanes[lane].cards[index][player].Color != "Black" ) return false
  board.lanes[lane].cards[index][player].siege[1 + (1 - player == game.getTurn())] += 3;
  board.lanes[lane].cards[index][player].updateDisplay()
  return true
});

targetMap.set("Enrage" , "unit")
effectMap.set("Enrage" , function(ev, lane, player, index){
  if (board.lanes[lane].cards[index][player].Color != "Red" || board.lanes[lane].cards[index][player].CardType != "Hero") return false
  board.lanes[lane].cards[index][player].currentArmor[3] += 4;
  board.lanes[lane].cards[index][player].currentAttack[3] += 4;
  board.lanes[lane].cards[index][player].updateDisplay()
  return true
});

targetMap.set("God's Strength" , "unit")
effectMap.set("God's Strength" , function(ev, lane, player, index){
  if (board.lanes[lane].cards[index][player].Color != "Red" || board.lanes[lane].cards[index][player].CardType != "Hero") return false
  board.lanes[lane].cards[index][player].currentAttack[1 + (1 - player == game.getTurn())] += 4;
  board.lanes[lane].cards[index][player].updateDisplay()
  return true
});

targetMap.set("Spring the Trap" , "lane")
effectMap.set("Spring the Trap" , function(ev, lane){
  let summons = [[],[]]
  lane = board.lanes[lane]
  for (let i = 0; i < 2; i++){
    let creep =  card(cardData.Cards.find(function(e){  return e.Name == "Centaur Hunter"  }),game.players[game.getTurn()])
    summons[game.getTurn()].push(creep);
  }
  lane.summon(summons)
  return true
});


targetMap.set("Strafing Run" , "lane")
effectMap.set("Strafing Run" , function(ev, lane){
  let l = board.lanes[lane]
  let player = game.getTurn()
  l.cards.forEach(function(card){
    if (card[1-player].Name != null && card[1-player].CardType == "Creep") {
      card[1-player].currentHealth[0] -= 2 - sum(card[1-player].currentArmor)
    }
  })
  l.collapse()
  return true
});

targetMap.set("Lightning Strike" , "lane")
effectMap.set("Lightning Strike" , function(ev, lane){
  let l = board.lanes[lane]
  let player = game.getTurn()
  l.towers[1-player].currentHealth[0] -= 6 - sum(l.towers[1-player].currentArmor)
  l.towers[1-player].updateDisplay()
  return true
});

targetMap.set("Rolling Storm" , "lane")
effectMap.set("Rolling Storm" , function(ev, lane){
  let player = game.getTurn()
  board.lanes.forEach(function(l){
    l.towers[player].currentHealth[0] -= 2 - sum(l.towers[player].currentArmor)
    l.towers[player].updateDisplay()
    l.towers[1-player].currentHealth[0] -= 2 - sum(l.towers[1-player].currentArmor)
    l.towers[1-player].updateDisplay()
  })
  return true
});

targetMap.set("Tower Barrage" , "lane")
effectMap.set("Tower Barrage" , function(ev, lane){
  let l = board.lanes[lane]
  let player = game.getTurn()
  l.cards.forEach(function(card){
    if (card[1-player].Name != null) {
      card[1-player].currentHealth[0] -= 2 - sum(card[1-player].currentArmor)
    }
  })
  l.collapse()
  return true
});

targetMap.set("Foresight" , "lane")
effectMap.set("Foresight" , function(ev, lane){
  let player = game.players[game.getTurn()]
  player.draw();player.draw()
  return true
});

targetMap.set("Prey on the Weak" , "lane")
effectMap.set("Prey on the Weak" , function(ev, lane){
  let l = board.lanes[lane]
  let summons = [[],[]]
  let player = game.getTurn()
  l.cards.forEach(function(cd){
    if (cd[1-player].Name != null && (cd[1-player].currentHealth[0] < cd[1-player].Health)) {
      let creep =  card(cardData.Cards.find(function(fd){  return fd.Name == "Hound of War"  }),game.players[game.getTurn()]);
      summons[game.getTurn()].push(creep);
    }
    if (cd[player].Name != null && (cd[player].currentHealth[0] < cd[player].Health)) {
      let creep =  card(cardData.Cards.find(function(fd){  return fd.Name == "Hound of War"  }),game.players[game.getTurn()]);
      summons[game.getTurn()].push(creep);
    }
  })
  l.summon(summons)
  return true
});

targetMap.set("Remote Detonation" , "lane")
effectMap.set("Remote Detonation" , function(ev, lane){
  let l = board.lanes[lane]
  let player = game.getTurn()
  l.cards.forEach(function(card){
    if (card[1-player].Name != null && card[player].Name == null) {
      card[1-player].currentHealth[0] -= 5 - sum(card[1-player].currentArmor)
    }
  })
  l.collapse()
  return true
});

targetMap.set("Thunderstorm" , "lane")
effectMap.set("Thunderstorm" , function(ev, lane){
  let l = board.lanes[lane]
  let player = game.getTurn()
  l.cards.forEach(function(card){
    if (card[1-player].Name != null) {
      card[1-player].currentHealth[0] -= 4 - sum(card[1-player].currentArmor)
    }
  })
  l.collapse()
  return true
});

targetMap.set("Bolt of Damocles" , "lane")
effectMap.set("Bolt of Damocles" , function(ev, lane){
  let l = board.lanes[lane]
  let player = game.getTurn()
  l.towers[1-player].currentHealth[0] -= 20 - sum(l.towers[1-player].currentArmor)
  l.towers[1-player].updateDisplay()
  return true
});

targetMap.set("Stars Align" , "lane")
effectMap.set("Stars Align" , function(ev, lane){
  let l = board.lanes[lane]
  let player = game.getTurn()
  l.towers[player].mana[0] += 3
  l.towers[player].updateDisplay()
  return true
});

targetMap.set("Bellow" , "unit")
effectMap.set("Bellow" , function(ev, lane, player, index){
  let summons = [[],[]]
  if (board.lanes[lane].cards[index][player].CardType != "Creep") return false
  let creep = board.lanes[lane].cards[index][player]
  let empty = blank(lane)//,board.lanes[lane].playAreas[player],index)
  board.lanes[lane].cards[index][player] = empty
  creep.div.parentNode.replaceChild(empty.div , creep.div);
  summons[player].push(creep)
  let l = board.lanes[(lane + Math.ceil(Math.random()*2))%3]
  l.summon(summons)
  return true
});

targetMap.set("Rumusque Blessing" , "lane")
effectMap.set("Rumusque Blessing" , function(ev, lane){
  let l = board.lanes[lane]
  let player = game.getTurn()
  l.cards.forEach(function(card){
    if (card[player].Name != null) {
      card[player].currentHealth[1] += 3;
      card[player].updateDisplay()
    }
  })
  return true
});

targetMap.set("Defensive Bloom" , "lane")
effectMap.set("Defensive Bloom" , function(ev, lane){
  let summons = [[],[]]
  lane = board.lanes[lane]
  for (let i = 0; i < 2; i++){
    let creep =  card(cardData.Cards.find(function(e){  return e.Name == "Roseleaf Wall"  }),game.players[game.getTurn()])
    summons[game.getTurn()].push(creep);
  }
  lane.summon(summons)
  return true
});

targetMap.set("Restoration Effort" , "lane")
effectMap.set("Restoration Effort" , function(ev, lane){
  let l = board.lanes[lane]
  let player = game.getTurn()
  l.towers[player].currentHealth[0] += 8
  if (l.towers[player].currentHealth[0] > 40 ) l.towers[player].currentHealth[0] = 40
  l.towers[player].updateDisplay()
  return true
});

targetMap.set("Intimidation" , "unit")
effectMap.set("Intimidation" , function(ev, lane, player, index){
  let summons = [[],[]]
  let creep = board.lanes[lane].cards[index][player]
  let empty = blank(lane)//,board.lanes[lane].playAreas[player],index)
  board.lanes[lane].cards[index][player] = empty
  creep.div.parentNode.replaceChild(empty.div , creep.div);
  summons[player].push(creep)
  let l = board.lanes[(lane + Math.ceil(Math.random()*2))%3]
  l.summon(summons)
  return true
});

targetMap.set("Curse of Atrophy" , "lane")
effectMap.set("Curse of Atrophy" , function(ev, lane){
  let l = board.lanes[lane]
  let player = game.getTurn()
  l.cards.forEach(function(card){
    if (card[1-player].Name != null && card[1-player].CardType == "Hero") {
      card[1-player].currentAttack[2] -= 2;
      card[1-player].updateDisplay()
    }
  })
  return true
});

targetMap.set("Grazing Shot" , "unit")
effectMap.set("Grazing Shot" , function(ev, lane, player, index){
  let l = board.lanes[lane]
  l.cards[index][player].currentHealth[0] -= 2 - sum(l.cards[index][player].currentArmor)
  l.collapse()
  return true
});

targetMap.set("Mana Drain" , "lane")
effectMap.set("Mana Drain" , function(ev, lane){
  let l = board.lanes[lane]
  let player = game.getTurn()
  l.towers[player].mana[0] += 2
  l.towers[player].updateDisplay()
  l.towers[1-player].mana[0] -= 2
  l.towers[1-player].updateDisplay()
  return true
});

targetMap.set("No Accident" , "unit")
effectMap.set("No Accident" , function(ev, lane, player, index){
  let l = board.lanes[lane]
  l.cards[index][player].currentHealth[0] -= 3 - sum(l.cards[index][player].currentArmor)
  l.collapse()
  return true
});

targetMap.set("Payday" , "lane")
effectMap.set("Payday" , function(ev, lane){
  game.players[game.getTurn()].gold *= 2;
  game.infoDisplayUpdate();
  return true
});

targetMap.set("Slay" , "unit")
effectMap.set("Slay" , function(ev, lane, player, index){
  let l = board.lanes[lane]
  if (l.cards[index][player].CardType != "Creep") return false
  game.condemn(l.cards[index][player],board.lanes[lane])
  game.infoDisplayUpdate();
  l.collapse()
  return true
});

targetMap.set("Arcane Censure" , "lane")
effectMap.set("Arcane Censure" , function(ev, lane){
  let l = board.lanes[lane]
  let player = game.getTurn()
  l.towers[1-player].mana[1] -= 1
  l.towers[1-player].mana[0] -= 1
  l.towers[1-player].updateDisplay()
  return true
});

targetMap.set("Pick Off" , "unit")
effectMap.set("Pick Off" , function(ev, lane, player, index){
  let l = board.lanes[lane]
  l.cards[index][player].currentHealth[0] -= 4 - sum(l.cards[index][player].currentArmor)
  l.collapse()
  return true
});

targetMap.set("Assassinate" , "unit")
effectMap.set("Assassinate" , function(ev, lane, player, index){
  let l = board.lanes[lane]
  l.cards[index][player].currentHealth[0] -= 10 - (sum(l.cards[index][player].currentArmor) < 0 ? sum(l.cards[index][player].currentArmor) : 0)
  l.collapse()
  return true
});

targetMap.set("New Orders" , "unit")
effectMap.set("New Orders" , function(ev, lane, player, index){
  let l = board.lanes[lane]
  let card = l.cards[index][player]
  if (player != game.getTurn()) return false
  doubleTarget(draggedCard, "card", function($lane,$player,$targetCard){
    card.arrow = $targetCard - index
    card.updateDisplay()
  }, function($lane,$player,$targetCard){
    return ( $lane == l && game.players[player] != $player && Math.abs($targetCard - index) <= 1)
  })
  return false
});

targetMap.set("Battlefield Control" , "unit")
effectMap.set("Battlefield Control" , function(ev, lane, player, index){
  let l = board.lanes[lane]
  let card = l.cards[index][player]
  doubleTarget(draggedCard, "card", function($lane,$player,$targetCard){
    card.arrow = $targetCard - index
    card.updateDisplay()
  }, function($lane,$player,$targetCard){
    return ( $lane == l && game.players[player] != $player && Math.abs($targetCard - index) <= 1)
  })
  return false
});

targetMap.set("Murder Plot" , "unit")
effectMap.set("Murder Plot" , function(ev, lane, player, index){
  let l = board.lanes[lane]
  let card = l.cards[index][player]
  if (board.lanes[lane].cards[index][player].CardType != "Hero" || board.lanes[lane].cards[index][player].Color != "Black" ) return false
  doubleTarget(draggedCard, "card", function($lane,$player,$targetCard){
    card.arrow = $targetCard - index
    card.currentAttack[3] += 8;
    card.updateDisplay()
  }, function($lane,$player,$targetCard){
    return ( $lane == l && game.players[player] != $player && Math.abs($targetCard - index) <= 1)
  })
  return false
});

targetMap.set("Steal Strength" , "unit")
effectMap.set("Steal Strength" , function(ev, lane, player, index){
  let l = board.lanes[lane]
  let card = l.cards[index][player]
  doubleTarget(draggedCard, "card", function($lane,$player,$targetCard){
    card.currentAttack[3] -= 4
    card.updateDisplay()
    let $card = $lane.cards[$targetCard][$player]
    $card.currentAttack[3] += 4
    $card.updateDisplay()
  }, function($lane,$player,$targetCard){
    return ($lane == l)
  })
  return false
});

targetMap.set("Ion Shell" , "unit")
effectMap.set("Ion Shell" , function(ev, lane, player, index){
  board.lanes[lane].cards[index][player].retaliate[1 + (1 - player == game.getTurn())] += 3;
  board.lanes[lane].cards[index][player].updateDisplay()
  return true
});

targetMap.set("Forward Charge" , "lane")
effectMap.set("Forward Charge" , function(ev, lane){
  let l = board.lanes[lane]
  let player = game.getTurn()
  l.cards.forEach(function(card){
    if (card[player].Name != null) {
      card[player].siege[3] += 2;
      card.arrow = 0
      card[player].updateDisplay()
    }
  })
  return true
});

targetMap.set("Time of Triumph" , "lane")
effectMap.set("Time of Triumph" , function(ev, lane){
  let l = board.lanes[lane]
  let player = game.getTurn()
  l.cards.forEach(function(card){
    if (card[player].Name != null && card[player].CardType == "Hero") {
      card[player].currentAttack[1] += 4;
      card[player].currentArmor[1] += 4;
      card[player].currentHealth[1] += 4;
      card[player].cleave[1] += 4;
      card[player].retaliate[1] += 4;
      card[player].siege[1] += 4;
      card[player].updateDisplay()
    }
  })
  return true
});

targetMap.set("Fighting Instinct" , "unit")
effectMap.set("Fighting Instinct" , function(ev, lane, player, index){
  if (board.lanes[lane].cards[index][player].Color != "Red" || board.lanes[lane].cards[index][player].CardType != "Hero") return false
  board.lanes[lane].cards[index][player].currentArmor[1] += 1;
  board.lanes[lane].cards[index][player].currentAttack[1] += 1;
  board.lanes[lane].cards[index][player].updateDisplay()
  return true
});


targetMap.set("Eclipse" , "lane")
effectMap.set("Eclipse" , function(ev, lane, player, index){
  let l = board.lanes[lane]
  let $player = game.getTurn()
  let beams = game.players[game.getTurn()].getHeros().find(function(luna){return luna.Name == "Luna"}).beams
  if (beams){
    for (var i = 0; i < beams; i++) {
      let $card = l.cards.reduce(targetUnitsAvail , [[],[]])[1-$player]
      if ($card.length != 0){
        $card = $card[Math.floor(Math.random()*$card.length)]
        $card = l.cards[$card]
        if ($card[1-$player].Name != null) {
          $card[1-$player].currentHealth[0] -= 3 - (sum($card[1-$player].currentArmor) < 0 ? sum($card[1-$player].currentArmor) : 0)
          l.collapse()
        }
      }
    }
  }
  return true
});

targetMap.set("Sow Venom" , "lane")
effectMap.set("Sow Venom" , function(ev, lane){
  let summons = [[],[]]
  lane = board.lanes[lane]
  for (let i = 0; i < 2; i++){
    let creep =  card(cardData.Cards.find(function(e){  return e.Name == "Plague Ward"  }),game.players[game.getTurn()])
    summons[game.getTurn()].push(creep);
  }
  lane.summon(summons)
  return true
});

targetMap.set("Mystic Flare" , "unit")
effectMap.set("Mystic Flare" , function(ev, lane, player, index){
  let l = board.lanes[lane]
  for (var i = 0; i < 12 ; ) {
    for (var j = -1; j <= 1; j++) {
      if(l.cards[index + j] != null && l.cards[index + j][player].Name != null){
        l.cards[index+j][player].currentHealth[0] -= 2
        i +=2
      }
    }
  }
  for (var j = -1; j <= 1; j++) {
    if(l.cards[index + j] != null && l.cards[index + j][player].Name != null){
      l.cards[index+j][player].currentHealth[0] += sum(l.cards[index+j][player].currentArmor)
      l.cards[index+j][player].updateDisplay()
    }
  }
  l.collapse()
  return true
});

targetMap.set("Coup de Grace" , "unit")
effectMap.set("Coup de Grace" , function(ev, lane, player, index){
  let l = board.lanes[lane]
  if (l.cards[index][player].CardType != "Hero") return false
  game.condemn(l.cards[index][player],board.lanes[lane])
  game.infoDisplayUpdate();
  l.collapse()
  let hand = game.players[game.getTurn()].hand
  if (hand.length > 1){
    let card = Math.floor(Math.random()*hand.length)
    if (hand[card] == draggedCard) card = ( card + 1 ) % hand.length
    card = hand.splice(card,1)[0]
    card.div.parentNode.removeChild(card.div)
  }
  return true
});

targetMap.set("Berserker's Call", "unit")
effectMap.set("Berserker's Call", function(ev, lane, player, index) {
  if (board.lanes[lane].cards[index][player].Color != "Red" || board.lanes[lane].cards[index][player].CardType != "Hero" || player !== game.getTurn()) return false
  game.dispatchEvent("whenAttacking")
  const currentLane = board.lanes[lane]
  for (var i = -1; i <= 1; i++) {
    if (currentLane.cards[index + i] != null && currentLane.cards[index + i][1-player].Name != null){
      battle( lane, player, index, lane, 1 - player, index + i , false)
    }
  }
  currentLane.collapse()
  return true

});

targetMap.set("Duel", "unit")
effectMap.set("Duel", function(ev, lane, player, index) {
  if (board.lanes[lane].cards[index][player].Color != "Red" || board.lanes[lane].cards[index][player].CardType != "Hero" || player !== game.getTurn()) return false
  // let l = board.lanes[lane]
  // let card = l.cards[index][player]
  doubleTarget(draggedCard, "card", function($lane,$player,$targetCard){
    battle( lane, player, index, board.lanes.indexOf($lane), $player, $targetCard , false)
    board.lanes[lane].collapse()
  }, function($lane,$player,$targetCard){
    return ( $lane == board.lanes[lane] )
  })
  return false

});

targetMap.set("Gank", "unit")
effectMap.set("Gank", function(ev, lane, player, index) {
  if (lane != game.getCurrentLane() || board.lanes[lane].cards[index][player].Color != "Black" || board.lanes[lane].cards[index][player].CardType != "Hero" || player !== game.getTurn()) return false
  // let l = board.lanes[lane]
  // let card = l.cards[index][player]
  doubleTarget(draggedCard, "card", function($lane,$player,$targetCard){
    battle( lane, player, index, board.lanes.indexOf($lane), $player, $targetCard , false)
    board.lanes[lane].collapse()
    $lane.collapse()
    game.infoDisplayUpdate();
  }, function($lane,$player,$targetCard){
    return (true)
  })
  return false

});

targetMap.set("Frostbite" , "unit")
effectMap.set("Frostbite" , function(ev, lane, player, index){
  let l = board.lanes[lane]
  l.cards[index][player].currentHealth[0] -= 2 - sum(l.cards[index][player].currentArmor)
  l.cards[index][player].disarmed = true;
  l.collapse()
  return true
});


targetMap.set("Act of Defiance" , "unit")
effectMap.set("Act of Defiance" , function(ev, lane, player, index){
  let l = board.lanes[lane]
  l.cards[index][player].silenced = true;
  return true
});

targetMap.set("Gust" , "lane")
effectMap.set("Gust" , function(ev, lane){
  let l = board.lanes[lane]
  let player = game.getTurn()
  l.cards.forEach(function(card){
    if (card[1-player].Name != null && card[1-player].CardType == "Hero") {
      card[1-player].silenced = true;
    }
  })
  return true
});

targetMap.set("Winter's Curse", "unit")
effectMap.set("Winter's Curse", function(ev, lane, player, index) {
  board.lanes[lane].cards[index][player].disarmed = true;
  game.dispatchEvent("whenAttacking")
  const currentLane = board.lanes[lane]
  for (var i = -1; i <= 1; i+=2) {
    if (currentLane.cards[index + i] != null && currentLane.cards[index + i][player].Name != null){
      battle( lane, player, index, lane, player, index + i , false)
    }
  }
  currentLane.collapse()
  return true

});

targetMap.set("Echo Slam" , "lane")
effectMap.set("Echo Slam" , function(ev, lane, player, index){
  let l = board.lanes[lane]
  let $player = game.getTurn()

  let enemies = l.cards.reduce(targetUnitsAvail , [[],[]])[1-$player]
  if (enemies.length != 0){
    enemies.forEach(function(enemy){
      enemy = l.cards[enemy]
      if (enemy[1-$player].Name != null) {
        enemy[1-$player].currentHealth[0] -= enemies.length - sum(enemy[1-$player].currentArmor)
      }
    })
  }
  l.collapse()
  return true
});

targetMap.set("Healing Salve" , "unit")
effectMap.set("Healing Salve" , function(ev, lane, player, index){
  let l = board.lanes[lane]
  l.cards[index][player].currentHealth[0] += 6
  if(l.cards[index][player].currentHealth[0] > l.cards[index][player].Health) {l.cards[index][player].currentHealth[0] = l.cards[index][player].Health}
  l.cards[index][player].updateDisplay()
  return true
});

targetMap.set("Fountain Flask" , "unit")
effectMap.set("Fountain Flask" , function(ev, lane, player, index){
  let l = board.lanes[lane]
  l.cards[index][player].currentHealth[0] = l.cards[index][player].Health
  l.cards[index][player].updateDisplay()
  return true
});

targetMap.set("Potion of Knowledge" , "lane")
effectMap.set("Potion of Knowledge" , function(ev, lane, player, index){
  game.players[game.getTurn()].draw()
  return true
});

targetMap.set("Town Portal Scroll" , "unit")
effectMap.set("Town Portal Scroll" , function(ev, lane, player, index){
  if (board.lanes[lane].cards[index][player].CardType != "Hero" || player != game.getTurn()) return false
  let card = board.lanes[lane].cards[index][player]
  let empty = blank(lane);
  card.div.parentNode.replaceChild(empty.div , card.div);
  board.lanes[lane].cards[index][player] = empty;
  card.respawn = 0;
  card.currentHealth[0] = card.Health;
  card.updateDisplay();

  return true
});

targetMap.set("Pick a Fight" , "unit")
effectMap.set("Pick a Fight" , function(ev, lane, player, index){
  let l = board.lanes[lane]
  let card = l.cards[index][player]
  if (l.cards[index][player].CardType != "Hero" || player != game.getTurn()) return false
  doubleTarget(draggedCard, "card", function($lane,$player,$targetCard){
    card.arrow = $targetCard - index
    for (var i = -1; i <= 1; i++) {
      if (l.cards[index + i] != null && l.cards[index + i][1-player].Name != null){
        l.cards[index+i][1-player].arrow = -1 * i
        l.cards[index+i][1-player].updateDisplay()
      }
    }
    card.updateDisplay()
  }, function($lane,$player,$targetCard){
    return ( $lane == l && game.players[player] != $player && Math.abs($targetCard - index) <= 1)
  })
  return false
});

targetMap.set("Viscous Nasal Goo" , "unit")
effectMap.set("Viscous Nasal Goo" , function(ev, lane, player, index){
  board.lanes[lane].cards[index][player].currentArmor[2] -= 2;
  board.lanes[lane].cards[index][player].updateDisplay()
  return true
});

targetMap.set("Fight Through the Pain" , "unit")
effectMap.set("Fight Through the Pain" , function(ev, lane, player, index){
  if (board.lanes[lane].cards[index][player].Color != "Red" || board.lanes[lane].cards[index][player].CardType != "Hero") return false
  board.lanes[lane].cards[index][player].currentArmor[3] += 2;
  game.gianInitiative()
  board.lanes[lane].cards[index][player].updateDisplay()
  return true
});

targetMap.set("Kraken Shell" , "unit")
effectMap.set("Kraken Shell" , function(ev, lane, player, index){
  if (board.lanes[lane].cards[index][player].Color != "Red" || board.lanes[lane].cards[index][player].CardType != "Hero") return false
  board.lanes[lane].cards[index][player].currentArmor[1] += 1;
  game.gianInitiative()
  board.lanes[lane].cards[index][player].updateDisplay()
  return true
});

targetMap.set("Rend Armor" , "unit")
effectMap.set("Rend Armor" , function(ev, lane, player, index){
  board.lanes[lane].cards[index][player].currentArmor[1] -= sum(board.lanes[lane].cards[index][player].currentArmor);
  board.lanes[lane].cards[index][player].updateDisplay()
  return true
});

targetMap.set("Clear The Deck" , "lane")
effectMap.set("Clear The Deck" , function(ev, lane){
  let l = board.lanes[lane]
  let player = game.getTurn()
  l.cards.forEach(function(card){
    if (card[player].Name != null && card[player].CardType == "Hero") {
      card[player].cleave[3] += 4;
      card[player].updateDisplay()
    }
  })
  return true
});

targetMap.set("Crippling Blow" , "unit")
effectMap.set("Crippling Blow" , function(ev, lane, player, index){
  board.lanes[lane].cards[index][player].currentAttack[2] -= 2;
  board.lanes[lane].cards[index][player].updateDisplay()
  return true
});

targetMap.set("Diabolic Revelation" , "lane")
effectMap.set("Diabolic Revelation" , function(ev, lane){
  let player = game.players[game.getTurn()]
  player.draw();player.draw()
  //let l = board.lanes[lane]
  player = game.getTurn()
  board.lanes.forEach(function(l){
    l.cards.forEach(function(card){
      if (card[player].Name != null) {
        card[player].currentHealth[0] -= 2 - sum(card[player].currentArmor)
      }
    })
    l.collapse()
  })

  return true
});

targetMap.set("Ventriloquy" , "unit")
effectMap.set("Ventriloquy" , function(ev, lane, player, index){
  let l = board.lanes[lane]
  let card = l.cards[index][player]
  for (var i = -1; i <= 1; i++) {
    if (l.cards[index + i] != null && l.cards[index + i][1-player].Name != null){
      l.cards[index+i][1-player].arrow = -1 * i
      l.cards[index+i][1-player].updateDisplay()
    }
  }
  card.updateDisplay()
});


targetMap.set("Cunning Plan" , "unit")
effectMap.set("Cunning Plan" , function(ev, lane, player, index){
  // let lane = board.lanes[game.getCurrentLane()]
  let l = board.lanes[lane]
  let card = l.cards[index][player]
  doubleTarget(draggedCard, "card", function($lane,$player,$targetCard){
    game.players[game.getTurn()].draw()
    let nextSibling = index > $targetCard ? card.div.nextSibling : $lane.cards[$targetCard][$player].div.nextSibling
    index > $targetCard ? $lane.cards[$targetCard][$player].div.parentNode.insertBefore(card.div,$lane.cards[$targetCard][$player].div) : card.div.parentNode.insertBefore($lane.cards[$targetCard][$player].div,card.div)
    index > $targetCard ? card.div.parentNode.insertBefore($lane.cards[$targetCard][$player].div, nextSibling) : $lane.cards[$targetCard][$player].div.parentNode.insertBefore(card.div,nextSibling)
    let temp = $lane.cards[$targetCard][$player]
    $lane.cards[$targetCard][$player] = l.cards[index][player]
    l.cards[index][player] = temp
    if(l.cards[index][1 - player].Name != null){
        l.cards[index][player].arrow = 0
        l.cards[index][player].updateDisplay()
    }
    if($lane.cards[$targetCard][1 - $player].Name != null){
        $lane.cards[$targetCard][$player].arrow = 0;
        $lane.cards[$targetCard][$player].updateDisplay()
    }
  } , function($lane,$player,$targetCard){
    return ( $lane == l && player == $player && (index == $targetCard - 1 || index == $targetCard + 1))
  })
  return false
});

targetMap.set("Juke" , "unit")
effectMap.set("Juke" , function(ev, lane, player, index){
  // let lane = board.lanes[game.getCurrentLane()]
  if (player != game.getTurn()) return false
  let l = board.lanes[lane]
  let card = l.cards[index][player]
  doubleTarget(draggedCard, "card", function($lane,$player,$targetCard){
    let nextSibling = index > $targetCard ? card.div.nextSibling : $lane.cards[$targetCard][$player].div.nextSibling
    index > $targetCard ? $lane.cards[$targetCard][$player].div.parentNode.insertBefore(card.div,$lane.cards[$targetCard][$player].div) : card.div.parentNode.insertBefore($lane.cards[$targetCard][$player].div,card.div)
    index > $targetCard ? card.div.parentNode.insertBefore($lane.cards[$targetCard][$player].div, nextSibling) : $lane.cards[$targetCard][$player].div.parentNode.insertBefore(card.div,nextSibling)
    let temp = $lane.cards[$targetCard][$player]
    $lane.cards[$targetCard][$player] = l.cards[index][player]
    l.cards[index][player] = temp
    if(l.cards[index][1 - player].Name != null){
        l.cards[index][player].arrow = 0
        l.cards[index][player].updateDisplay()
    }
    if($lane.cards[$targetCard][1 - $player].Name != null){
        $lane.cards[$targetCard][$player].arrow = 0;
        $lane.cards[$targetCard][$player].updateDisplay()
    }
  } , function($lane,$player,$targetCard){
    return ( $lane == l && player == $player && (index == $targetCard - 1 || index == $targetCard + 1))
  })
  return false
});


targetMap.set("Whispers of Madness" , "unit")
effectMap.set("Whispers of Madness" , function(ev, lane, player, index){
  if (player == game.getTurn()) return false
  board.lanes[lane].cards[index][player].silenced = true
  board.lanes[lane].cards[index][player].disarmed = true
  board.lanes[lane].cards[index][player].updateDisplay()
  board.lanes.forEach(function(l){
    l.cards.forEach(function(card){
      if (card[1-player].Name != null && card[1-player].CardType == "Hero") {
        card[1-player].silenced = true
        card[1-player].disarmed = true
        card[1-player].updateDisplay()
      }
    })
  })

  return true
});

targetMap.set("At Any Cost" , "lane")
effectMap.set("At Any Cost" , function(ev, lane){
  let l = board.lanes[lane]
  let player = game.getTurn()
  l.cards.forEach(function(card){
    if (card[1-player].Name != null) {
      card[1-player].currentHealth[0] -= 6 - sum(card[1-player].currentArmor)
    }
    if (card[player].Name != null) {
      card[player].currentHealth[0] -= 6 - sum(card[player].currentArmor)
    }
  })
  l.collapse()
  return true
});

targetMap.set("Annihilation" , "lane")
effectMap.set("Annihilation" , function(ev, lane){
  let l = board.lanes[lane]
  let player = game.getTurn()
  l.cards.forEach(function(card,index){
    if (card[player].Name != null) {
      game.condemn(l.cards[index][player],l)

    }
    if (card[1-player].Name != null) {
      game.condemn(l.cards[index][1-player],l)
    }
  })
  l.collapse()
  return true
});

targetMap.set("Compel" , "unit")
effectMap.set("Compel" , function(ev, lane, player, index){
  let l = board.lanes[lane]
  let card = l.cards[index][player]
  doubleTarget(draggedCard, "card", function($lane,$player,$targetCard){
    card.arrow = $targetCard - index
    card.updateDisplay()
    game.players[game.getTurn()].draw()
  }, function($lane,$player,$targetCard){
    return ( $lane == l && game.players[player] != $player && Math.abs($targetCard - index) <= 1)
  })
  return false
});

targetMap.set("Arcane Assault" , "lane")
effectMap.set("Arcane Assault" , function(ev, lane){
  let l = board.lanes[lane]
  let player = game.getTurn()
  l.towers[1-player].currentHealth[0] -= 2 - sum(l.towers[1-player].currentArmor)
  l.towers[1-player].updateDisplay()
  game.players[player].draw()
  game.gianInitiative()
  return true
});

targetMap.set("Fog of War" , "lane")
effectMap.set("Fog of War" , function(ev, lane){
  let l = board.lanes[lane]
  let player = game.getTurn()
  l.cards.forEach(function(card){
    if (card[1-player].Name != null) {
      if (Math.random() < 0.5) card[1-player].disarmed = true
    }
  })
  l.collapse()
  return true
});

targetMap.set("Friendly Fire", "unit")
effectMap.set("Friendly Fire", function(ev, lane, player, index) {
  if (player == game.getTurn()) return false
  // let l = board.lanes[lane]
  // let card = l.cards[index][player]
  doubleTarget(draggedCard, "card", function($lane,$player,$targetCard){
    battle( lane, player, index, board.lanes.indexOf($lane), $player, $targetCard , false)
    board.lanes[lane].collapse()
  }, function($lane,$player,$targetCard){
    return ( $lane == board.lanes[lane], $player == player )
  })
  return false

});

targetMap.set("Lodestone Demolition" , "lane")
effectMap.set("Lodestone Demolition" , function(ev, lane){
  let l = board.lanes[lane]
  let x = 0;
  let player = game.getTurn()
  l.cards.forEach(function(card){
    if (card[1-player].Name != null) {
      x += sum(card[1-player].currentArmor)
    }
  })
  l.towers[1-player].currentHealth[0] -= x - sum(l.towers[1-player].currentArmor)
  l.towers[1-player].updateDisplay()
  return true
});

targetMap.set("Hip Fire" , "unit")
effectMap.set("Hip Fire" , function(ev, lane, player, index){
  let l = board.lanes[lane]
  l.cards[index][player].currentHealth[0] -= 4 - sum(l.cards[index][player].currentArmor)
  l.collapse()
  game.gianInitiative()
  return true
});

targetMap.set("The Cover of Night" , "unit")
effectMap.set("The Cover of Night" , function(ev, lane, player, index){
  if (board.lanes[lane].cards[index][player].Color != "Black" || board.lanes[lane].cards[index][player].CardType != "Hero" || player != game.getTurn()) return false
  let summons = [[],[]]
  let hero = board.lanes[lane].cards[index][player]
  let empty = blank(lane)//,board.lanes[lane].playAreas[player],index)

  doubleTarget(draggedCard, "lane", function($lane){
    board.lanes[lane].cards[index][player] = empty
    hero.div.parentNode.replaceChild(empty.div , hero.div);
    hero.currentAttack[5] += 4
    hero.siege[5] += 7
    summons[player].push(hero)
    console.log($lane);
    $lane.summon(summons)
  } , function($lane){
    return ( $lane != lane)
  })
  return false
});

targetMap.set("Arm the Rebellion" , "lane")  // not in database
effectMap.set("Arm the Rebellion" , function(ev, lane){
  let l = board.lanes[lane]
  let player = game.getTurn()
  l.cards.forEach(function(card){
    if (card[player].Name != null && card[player].CardType == "Creep") {
      card[player].currentAttack += 2
      card[player].currentArmor += 1
      card[player].updateDisplay()
    }
  })
  return true
});

targetMap.set("Defend the Weak" , "unit")
effectMap.set("Defend the Weak" , function(ev, lane, player, index){
  let card = board.lanes[lane].cards[index][player]
  card.div.addEventListener("continuousEffect", function(e){
    for (var i = -1; i < 2; i+=2) {
      let l = board.lanes[e.detail.lane]
      index = e.detail.card
      if(l.cards[index+i] != null && l.cards[index+i][e.detail.player].Name != null){
        l.cards[index+i][e.detail.player].currentArmor[4] += 2;
        l.cards[index+i][e.detail.player].updateDisplay()
      }
    }
  })

  return true
});

targetMap.set("Allseeing One's Favor" , "unit")
effectMap.set("Allseeing One's Favor" , function(ev, lane, player, index){
  if (board.lanes[lane].cards[index][player].Color != "Green" || board.lanes[lane].cards[index][player].CardType != "Hero") return false
  let card = board.lanes[lane].cards[index][player]
  card.div.addEventListener("continuousEffect", function(e){
    let l = board.lanes[e.detail.lane]

    l.cards.forEach(function(card){
      if (card[e.detail.player].Name != null && card[e.detail.player] != board.lanes[e.detail.lane].cards[e.detail.card][e.detail.player]) {
        card[e.detail.player].regen[4] += 2;
        card[e.detail.player].updateDisplay()
      }
    })
  })

  return true
});

targetMap.set("Heartstopper Aura" , "unit")
effectMap.set("Heartstopper Aura" , function(ev, lane, player, index){
  if (board.lanes[lane].cards[index][player].Color != "Black" || board.lanes[lane].cards[index][player].CardType != "Hero") return false
  let card = board.lanes[lane].cards[index][player]
  let abilitiesContainer = card.abilitiesContainer
  let div = document.createElement('div')
  div.classList.add("ability-container")
  let abilityIcon = document.createElement('IMG'); abilityIcon.draggable = false;
  abilityIcon.src = `../node_modules/artifactdb/assets/artwork/small/${card.FileName}.jpg`
  abilityIcon.onerror = function () { abilityIcon.src = "../src/placeholder.png"}
  abilityIcon.title = "Modify a black hero with \"Deal 2 piercing damage to this hero's enemy neighbors before the action phase.\""
  div.appendChild(abilityIcon)
  abilitiesContainer.appendChild(div)

  card.div.addEventListener("beforeTheActionPhase", function(e){
    let currentLane = board.lanes[e.detail.lane]
    let index = e.detail.card
    for (var i = -1; i <= 1; i++) {
      if (currentLane.cards[index + i] && currentLane.cards[index + i][1-e.detail.player].Name != null){
        currentLane.cards[index + i][1-e.detail.player].currentHealth[0] -= 2 - (sum(currentLane.cards[index + i][1-e.detail.player].currentArmor) < 0 ? sum(currentLane.cards[index + i][1-e.detail.player].currentArmor) : 0)
      }
      currentLane.collapse()
    }
  })

  return true
});

targetMap.set("Track" , "unit")
effectMap.set("Track" , function(ev, lane, player, index){
  if (board.lanes[lane].cards[index][player].CardType != "Hero") return false
  board.lanes[lane].cards[index][player].Bounty += 10
  return true
});

targetMap.set("Blood Rage" , "unit")
effectMap.set("Blood Rage" , function(ev, lane, player, index){
  board.lanes[lane].cards[index][player].silenced = true;
  board.lanes[lane].cards[index][player].currentAttack[3] += 4;
  board.lanes[lane].cards[index][player].updateDisplay()
  return true
});

//Defend the Weak,Allseeing One's Favor

export {effectMap,targetMap};
