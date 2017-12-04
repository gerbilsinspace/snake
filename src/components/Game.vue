<template>
  <v-touch
    class='game'
    v-on:swipeup='onMoveUp'
    v-on:swiperight='onMoveRight'
    v-on:swipedown='onMoveDown'
    v-on:swipeleft='onMoveLeft'
  >
    <h1><span>S</span>nake</h1>

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
                <div class='empty piece' v-if='boardState[row][column].state === "empty"' />
                <div class='snake piece' v-if='boardState[row][column].state === "snake"' />
                <div class='pellet piece' v-if='boardState[row][column].state === "pellet"' />
              </span>
            </li>
          </ul>
        </li>
        <div class='clearfix' />
      </ul>
    </div>

    <div v-if='page === "gameOver"' class='game-over'>
      <h2><span>G</span>ame <span>O</span>ver</h2>

      <p>Pellets: <span>{{ pelletCount }}</span></p>
      <p>Spaces: <span>{{ tick }}</span></p>

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
import Leaderboard from './Leaderboard'
import { db } from '../firebase'

export default {
  name: 'game',
  components: {
    Leaderboard
  },
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
        return Object.keys(this.leaderboard).sort((a, b) => {
          const aArray = a.split('.')
          const bArray = b.split('.')

          if (aArray[0] !== bArray[0]) {
            return this.compareNumbers(aArray[0], bArray[0])
          } else if (aArray[1] !== bArray[1]) {
            return this.compareNumbers(aArray[1], bArray[1]) * -1
          } else {
            if (aArray[2].toLowerCase() < bArray[2].toLowerCase()) {
              return 1
            } else if (aArray[2].toLowerCase() > bArray[2].toLowerCase()) {
              return -1
            } else {
              return 0
            }
          }
        })
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
          this.onMoveUp()
          break
        case 'right':
        case 'd':
          this.onMoveRight()
          break
        case 'down':
        case 's':
          this.onMoveDown()
          break
        case 'left':
        case 'a':
          this.onMoveLeft()
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
    onMoveUp () {
      this.snakeNextDirections.push('up')
    },
    onMoveRight () {
      this.snakeNextDirections.push('right')
    },
    onMoveDown () {
      this.snakeNextDirections.push('down')
    },
    onMoveLeft () {
      this.snakeNextDirections.push('left')
    },
    compareNumbers (a, b) {
      return (a - b) * -1
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