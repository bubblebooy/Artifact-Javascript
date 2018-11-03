import {game , cardData} from './index.js'
import {deployment} from './deploy.js'
import {sum, shuffle} from './arrayFunctions'
import {card} from './card'

const shop = (() => {
  const div = document.getElementById("shop");
  const secretShopShop = document.getElementById("secret-shop");
  const itemShop = document.getElementById("item-deck");
  const consumableShop = document.getElementById("consumables");


  const closeButton = document.createElement('button')
  closeButton.innerHTML = "Done"
  closeButton.classList.add("close-btn" , "btn")
  closeButton.type="submit"
  div.appendChild(closeButton)

  let itemDeck = ["Demagicking Maul","Stonehall Plate","Stonehall Cloak"]
  itemDeck = itemDeck.concat(itemDeck,itemDeck)
  let item
  let consumableDeck = ["Leather Armor","Short Sword","Traveler's Cloak"]//["Healing Salve","Town Portal Scroll","Fountain Flask","Potion of Knowledge"]
  let secretShopDeck = ["Apotheosis Blade","Horn of the Alpha","Shop Deed"]

  closeButton.addEventListener("click",function(){
    div.classList.add('display-none');
    if (secretShopShop.firstChild) secretShopShop.removeChild(secretShopShop.firstChild)
    itemDeck.push(item.Name)
    item = null
    if (itemShop.firstChild) itemShop.removeChild(itemShop.firstChild)
    if (consumableShop.firstChild) consumableShop.removeChild(consumableShop.firstChild)
    deployment();
  })

  const draw = (deck , depleting = false) => {
    let c
    if (depleting) deck = shuffle(deck)
    c = depleting ? deck.shift() : deck[Math.floor(Math.random() * deck.length)]
    if (c != null){
      if (typeof c == "string"){
        let newCard = card(cardData.Cards.find(function(e){
          return e.Name == c
        }))
        return newCard
      } else {return c}

    }
    return false
  }

  const show = () => {
    item = draw(itemDeck,true)
    let consumable = draw(consumableDeck)
    let secretShop = draw(secretShopDeck)
    secretShopShop.appendChild(secretShop.div)
    itemShop.appendChild(item.div)
    consumableShop.appendChild(consumable.div)
    div.classList.remove('display-none');
    closeButton.focus();
  };
  return {show}
})();

export default shop;
