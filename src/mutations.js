export const mutations = {
  addScore (state, payload) {
    state.leaderboard = { ...state.leaderboard, payload }
  },
  setLeaderboard (state, payload) {
    const arr = Object.keys(payload).map(function (key) { return payload[key] })
    const result = arr.reduce((result, item) => {
      const title = `${item.score}.${item.travelled}.${item.name.toLowerCase()}`
      return { ...result, [title]: item }
    }, {})
    state.leaderboard = result
  }
}
