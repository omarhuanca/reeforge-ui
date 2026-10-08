"""Build design/reeforge-design-system.html: a single self-contained copy of
preview.html for sharing (claude.ai artifact). Inlines tokens.css and
components.css, embeds General Sans as WOFF2 data URIs (Fontshare is not an
allowed stylesheet host there), loads IBM Plex from Google Fonts, and adds
the French "À valider" section from approval-intro.html.

Usage: python3 design/build-standalone.py
"""
import base64
import pathlib
import re
import urllib.request

HERE = pathlib.Path(__file__).parent
OUT = HERE / "reeforge-design-system.html"
FONTSHARE_CSS = "https://api.fontshare.com/v2/css?f[]=general-sans@500,600,700&display=swap"


def general_sans_faces():
    css = urllib.request.urlopen(FONTSHARE_CSS).read().decode()
    faces = ""
    for block in re.findall(r"@font-face\s*{[^}]+}", css):
        weight = re.search(r"font-weight:\s*(\d+)", block).group(1)
        url = "https:" + re.search(r"url\('(//[^']+\.woff2)'\)", block).group(1)
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        data = base64.b64encode(urllib.request.urlopen(req).read()).decode()
        faces += (f"@font-face{{font-family:'General Sans';src:url(data:font/woff2;base64,{data}) "
                  f"format('woff2');font-weight:{weight};font-style:normal;font-display:swap}}\n")
    assert faces.count("@font-face") == 3, "expected 3 General Sans weights"
    return faces


def main():
    tokens = (HERE / "tokens.css").read_text()
    comps = (HERE / "components.css").read_text()
    prev = (HERE / "preview.html").read_text()
    intro = (HERE / "approval-intro.html").read_text()

    style = re.search(r"<style>(.*?)</style>", prev, re.S).group(1)
    body = re.search(r'<body class="rf-root">(.*)</body>', prev, re.S).group(1)

    marker = "</section>\n\n<!-- ================= COLORS"
    assert marker in body
    body = body.replace(marker, "</section>\n\n" + intro + "\n<!-- ================= COLORS", 1)
    body = body.replace('<nav>\n    <a href="#colors">', '<nav>\n    <a href="#approval">To approve</a><a href="#colors">', 1)

    extra = """
  body { margin: 0; background: var(--rf-bg); }
  .ds-top { top: env(safe-area-inset-top, 0px); }
  .ds-approval { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--rf-space-4); }
  .ds-approval__item { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: var(--rf-space-3); align-items: start; }
  .ds-approval__item p { margin: var(--rf-space-1) 0 0; color: var(--rf-text-muted); font-size: var(--rf-text-sm); line-height: 1.55; }
  .ds-approval__n { width: 28px; height: 28px; border-radius: var(--rf-radius-full); background: var(--rf-gradient-primary); color: var(--rf-on-primary); display: grid; place-content: center; font: 600 var(--rf-text-sm)/1 var(--rf-font-display); }
  :root { color-scheme: light; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { color-scheme: dark; } }
  :root[data-theme="dark"] { color-scheme: dark; }
"""
    out = f"""<title>Reeforge Design System</title>
<meta name="description" content="Reeforge visual identity for approval">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
{general_sans_faces()}
{tokens}
{comps}
{style}
{extra}
</style>
<div class="rf-root">
{body}
</div>
"""
    OUT.write_text(out)
    print(f"{OUT.name}: {len(out) // 1024} KB")


if __name__ == "__main__":
    main()
