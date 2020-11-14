const onecolor = require("onecolor");
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
  { family: "light-blue", grade: 10, value: "#d9e8f6" },
  { family: "light-blue", grade: 20, value: "#aacdec" },
  { family: "green", grade: 10, value: "#dfeacd" },
  { family: "green", grade: 20, value: "#b8d293" },
  { family: "white", grade: 0, value: "#ffffff" },
  { family: "black", grade: 100, value: "#000000" },
].map((color) => ({ ...color, onecolorValue: onecolor(color.value) }));

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
