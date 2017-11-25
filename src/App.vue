<template>
  <div id='game'>
    <h1><span>S</span>nake</h1>

    <div v-if='playing === false'>
      <p>WASD or Arrow keys to move</p>

      <button v-on:click='start'>Start</button>
    </div>

    <div v-else>
      <div class='score' v-if='gameOver === false'>
        <div class='pellet-count'>Eaten {{ pelletCount }}</div>
        <div class='distance-travelled'>Travelled {{ tick }}</div>
        <div class='clearfix' />
      </div>

      <ul class='row' v-if='gameOver === false'>
        <li v-for='row in parseInt(rows)' :key='row' :id='"row-" + row'>
          <ul class='column'>
            <li
              v-for='column in parseInt(columns)'
              :key='row + "" + column'
              :id='row + "" + column'
            >
              <span v-if='boardState && boardState[row] && boardState[row][column]'>
                <div id="piece" :class='boardState[row][column].state'></div>
              </span>
            </li>
          </ul>
        </li>
      </ul>

      <div v-else class='game-over'>
        <h2><span>G</span>ame <span>O</span>ver</h2>

        <p>Pellets: <span>{{ pelletCount }}</span></p>
        <p>Spaces: <span>{{ tick }}</span></p>

        <button v-on:click='retry'>Retry</button>
      </div>
    </div>
  </div>
</template>

<script>
import Piece from '@/components/Piece'
export default {
  name: 'game',
  components: {
    Piece
  },
  data () {
    return {
      rows: 10,
      columns: 10,
      playing: false,
      snakePosition: [],
      snakeDirection: 'right',
      snakePrevDirection: 'right',
      snakeNextDirection: '',
      boardState: [],
      nextPosition: [],
      tick: 0,
      tickRate: 1000,
      tickFunction: () => {},
      pelletPosition: [],
      pelletCount: 0,
      snakeGrowing: false,
      gameOver: false
    }
  },
  created () {
    window.removeEventListener('keydown', this.onKeyPress)
    window.addEventListener('keydown', this.onKeyPress)
  },
  methods: {
    start () {
      this.playing = true
      this.initializeGame()
    },
    initializeGame () {
      this.setSnakePosition()
      this.snakeDirection = 'right'
      this.snakePrevDirection = 'right'
      this.snakeNextDirection = ''
      this.pelletPosition = []
      this.setPelletPosition()
      this.paintBoard()
      this.gameOver = false
      this.tickRate = 1000
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
      const nextDir = this.snakeNextDirection
      const prevDir = this.snakePrevDirection

      if (
        (nextDir === 'up' && prevDir === 'down') ||
        (nextDir === 'right' && prevDir === 'left') ||
        (nextDir === 'down' && prevDir === 'up') ||
        (nextDir === 'left' && prevDir === 'right')
      ) {
        this.snakeNextDirection = ''
      }
    },
    getNextPosition () {
      const snakeHead = this.snakePosition[0]
      let hPos = snakeHead[0]
      let wPos = snakeHead[1]

      this.preventReverseDirection()

      if (this.snakeNextDirection.length > 0) {
        this.snakeDirection = this.snakeNextDirection
        this.snakeNextDirection = ''
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

      if (this.snakePosition.find(el => (nextPosition[0] === el[0] && nextPosition[1] === el[1]))) {
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
        this.gameOver = true
        return true
      } else if (collided === 'pellet') {
        this.boardState[this.pelletPosition[0]][this.pelletPosition[1]].state = 'empty'
        this.snakeGrowing = true

        if (this.tickRate > 200) {
          this.tickRate = this.tickRate - 50
        } else if (this.tickRate > 100) {
          this.tickRate = this.tickRate - 10
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
          this.snakeNextDirection = 'up'
          break
        case 'right':
        case 'd':
          this.snakeNextDirection = 'right'
          break
        case 'down':
        case 's':
          this.snakeNextDirection = 'down'
          break
        case 'left':
        case 'a':
          this.snakeNextDirection = 'left'
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

<style>
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
body {
	line-height: 1;
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

body {
  background: #000;
  color: #fff;
  font-family: 'Baloo', cursive;
}

h1 {
  font-size: 48pt;
  margin-bottom: 10px;
}

span {
  color: lightgreen;
}

h2 {
  font-size: 36pt;
  margin-bottom: 20px;
}

p {
  font-size: 24pt;
  margin-bottom: 10px;
}

#game {
  width: 260px;
  margin: 40px auto 0;
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

button {
  margin-top: 20px;
  padding: 10px;
  font-family: 'Baloo', cursive;
  font-size: 24pt;
  line-height: 24pt;
}

button:hover {
  background: #ddd;
}

#piece {
  width: 20px;
  height: 20px;
  border: 1px solid #000;
  margin: 2px;
  border-radius: 3px;
}
#piece.empty {
  background: #333;
}
#piece.pellet {
  background: orangered;
}
#piece.snake {
  background: lightgreen;
}

</style>
