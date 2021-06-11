export default function ({ store, redirect }) {
  if (!store.state.auth.loggedIn) {
    const user = store.state.auth.user
    if (!user.guild)
      return redirect('/')
  }
}
