<template>
	<div class="relative">
		<div class="flex flex-col items-center w-full mt-12" v-if="user">
			<avatar class="h-24 w-24" :image-url="user.avatar">
				<image-uploader v-if="this.$auth.loggedIn && this.$auth.user.id === user.id"
								@imageUploaded="changeAvatar" class="absolute top-0 left-0"/>
				<user-online-icon class="absolute h-7 w-7 top-0 right-0" :is-online="isOnline"/>
			</avatar>
			<h1 class="font-semibold mt-2 text-2xl">
				<nuxt-link class="text-yellow" :to="`/guilds/${guild.anagram}`" v-if="guild">[{{ guild.anagram }}]
				</nuxt-link>
				<editable-field tag="div" classes="inline-block"
								:editable="this.$auth.loggedIn && this.$auth.user.id === user.id"
								:value="user.display_name" @stopEditing="saveDisplayName"/>
			</h1>
			<div v-if="guild && guild.owner">
				<p>{{ guild.owner.id === user.id ? 'Owner' : 'Officer' }} in {{ guild.name }}</p>
			</div>
			<div v-if="user.role !== 'user'">
				<p>ft_transcendence's {{ user.role }}</p>
			</div>
			<p>
				elo : {{ user.elo }}
			</p>
      <admin-button :user="user" v-if="isNotUser" class="mt-2 text-sm block md:absolute top-0 left-0"
                    @adminActionPerformed="refetchUser"/>
      <level-bar class="my-4" :points="user.points"/>
      <div class="absolute top-0 right-0">
        <friend-button v-if="this.$auth.loggedIn && this.$auth.user.id !== user.id" @update="updateFriend"
                 class="mt-2 text-sm block relative mb-4"
                 :friend-state="friendState"/>
        <div v-if="(this.$auth.loggedIn && this.$auth.user.id !== user.id) && this.clients.includes(this.user.id)">
          <button @click="challengeUser" class="relative bg-blue-300 text-blue-800 text-sm px-10 py-3 text-center uppercase font-bold rounded-md focus:outline-none mb-4">
            Challenge {{ this.user.display_name }}
            <span class="text-xxs block">(click to challenge)</span>
          </button>
        </div>
        <div v-if="this.$auth.loggedIn && this.$auth.user.id !== user.id">
          <button @click="blockUser" class="relative bg-red-300 text-red-800 text-sm px-10 py-3 text-center uppercase font-bold rounded-md focus:outline-none w-full">
            <span v-if="!this.userIsBlocked">
              Block {{ this.user.display_name }}
              <span class="text-xxs block">(click to block)</span>
            </span>
            <span v-if="this.userIsBlocked">
              Unblock {{ this.user.display_name }}
              <span class="text-xxs block">(click to unblock)</span>
            </span>
          </button>
		</div>
<!--		  <button class="relative bg-red-300 text-red-800 text-sm px-10 py-3 text-center uppercase font-bold rounded-md focus:outline-none w-full" @click="inviteToChat">Invite to Chat</button>-->

	  </div>
			<div class="flex flex-wrap justify-center my-2 mb-4 w-full md:w-2/3" v-if="statistics">
				<!--statistics-->
				<statistic class="w-1/3 md:w-1/3 lg:w-1/5 xl:w-1/6" unity="wins" :value="statistics.wins"/>
				<statistic class="w-1/3 md:w-1/3 lg:w-1/5 xl:w-1/6" unity="loses" :value="statistics.loses"/>
				<statistic class="w-1/3 md:w-1/3 lg:w-1/5 xl:w-1/6" unity="matchs" :value="statistics.finished"/>
				<statistic class="w-1/3 md:w-1/3 lg:w-1/5 xl:w-1/6" unity="ratio" :value="ratio.toFixed(2)"/>
			</div>
			<div class="flex flex-wrap items-center justify-center space-x-2">
				<!--achievements-->
				<achievement v-for="(achievement, index) in user.achievements" :key="`achievement-${index}`"
							 :name="achievement.name" :description="achievement.description"
							 :color="achievement.color"/>
			</div>
			<div class="w-full flex flex-wrap items-center">
				<single-game v-for="(game, index) in games" :key="`game-${index}`" :user="$auth.user"
							 :is-full-display="false" :game="game" class="w-full md:w-1/2"/>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import Avatar from "~/components/User/Profile/Avatar.vue";
import LevelBar from "~/components/User/Profile/LevelBar.vue";
import UserOnlineIcon from "~/components/User/Profile/UserOnlineIcon.vue";
import {Component, namespace} from "nuxt-property-decorator";
import Achievement from "~/components/User/Profile/Statistics/Achievement.vue";
import Statistic from "~/components/User/Profile/Statistics/Statistic.vue";
import EditableField from "~/components/Core/Editable/EditableField.vue";
import FriendButton from "~/components/User/Profile/FriendButton.vue";
import {FriendState} from "~/utils/enums/friend-state.enum";
import {NotifyOptions} from "~/utils/interfaces/notifications/notify.options.interface";
import {Socket} from "vue-socket.io-extended";
import {Context} from "@nuxt/types";
import AdminButton from "~/components/User/Admin/AdminButton.vue";
import {Role} from "~/utils/enums/role.enum";
import ImageUploader from "~/components/User/Profile/ImageUploader.vue";
import SingleGame from "~/components/Game/Records/SingleGame.vue";
import {GameInterface} from "~/utils/interfaces/game/game.interface";

const onlineClients = namespace('onlineClients')

interface ImageInterface {
	uuid: string
	extension: string
}

@Component({
	components: {
		Avatar,
		LevelBar,
		UserOnlineIcon,
		Achievement,
		Statistic,
		EditableField,
		FriendButton,
		AdminButton,
		ImageUploader,
		SingleGame
	},
})
export default class Account extends Vue {

	/** Variables */
	guild: any = null
	user: any = null
	statistics: any = null
	games: GameInterface[] = []
	gamePage: number = 0
	connected: boolean = false
	friendRequests: any[] = []
	userIsBlocked: boolean = false

	baseUrl?: string = process.env.baseUrl

	@onlineClients.Getter
	clients!: number[]

	async validate({params}: Context) {
		return (params.login.length >= 3 && params.login.length <= 16)
	}

	mounted() {
		if (this.$auth.loggedIn)
			this.$auth.fetchUser()
		document.addEventListener('scroll', this.scrollEvent)
	}

	beforeDestroy() {
		document.removeEventListener('scroll', this.scrollEvent)
	}

	async scrollEvent() {
		if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
			if (this.$fetchState.pending)
				return;
			this.gamePage++
			const newGames = await this.$axios.$get(`games/users/${this.user.id}?page=${this.gamePage}`, {
				progress: false
			})
			for (const game of newGames) {
				this.games.push(game)
			}
		}
	}

	async asyncData({app, params, error}: Context) {
		const user = await app.$axios.$get(`/users?login=${params.login}`)
			.catch(() => {
				error({
					statusCode: 404,
					message: 'This user does not exist'
				})
			})
		return ({user})
	}

	async fetch() {
		if (this.user.guild)
			this.guild = await this.$axios.$get(`guilds/${this.user.guild.id}`)
		this.games = await this.$axios.$get(`games/users/${this.user.id}?page=${this.gamePage}`)
		this.statistics = await this.$axios.$get(`games/statistics/${this.user.id}`)
		this.userIsBlocked = await this.$axios.$get(`chat/isblocked/${this.user.id}`).then((e) => (e.blocked))
		if (this.$auth.loggedIn)
			await this.fetchRequests()
	}

	changeAvatar(image: ImageInterface) {
		const avatar = `${this.baseUrl}/cdn/${image.uuid}${image.extension}`
		this.$axios.patch(`users/me`, {
			avatar
		}).then(() => {
			this.$toast.success(`Avatar successfully changed`)
			this.$auth.fetchUser()
			this.user.avatar = avatar
		}).catch((err) => {
			this.$toast.error(err.response.data.message[0])
		})
	}

	blockUser() {
		this.$axios.$get(`/chat/block/${this.user.id}`).then((res) => {
			if (res.blocked)
				this.$toast.success(`${this.user.display_name} blocked !`)
			else
				this.$toast.success(`${this.user.display_name} unblocked !`)
			this.userIsBlocked = res.blocked
		}).catch((e) => {
			this.$toast.error(`Cannot block user ${this.user.display_name}`)
		})

	}

	inviteToChat()
	{
		this.$socket.client.emit('createChannel', {
			name: "privatechannel",
			privacy: "private",
			users: [this.user.id],
			password: false
		})
		this.$toast.success(`You created the channel privatechannel`)
		this.$emit('createdChannel', {
			channel: "privatechannel"
		})
	}

	/**
	 * Event when the user saves the display name
	 * Send a request to backend to change the display_name
	 * @param {String} newDisplayName
	 */
	saveDisplayName(newDisplayName: string) {
		this.$axios.patch('/users/me', {
			display_name: newDisplayName
		}).then((result) => {
			this.$toast.success(`Your new display name is ${result.data.display_name}`)
			this.user.display_name = result.data.display_name
			//refresh the user
			this.$auth.fetchUser()
		}).catch((error) => {
			this.$toast.error(`${error.response.data.message[0]}`)
		})
	}

	/**
	 * Event when the user request or remove the friend
	 * @param {FriendState} friendState
	 */
	async updateFriend(friendState: FriendState) {
		if (friendState === FriendState.NOT_FRIEND) {
			this.$axios.post(`friends/requests`, {
				requested: {
					id: this.user.id
				}
			}).then((result) => {
				this.$toast.success('Your friend request has been sent')
				this.friendRequests.push(result.data)
			}).catch((err) => {
				this.$toast.error(err.response.data.error)
			})
		} else if (friendState === FriendState.FRIEND) {
			this.$axios.delete(`friends`, {
				data: {
					friend: {
						id: this.user.id
					}
				}
			}).then(() => {
				this.$toast.success(`${this.user.display_name} is no longer your friend`)
				this.$auth.fetchUser()
			}).catch((err) => {
				this.$toast.error(err.response.data.error)
			})
		} else if (friendState === FriendState.PENDING_REQUESTED) {
			this.$axios.post(`friends/accept`, {
				requester: {
					id: this.user.id
				}
			}).then(() => {
				this.$toast.success(`${this.user.display_name} is now your friend`)
				this.$auth.fetchUser()
			}).catch((err) => {
				this.$toast.error(err.response.data.error)
			})
		}
		await this.fetchRequests()
	}

	async refetchUser() {
		this.user = await this.$axios.$get(`/users?login=${this.user.login}`)
	}

	/**
	 * Fetch the requests
	 */
	async fetchRequests() {
		this.friendRequests = await this.$axios.$get(`/friends/requests`)
	}

	/**
	 * Getter (isOnline)
	 */
	get isOnline(): boolean {
		return (this.user && this.clients.indexOf(this.user.id) !== -1)
	}

	/**
	 * Is friend with user
	 */
	get friendState(): FriendState {
		if (!this.$auth.loggedIn) return FriendState.NOT_FRIEND
		const friends = (this.$auth.user as any).friends
		if ((friends as any[]).map(friend => friend.id).indexOf(this.user.id) !== -1)
			return FriendState.FRIEND
		if (this.friendRequests.filter(req => req.requester.id === this.user.id).length > 0)
			return FriendState.PENDING_REQUESTED
		if (this.friendRequests.filter(req => req.requested.id === this.user.id).length > 0)
			return FriendState.PENDING_REQUESTER
		return FriendState.NOT_FRIEND
	}

	/**
	 * Is not User
	 */
	get isNotUser(): boolean {
		if (this.$auth.user && this.$auth.user.id === this.user.id)
			return false
		return (this.$auth.user && this.$auth.user.role !== Role.User)
	}

	get ratio(): number {
		if (this.statistics) {
			const stats = this.statistics as any
			if (stats.loses === 0 || stats.wins === 0)
				return 0
			return stats.wins / stats.loses
		}
		return 0
	}

	/**
	 * Overload the default notification system
	 * When we are on this page, if we receive a notification, we re-fetch the requests as well
	 * @param options
	 */
	@Socket("notification")
	async notificationEventOverload(options: NotifyOptions) {
		if (this.$auth.loggedIn && options.fetchClient) {
			await this.fetchRequests()
		}
	}

}
</script>

<style scoped>

</style>
