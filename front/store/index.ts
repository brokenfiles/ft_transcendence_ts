import { Store } from 'vuex'
import { initialiseStores } from '~/utils/store-accessor'
import {UserInterface} from "~/utils/interfaces/users/user.interface";
const initializer = (store: Store<any>) => initialiseStores(store)
export const plugins = [initializer]
export * from '~/utils/store-accessor'

export const getters = {
  isAuthenticated(state: any) {
    return state.auth.loggedIn
  },

  loggedInUser(state: any): UserInterface {
    return state.auth.user
  }
}
