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
