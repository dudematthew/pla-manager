#!/usr/bin/env sh

# abort on errors
# set -e

# merge branch
git checkout production

git merge main

git push

git checkout main

# if you want to keep the terminal open
# /bin/bash
