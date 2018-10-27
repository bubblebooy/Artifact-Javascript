import passButtonController from './passButtonController'
import {game , board, cardData, posAvail} from './index.js'
import {card , blank, draggedCard} from './card'
import shuffle from './shuffle'


const stages = [];
const deployButton = document.createElement('button');



let sides = [];

function dragover(ev) { ev.preventDefault()}
function dragenter(ev) { ev.target.classList.add("dragover")}
function dragleave(ev) { ev.target.classList.remove("dragover")}


function buildStages(){
  const stageBottom = document.createElement("div"); stageBottom.classList.add("bottom","display-none");
  const stageTop = document.createElement("div"); stageTop.classList.add("top","display-none");
  stages.push(stageBottom);
  stages.push(stageTop);
  stages.forEach(function(stage){
    stage.classList.add("stage","UI")
    game.div.appendChild(stage);
  })

  deployButton.classList.add("deploy-btn", "btn" ,"UI" ,"display-none")
  deployButton.textContent = "Deploy"
  game.div.appendChild(deployButton);
  deployButton.addEventListener("click",function(){
    if (stages[0].hasChildNodes() || stages[1].hasChildNodes()){
      alert("Need to choose lanes for all Heros")
    } else {
      deploy()
    }
  })
  board.lanes.forEach(function(lane,laneIndex){
    lane.stages.forEach(function(stage, side){
      stage.ondragover = dragover;
      stage.ondragenter = dragenter;
      stage.ondragleave = dragleave;
      stage.ondrop=function(ev){ev.preventDefault();
        dragleave(ev)
        if (draggedCard.player == game.players[side]){
          stage.appendChild(draggedCard.div)
          sides[side][laneIndex].push(draggedCard)
          draggedCard.div.draggable = false;
        }
      };
    })
  })
}

function showStages(){
  for (let i = 0; i < 2; i++){
    stages[i].classList.remove('display-none')
    board.lanes.forEach(function(lane){
          lane.stages[i].classList.remove('display-none')
    })
  }
}

function hideStages(){
  for (let i = 0; i < 2; i++){
    stages[i].classList.add('display-none')
    board.lanes.forEach(function(lane){
          lane.stages[i].classList.add('display-none')
    })
  }
}

function deployment(){
  sides[0] = [[],[],[]];
  sides[1] = [[],[],[]];
  if (stages[0] == null){buildStages()}
  board.div.classList.add("zoom-out");
  game.div.classList.add("zoom-out");

  !function staging(){
    showStages();
    sides.forEach(function(side, sideIndex){
      for (let i = 0; i < 2; i++){
        let rand = Math.floor(Math.random() * 3)
        let creep = card(cardData.Cards[132],game.players[sideIndex])
        side[rand].push(creep);
        board.lanes[rand].stages[sideIndex].appendChild(creep.div)
      }
      if (game.getRound() == 0){
        let rand = shuffle([0,1,2])
        for (var i = 0; i < 3; i++) {
          let hero = game.players[sideIndex].getHeros()[i]
          board.lanes[rand[i]].stages[sideIndex].appendChild(hero.div)
          side[rand[i]].push(hero)
        }
      }
      game.players[sideIndex].getHeros().forEach(function(hero){
        if (hero.respawn == 0 && game.getRound() != 0){
          if (!game.players[sideIndex].computer) {
            stages[sideIndex].appendChild(hero.div)
            hero.div.draggable = true;
          } else{
            let rand = Math.floor(Math.random() * 3)
            side[rand].push(hero)
            board.lanes[rand].stages[sideIndex].appendChild(hero.div)
          }
        }
        hero.respawn -= 1;
      })
    })
    deployButton.classList.remove('display-none')
    // deploy();
  }();
}

function deploy(){

  hideStages()
  deployButton.classList.add('display-none')
  for (let i = 0; i < 3; i++){
    let lane = board.lanes[i]
    sides.forEach(function(side, sideIndex){
      while (lane.cards.reduce(posAvail , [[],[]])[sideIndex].length < side[i].length){
        let rightLeft = Math.random() < 0.5
        let empty = [blank(lane.playAreas[0],rightLeft),blank(lane.playAreas[1],rightLeft)]
        rightLeft ? lane.cards.push(empty) : lane.cards.unshift(empty)
      }
    })
    sides.forEach(function(side, sideIndex){
      side[i].forEach(function(creep){
        let pos = lane.cards.reduce(posAvail , [[],[]])[sideIndex]
        pos = pos[Math.floor(Math.random() * pos.length)]
        let blankDiv = lane.cards[pos][sideIndex].div
        blankDiv.parentNode.replaceChild(creep.div , blankDiv)
        lane.cards[pos][sideIndex] = creep
      })
    })
  }
  board.lanes.forEach(function(lane){
    if (game.getRound() != 0){
      lane.cards.forEach(function(row,index){
        row.forEach(function(unit, side) {
          if(unit.Name != null){
            if(row[1 - side].Name == null){
              let rand = Math.random();
              rand = rand > .75 ? 1 : (rand > .25) - 1;
              if (lane.cards[index + rand] == null || lane.cards[index + rand][1 - side].Name == null){ rand = 0 }
              unit.arrow = rand;
            }
            unit.updateDisplay()
          }
        })
      })
    }
    console.log(lane.cards)
  })
  passButtonController.show();
}


export { deployment }
