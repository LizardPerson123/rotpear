async function GetText() { 
  let res = await fetch(`https://api.rottingpears.com/eb/text`)
  if (res.status != 200) {throw new Error("Error fetching text")}
  return res.text()
}

async function getLeaderboard(v) {return fetch(`https://api.rottingpears.com/eb/leaderboard/?v=${v}`).then(res => res.json())}
async function isScore(v, username) {return fetch(`https://api.rottingpears.com/eb/isScore?v=${v}&username=${username}`).then(res => res.text())}
async function submitScore(username, password, score) {return fetch('https://api.rottingpears.com/eb/submitScore', {method:'POST', body: JSON.stringify({username: username, password: password, score: score}), headers: {"Content-Type": "application/json"}})}
async function createAccount(username, password) {
  let res = await fetch('https://api.rottingpears.com/eb/text', {method: 'POST', body: JSON.stringify({username: username, password: password}), headers: {"Content-Type": "application/json"}})
  return res.status
}