#!/bin/sh

scss_dir=src/public/style/scss/
css_dir=src/public/style/css/

echo 'Compiling SCSS...'

for f in $scss_dir*.scss; do
  out=$css_dir$(basename -s .scss $f).css;
  scss $f $out --style compressed
  echo "Compiled $(basename $f).";
done

echo 'Compilation complete.\n'
