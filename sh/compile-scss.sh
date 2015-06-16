#!/bin/sh

# Compile SCSS into minified CSS.

in_dir=src/public/style
out_dir=$in_dir/min

echo 'Compiling SCSS...';

mkdir $out_dir

for in_file in $in_dir/*.scss; do
  out_file=$out_dir/$(basename -s .scss $in_file).min.css;
  scss $in_file $out_file --cache-location $in_dir/.sass-cache --style compressed;
  echo "* $(basename $in_file)";
done

echo 'SCSS compilation complete.\n';
