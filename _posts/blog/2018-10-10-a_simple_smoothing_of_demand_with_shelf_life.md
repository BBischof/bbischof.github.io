---
 layout: post
 title: "Simple smoothing of demand with shelf life"
 modified:
 categories: blog
 excerpt:
 tags: []
 image:
 feature:
 date: 2018-10-10T00:00:01-04:00
---

A very simple discrete algorithm for smoothing out impulses to a target constant value

<!-- ^Spoiler Text^ -->

# Demand smoothing

Let's assume you use a lot of toilet paper at your home. Some number of rolls per week(integer rolls). If you buy new packages of toilet paper once a month, let's figure out a simple algorithm to keep your bathroom well-stocked.

## Roll up weekly data

Each week, we have our usage, but since we're only buying once every month we need to consider the sum over the weeks inside. Consider M-S weeks, then the months have the following number of Sundays:

> [4,4,4,5,4,4,5,4,5,4,4,5]

We'll return to this later.

## Available rolls

We dont want to run out, period. As not-a-risk taker, and someone who occasionally throws parties, I want at least _twice as much_ TP around as I normally need. Let's then say whatever my average usage per week is, times two, will be my target `t`.

## Minimizing Error

Because we have a target for available rolls, our goal throughout the month, is to have our order keep us as close to that value as possible.

For `i`, `1 ≤ i ≤ 5` the numbered weeks in the month, and `u_i` the corresponding TP usages. Also assume that before you buy some more TP, you have `o` the "on shelf" TP from the month before. We'll be calculating our TP purchase `x`

We wish to minimize

\\[\argmin_x\left(\sum_i\left(\left\mid x+o-\sum^i_j u_j -t \right\mid\right)\right)\\]

This feels like something that should be somewhat easy to minimize, and to a certain extent it is. It relies on a little lemma though:

### Little Lemma

For a set of numbers `S`, and a value `Y`

\\[\argmin_{s \in S}\left(\sum_i\left(\left\mid S - Y \right\mid\right)\right) = median\left(S\right)\\]

So let `Y= x+o-t`, and consider instead, the partial sums `U_i = \sum^i_j u_j`, then

\\[\argmin_x\left(\sum_i\left(\left\mid x+o-\sum^i_j u_j -t \right\mid\right)\right) = \argmin_{U_i}\left(\sum_i\left(\left\mid U_i - Y \right\mid\right)\right) = median\left(U_i\right)\\]

## Ap-PLY-ing our algorithm


