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
      const contrastRatio = onecolor(color1.hex).contrast(onecolor(color2.hex));

      if (color1.grade > color2.grade) {
        return; // don't compare same colors to each other
      }

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

/** Create an array of { family, grade, hex } values */
const normalizePalette = (flatPalette) =>
  Object.entries(flatPalette).reduce(
    (accumulator2, [name, hex]) => [
      ...accumulator2,
      {
        family: name.substring(0, name.lastIndexOf("-")),
        grade: parseInt(name.substring(name.lastIndexOf("-") + 1), 10),
        hex,
      },
    ],
    []
  );

const run = (colors, config) => {
  logger.info(`${green("Analyzing")}: ${config.file}`);

  const flatPalette = isFlat(colors) ? colors : flattenPalette(colors);
  const normalizedPalette = normalizePalette(flatPalette);
  const magicNumbers = calculateMagicNumbers(normalizedPalette);

  logger.log(`${green("Colors:")} ${normalizedPalette.length}`);
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

  logger.log(); // new line at the end

  if (hasViolations) process.exit(1);
};

module.exports = {
  run,
  isFlat,
  flattenPalette,
  normalizePalette,
};
