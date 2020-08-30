const { isFlat, flattenPalette, normalizePalette } = require("../index");

const flatPalette = {
  "light-blue-10": "#d9e8f6",
  "light-blue-20": "#aacdec",
  "green-10": "#dfeacd",
  "green-20": "#b8d293",
  "white-0": "#ffffff",
  "black-100": "#000000",
};

const nestedPalette = {
  "light-blue": {
    "light-blue-10": "#d9e8f6",
    "light-blue-20": "#aacdec",
  },
  green: {
    "green-10": "#dfeacd",
    "green-20": "#b8d293",
  },
  white: {
    "white-0": "#ffffff",
  },
  black: {
    "black-100": "#000000",
  },
};

const normalizedPalette = [
  { family: "light-blue", grade: 10, hex: "#d9e8f6" },
  { family: "light-blue", grade: 20, hex: "#aacdec" },
  { family: "green", grade: 10, hex: "#dfeacd" },
  { family: "green", grade: 20, hex: "#b8d293" },
  { family: "white", grade: 0, hex: "#ffffff" },
  { family: "black", grade: 100, hex: "#000000" },
];

test("isFlat returns true for flat color palette definition", () => {
  expect(isFlat(flatPalette)).toBe(true);
});

test("isFlat returns false for nested color palette definition", () => {
  expect(isFlat(nestedPalette)).toBe(false);
});

test("flattens a nested palette", () => {
  expect(flattenPalette(nestedPalette)).toEqual(flatPalette);
});

test("normalizes a flat palette", () => {
  expect(normalizePalette(flatPalette)).toEqual(normalizedPalette);
});
