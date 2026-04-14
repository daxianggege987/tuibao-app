#!/usr/bin/env python3
"""Remove top-right exclamation badge from tuibao icon PNG (1144.png source)."""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image


def dilate(pixels: set[tuple[int, int]], w: int, h: int, iters: int = 1) -> set[tuple[int, int]]:
    cur = set(pixels)
    for _ in range(iters):
        nxt = set(cur)
        for x, y in cur:
            for dx, dy in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h:
                    nxt.add((nx, ny))
        cur = nxt
    return cur


def main() -> None:
    root = Path(__file__).resolve().parents[2]
    src = root / "1144.png"
    if not src.exists():
        raise SystemExit(f"Missing {src}")

    im = Image.open(src).convert("RGBA")
    w, h = im.size
    px = im.load()

    def is_bg_white(p) -> bool:
        r, g, b, _a = p
        return r > 245 and g > 245 and b > 245

    def is_whiteish(p) -> bool:
        r, g, b, a = p
        return r > 230 and g > 230 and b > 230 and a > 200

    outside: set[tuple[int, int]] = set()
    for sx, sy in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        if (sx, sy) in outside:
            continue
        if not is_bg_white(px[sx, sy]):
            continue
        q: deque[tuple[int, int]] = deque([(sx, sy)])
        outside.add((sx, sy))
        while q:
            x, y = q.popleft()
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if nx < 0 or ny < 0 or nx >= w or ny >= h:
                    continue
                if (nx, ny) in outside:
                    continue
                if not is_bg_white(px[nx, ny]):
                    continue
                outside.add((nx, ny))
                q.append((nx, ny))

    cand = [
        (x, y)
        for y in range(h)
        for x in range(w)
        if 820 < x < 1120 and 40 < y < 320 and is_whiteish(px[x, y])
    ]
    sc = set(cand)
    seen: set[tuple[int, int]] = set()
    comps: list[list[tuple[int, int]]] = []
    for start in cand:
        if start in seen:
            continue
        stack = [start]
        seen.add(start)
        comp: list[tuple[int, int]] = []
        while stack:
            x, y = stack.pop()
            comp.append((x, y))
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if (nx, ny) in sc and (nx, ny) not in seen:
                    seen.add((nx, ny))
                    stack.append((nx, ny))
        comps.append(comp)

    badge_white: set[tuple[int, int]] = set()
    for c in comps:
        if len(c) in (420, 1239, 1560):
            badge_white |= set(c)

    if not badge_white:
        raise SystemExit("Could not find exclamation badge components; aborting.")

    mask = dilate(badge_white, w, h, 14)
    main_rgba = (253, 0, 0, 255)
    painted = 0
    for x, y in mask:
        if (x, y) in outside:
            continue
        px[x, y] = main_rgba
        painted += 1

    im.save(src, format="PNG")
    print(f"Wrote {src} ({painted} pixels painted)")


if __name__ == "__main__":
    main()
