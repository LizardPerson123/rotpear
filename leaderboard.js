function applyLeaderboard(leaderboardData, leaderboardDiv) {
  for (element in leaderboardData) { 
    let entry = document.createElement("div")
    entry.innerHTML = `<h1 style="margin-bottom: 0px">${element}: ${leaderboardData[element]}</h1>`
    entry.className = "leaderboardEntry"
    leaderboardDiv.appendChild(entry)
  }
}

async function setUpLeaderboard() {
  ApplyMode()
  ApplyComicSans()
  let leaderboardData = await getLeaderboard(1)
  let leaderboardDiv = getById("leaderboard")
  applyLeaderboard(leaderboardData, leaderboardDiv)
  
}

let leaderboardPage = 1;
setUpLeaderboard()

async function loadMoreLeaderboard(addToLeaderboardPage = 1) {
  if ((leaderboardPage + addToLeaderboardPage) < 1) {return}
  leaderboardPage += addToLeaderboardPage
  console.log(leaderboardPage)
  let leaderboardData = await getLeaderboard(leaderboardPage)
  getByClss("leaderboardEntry").forEach(node => node.remove())
  let leaderboardDiv = getById("leaderboard")
  applyLeaderboard(leaderboardData, leaderboardDiv)
}