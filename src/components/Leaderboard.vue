<template>
  <div id='leaderboard'>
    <h2><span :style='textColour'>L</span>eaderboard</h2>
    {{ name }}
  </div>
</template>

<script>
export default {
  name: 'leaderboard',
  props: [
    'textColour',
    'name'
  ]
}
</script>
