#!/bin/bash

BASEDIR=$(dirname "$0")
BASEDIR="$BASEDIR/.."

DEST="$BASEDIR/lib/jquery.i18n"
CLONEDIR="$BASEDIR/vendor/jquery.i18n"

UPSTREAM="https://github.com/wikimedia/jquery.i18n.git"

echo "Getting latest jquery.i18n from $UPSTREAM"

if [ -d "$CLONEDIR" ]; then
	pushd "$CLONEDIR"
	git pull
	popd
else
	git clone "$UPSTREAM" "$CLONEDIR"
fi

rm -rf "$DEST"/*
cp -R "$CLONEDIR"/src/* "$CLONEDIR"/{*LICENSE,CREDITS} "$DEST"
