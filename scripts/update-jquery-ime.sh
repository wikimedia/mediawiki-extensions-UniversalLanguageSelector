#!/bin/bash

BASEDIR=$(dirname "$0")
BASEDIR="$BASEDIR/.."

DEST="$BASEDIR/lib/jquery.ime"
CLONEDIR="$BASEDIR/vendor/jquery.ime"

UPSTREAM="https://github.com/wikimedia/jquery.ime.git"

echo "Getting latest jquery.ime from $UPSTREAM"

if [ -d "$CLONEDIR" ]; then
	pushd "$CLONEDIR"
	git pull
	popd
else
	git clone "$UPSTREAM" "$CLONEDIR"
fi

pushd "$CLONEDIR"
npm install
./node_modules/.bin/grunt copy concat
popd

rm -rf "$DEST"/*
cp -R "$CLONEDIR"/dist/jquery.ime/{images,css,rules,jquery.ime.js} "$CLONEDIR"/*LICENSE "$DEST"
