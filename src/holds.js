import { useState } from "react";
import classNames from "./classNames";

export function useHoldsState() {
  const [hoveredId, setHoveredId] = useState(null);
  // Keep track of which hold we just moused-out of so that we can keep it in
  // the mask as the shade fades out.
  const [lastHoveredId, setLastHoveredId] = useState(null);

  function onFocus(id) {
    setHoveredId(id);
    setLastHoveredId(id);
  }
  function onBlur() {
    setHoveredId(null);
  }

  return { onFocus, onBlur, hoveredId, lastHoveredId };
}

function Holds({
  imgSrc,
  placeholder,
  viewBox,
  holds,
  state,
  className,
  ...rest
}) {
  const { hoveredId, lastHoveredId } = state;

  const [w, h] = viewBox;
  const round = h / 100;
  const strokeWidth = h / 150;

  const holdsById = new Map();
  for (const hold of holds) holdsById.set(hold.id, hold);
  const hoveredHold = holdsById.get(hoveredId ?? lastHoveredId) ?? null;

  // Exactly aligning rectangles leads to some subpixel inaccuracies on mobile
  // at some zoom levels. Pad by some amount.
  const oversized = { x: -w / 2, y: -h / 2, width: 2 * w, height: 2 * h };

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
      <image href={imgSrc} width={w} height={h} />
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
                strokeWidth,
                stroke: "white",
              }),
            )}
          </mask>
        ))}
      {/**/}
      {/* holds */}
      <g fill="transparent" strokeWidth={strokeWidth}>
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
          fillOpacity={hoveredId != null ? 0.75 : 0}
          className="transition-[fill-opacity] duration-300"
        />
        {hoveredHold && (
          <g fill="black" stroke="black" strokeWidth={strokeWidth}>
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
    </svg>
  );
}

export default Holds;
