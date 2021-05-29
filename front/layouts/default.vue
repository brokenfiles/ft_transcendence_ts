<template>
  <div>
    <Navigation />
    <Sidebar @toggle="toggleSidebar"/>
    <client-only>
      <chat />
    </client-only>
    <div class="application bg-gray min-h-screen text-cream w-screen">
      <div class="md:w-11/12 md:mx-auto mx-4">
        <Nuxt />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Navigation from "~/components/Navigation.vue";
import Sidebar from "~/components/Sidebar.vue";
import Chat from "~/components/Chat/Chat.vue";
import {Component, namespace} from "nuxt-property-decorator";
import {Socket} from "vue-socket.io-extended";
import Ball from "~/components/Game/Pong/Ball.vue";
const onlineClients = namespace('onlineClients')

@Component({
  components: {
    Ball,
    Navigation,
    Sidebar,
    Chat,
  },
})
export default class Default extends Vue {

  sidebarExpanded: boolean = false

  toggleSidebar(state: boolean) {
    this.sidebarExpanded = state
  }

  mounted() {
    // define the ws token for the ws requests
    this.defineSocketToken()
    // when the user is connecting, we have also to define his token for ws requests
    this.$root.$on('beforeWsConnect', () => this.defineSocketToken())
    // by default, connect the user even if he is not authenticated
    this.$socket.client.connect()

  }

  /**
   * Used to define the token in socket requests
  **/
  defineSocketToken() {
    if (this.$auth.loggedIn) {
      const token = this.getTokenWithoutBearer
      this.$socket.client.io.opts.query = {
        token: token
      }
    }
  }

  /**
   * Returns the token without the bearer
   */
  get getTokenWithoutBearer(): string {
    const bearerToken = (this.$auth.strategy as any).token.get()
    if (bearerToken.length > 0) {
      const tokenParts = bearerToken.split(' ')
      if (tokenParts.length > 1) {
        if (tokenParts[0].toLowerCase() === 'bearer')
          return (tokenParts[1])
      } else if (tokenParts.length === 1 && tokenParts[0].toLowerCase() !== 'bearer') {
        return (tokenParts[0]);
      }
    }
    return ''
  }

  @onlineClients.Getter
  public clients!: number[]

  @onlineClients.Mutation
  public setClients!: (clients: number[]) => void

  /**
   * Send to the ws server that we are connected
   **/
  @Socket('connect')
  connectEvent() {
    if (process.client) {
      if (this.$auth && this.$auth.loggedIn && this.$auth.user) {
        // set set the token to socket.io client
        console.log("CIIZEIEIEIE")
        this.$socket.client.emit('userOnline', {
          userId: this.$auth.user.id
        })
      }
    }
  }

  /**
   * When a client status changed to online -> offline or inverse
   *
   * This function update online clients in the store
   * @param {number[]} clients
   */
  @Socket('onlineClientsUpdated')
  onlineClientUpdatedEvent(clients: number[]) {
    this.setClients(clients)
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

@media screen and (max-width: 768px) {
  .application {
    padding-left: 0;
  }
}

</style>
