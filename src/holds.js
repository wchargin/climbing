import { useState } from "react";
import classNames from "./classNames";

import { useImageSpy } from "./imageSpy";

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
    return (
      <rect
        x={hold.box[0]}
        y={hold.box[1]}
        width={hold.box[2]}
        height={hold.box[3]}
        rx={round}
        ry={round}
        mask={hold.maskOut ? `url(#mask-${hold.id})` : null}
        {...props}
      />
    );
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
              stroke={hold.color}
            >
              {holdRect(hold)}
              {hold.extra && <path d={hold.extra} />}
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
              {hoveredHold.extra && <path fill="none" d={hoveredHold.extra} />}
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
