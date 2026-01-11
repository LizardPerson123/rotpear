async function start(difficulty) {
  document.getElementById("start").removeAttribute("href")
  
  getById("start").innerText = "Loading... This May Take A Few Seconds"
  getById("start2").style.display = "none"
  getById("start3").style.display = "none"

  let text = await GetText()
  text = text.split(".")
  text[0] += ". "
  getById("ebolaCanvas").innerHTML = parseText(text[0])
  idList = Array.from(Array(text[0].split(" ").length).keys())
  curedList = Array.from(Array(text[0].split(" ").length).keys())
  setEbolaInterval(difficulty)
  return text
}

let id = 1

console.log("v1.0.3")

GetHighScore()
ApplyComicSans()

addEventListener("pageshow", function() {
  ApplyMode()
})