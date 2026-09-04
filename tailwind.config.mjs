/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        tinta: '#2E4257',
        azul: { DEFAULT: '#C6D7E4', claro: '#DCE7F0', pálido: '#EDF3F8' },
        crema: '#F7EFE3',
        hueso: '#FBFAF7',
        durazno: '#F0C9B4',
        rosa: '#C79098',
        salvia: '#8A9A78',
        limón: '#F0D078',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        cuerpo: ['Jost', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        ancho: '0.18em',
        anchísimo: '0.32em',
      },
      maxWidth: { lectura: '62ch' },
    },
  },
  plugins: [],
};
