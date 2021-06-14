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
    }
}

export default config


