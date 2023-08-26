const colorConvert = require("color-convert");
const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./src/**/*.js"],
  theme: {
    extend: {
      colors: {
        brand: brandPalette(),
      },
    },
  },
  plugins: [],
};

function brandPalette() {
  const palette = {};
  for (const [k, v] of Object.entries(colors.slate)) {
    palette[k] = desaturateHex(v, 1.5);
  }
  return palette;
}

function desaturateHex(hex, exponent) {
  let [h, s, l] = colorConvert.hex.hsl(hex);
  s = 100 * Math.pow(s / 100, exponent);
  return "#" + colorConvert.hsl.hex(h, s, l).toLowerCase();
}
