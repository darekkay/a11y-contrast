#!/usr/bin/env bash

../bin/a11y-contrast.js black-white.json
../bin/a11y-contrast.js ibm-v2.1.json --min-ratio-3=40 --min-ratio-4.5=50 --min-ratio-7=70
../bin/a11y-contrast.js open-color.json
../bin/a11y-contrast.js radix-dark.json
../bin/a11y-contrast.js radix-light.json
../bin/a11y-contrast.js tailwind-v1.json
../bin/a11y-contrast.js tailwind-v2.json
../bin/a11y-contrast.js uswds.json
