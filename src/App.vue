<template>
  <div id="app">
    <Game />
  </div>
</template>

<script>
import Game from '@/components/Game'
export default {
  name: 'app',
  components: {
    Game
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
