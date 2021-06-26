<template>
	<div>
		<Navigation/>
		<Sidebar @toggle="toggleSidebar"/>
		<client-only>
			<chat v-if="canViewChat"/>
			<game-notification/>
		</client-only>
		<div class="application bg-ftgray min-h-screen text-cream w-screen">
			<div class="md:w-11/12 md:mx-auto mx-4">
				<Nuxt/>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import Navigation from "~/components/Navigation/Navigation.vue";
import Sidebar from "~/components/Sidebar.vue";
import Chat from "~/components/Chat/Chat.vue";
import {Component, namespace} from "nuxt-property-decorator";
import {Socket} from "vue-socket.io-extended";
import {NotifyOptions} from "~/utils/interfaces/notifications/notify.options.interface";
import GameNotification from "~/components/Game/GameNotification.vue";

const onlineClients = namespace('onlineClients')

@Component({
	components: {
		GameNotification,
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
			const token = this.getRefreshTokenWithoutBearer()
			this.$socket.client.io.opts.query = {
				token
			}
		}
	}

	/**
	 * Returns the token without the bearer
	 */
	getRefreshTokenWithoutBearer(): string {
		const bearerToken = (this.$auth.strategy as any).refreshToken.get()
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

	/** Computed */
	get canViewChat() {
		if (process.client)
			return (this.$auth.loggedIn && this.$socket && this.$socket.connected)
		return false
	}

	@onlineClients.Getter
	public clients!: number[]

	@onlineClients.Mutation
	public setClients!: (clients: number[]) => void

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

	/**
	 * Notification system from the backend
	 * @param options
	 */
	@Socket("notification")
	notificationEvent(options: NotifyOptions) {
		this.$toast.info(options.message)
		// check when the user receive the notification, we have to re-fetch the user
		if (this.$auth.loggedIn && options.fetchClient) {
			this.$auth.fetchUser()
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
	padding-bottom: 72px;
}

@media screen and (max-width: 768px) {
	.application {
		padding-left: 0;
	}
}

</style>
