#!/bin/sh

# Compress JS files.

in_dir=src/public/scripts
out_dir=$in_dir/min

echo 'Compiling JavaScript...';

if [ ! -d "$out_dir" ]; then
  mkdir $out_dir;
fi

for in_file in $in_dir/*.js; do
  out_file=$out_dir/$(basename -s .js $in_file).min.js;
  uglifyjs $in_file --compress sequences,dead_code,conditionals,booleans,unused,if_return,join_vars --mangle --output $out_file
  echo "* $(basename $in_file)";
done

echo 'JavaScript compilation complete.\n'
