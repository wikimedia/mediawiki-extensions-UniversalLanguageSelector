#!/bin/bash

BASEDIR=$(dirname "$0")
BASEDIR="$BASEDIR/.."

DEST="$BASEDIR/lib/jquery.webfonts"
CLONEDIR="$BASEDIR/vendor/jquery.wefonts"

UPSTREAM="https://github.com/wikimedia/jquery.webfonts.git"

echo "Getting latest jquery.wefonts from $UPSTREAM"

if [ -d "$CLONEDIR" ]; then
	pushd "$CLONEDIR"
	git pull
	popd
else
	git clone "$UPSTREAM" "$CLONEDIR"
fi

rm -rf "$DEST/jquery.webfonts.js"
cp -R "$CLONEDIR"/{src,*LICENSE} "$DEST"
