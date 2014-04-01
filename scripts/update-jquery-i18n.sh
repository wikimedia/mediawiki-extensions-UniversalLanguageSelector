#!/bin/bash

DEST="../lib/jquery.i18n";
CLONEDIR="/tmp/jquery.i18n";
HERE=$(pwd);
UPSTREAM="https://github.com/wikimedia/jquery.i18n.git";

echo -e "Getting latest jquery.i18n from $UPSTREAM\n";

if [ -d $CLONEDIR ]; then
    git pull;
else
    git clone $UPSTREAM $CLONEDIR;
fi

cd "$HERE";
cp -rf $CLONEDIR/src/* $DEST
