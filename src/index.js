/** This script analyzes multiple color palettes to find/check whether there is a "magic number" between two color grades that ensures a sufficient WCAG contrast ratio */
const onecolor = require("onecolor");
const { green, cyan, yellow, red } = require("kleur");
const logger = require("@darekkay/logger");

const ratios = {
  "min-ratio-3": {
    description: "(WCAG AA, large text)",
    minRatio: 3,
  },
  "min-ratio-4.5": {
    description: "(WCAG AA, normal text / WCAG AAA, large text)",
    minRatio: 4.5,
  },
  "min-ratio-7": {
    description: "(WCAG AAA, normal text)",
    minRatio: 7,
  },
};

const verifyContrastRatio = (palette, magicNumber) => {
  const violations = [];

  palette.forEach((color1) => {
    palette.forEach((color2) => {
      if (color1.grade > color2.grade) {
        return; // don't compare same colors to each other
      }

      const contrastRatio = color1.onecolorValue.contrast(color2.onecolorValue);

      if (Math.abs(color1.grade - color2.grade) >= magicNumber.value) {
        if (contrastRatio < magicNumber.ratio) {
          violations.push({ color1, color2, contrastRatio });
        }
      }
    });
  });

  return violations;
};

const calculateMagicNumbers = (palette) => {
  const magicNumbers = {};

  Object.entries(ratios).forEach(([level, { minRatio }]) => {
    for (let i = 10; i < 100; i += 10) {
      const violations = verifyContrastRatio(palette, {
        value: i,
        ratio: minRatio,
      });
      if (violations.length === 0) {
        magicNumbers[level] = i;
        return;
      }
    }
    magicNumbers[level] = "-";
  });

  return magicNumbers;
};

const isFlat = (colors) => typeof Object.values(colors)[0] !== "object";

const flattenPalette = (nestedPalette) =>
  Object.values(nestedPalette).reduce(
    (accumulator, colors) => ({ ...accumulator, ...colors }),
    {}
  );

/** Create an array of { family, grade, value } values */
const normalizePalette = (flatPalette) =>
  Object.entries(flatPalette).reduce(
    (accumulator2, [name, value]) => [
      ...accumulator2,
      {
        family: name.substring(0, name.lastIndexOf("-")),
        grade: parseInt(name.substring(name.lastIndexOf("-") + 1), 10),
        value,
        onecolorValue: onecolor(value.trim()),
      },
    ],
    []
  );

const removeInvalidColors = (palette) => {
  return palette.filter((color) => {
    if (!color.onecolorValue) {
      logger.error(
        `Color ${color.family}-${color.grade} is invalid: '${color.value}'`
      );
    }
    return !!color.onecolorValue;
  });
};

const calculateValidColorCombinations = (palette, ratio) => {
  const combinations = [];

  palette.forEach((color1) => {
    palette.forEach((color2) => {
      if (color1.grade > color2.grade) {
        return; // don't compare same colors to each other
      }

      const contrastRatio = color1.onecolorValue.contrast(color2.onecolorValue);
      if (contrastRatio > ratio) {
        combinations.push([color1.value, color2.value]);
      }
    });
  });

  return combinations;
};

const run = (colors, config) => {
  logger.info(`${green("Analyzing")}: ${config.file}`);

  const flatPalette = isFlat(colors) ? colors : flattenPalette(colors);
  const normalizedPalette = normalizePalette(flatPalette);
  const validPalette = removeInvalidColors(normalizedPalette);
  const magicNumbers = calculateMagicNumbers(validPalette);

  logger.log(`${green("Colors:")} ${validPalette.length}`);
  logger.log(green("Magic numbers:"));
  Object.entries(magicNumbers).forEach(([grade, magicNumber]) => {
    logger.log(
      ` - ${cyan(
        `Contrast ratio >= ${ratios[grade].minRatio.toString().padEnd(3)}`
      )} : ${magicNumber} ${yellow(ratios[grade].description)}`
    );
  });

  let hasViolations = false;
  Object.entries(ratios).forEach(([level, ratio]) => {
    if (config[level] !== undefined) {
      const violations = verifyContrastRatio(normalizedPalette, {
        value: config[level],
        ratio: ratio.minRatio,
      });
      if (violations.length > 0) {
        logger.log(red(`Violations (${level}):`));
        violations.forEach(({ color1, color2, contrastRatio }) =>
          logger.log(
            ` - ${cyan(
              `${color1.family}-${color1.grade} / ${color2.family}-${color2.grade}`
            )} (${contrastRatio})`
          )
        );
        hasViolations = true;
      }
    }
  });

  if (config.combinations) {
    logger.log(green("Valid color combinations:"));
    const combinations = calculateValidColorCombinations(validPalette, 4.5);
    combinations.forEach((combination) => logger.log(combination));
  }

  logger.log(); // new line at the end

  if (hasViolations) process.exit(1);
};

module.exports = {
  run,
  isFlat,
  flattenPalette,
  normalizePalette,
};
