#!/bin/bash

DEST="../lib/jquery.ime";
CLONEDIR="/tmp/jquery.ime";
HERE=$(pwd);
UPSTREAM="https://github.com/wikimedia/jquery.ime.git";

echo -e "Getting latest jquery.ime from $UPSTREAM\n";

if [ -d $CLONEDIR ]; then
    git pull;
else
    git clone $UPSTREAM $CLONEDIR;
fi

cd $CLONEDIR;
npm install;
grunt copy concat;
cd "$HERE";
cp -rf $CLONEDIR/dist/jquery.ime/{images,css,rules,jquery.ime.js} $DEST;
