function getRndInteger(min, max) {return Math.floor(Math.random() * (max - min) ) + min;}
let getById = id => {return document.getElementById(id) }
let getByClss = className => {return Array.from(document.getElementsByClassName(className)) }