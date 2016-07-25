---
layout: post
title: "Code for America App"
modified:
categories: blog
excerpt:
tags: []
image:
  feature:
date: 2016-07-23T08:08:50-04:00
---

The notion of Code for America is very attractive to me. In particular, the allure of working directly with a local government, is one of the ideal jobs I could ask for. While there would be some huge sacrifices to taking this position(not developing certain skills, forfeiting access to certain computational infrastructures, and of course, the money aspect), I am still interested. So I decided to apply. 

## Data Challenge

The coding challenge was very very easy:

~~~
Given the following `csv`, compute the number of violations by type, and the first and last violation in each set.
~~~

And they provide a little data file with columns:

~~~
violation_id,inspection_id,violation_category,violation_date,violation_date_closed,violation_type
~~~

so the actual problem just requires a groupby, count, and min/max. However, the challenge asks specifically for you to _present_ this output. Whence I decided to just use js/D3 for the whole challenge.

I had to remember how to use `nest()`:

~~~
d3.nest().key(function(d) {return d.violation_type}).entries(data)
~~~

and then I did the fun thing of deciding how to draw this data. The data sets were so small, and so limited in time-scale, but I like the idea of something histogram-y. Since the number of total points was tiny, and one-dimensional, I remembered that beeswarms could be usable. So I went with that.

Here's the live [version](http://bl.ocks.org/BBischof/a9e166f26ea11e01d838273e34a043b6).

## An Alternative 

The reality is, while the beeswarm is fun and kinda cool, I have to admit that it might just be better to use a calendar visualization. Because it's all a single year I can use the exploded version of the calendar that takes up a bit more space and really highlights the delineation between the months. 

Here's the live [version](http://bl.ocks.org/BBischof/7607b90705281634c6da741c34d9ba7c).

