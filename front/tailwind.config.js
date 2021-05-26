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
        gray: '#1d242c',
        fortytwo: '#00babc',
        // online status colors
        onlineGreen: '#27AE60',
        offlineGray: '#BDBDBD',
      },
      backgroundImage: {
        transGradient: 'linear-gradient(90deg, #A831D1 -2.11%, #B81261 100%)'
      },
      borderWidth: {
        '10': '10px'
      },
      outline: {
        cream: '1px dotted #EEEBDE'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
