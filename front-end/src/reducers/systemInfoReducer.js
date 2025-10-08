// src/reducers/systemInfoReducer.js

const initialState = {
  siteName: "JObVip", // giá trị mặc định
};

const systemInfoReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_SYSTEM_INFO":
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default systemInfoReducer;
