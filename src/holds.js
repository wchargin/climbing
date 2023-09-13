import { useState } from "react";
import classNames from "./classNames";

import { useImageSpy } from "./imageSpy";

const COLORS = {
  // h-blu: blue hold colors
  "h-blu-200": "#c7dfff",
  "h-blu-400": "#a7bfe2",
  "h-blu-500": "#80a4d5",
  "h-blu-600": "#5a88c9",
  // h-blk: black hold colors
  "h-blk-900": "#111111",
  // h-pnk: pink hold colors
  "h-pnk-050": "#ffd6d9",
  "h-pnk-100": "#ffb1b6",
  "h-pnk-200": "#f9959b",
  "h-pnk-400": "#fb7b87",
  "h-pnk-600": "#ec4d5c",
  "h-pnk-800": "#882c35",
};
function getColor(c) {
  return COLORS[c] ?? c;
}

export function useHoldsState(routeId, imgSrc) {
  const [hoveredId, setHoveredId] = useState(null);
  // Keep track of which hold we just moused-out of so that we can keep it in
  // the mask as the shade fades out.
  const [lastHoveredId, setLastHoveredId] = useState(null);

  // Reset holds state when route changes, using the pattern suggested in React
  // docs to avoid effects.
  const [lastRouteId, setLastRouteId] = useState(routeId);
  if (routeId !== lastRouteId) {
    setLastRouteId(routeId);
    setHoveredId(null);
    setLastHoveredId(null);
  }

  const imgLoaded = useImageSpy(imgSrc);

  function onFocus(id) {
    setHoveredId(id);
    setLastHoveredId(id);
  }
  function onBlur() {
    setHoveredId(null);
  }

  return {
    routeId,
    onFocus,
    onBlur,
    hoveredId,
    lastHoveredId,
    imgSrc,
    imgLoaded,
  };
}

function Holds({
  placeholder,
  viewBox,
  holds,
  showHolds,
  state,
  className,
  ...rest
}) {
  const { hoveredId, lastHoveredId, imgSrc, imgLoaded } = state;

  const [w, h] = viewBox;
  const round = h / 100;
  const strokeWidth = h / 150;

  const tagLength = h / 60;
  const tagGap = strokeWidth * 1.5;

  const holdsById = new Map();
  for (const hold of holds) holdsById.set(hold.id, hold);
  const hoveredHold = holdsById.get(hoveredId ?? lastHoveredId) ?? null;

  // Exactly aligning rectangles leads to some subpixel inaccuracies on mobile
  // at some zoom levels. Pad by some amount.
  // TODO: Currently this is a hack because the oversized shade can be seen on
  // some layout sizes, namely "md" size when the space for the SVG is wider
  // than it is tall :-(
  const dOversize = Math.round(h / 1000);
  const oversized = {
    x: -dOversize,
    y: -dOversize,
    width: w + 2 * dOversize,
    height: h + 2 * dOversize,
  };

  function holdRect(hold, props) {
    const [x, y, w, h] = hold.box;
    const dashed = hold.style === "dashed" || undefined;
    let transform;
    if (hold.rotateDeg) {
      transform = `rotate(${hold.rotateDeg} ${x + w / 2} ${y + h / 2})`;
    }
    return (
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={round}
        ry={round}
        strokeWidth={dashed && strokeWidth / 2}
        strokeDasharray={dashed && strokeWidth}
        mask={hold.maskOut ? `url(#mask-${hold.id})` : null}
        transform={transform}
        {...props}
      />
    );
  }
  function holdTags(hold, props) {
    if (hold.tags) {
      const parts = [];
      for (const [n, dir, rx, ry] of hold.tags) {
        const row = dir[0] === "v";
        const offset = tagGap * (-(n - 1) / 2);
        const x0 = hold.box[0] + hold.box[2] * rx + (row ? offset : 0);
        const y0 = hold.box[1] + hold.box[3] * ry + (row ? 0 : offset);
        for (let i = 0; i < n; i++) {
          const x = x0 + (row ? i * tagGap : 0);
          const y = y0 + (row ? 0 : i * tagGap);
          parts.push(`M${x} ${y}${dir}${tagLength}`);
        }
      }
      return <path d={parts.join("")} {...props} />;
    }
    if (hold.extra) {
      return <path d={hold.extra} {...props} />;
    }
    return null;
  }

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={classNames("select-none", className)}
      strokeWidth={strokeWidth}
      {...rest}
    >
      {/**/}
      {/* background stuff */}
      {placeholder.color && (
        <rect width={w} height={h} fill={placeholder.color} />
      )}
      {placeholder.src && (
        <image
          href={placeholder.src}
          width={w}
          height={h}
          preserveAspectRatio="none"
        />
      )}
      <image
        key={`img-${state.routeId}`}
        href={imgSrc}
        width={w}
        height={h}
        className={classNames(
          "transition-opacity",
          imgLoaded || "js-opacity-0",
        )}
      />
      <g
        key={`holds-${state.routeId}`}
        className={classNames(
          "transition-opacity",
          (imgLoaded && showHolds) || "js-opacity-0",
        )}
      >
        {/**/}
        {/* masks for holds */}
        {holds
          .filter((h) => h.maskOut)
          .map((hold) => (
            <mask key={hold.id} id={`mask-${hold.id}`}>
              <rect {...oversized} stroke="none" fill="white" />
              {hold.maskOut.map((otherId) =>
                holdRect(holdsById.get(otherId), {
                  key: otherId,
                  fill: "black",
                  // Only mask out the *interior* of masked holds.
                  stroke: "white",
                }),
              )}
            </mask>
          ))}
        {/**/}
        {/* holds */}
        <g fill="transparent">
          {holds.map((hold) => (
            <g
              key={hold.id}
              onMouseEnter={() => state.onFocus(hold.id)}
              onMouseLeave={() => state.onBlur()}
              stroke={getColor(hold.color)}
            >
              {holdRect(hold)}
              {holdTags(hold)}
            </g>
          ))}
        </g>
        {/**/}
        {/* shade */}
        <mask id="mask-shade">
          <rect {...oversized} fill="black" />
          <rect
            {...oversized}
            fill="white"
            fillOpacity={hoveredId != null ? 0.5 : 0}
            className="transition-[fill-opacity]"
          />
          {hoveredHold && (
            <g fill="black" stroke="black">
              {holdRect(hoveredHold)}
              {holdTags(hoveredHold, { fill: "none" })}
            </g>
          )}
        </mask>
        <rect
          {...oversized}
          fill="black"
          mask="url(#mask-shade)"
          className="pointer-events-none"
        />
      </g>
    </svg>
  );
}

export default Holds;
