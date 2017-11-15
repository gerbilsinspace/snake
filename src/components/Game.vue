<template>
  <div id='game'>
    <ul class='row'>
      <li v-for='row in parseInt(rows)' :key='row' :id='"row-" + row'>
        <ul class='column'>
          <li
            v-for='column in parseInt(columns)'
            :key='row + "" + column'
            :id='row + "" + column'
          >
            <span v-if='boardState && boardState[row] && boardState[row][column]'>
              <Piece :state='boardState[row][column].state || {}' />
            </span>
          </li>
        </ul>
      </li>
    </ul>
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
      snakeDirection: 'right',
      nextSnakeDirection: '',
      boardState: [],
      nextPosition: [],
      tick: 0,
      tickRate: 1000,
      tickFunction: () => {},
      pelletPosition: [],
      snakeGrowing: false
    }
  },
  computed: {
    snakePosition () {
      let result = []
      const row = Math.floor(this.rows / 2)
      const column = Math.floor(this.columns / 2)
      result[result.length] = [row, column]
      return result
    }
  },
  props: ['columns', 'rows'],
  created () {
    this.setPelletPosition()
    window.addEventListener('keyup', this.onKeyUp)
    this.tickFunction = window.setInterval(() => {
      this.tick++
    }, this.tickRate)
  },
  methods: {
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
    getNextPosition () {
      const snakeHead = this.snakePosition[0]
      let hPos = snakeHead[0]
      let wPos = snakeHead[1]

      if (this.nextSnakeDirection.length > 0) {
        this.snakeDirection = this.nextSnakeDirection
        this.nextSnakeDirection = ''
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
      }

      if ((collided === 'wall') || (collided === 'snake')) {
        // game over
        window.clearInterval(this.tickFunction)
        return true
      } else if (collided === 'pellet') {
        this.boardState[this.pelletPosition[0]][this.pelletPosition[1]].state = 'empty'
        this.snakeGrowing = true
        if (this.tickRate > 100) {
          this.tickRate = this.tickRate - 50
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
    onKeyUp (event) {
      const nextDirection = event.code.toLowerCase().replace('arrow', '')
      switch (nextDirection) {
        case 'up':
        case 'right':
        case 'down':
        case 'left':
          if (
            ((nextDirection === 'up') && (this.snakeDirection === 'down')) ||
            ((nextDirection === 'right' && this.snakeDirection === 'left')) ||
            ((nextDirection === 'down' && this.snakeDirection === 'up')) ||
            ((nextDirection === 'left' && this.snakeDirection === 'right'))
          ) {
            return
          }
          this.snakeDirection = nextDirection
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
</style>
