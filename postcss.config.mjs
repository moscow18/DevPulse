/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // هنا التغيير اللي هيشيل الـ Error
  },
};

export default config;