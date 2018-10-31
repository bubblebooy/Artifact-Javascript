import {game , cardData, posAvail} from './index.js'
import {board} from './board'
import {card , blank, draggedCard} from './card'
import {sum, shuffle} from './arrayFunctions'


let effectMap = new Map()  // should i just be uisng an object instead? does it really matter?
let targetMap = new Map()


// Targets : lane, unit, improvement


targetMap.set("Dimensional Portal" , "lane")
effectMap.set("Dimensional Portal" , function(ev, lane){
  let summons = [[],[]]
  lane = board.lanes[lane]
  for (let i = 0; i < 3; i++){
    let creep = card(cardData.Cards[132],game.players[game.getTurn()])
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
    let creep = card(cardData.Cards[132],game.players[game.getTurn()])
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
    let creep = card(cardData.Cards[132],game.players[game.getTurn()])
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
  board.lanes[lane].cards[index][player].currentArmor[4] -= 8;
  board.lanes[lane].cards[index][player].currentAttack[4] += 8;
  board.lanes[lane].cards[index][player].updateDisplay()
  return true
});

targetMap.set("Poised to Strike" , "unit")
effectMap.set("Poised to Strike" , function(ev, lane, player, index){
  if (board.lanes[lane].cards[index][player].Color != "Red" || board.lanes[lane].cards[index][player].CardType != "Hero") return false
  board.lanes[lane].cards[index][player].currentAttack[4] += 4;
  board.lanes[lane].cards[index][player].updateDisplay()
  return true
});

targetMap.set("Defensive Stance" , "unit")
effectMap.set("Defensive Stance" , function(ev, lane, player, index){
  if (board.lanes[lane].cards[index][player].CardType != "Hero") return false
  board.lanes[lane].cards[index][player].currentArmor[4] += 3;
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

targetMap.set("Enrage" , "unit")
effectMap.set("Enrage" , function(ev, lane, player, index){
  if (board.lanes[lane].cards[index][player].Color != "Red" || board.lanes[lane].cards[index][player].CardType != "Hero") return false
  board.lanes[lane].cards[index][player].currentArmor[4] += 4;
  board.lanes[lane].cards[index][player].currentAttack[4] += 4;
  board.lanes[lane].cards[index][player].updateDisplay()
  return true
});

targetMap.set("God's Strength" , "unit")
effectMap.set("God's Strength" , function(ev, lane, player, index){
  if (board.lanes[lane].cards[index][player].Color != "Red" || board.lanes[lane].cards[index][player].CardType != "Hero") return false
  board.lanes[lane].cards[index][player].currentAttack[1 + (1 - player == game.getTurn())] += 2;
  board.lanes[lane].cards[index][player].updateDisplay()
  return true
});

targetMap.set("Spring the Trap" , "lane")
effectMap.set("Spring the Trap" , function(ev, lane){
  let summons = [[],[]]
  lane = board.lanes[lane]
  for (let i = 0; i < 2; i++){
    let creep =  card(cardData.Cards.find(function(e){  return e.Name == "Centaur Hunter"  }),game.players[game.getTurn()])
    // card(cardData.Cards[132],game.players[game.getTurn()])
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
  l.cards[index][player].currentHealth[0] -= 10
  l.collapse()
  return true
});

//"Grazing Shot","No Accident","Slay","Pick Off","Assassinate"
["Mana Drain","Payday","Arcane Censure"]


export {effectMap,targetMap};
