import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux"; // ✅ thêm dòng này
import store from "./redux/store"; // ✅ import store (đường dẫn đúng với project của bạn)

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      {" "}
      {/* ✅ Bọc App bằng Provider */}
      <App />
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
