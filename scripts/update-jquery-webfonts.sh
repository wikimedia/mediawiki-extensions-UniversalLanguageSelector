#!/bin/bash

DEST="../lib/";
CLONEDIR="/tmp/jquery.webfonts";
HERE=$(pwd);
UPSTREAM="https://github.com/wikimedia/jquery.webfonts.git";

echo -e "Getting latest jquery.webfonts from $UPSTREAM\n";

if [ -d $CLONEDIR ]; then
    git pull;
else
    git clone $UPSTREAM $CLONEDIR;
fi

cd "$HERE";
cp -rf $CLONEDIR/src/* $DEST
