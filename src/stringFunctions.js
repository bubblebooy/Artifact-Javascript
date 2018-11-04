function toCamelCase(str){
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter,index){
    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '');
}

function toFunctionName(str){
  return toCamelCase(str.replace(" : Effect", '').replace(/[^\w\s]+/g, ''))
}

function toFileName(str){
  return str.replace(" : Effect", '').replace(/\s/g,"_").replace("\'","-").toLowerCase()
}


export {toCamelCase, toFunctionName, toFileName};
