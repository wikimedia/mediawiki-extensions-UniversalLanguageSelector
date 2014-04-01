#!/bin/bash

DEST="../lib/jquery.uls";
CLONEDIR="/tmp/jquery.uls";
HERE=$(pwd);
UPSTREAM="https://github.com/wikimedia/jquery.uls.git";

echo -e "Getting latest jquery.uls from $UPSTREAM\n";

if [ -d $CLONEDIR ]; then 
    git pull;
else
    git clone $UPSTREAM $CLONEDIR;
fi

cd "$HERE";
cp -rf $CLONEDIR/{images,css,src,i18n} $DEST
