# The Alchemist Crucible
A proposal for the art of the Alchemist's Crucible NFT, generated when a user mints a UniversalVault crucible using the Alchemist Coin protocol.

This project was done using another open source project by fiddlekins, [available here](https://github.com/Fiddlekins/alchemist-crucible-lens/). From this project, I took the crucible data fetching from the ethereum blockchain, and the pseudo-random generation script.

This project users three.js and requires, for now, the MetaMask browser extension to fetch data from the Ethereum blockchain.  For this reason, it currently doesn't run on mobile. (will work on that in the future!) 

## Concept 

Alchemy is widely recognized by magic / alchemy circles. They're used to represent alchemy accross many mediums, and can take multiple forms. They convey something magic, and will spark the imagination of viewers. 

I decided to try to represent an alchemy circle in a different way, in 3D. For this, used the three.js library, to be able to render 3D graphics on the browser. This way, I could create generative art that would be easily accessible by anyone with a browser. 

I decided to draw inspiration from technologic engines and futuristic technology representations, combining technology with magic and mysticism.  Since "any sufficiently advanced technology is indistinguishable from magic", a Crucible NFT surely looks very magical. So I believe this effect could reiterate this idea, creating a  mix of alchemy and mysticism with technology. This way, the 3D Alchemy Circle would be composed of different circles on top of each other, each with a unique shape. The different shapes, then, animated with slightly different speed and in both directions, would create a unique effect.


## Anatomy of the Crucible 

The 3D Alchemy Circle is composed of a few  different "circles", or 3D shapes with different forms, based on how other alchemic circles have been constructed in previous works - accross pop culture and history.  Each "circle" is positioned in 3D space on top of the other, in an ordered manner, and then animated.

To create a more interesting composition, I divided the circles in three categories: Top, Bottom, Center. Each category has a few different circle shape options, declared in  `circles.js`.  

- *Center*: a star or similar shape, medium-sized, that should be seen through mostly when looking from the top. `min: 1, max: 2`
- *Bottom*: Circle-shaped, big-sized. Can be combined with hexagons and others to make interesting shapes. `min: 1, max: 2`
- *Top*: Mostly circle-shaped, smaller-sized. This is where the biggest variation can happen: triangles, circles, runes, hexagons.. `min: 2, max: 4`


After that, the address of the Crucible owner is rendered in a circle around one centermost piece, rotating around. Then, the Crucible ID address is rendered around the largest and last bottom piece.  Lastly, two particle emitters were added, spawned in the center of the Crucible: one with a small box size, focusing on the middle; and the other with a bigger box size, sprawling accross the screen.  With this, the Crucible is assembled!


## Generation based on the Crucible data 

The data from the Crucible NFT is fetched from the ethereum network when the page is loaded, and is used to generate the visual representation of the Crucible. The data we use here is: 
- `ID` the Crucible ID 
- `balance` the amount that is added to the liquidity pool in the Crucible 

The id is used with the PRNG script, to generate reliable values based on its number. And the balance is used as a coeficient, multiplying many values accross the Crucible.

### Color generation
Based on fiddlekins' project, our Crucible has a list of colors to pool from, generated using the PRNG of the crucible id. The number of colors is bigger depending on the balance. The main colors range from blueish to purpleish tones, and the higher the balance of the crucible, the higher chance of golden colors -- since the goal of the Alchemist is to create gold out of nothing! 

Each different element draws a new color from the pool, but all of them share the same "lightness" valuet. Since we're using a Bloom post-processing effect, the higher the lightness the bigger the emission and the amount of bloom. So lower lightness values look a LOT darker than the higher ones, and its better to keep them consistent for a nicer composition.

The background of the page is a pure CSS radial gradient, that is also generated based on the Crucible ID and using the LP balance as a modifier. For this, the lightness value is a lot lower on purpose, to provide a dark background where the crucible can shine. This was the simplest way to guarantee a good background and also to make it generated based on the Crucible too, giving a bit more variety to the overall piece. 

### Circle generation 
The number of circles rendered can vary from 4 to 9, depending on the balance deposited in the Crucible. 
Each different circle is pooled from its category list (center, top, bottom) with a number generated pseudo-randomly, based on the id. There is a total of 14 different shapes, guaranteeing the crucibles can have a wide variety of shapes!

### Animation 
The circles and the text are animated rotating on their Y axis, constantly.  The circles also have a slight hovering movement, made using a sine function. This way, they are always going up and down just a little bit, and always in a loop. 
The speed with each piece animates also has a pseudo-random modifier, based on the crucible id. So one crucible could animate faster than the other. 


## Next Steps 
To actually use the work generated here as the Art for the NFTs, we would have to render animations from the scene. From what I researched, websites like OpenSea and RARI don't support html / interactive code as NFTs. So our best option would be to run this on a special server, able to render a video from the screen, save that on a file, and then upload that as part of the nft.  This app here would still be a great way to visualize different Crucibles!












