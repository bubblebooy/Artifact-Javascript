function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function sum(a) {
  if (typeof a == "number"){return a}
  return a.reduce( (total, num) => total + num )
}



export {shuffle, sum};
