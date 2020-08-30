#!/usr/bin/env node

const { readFileSync } = require("fs");

const logger = require("@darekkay/logger");

const { cli, enhance } = require("../src/cli");
const index = require("../src/index");

cli
  .positional("<file>", { paramsDesc: "Color palette file" })
  .number("--min-ratio-3", { desc: "Verify magic number for ratio 3" })
  .number("--min-ratio-4.5", { desc: "Verify magic number for ratio 4.5" })
  .number("--min-ratio-7", { desc: "Verify magic number for ratio 7" });
enhance(cli);

module.exports = index;

async function main() {
  const argv = await cli.parseAndExit();

  try {
    const fileContent = readFileSync(argv.file, "utf-8");
    index.run(JSON.parse(fileContent), argv);
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}

if (require.main === module) main();
