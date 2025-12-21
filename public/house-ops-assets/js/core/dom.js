export function el(id){
  return document.getElementById(id);
}

export function qsa(selector, root = document){
  return Array.from(root.querySelectorAll(selector));
}
