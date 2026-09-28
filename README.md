# naftaliro.dev

the quiet one. stories, write-ups, what i'm reading and watching. plain html, css and js,
no framework, no build step. same catppuccin setup as [3hz.dev](https://3hz.dev).

## where things live

| file | what's in it |
| --- | --- |
| `index.html` | the homepage. every box is a `<section class="win">` |
| `beating-the-game.html`, `the-usb-port-was-the-problem.html`, `the-hastur-protocol.html` | the posts |
| `assets/css/style.css` | palettes at the top, then the bar, windows, and post styles |
| `assets/js/main.js` | flavor switcher, the wallpaper, the % in the post title bar, the content warning |
| `feed.xml` | rss (atom) for the posts |
| `404.html` | for links that go nowhere |

## adding a post

1. copy `the-usb-port-was-the-problem.html` to `new-thing.html`
2. change the `<title>`, the description + og tags, the canonical url, the path in the
   title bar, and the stuff in `art-head`
3. write it inside `<div class="prose">`. `<h2>`, lists, `<pre><code>`, `<blockquote>` all
   have styles already
4. add it to the top of the list in `index.html` (`~/writing`), bump the file count in
   that title bar
5. add an `<entry>` to `feed.xml` and change `<updated>` at the top
6. add it to `sitemap.xml`

if a post needs a content warning, `beating-the-game.html` has one. anything with
`class="gated"` stays hidden until someone clicks through (it's all just visible if js
is off).

## the shelf

`~/shelf.log` in `index.html`. each book/show is an `<li>`. stars are just ★ characters,
empty ones are `<span class="off">☆</span>`. fix the `aria-label` to match.

## preview locally

```sh
python3 -m http.server
# then open http://localhost:8000
```

links start with `/` so double-clicking the file won't load the styles, use the server.

## keys

`t` cycles the catppuccin flavor.

## credits

- colors: [catppuccin](https://catppuccin.com) (MIT)
- fonts: [iosevka + iosevka etoile](https://typeof.net/Iosevka/) and [silkscreen](https://kottke.org/plus/type/silkscreen/), SIL OFL, see `assets/fonts/LICENSE.txt`
- icons: [tabler icons](https://tabler.io/icons) (MIT)
