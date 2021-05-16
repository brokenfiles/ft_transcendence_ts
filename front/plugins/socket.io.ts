import Vue from "vue"
import VueSocketIO from "vue-socket.io"

Vue.use(new VueSocketIO({
  debug: true,
  connection: 'http://localhost:81',
  // connection: 'http://192.168.1.32:81',
}))
