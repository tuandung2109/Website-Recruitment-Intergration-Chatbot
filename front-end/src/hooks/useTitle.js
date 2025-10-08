import { useEffect } from "react";

function UseTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

export default UseTitle;
