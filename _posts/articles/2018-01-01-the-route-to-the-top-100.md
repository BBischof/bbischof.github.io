---
 layout: post
 title: "The route to the top 100"
 modified:
 categories: articles
 excerpt:
 tags: []
 image:
 feature:
 date: 2018-01-01T00:00:01-04:00
---

The shortest cycling route that climbs the top 100 climbs in the continental US.

<!-- ^Spoiler Text^ -->

# The route to the top 100

A while back, Randal Olson posted a blog post about the [optimal road trip across the US](http://www.randalolson.com/2015/03/08/computing-the-optimal-road-trip-across-the-u-s/). The parameters of his project were to design a car trip that touched all the states, and he used landmarks in each state to make it more interesting. Two things really stood out about this to me:
- he open-sourced a nice notebook that allowed a fair bit of customization, but wrapped up some of more annoying API/wrapper stuff and the genetic algorithm
- he noted that the API accepted a `bike routes` flag!

The easiest way to describe what happened next is to say that I got inspired by these two observations. My project, was essentially:

**_Mash the dataset of [Top 100 road cycling climbs](https://www.pjammcycling.com/) with Randal Olson's project to achieve the minimal bike route that includes all these climbs_.**

This turned out to be a tiny bit complicated for a few reasons...

Note: _I wanted this to be a cycling route, no usage of boats allowed. So Hawaii was out. Unfortunately—and somewhat surprisingly, Hawaii has 7 of the top 100 road climbs in the US. Luckily, the list provided 107 climbs, so that's a freebie._

<figure>
    <img src="/images/freebie.gif" alt="that was a freebie">
</figure>


## Some challenges

Initially, I was going to grab the list of locations, throw them into his notebook, and let it crunch. I had a feeling immediately that things weren't going to be easy, because the names of the locations weren't very accurate.

My first round yielded a route that the visualization couldn't plot because many of the locations it couldn't find anything for. I switched to `(lat, long)` after a few small modifications to his notebook. This worked much better at getting me close to the initial points for each of the climbs.

Again, the visualization code died on this route. This time, it was a mixture of some bad waypoints, and a few other things:
- the route was longer than the maximum alloted
- some locations were on roads that are not bike friendly so Google maps disliked this
- some locations were connected by seasonal roads, so Google maps disliked this_(this issue returns later)_

I managed to do some small adjustments and finally get an image for this stage of the visualization, knowing that there was much more to do. I also broke the route up into ten pieces, anticipating the difficulties due to scale.

<figure>
  <img src="/images/google-maps-image-routepart-01.png" alt="part 1"></a>
  <figcaption>The long first route.</figcaption>
</figure>

<figure class="third">
  <img src="/images/google-maps-image-routepart-02.png" alt="part 2"></a>
  <img src="/images/google-maps-image-routepart-03.png" alt="part 3"></a>
  <img src="/images/google-maps-image-routepart-04.png" alt="part 4"></a>
  <figcaption>Plots of route starts via Google Maps.</figcaption>
</figure>

<figure class="half">
  <img src="/images/google-maps-image-routepart-05.png" alt="part 5"></a>
  <img src="/images/google-maps-image-routepart-06.png" alt="part 6"></a>
  <figcaption>Plots of route starts via Google Maps.</figcaption>
</figure>

<figure class="half">
  <img src="/images/google-maps-image-routepart-07.png" alt="part 7"></a>
  <img src="/images/google-maps-image-routepart-08.png" alt="part 8"></a>
</figure>

<figure>
  <img src="/images/google-maps-image-routepart-09.png" alt="part 9"></a>
</figure>

<figure>
  <img src="/images/google-maps-image-routepart-10.png" alt="part 10"></a>
  <figcaption>The last ten.</figcaption>
</figure>

## Transitioning to an actual cycling route

I always wanted this to turn into a cycling route in the end, and the numerous issues with the Google maps visualization made clear that things wouldn't go smoothly. About this time I came to some scary realizations:
- the data that I had didn't include the actual climbs, they were simply latitude and longitude of the starting location
- I didn't have the Strava segments associated to each of these climbs
- I couldn't find a route builder that accepted lists of coordinates to build a route, and Strava doesn't allow adding waypoints later, or searching by lat/long in their route builder.

At this point, I took a major step back. The relatively naive approach I was taking had come to an end. I then started working on building more of a decent dataset.

## The dataset

Until this moment I'd been able to simply copy the table off the front page, and with some text-editor dexterity, turn it into something that looked like a data set. Now, I knew I needed to do a few things:

- scrape the dataset and make sure it was clean and more easily referenced
- download the Strava segments for each climb and add the segment number to my dataset

These were relatively straightforward, here's how I grabbed the segments:
```sh
printf "1, " >> enum_outputstrings.txt
curl -s "https://www.pjammcycling.com/1.--mauna-kea---test2.html" | grep www.Strava | awk 'BEGIN {FS="src="} {for(i=2;i<=NF;i++)print $i}' | cut -d ">" -f 1 | tr -d \'\" | sed -e 's/\/embed$//'  >> enum_outputstrings.txt
```

I was feeling good about this and started the next step—which I'll explain in a minute—before I realized a _huge_ problem with this.

If you look closely at how I'm extracting the above, I'm using a few tricks about the order that I download them, to infer the number in the ranking, and then searching that page for where I see the string `www.Strava`. Why is this a problem? Because **pjammcycling** has changed the order without updating the urls... Also, my original code wasn't clever enough to predict pages with multiple Strava links.

Both of these meant that this data extract was quite seriously erroneous. This wouldn't have been particularly awful, had I been using a more sophisticated method for this data extraction. The subtlety really ended up being the killer. I ended up not really updating the shell script, and instead just manually adjusted things, or used some text-editor shenanigans.

This was the first part of the problem that pushed the timeline way back.

## Plotting the route

I still hadn't found a solution to either of my plotting problems. So, I thought to myself:

_"I'll buckle down and input all these lat/long by hand"_

Luckily, I had the foresight to split them into ten-climb groups. It took about an hour, but I build the original ten routes, by copy-pasting lat/long pairs into [ridewithGPS](ridewithgps.com).

A note about **ridewithGPS**: I think that I'd more naturally use Strava to build the route, because all of the climbs have the effort data, but **ridewithGPS'** route tool is hands-down easier to use, and allows for addition of waypoints, splitting, combining, etc. _I'm not confident this project would be possible with Strava's route tool, but doable with **ridewithGPS'**_.

So now I have ten long routes that connect the starting points of each climb, but I'm a long way from the actual goal. This came after some manual adjustment here and there, where the points were problematic as I previously mentioned.

### A brief aside about loops

The final product is not a loop. This is completely intended. The output of the algorithm is a loop. I didn't really like that, so I decided I would break it. Because I was breaking it, I could choose which pair of points didn't need connection. Keeping in line with the original goal of the project, I removed the _longest distance connection_ between any two consecutive points in the optimized path.

This turned out to be the connection from northwest Wyoming to upstate New York. I arbitrarily decided on the orientation of the route, which mean that upstate New York was the start, and that it would finish miles from the Wyoming/Montana border.

## Drag on

I had a moment of realization as I was finishing up the manual route building of the ten original segments where I thought

_"I'm going to have to drag the path to make all the hill climbs part of this route—that's going to suck"_

It did.

I used a timer during this project and this part of the project took approximately 8 hrs. This involved:
- downloading a [chrome extension](https://github.com/cdzombak/OpenList) that can open lists of urls as tabs
- using my dataset of Strava segments to visually detail what the routes look like
- dragging a point just after the starting waypoint to the top of the climb
- adjusting points in-between to make sure they followed the _exact_ path as the specified segment
- fixing some data issues again _(yes, there were more at this point, c.f. below)_
- adjusting the route between ends of climbs and starts of next to optimize both: enjoyability of ride, and minimal distance taking into consideration the different location

This last point was important to me. The genetic algorithm provides a pretty good global solution, but since I was effectively doubling the number of waypoints, and the algorithm never saw the new ones, there was only this human option.

This process was very challenging, and I had to spread this over a few weeks. In some cases, the route builder seemed _insistant_ on not following the route I wanted and occasionally would require six or more extra points to force it. Not to mention the incredible frustration of summer roads. The astute reader may realize that we've been talking about mountains here, which in some cases, get snowy. In places like Colorado and some in the Sierras, the climb is on a summer road that I for the life of me, could not get **ridewithGPS** to plot on. However, again we see the flexibility of their tool: you can freehand.

So yes, dear reader, a few of the climbs are freehanded(poorly I might add).

### More data issues

How could there be any data issues left by now? _...Sigh..._

In one case, I had apparently deleted a digit in the dataset accidentally. In two cases, the Strava segment listed was no longer listed on Strava. And more! These little issues eat up time and make an already exhausting task feel impossible. Nevertheless, I persisted.

#### Explicit changes to the dataset

Here is a short list of _data changes_ that I made:
- A few climbs had double Strava segments
- Three climbs had bad coords for the starts: 44, 61, 62
- A few had no Strava segment listed, so I went and found some using the [segment explorer](https://www.Strava.com/segments/explore)
- _Hwy 21-245-180-198 California_, doesn't have a Strava route, but there's a [longer one](https://www.strava.com/segments/14594861) that can be used
- _Tollhouse Rd_ had the wrong route number, it's actually [9887218](https://www.strava.com/segments/9887218)
- The _Gibraltar Rd_ [segment](https://www.strava.com/segments/7961219) has been flagged, so I used the _Gibraltar TT_ [segment](https://www.strava.com/segments/634846)(shorter), but on the top 100 route, it still does the longer version
- Fixed the _Lone Pine to Table Mountain_ [segment](https://www.strava.com/segments/3812372) to a better one

## One for all

Now I had ten routes ([1](https://ridewithgps.com/routes/26535896), [2](https://ridewithgps.com/routes/26535908), [3](https://ridewithgps.com/routes/26535916), [4](https://ridewithgps.com/routes/26535920), [5](https://ridewithgps.com/routes/26535926), [6](https://ridewithgps.com/routes/26535934), [7](https://ridewithgps.com/routes/26535938), [8](https://ridewithgps.com/routes/26535948), [9](https://ridewithgps.com/routes/26535957), [10](https://ridewithgps.com/routes/26535964)), all with ten climbs each. Again, **ridewithGPS** to the rescue; combining was relatively painless. Although, I'll admit that it's a little hard on the browser to have close to 300 waypoints stretched over 14000 miles of route, unsurprisingly.

**So I guess, it's time to [show you it!!!](https://ridewithgps.com/routes/26633832)?**

## By the numbers

- 100 climbs in the Continental US
- 17 states
- 14235 miles
- 965210 ft of elevation

## Some technical notes

- The [dataset](https://github.com/BBischof/top100ClimbsRoute/blob/master/RoutesData.csv) was extracted originally in November, 2017. I wont likely be updating the routes.
- The actual route doesn't change as the ranking list changes, but, obviously, it will be effected if totally new routes are added.
- Bear Camp was not in the dataset when the original dataset was built, hence it's not included. [Here](https://www.pjammcycling.com/oregon---bear-camp.html) is the route. It should be in [this section](https://ridewithgps.com/routes/26535916) of the route, before you climb [Mt. Ashland](https://www.pjammcycling.com/91.--mt.-ashland--or.html) the Strava route for the new Bear Camp is [here](https://www.strava.com/segments/7625827)

## Next Steps

First, I want to mention an accidental offshoot of this project: _maximal sub-routes_. By this I mean, "what are some sections of this route which maximize the elevation/mileage trade-off?" These are things that you could consider turning into crazy Gran-Fondos like the [California Triple Crown series](http://www.caltriplecrown.com/) which are hard-as-nails double centuries. There are some obvious ones in this data-set, and some manual inspection can find some cute little things like Mile 310-510 in the [4th route](https://ridewithgps.com/routes/26535920) which contains almost 30k climbing on six of the top 100 climbs! _([HRS I'm looking at you here!](http://www.highrouleur.cc/))_

I'll be following this post up with some fun dives into snippets like the above.

Finally, I want to mention that this project, believe it or not, is part one. To keep the mystery alive, I'll only mention that part two is to compute the _Best of the Top 100_, and more generally a **Strava ELO...**

