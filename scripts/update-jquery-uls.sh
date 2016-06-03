#!/bin/bash

BASEDIR=$(dirname "$0")
BASEDIR="$BASEDIR/.."

DEST="$BASEDIR/lib/jquery.uls"
CLONEDIR="$BASEDIR/vendor/jquery.uls"

UPSTREAM="https://github.com/wikimedia/jquery.uls.git"

echo "Getting latest jquery.uls from $UPSTREAM"

if [ -d "$CLONEDIR" ]; then
	pushd "$CLONEDIR"
	git pull
	popd
else
	git clone "$UPSTREAM" "$CLONEDIR"
fi

rm -rf "$DEST"/*
cp -R "$CLONEDIR"/{images,css,src,i18n,*LICENSE,CREDITS} "$DEST"
