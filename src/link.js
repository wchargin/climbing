import { useRouter } from "./router";
import { useStore } from "./store/context";

// Intra-app link. `to` should be an app path like "/" or "/routes/123/"; it
// should start and end with a slash. This will be a hard HTML link until the
// store has fully loaded, at which point it will turn into a soft link.
function Link({ to, children, ...rest }) {
  const { navigate, href } = useRouter();
  const { loaded } = useStore();

  function onClick(e) {
    e.preventDefault();
    navigate(to);
    window.scrollTo(0, 0);
    if (rest.onClick) rest.onClick.call(this, e);
  }

  return (
    <a href={href(to)} onClick={loaded ? onClick : rest.onClick} {...rest}>
      {children}
    </a>
  );
}

export default Link;
