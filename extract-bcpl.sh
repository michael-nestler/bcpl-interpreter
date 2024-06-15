#!/bin/bash

set -euo pipefail

rm -f ui/src/assets/bcpl/*
mkdir -p ui/src/assets/bcpl

files=(\
    cmpltest \
    date \
    easter \
    echo \
    enlarge \
    fact \
    procode \
    sortdemo \
    sortlines \
    sudoku \
)

for file in ${files[@]}; do
    docker run --rm -it --entrypoint cat bcpl distribution/BCPL/cintcode/com/$file.b > ui/src/assets/bcpl/$file.b
    docker run --rm -it bcpl convert-bcpl-to-ocode-stdin.sh distribution/BCPL/cintcode/com/$file.b > ui/src/assets/bcpl/$file.ocode
done

pushd bcpl/test-programs
tests=(*.ocode)
tests_json=$(jq -c -n '$ARGS.positional' --args "${tests[@]%.*}")
popd
cp bcpl/test-programs/*.ocode ui/src/assets/bcpl

jq -c -n '$ARGS.positional' --args "${files[@]}" | jq ". |= .+ ${tests_json} | sort" > ui/src/assets/bcpl/index.json
