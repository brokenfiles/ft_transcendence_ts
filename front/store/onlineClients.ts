import {Module, Mutation, VuexModule} from "vuex-module-decorators";
import {Getter, State} from "nuxt-property-decorator";

@Module({
  name: 'onlineClients',
  stateFactory: true,
  namespaced: true
})
export default class OnlineClients extends VuexModule {

  _clients: number[] = []

  @Mutation
  setClients(clients: number[]): void {
    this._clients = clients
  }

  get clients(): number[] {
    return this._clients
  }

}
