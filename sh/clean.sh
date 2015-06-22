#!/bin/sh

# Remove temporary working directories.
rm -rf src/public/style/min
echo "Removed minified style files."

rm -rf src/public/scripts/min
echo "Removed minified script files."
