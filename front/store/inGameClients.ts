import {Module, Mutation, VuexModule} from "vuex-module-decorators";

@Module({
  name: 'inGameClients',
  stateFactory: true,
  namespaced: true
})
export default class OnlineClients extends VuexModule {

  _inAGame: number[] = []

  @Mutation
  setClientsInAGame(inAGame: number[]): void {
    this._inAGame = inAGame
  }

  get inAGame(): number[] {
    return this._inAGame
  }

}
