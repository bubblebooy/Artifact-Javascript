import {game} from './index.js'
import {deployment} from './deploy.js'

const shop = (() => {
  const div = document.getElementById("shop");
  const closeButton = document.createElement('button')
  closeButton.innerHTML = "Done"
  closeButton.classList.add("close-btn" , "btn")
  closeButton.type="submit"
  div.appendChild(closeButton)

  closeButton.addEventListener("click",function(){
    div.classList.add('display-none');
    deployment();
  })

  const show = () => {
    div.classList.remove('display-none');
    closeButton.focus();
  };
  return {show}
})();

export default shop;
