import { useState } from "react";
import classNames from "./classNames";

function Holds({ imgSrc, placeholder, viewBox, holds, className, ...rest }) {
  const [hoveredId, setHoveredId] = useState(null);

  const [w, h] = viewBox;
  const round = h / 100;
  const strokeWidth = h / 150;

  const holdsById = new Map();
  for (const hold of holds) holdsById.set(hold.id, hold);
  const hoveredHold = hoveredId && holdsById.get(hoveredId);

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
            <rect width={w} height={h} stroke="none" fill="white" />
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
            onMouseEnter={() => void setHoveredId(hold.id)}
            onMouseLeave={() => void setHoveredId(null)}
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
        <rect width={w} height={h} fill="white" />
        {hoveredHold &&
          holdRect(hoveredHold, {
            fill: "black",
            stroke: "black",
            strokeWidth,
          })}
      </mask>
      <rect
        width={w}
        height={h}
        fill="black"
        fillOpacity={hoveredHold ? 0.75 : 0}
        mask="url(#mask-shade)"
        className="pointer-events-none transition-[fill-opacity] duration-300"
      />
      {/**/}
      {/* hovered holds, re-drawn on top of shade */}
      {hoveredHold && (
        <g
          fill="none"
          strokeWidth={strokeWidth}
          stroke={hoveredHold.color}
          className="pointer-events-none"
        >
          {holdRect(hoveredHold)}
          {hoveredHold.extra && <path d={hoveredHold.extra} />}
        </g>
      )}
    </svg>
  );
}

export default Holds;
