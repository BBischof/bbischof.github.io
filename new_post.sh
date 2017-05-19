#!/bin/sh
name=$1
destination='_posts/blog/'$(date  +%Y-%m-%d)'-'$name'.md'
touch $destination
name=`echo ${name:0:1} | tr  '[a-z]' '[A-Z]'`${name:1}
header='---\n layout: post\n title: "'$name'"\n modified:\n categories: blog\n excerpt:\n tags: []\n image:\n   feature:\n date: '$(date  +%Y-%m-%d)'T00:00:01-04:00\n---\n\n\n<!-- ^Spoiler Text^ -->\n##'
echo $header > $destination
subl $destination
