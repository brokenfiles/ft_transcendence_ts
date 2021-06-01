module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: '#111927',
        secondary: '#141F31',
        cream: '#EEEBDE',
        yellow: '#FFDA18',
        ftgray: '#1d242c',
        fortytwo: '#00babc',
        // online status colors
        onlineGreen: '#27AE60',
        offlineGray: '#BDBDBD',
        // friends
        friend: {
          200: '#6FCF97',
          500: '#005F28'
        },
        notFriend: {
          200: '#F2C94C',
          500: '#AA3028'
        }
      },
      backgroundImage: {
        transGradient: 'linear-gradient(90deg, #A831D1 -2.11%, #B81261 100%)'
      },
      borderWidth: {
        '10': '10px'
      },
      fontSize: {
        xxs: ['0.65rem', '0.80rem']
      },
      boxShadow: {
        tabSelected: 'inset 0 2px 7px 0 rgba(0, 0, 0, 0.5)',
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
