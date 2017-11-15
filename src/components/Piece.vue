<template>
  <div id="piece" :class='state'></div>
</template>

<script>
export default {
  name: 'piece',
  data () {
    return {
      playerColour: 'green',
      pelletColour: 'yellow',
      emptyColour: 'white'
    }
  },
  components: {
  },
  props: ['state']
}
</script>

<style>
  #piece {
    width: 20px;
    height: 20px;
    border: 1px solid #000;
    margin: 2px;
  }
  #piece.empty {
    background: #fff;
  }
  #piece.pellet {
    background: yellow;
  }
  #piece.snake {
    background: green;
  }
</style>
