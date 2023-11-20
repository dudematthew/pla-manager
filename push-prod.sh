#!/usr/bin/env sh

# abort on errors
# set -e

# merge branch

git pull

git push

git checkout production

git pull

git merge main

# stash any uncommitted changes
git stash

# bump version based on the first argument to the script
npm version $VERSION -m "Upgrade to %s"

# apply the stash
git stash pop

git push

git checkout main

git merge production

git push

# if you want to keep the terminal open
# /bin/bash