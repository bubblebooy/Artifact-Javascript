import {game } from './index.js'
import {board} from './board'

const zoomNavController = (() => {
// function zoomNavController(){
  const zoomButton = document.getElementById('zoom-btn');
  const zoomLeftButton = document.getElementById('zoom-btn-left');
  const zoomMiddleButton = document.getElementById('zoom-btn-middle');
  const zoomRightButton = document.getElementById('zoom-btn-right');

  zoomButton.addEventListener("click",function(){
    board.div.classList.toggle("zoom-out");
    game.div.classList.toggle("zoom-out");
    board.lanes[game.getCurrentLane()].div.scrollIntoView({inline: "center"})
  })
  zoomLeftButton.addEventListener("click",function(){
    board.div.classList.remove("zoom-out");
    game.div.classList.remove("zoom-out");
    board.lanes[0].div.scrollIntoView({inline: "center"})
  })
  zoomMiddleButton.addEventListener("click",function(){
    board.div.classList.remove("zoom-out");
    game.div.classList.remove("zoom-out");
    board.lanes[1].div.scrollIntoView({inline: "center"})
  })
  zoomRightButton.addEventListener("click",function(){
    board.div.classList.remove("zoom-out");
    game.div.classList.remove("zoom-out");
    board.lanes[2].div.scrollIntoView({inline: "center"})
  })


  const updateActive = () => {
    switch(game.getCurrentLane()){
      case 0:
        zoomLeftButton.classList.add("active")
        zoomMiddleButton.classList.remove("active")
        zoomRightButton.classList.remove("active")
        break;
      case 1:
        zoomLeftButton.classList.remove("active")
        zoomMiddleButton.classList.add("active")
        zoomRightButton.classList.remove("active")
        break;
      case 2:
        zoomLeftButton.classList.remove("active")
        zoomMiddleButton.classList.remove("active")
        zoomRightButton.classList.add("active")
        break;
    }
    return
  }
  return {updateActive}
})();

export default zoomNavController;
