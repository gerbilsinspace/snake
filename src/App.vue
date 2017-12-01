<template>
  <v-touch
    class='game'
    :style='boardStyle'
    v-on:swipeup='onSwipeUp'
    v-on:swiperight='onSwipeRight'
    v-on:swipedown='onSwipeDown'
    v-on:swipeleft='onSwipeLeft'
  >
    <h1><span :style='textStyle'>S</span>nake</h1>

    <div v-if='page === "start"'>
      <p>WASD or Arrow keys to move</p>

      <button v-on:click='start'>Start</button>
    </div>

    <div v-if='page === "playing"'>
      <div class='score'>
        <div class='pellet-count'>Eaten {{ pelletCount }}</div>
        <div class='distance-travelled'>Travelled {{ tick }}</div>
        <div class='clearfix' />
      </div>
    </div>

    <div class='board' v-if='page === "playing"'>
      <ul class='row'>
        <li v-for='row in parseInt(rows)' :key='row' :id='"row-" + row'>
          <ul class='column'>
            <li
              v-for='column in parseInt(columns)'
              :key='row + "" + column'
              :id='row + "" + column'
            >
              <span v-if='boardState && boardState[row] && boardState[row][column]'>
                <div class='empty piece' v-if='boardState[row][column].state === "empty"' :style='emptyStyle' />
                <div class='snake piece' v-if='boardState[row][column].state === "snake"' :style='snakeStyle' />
                <div class='pellet piece' v-if='boardState[row][column].state === "pellet"' :style='pelletStyle' />
              </span>
            </li>
          </ul>
        </li>
        <div class='clearfix' />
      </ul>
    </div>

    <div v-if='page === "gameOver"' class='game-over'>
      <h2><span :style='textStyle'>G</span>ame <span :style='textStyle'>O</span>ver</h2>

      <p>Pellets: <span :style='textStyle'>{{ pelletCount }}</span></p>
      <p>Spaces: <span :style='textStyle'>{{ tick }}</span></p>

      <button v-on:click='retry'>Retry</button>
      <button v-on:click='showChooseName'>Leaderboard</button>
    </div>

    <div v-if='page === "chooseName"'>
      <h2>Choose Name</h2>
      <div v-if='error.length > 0'>{{ error }}</div>
      <input v-model='name' />
      <button v-on:click='showLeaderboard'>Save Score</button>
    </div>

    <div
      v-if='page === "leaderboard"'
      :textStyle='textStyle'
      :name='name'
    >
      <button v-on:click='retry'>Retry</button>
      <ul>
        <li v-for='key in leaderboardKeys' :key='key'>
          <span>{{ leaderboard[key].name }}</span>
          <span>{{ leaderboard[key].score }}</span>
          <span>{{ leaderboard[key].travelled }}</span>
        </li>
      </ul>
    </div>
  </v-touch>
</template>

<script>
import Leaderboard from './components/Leaderboard'
import { db } from './firebase'

export default {
  name: 'game',
  components: {
    Leaderboard
  },
  props: [
    'textStyle',
    'pelletStyle',
    'emptyStyle',
    'snakeStyle',
    'boardStyle'
  ],
  data () {
    return {
      name: '',
      error: '',
      page: 'start',
      rows: 10,
      columns: 10,
      snakePosition: [],
      snakeDirection: '',
      snakePrevDirection: '',
      snakeNextDirections: [],
      boardState: [],
      nextPosition: [],
      tick: 0,
      tickRate: 0,
      tickFunction: () => {},
      pelletPosition: [],
      pelletCount: 0,
      snakeGrowing: false
    }
  },
  computed: {
    leaderboard () {
      return this.$store.getters.getLeaderboard
    },
    leaderboardKeys () {
      if (this.leaderboard) {
        return Object.keys(this.leaderboard)
      }

      return []
    }
  },
  created () {
    window.removeEventListener('keydown', this.onKeyPress)
    window.addEventListener('keydown', this.onKeyPress)
  },
  methods: {
    start () {
      this.page = 'playing'
      this.initializeGame()
    },
    initializeGame () {
      this.page = 'playing'
      this.setSnakePosition()
      this.snakeDirection = 'right'
      this.snakePrevDirection = 'right'
      this.snakeNextDirections = []
      this.pelletPosition = []
      this.setPelletPosition()
      this.paintBoard()
      this.gameOver = false
      this.tickRate = 500
      this.tick = 0
      this.pelletCount = 0

      this.tickFunction = window.setInterval(() => {
        this.tick++
      }, this.tickRate)
    },
    setSnakePosition () {
      let result = []
      const row = Math.floor(this.rows / 2)
      const column = Math.floor(this.columns / 2)
      result[result.length] = [row, column]
      result[result.length] = [row, column - 1]
      this.snakePosition = result
    },
    paintBoard () {
      let result = []
      const rows = this.rows || 0
      const columns = this.columns || 0

      for (let i = 0; i <= rows; i++) {
        result[i] = []

        for (let j = 0; j <= columns; j++) {
          result[i][j] = {
            state: 'empty'
          }

          for (let id = 0; id < this.snakePosition.length; id++) {
            const s = this.snakePosition[id]
            if ((s[0] === i) && (s[1] === j)) {
              result[i][j].state = 'snake'
            }
          }
        }
      }

      result[this.pelletPosition[0]][this.pelletPosition[1]].state = 'pellet'

      this.boardState = result
    },
    preventReverseDirection () {
      const prevDir = this.snakePrevDirection
      const invalidPairs = [['up', 'down'], ['left', 'right']]

      const validDirs = this.snakeNextDirections.reduce((result, item) => {
        for (var i = 0; i < invalidPairs.length; i++) {
          const invalidPair = invalidPairs[i]

          if (
            (prevDir === invalidPair[0] && item === invalidPair[0]) ||
            (prevDir === invalidPair[0] && item === invalidPair[1]) ||
            (prevDir === invalidPair[1] && item === invalidPair[0]) ||
            (prevDir === invalidPair[1] && item === invalidPair[1])
          ) {
            return result
          }
        }

        return [...result, item]
      }, [])
      this.snakeNextDirections = []
      return validDirs.pop()
    },
    getNextPosition () {
      const snakeHead = this.snakePosition[0]
      let hPos = snakeHead[0]
      let wPos = snakeHead[1]

      const direction = this.preventReverseDirection()

      if (direction) {
        this.snakeDirection = direction
        this.snakeNextDirections = []
        this.snakePrevDirection = this.snakeDirection
      }

      if (this.snakeDirection === 'up') {
        hPos--
      } else if (this.snakeDirection === 'right') {
        wPos++
      } else if (this.snakeDirection === 'down') {
        hPos++
      } else if (this.snakeDirection === 'left') {
        wPos--
      }

      this.nextPosition = [hPos, wPos]
    },
    handleCollisions () {
      const nextPosition = this.nextPosition
      let collided = false

      if ((nextPosition[0] <= 0) ||
          (nextPosition[1] <= 0) ||
          (nextPosition[0] > this.rows) ||
          (nextPosition[1] > this.columns)) {
        collided = 'wall'
      }

      const snakeNoTailPosition = this.snakePosition.reduce((result, item) => {
        if (result.length === this.snakePosition.length - 1) {
          return result
        }

        return [...result, item]
      }, [])

      if (snakeNoTailPosition.find(
        el => (
          nextPosition[0] === el[0] && nextPosition[1] === el[1]
        )
      )) {
        collided = 'snake'
      }

      if (
        (nextPosition[0] === this.pelletPosition[0]) &&
        (nextPosition[1] === this.pelletPosition[1])
      ) {
        collided = 'pellet'
        this.pelletCount++
      }

      if ((collided === 'wall') || (collided === 'snake')) {
        window.clearInterval(this.tickFunction)
        this.page = 'gameOver'
        return true
      } else if (collided === 'pellet') {
        this.boardState[this.pelletPosition[0]][this.pelletPosition[1]].state = 'empty'
        this.snakeGrowing = true

        if (this.tickRate > 200) {
          this.tickRate = this.tickRate - 20
        }

        this.setPelletPosition()
        window.clearInterval(this.tickFunction)
        this.tickFunction = window.setInterval(() => {
          this.tick++
        }, this.tickRate)
        return false
      }

      return false
    },
    onKeyPress (event) {
      const nextDirection = event.code.toLowerCase().replace('arrow', '').replace('key', '')
      switch (nextDirection) {
        case 'up':
        case 'w':
          this.snakeNextDirections.push('up')
          break
        case 'right':
        case 'd':
          this.snakeNextDirections.push('right')
          break
        case 'down':
        case 's':
          this.snakeNextDirections.push('down')
          break
        case 'left':
        case 'a':
          this.snakeNextDirections.push('left')
          break
        default:
          break
      }
    },
    setPelletPosition () {
      let hPosition = (Math.floor(Math.random() * this.rows))
      if (hPosition <= 0) {
        hPosition = 1
      }
      let wPosition = (Math.floor(Math.random() * this.columns))
      if (wPosition <= 0) {
        wPosition = 1
      }
      const pelletPosition = [hPosition, wPosition]
      let isSnake = this.snakePosition.find((val) => {
        return (
          (pelletPosition[0] === val[0]) &&
          (pelletPosition[1] === val[1])
        )
      })

      if (!isSnake && this.nextPosition[0] && this.nextPosition[1]) {
        isSnake = (pelletPosition[0] === this.nextPosition[0]) && (pelletPosition[1] === this.nextPosition[1])
      }

      if (isSnake) {
        this.setPelletPosition()
      } else {
        this.pelletPosition = pelletPosition
      }
    },
    retry () {
      this.initializeGame()
    },
    showLeaderboard () {
      if (this.name.trim().length === 0) {
        this.error = 'Please choose a name'
      } else {
        this.error = ''

        // connect to database
        const newScore = db.ref('snakeLeaderboard').push()
        newScore.set({
          name: this.name.trim(),
          travelled: this.tick,
          score: this.pelletCount
        })
        this.page = 'leaderboard'
      }
    },
    showChooseName () {
      this.page = 'chooseName'
    },
    onSwipeUp () {
      this.snakeNextDirections.push('up')
    },
    onSwipeRight () {
      this.snakeNextDirections.push('right')
    },
    onSwipeDown () {
      this.snakeNextDirections.push('down')
    },
    onSwipeLeft () {
      this.snakeNextDirections.push('left')
    }
  },
  watch: {
    tick () {
      this.getNextPosition()
      const collided = this.handleCollisions()

      if (!collided) {
        if (this.snakeGrowing) {
          this.snakeGrowing = false
        } else {
          this.snakePosition.pop()
        }
        this.snakePosition.unshift(this.nextPosition)
        this.paintBoard()
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Baloo');

html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed, 
figure, figcaption, footer, header, hgroup, 
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
	margin: 0;
	padding: 0;
	border: 0;
	font-size: 100%;
	font: inherit;
	vertical-align: baseline;
}

/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure, 
footer, header, hgroup, menu, nav, section {
	display: block;
}

ol, ul {
	list-style: none;
}

blockquote, q {
	quotes: none;
}

blockquote:before, blockquote:after,
q:before, q:after {
	content: '';
	content: none;
}

table {
	border-collapse: collapse;
	border-spacing: 0;
}

ul {
  list-style: none;
  display: block;
  margin: 0;
  padding: 0;
}

li {
  display: block;
}

h1 {
  font-size: 48pt;
  margin-top: 40px;
  margin-bottom: 10px;
  text-align: center;
}

h2 {
  font-size: 32pt;
  margin-bottom: 20px;
  text-align: center;
}

p {
  font-size: 24pt;
  margin-bottom: 10px;
  text-align: center;
}

button {
  margin-top: 20px;
  padding: 10px;
  font-family: 'Baloo', cursive;
  font-size: 24pt;
  line-height: 24pt;
  display: block;
  text-align: center;
  width: 100%;
  border-radius: 3px;
  background: #ddd;
}

button:hover {
  background: #ddd;
}

input {
  border: 1px solid #ddd;
  width: calc(100% - 20px);
  padding: 10px;
}

@media (max-width: 400px) {
  .game {
    width: calc(100% - 20px);
    margin: 0 auto;
  }
  .board {
    width: 240px;
    margin: 20px auto 0;
  }
}

@media (min-width: 401px) {
  .game {
    width: 240px;
    margin: 40px auto 0;
  }
}

.game {
  line-height: 1;
  font-family: 'Baloo', cursive;
}

.piece {
  width: 20px;
  height: 20px;
  margin: 2px;
  border-radius: 3px;
  background: #333;
}

.snake {
  background: pink
}
.pellet {
  background: gold;
}

.row {
  display: block;
  clear: both;
}

.row > li {
  display: block;
  clear: both;
}

.column li {
  float: left;
}

.pellet-count {
  float: left;
}

.distance-travelled {
  float: right;
}

.clearfix {
  clear: both;
}
</style>
