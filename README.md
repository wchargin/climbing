# climbing

A little portfolio of some bouldering routes that I've climbed, for sharing
with friends. <https://wchargin.com/climbing>

## Motivation

I created this for two reasons.

First, I sometimes want to share and talk about routes with friends, but if
I just send an image of "the blue route", it can be hard for people to see
which holds are blue, or where the start is. Colors often look ambiguous due to
lighting and also chalk on the holds; start tape can be folded over or
obscured; and some holds are just plain small and hard to see unless you're
looking for them specifically. So having annotations on the image indicating
positions of holds, starts, finishes, and other regions of interest, as well as
linking them to mentions in the text, seemed fun.

Second, I wanted to have a canvas for visualizing my own data and progress.
It feels good to see how I'm improving. So far, this site mostly hosts a route
gallery, which has some facilities for implying progress (e.g., counting routes
grouped by type and season). I might add more explicit, chart-like views:
I have some ideas and mocks.

Is it overkill? Sure. But it's fun and I like it.

## Implementation

This is a static site hostable from any subpath of a static web server, and is
designed to be hosted from a GitHub Pages repository domain. The path prefix
does not need to be known at build time. Since the static content is published
via a Git repository, another design goal of mine is that updating the main
data file should not require re-building every individual page or the main
client-side bundle, and likewise updating the client bundle should not require
updating the (built) data file.

The site degrades gracefully when JavaScript is disabled, and the only runtime
dependencies are React and [Thumbhash][], used for image placeholders.

I went back and forth on whether to use a framework like Next.js. Such
frameworks provide useful value to me, but when I'm using them I tend to feel
sad, frustrated, and drained. While sadness is a lovely emotion, I want my side
projects to be associated with joy. So I decided to just roll this one myself.
I'm happy with that choice: it's not actually very much work, the end result is
better and causes me much less stress damage, and designing the data loading
was fun.

<!--
For the curious, there were specific things that I wanted to avoid in Next.js.
Its file-based routing, particularly with the ugly sigils for path parameters,
leads to a project structure that I find confusing and distasteful. And Next.js
supports hosting a static site behind a path prefix (i.e., not at the root of a
domain), but that path prefix must be known at build time, and I don't like
that: it interferes with content-addressed gateways and also just feels
philosophically wrong to me. That kind of philosophical disagreement also
extends to other aspects of Next.js that I might not be able to name specific
complaints about, but still give me unease to work with.
-->

[Esbuild][] is fast enough that I can just do a full re-bundle on any change to
source or data files: bundling takes 40ms and re-generating the site takes
140ms. Unfortunately, Tailwind is very slow at fully 600ms, which degrades the
experience a little. Still, it's not bad enough to warrant changing it yet.

Another neat trick is the way I turn the static site output into a new commit
onto the `gh-pages` branch. I've done this for years, but it usually involves
a fair few operations that are annoying and easy to get subtly wrong in a shell
script (e.g., moving all files from `dist/` into `.`). I played with some new
ways to do this, involving just initializing a fresh Git repository in `dist/`,
committing everything, `fetch`ing that tree from the main repository, and using
`git-commit-tree` to stamp it onto the deploy branch. The new, refined version
is conceptually similar but uses the `--work-tree` argument to avoid needing
the extra Git repository. I think this is much cleaner overall! It would be
ideal if I could do this without stomping (or reading from) the index of the
main repository, but aside from manually assembling a patch I don't immediately
see how to do that.

[esbuild]: https://esbuild.github.io/
[thumbhash]: https://evanw.github.io/thumbhash/
