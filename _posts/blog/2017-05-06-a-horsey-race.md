---
layout: post
title: "A Horsey Race"
modified:
categories: blog
excerpt:
tags: [puzzles]
image:
  feature:
date: 2017-05-06T08:08:50-04:00
---

I've been playing with some puzzles lately(slightly egged on by [Jeff](https://whatsyourpvalue.wordpress.com/)).

## Some recent puzzles

I've thought about some of the recent puzzles, even automating some and making some fun [visualizations](https://twitter.com/BEBischof/status/852372470707269632).

Also spent a little time writing some puzzles myself, and some out of left field [questions](https://twitter.com/BEBischof/status/848016168254406656).

However, for the most recent 538 puzzle, they suggested making an animation, so I thought I'd spent a few hours making a d3 vis for fun. Here's the [puzzle.](https://fivethirtyeight.com/features/who-will-win-the-lucky-derby/)

## Horseys

The setup is relatively straightforward; using the list of probabilities, generate 20 sequences of steps, continuing to sum them until one exceeds 200. Here's the little function—keep in mind that I don't know Javascript:

```
function run_race(race_length){
  horsey_probabilities = [.52,.54,.56,.58,.60,.62,.64,.66,.68,.70,.72,.74,.76,.78,.80,.82,.84,.86,.88,.90].reverse()
  horsey_paths = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]
  winning_position = 0
  while (winning_position < race_length) {
    new_steps = horsey_probabilities.map(function(d){return rand_step(d)})
    horsey_paths.map(function (list, idx) {
      return list.push(new_steps[idx]);});
    winning_position = Math.max.apply(Math, horsey_paths.map(function(d){return d.reduce((a, b) => a + b, 0)}))
//   console.log(winning_position);
  }
  return horsey_paths
}
```

The 'hardest' part was that I wanted to display the data as a bump chart of who was winning the race at each step. So I had to compute the 'position' at each step. Consider the following problem:

```
Given a square matrix of numbers of integers, a list of rows, convert the integers to the columnar rank of each entry.
```

For example:
```
[
  [1,2,3],
  [3,2,1],
  [5,1,0],
]
```
becomes
```
[
  [1,1,3],
  [2,3,2],
  [3,1,1],
]
```

It's a little strange, but mostly involves changing the direction of the lists, and then computing the ranks; even in Python gave me pause:
```
a = [5,2,4,3,0]
[z[1] for z in
 sorted([(y[0],j+1) for j,y in
         enumerate(sorted([(i+1,x) for i,x in
                           enumerate(a)
                          ], key=lambda x: x[1]))
        ], key=lambda x: x[0])
]
```
So you can imagine it was a little awkard in JS, but here ya go:
```
function matrix_transpose(matrix){
  return matrix[0].map(function(col, i) {
    return matrix.map(function(row) {
        return row[i];
    });
});
}

function convert_list_to_ranks(list_of_sums){
  output = list_of_sums.map(function (i,idx){return ([idx+1, i]);})
    .sort(function(a,b) {return b[1] - a[1];})
    .map(function (p,idy){return ([p[0], idy+1])})
    .sort(function(a,b) {return a[0] - b[0];})
    .map(function (x){return x[1]})
  return output
}
```

Without further ado, here's the [vis](https://bl.ocks.org/BBischof/576cf84b61c3f04f1021a0159fc5a2d1).
