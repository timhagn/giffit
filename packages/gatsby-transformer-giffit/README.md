# gatsby-transformer-webpconv (temp name)

This transformer shall interact with another plugin I just develop pertaining 
GIFs and return a fixed / fluid structure like `gatsby-transformer-sharp`.

To be honest, I started by just copying it's sources and adapting the types and
resolvers - but it never worked in it's own repo oO!
Adding the contents of `src` to a `plugins` folder in a Gatsby site works...

Here it Errors out with either one like this:

```error
Error: ImageWebpConv.fixed@width provided incorrect InputType: '"Int"'
```

or even:

```error
Error: ImageWebpConv.fixed provided incorrect OutputType: '"ImageWebpConvFixed"'
```

I think the problem is a `babel` one, though it doesn't work with the 
non-transpiled `src` files either oO.

Any help would be wholeheartedly appreciated!
Thanks in advance!  

P.S.: "-webpconv" is a development name, I'm open for suggestions. Though 
"-gif2webp" just sounds a little lame - what do you think ; )?