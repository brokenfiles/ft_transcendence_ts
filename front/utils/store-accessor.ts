import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import OnlineClients from '~/store/onlineClients'

let onlineClients: OnlineClients

function initialiseStores(store: Store<any>): void {
  onlineClients = getModule(OnlineClients, store)
}

export { initialiseStores, OnlineClients }
