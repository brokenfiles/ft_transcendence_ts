const config = {
    authorizedImageFormats: [
        'png', 'jpg', 'gif'
    ],
    cdn: {
        limits: {
            user: 1,
            moderator: 10,
            administrator: 100,
        }
    },
    guilds: {
        limits: {
            users: 50
        }
    }
}

export default config


