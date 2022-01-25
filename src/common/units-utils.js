const units = {
  feet: {
    fr: "pied",
    en: "feet",
  },
  meter: {
    fr: "mètre",
    en: "meter",
  },
};
const unitsShort = {
  foot: {
    fr: "pied",
    en: "ft",
  },
  meter: {
    fr: "m",
    en: "m",
  },
};
let conversionFunctions = {
  meter: function (value) {
    return Math.round(value * 0.3048 * 100) / 100;
  },
  foot: function metersToFeet(value) {
    return Math.round((value / 0.3048) * 100) / 100;
  },
};

export { conversionFunctions, unitsShort};
