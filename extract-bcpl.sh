#!/bin/bash

set -euo pipefail

files=(\
    cmpltest \
    date \
    easter \
    echo \
    enlarge \
    fact \
    hello \
    procode \
    sortdemo \
    sortlines \
    sudoku \
    swtest \
)

for file in ${files[@]}; do
    docker run --rm -it --entrypoint cat bcpl distribution/BCPL/cintcode/com/$file.b > ui/src/assets/bcpl/$file.b
    docker run --rm -it bcpl convert-bcpl-to-ocode-stdin.sh distribution/BCPL/cintcode/com/$file.b > ui/src/assets/bcpl/$file.ocode
done

jq -c -n '$ARGS.positional' --args "${files[@]}" > ui/src/assets/bcpl/index.json
