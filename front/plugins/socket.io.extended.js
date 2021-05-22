import Vue from 'vue';
import { io, protocol } from 'socket.io-client';
import VueSocketIOExt from 'vue-socket.io-extended';

const socket = io('http://localhost:81', {
  autoConnect: false
});

export default ({ store }) => {
  Vue.use(VueSocketIOExt, socket, { store });
}
