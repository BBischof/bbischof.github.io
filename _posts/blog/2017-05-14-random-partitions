---
layout: post
title: "Random Partition"
modified:
categories: blog
excerpt:
tags: [algorithms]
image:
  feature:
date: 2017-05-14T08:08:50-04:00
---

I've been curious about generating a random partition of an integer.

## RanCom

I have been thinking a lot about this somewhat randomly. In particular, I've been trying to think of how to select things randomly in various incarnations. This one wasn't obvious other than the naive solution of

- Generate all partitions
- Select one at random

After some Google, I found [this](http://stackoverflow.com/questions/2161406/how-do-i-generate-a-uniform-random-integer-partition), which after a little thinking I was able to understand. The answer I used comes from this [book](https://www.math.upenn.edu/~wilf/website/CombinatorialAlgorithms.pdf)—which I am now dangerously interested in reading. It becomes:


```python
import random

def rancom(n,k):
    if k>1:
        a = sorted(random.sample(list(range(1,n+k)), n+k-1)[:k-1])
        return [a[0]-1]+[x[1]-x[0]-1 for x in zip(a,a[1:])]+[n+k-1-a[-1]]
    else:
        return [n]
```

Notice that this is for arbitrary `k`, but in our case, `k=n`

Nice and fast. I think it'd be fun to look at the balls-and-boxes algorithm that leads to this solution.

There's also the fun question of what is an average partition for `n`:

```python
def avg_part(n, iterations=500):
    parts = []
    for i in range(iterations):
        parts.append(sorted(rancom(n,n), reverse=True))
    for j in range(n):
        print sum([x[j] for x in parts])/len(parts)
```

```txt
[1, 0]
[2, 0, 0]
[2, 1, 0, 0]
[2, 1, 0, 0, 0]
[3, 1, 0, 0, 0, 0]
[3, 1, 1, 0, 0, 0, 0]
[3, 1, 1, 0, 0, 0, 0, 0]
[3, 2, 1, 0, 0, 0, 0, 0, 0]
[3, 2, 1, 1, 0, 0, 0, 0, 0, 0]
[3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0]
[3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]
[4, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]
[4, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
[4, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
[4, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
[4, 3, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
[4, 3, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
[4, 3, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
[4, 3, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
[4, 3, 2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
[4, 3, 2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
[4, 3, 2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
[4, 3, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
```
