#!/bin/bash

set -euo pipefail

rm -f ui/src/assets/bcpl/*
mkdir -p ui/src/assets/bcpl

pushd bcpl/test-programs
tests=(*.ocode)
tests_json=$(jq -c -n '$ARGS.positional' --args "${tests[@]%.*}")
popd
cp bcpl/test-programs/*.ocode ui/src/assets/bcpl

jq -c -n '$ARGS.positional' --args "${files[@]}" | jq ". |= .+ ${tests_json} | sort" > ui/src/assets/bcpl/index.json
