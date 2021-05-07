<template>
  <div id="sidebar" class="fixed left-0 bottom-0 top-0 py-4 overflow-y-hidden whitespace-nowrap z-10 bg-primary text-cream">
    <ul class="sidebar-items">
      <li class="sidebar-item my-4">
        <div class="flex">
          <div class="item-img flex-shrink-0 text-4xl text-center">
            <font-awesome-icon :icon="['fas', 'play-circle']"></font-awesome-icon>
          </div>
          <div class="item-content pr-8 pl-4 font-semibold">
            <div class="item-link my-2 text-xl">
              <a href="#">Play</a>
            </div>
            <div class="item-link my-2">
              <div class="flex border-2 items-center rounded py-2 px-4">
                <input type="text" class="flex-1 outline-none bg-transparent" placeholder="Enter a code">
                <button class="focus:outline-none play-button">
                  <font-awesome-icon :icon="['fas', 'play']"></font-awesome-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </li>
      <li class="sidebar-item my-4">
        <div class="flex">
          <div class="item-img flex-shrink-0 text-4xl text-center">
            <font-awesome-icon :icon="['fas', 'users']"></font-awesome-icon>
          </div>
          <div class="item-content pr-8 pl-4 font-semibold">
            <div class="item-link my-2 text-xl">
              <a href="#">Guilds</a>
            </div>
            <div class="item-link my-2 text-xl">
              <a href="#">Create a guild</a>
            </div>
            <div class="item-link my-2 text-xl">
              <a href="#">Join a guild</a>
            </div>
          </div>
        </div>
      </li>
      <li class="sidebar-item my-4">
        <div class="flex">
          <div class="item-img flex-shrink-0 text-4xl text-center">
            <font-awesome-icon :icon="['fas', 'star']"></font-awesome-icon>
          </div>
          <div class="item-content pr-8 pl-4 font-semibold">
            <div class="item-link my-2 text-xl">
              <a href="#">Leaderboard</a>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: "Sidebar"
})
</script>

<style scoped>
#sidebar {
  top: 72px;
  max-width: 72px;
  transition: all 0.3s ease;
}

.item-img {
  width: 72px;
  @apply text-yellow;
}

.item-content {
  transition: max-height 0.3s ease;
  max-height: 0;
}

#sidebar:hover {
  max-width: 500px;
}

#sidebar:hover .item-content {
  max-height: 500px;
}
</style>
