<template>
  <div>
    <Navigation />
    <Sidebar />
    <client-only>
      <chat />
    </client-only>
    <div class="application bg-gray min-h-screen text-cream">
      <Nuxt />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Navigation from "~/components/Navigation.vue";
import Sidebar from "~/components/Sidebar.vue";
import Chat from "~/components/Chat/Chat.vue";
import {mapGetters} from "vuex";
import {Component} from "nuxt-property-decorator";
import {Socket} from "vue-socket.io-extended";

@Component({
  components: {
    Navigation,
    Sidebar,
    Chat,
  },

})
export default class Default extends Vue {

  mounted() {
    this.$socket.client.connect()
  }

  @Socket('connect')
  connectEvent() {
    if (process.client) {
      if (this.$auth && this.$auth.loggedIn && this.$auth.user) {
        this.$socket.client.emit('loggedIn', {
          userId: this.$auth.user.id
        })
      }
    }
  }

}
</script>

<style>
html {
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}

.application {
  padding-left: 72px;
  padding-top: 72px;
}

</style>
