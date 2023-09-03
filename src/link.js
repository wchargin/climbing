import { forwardRef } from "react";

import { useRouter } from "./router";
import { useStore } from "./store/context";
import { useTelescroll } from "./telescroll";

// Intra-app link. `to` should be an app path like "/" or "/routes/123/"; it
// should start and end with a slash. This will be a hard HTML link until the
// store has fully loaded, at which point it will turn into a soft link.
function Link({ to, children, scrollTo, ...rest }, ref) {
  const { navigate, href } = useRouter();
  const { loaded } = useStore();
  const { requestScroll } = useTelescroll();

  function onClick(e) {
    // Let ctrl-click (to open in new tab), etc. pass through unchanged.
    if (isModifiedEvent(e)) return;

    e.preventDefault();
    navigate(to);
    if (scrollTo == null) {
      window.scrollTo(0, 0);
    } else {
      requestScroll(scrollTo);
    }
    if (rest.onClick) rest.onClick.call(this, e);
  }

  return (
    <a
      ref={ref}
      href={to != null ? href(to) : null}
      onClick={to != null && loaded ? onClick : rest.onClick}
      {...rest}
    >
      {children}
    </a>
  );
}

/*! `isModifiedEvent`: adapted from the function of the same name in
 * `next/link`, which is provided under the MIT License by Vercel, Inc.
 */
function isModifiedEvent(e) {
  const anchorTarget = e.currentTarget.getAttribute("target");
  if (anchorTarget && anchorTarget !== "self") return true;
  return (
    e.metaKey ||
    e.ctrlKey ||
    e.shiftKey ||
    e.altKey ||
    e.nativeEvent?.which === 2
  );
}

export default forwardRef(Link);
