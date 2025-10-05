// const API = `https://topcv-api.vercel.app/api` || "http://localhost:9000/api";
// const API = process.env.NODE_ENV === "http://localhost:9000/api";
const API =
  process.env.NODE_ENV === "development"
    ? "http://localhost:9000/api"
    : "https://your-production-url.com/api";

export const _get = async (path) => {
  const response = await fetch(API + path, {
    method: "GET",
    credentials: "include",
  });
  return response;
};

export const _post = async (path, data) => {
  const isFormData = data instanceof FormData;
  const options = {
    method: "POST",
    credentials: "include",
  };
  if (isFormData) {
    options.body = data;
  } else {
    options.headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    options.body = JSON.stringify(data);
  }
  const response = await fetch(API + path, options);
  return response;
};
// export const _post = async (path, data) => {
//   const isFormData = data instanceof FormData;
//   const options = {
//     method: "POST",
//     credentials: "include",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data),
//   };

//   if (!isFormData) {
//     options.headers = {
//       Accept: "application/json",
//       "Content-Type": "application/json",
//     };
//     options.body = JSON.stringify(data);
//   }

//   const response = await fetch(API + path, options);
//   return response;
// };

export const _patch = async (path, data) => {
  const isFormData = data instanceof FormData;
  const options = {
    method: "PATCH",
    credentials: "include",
    body: data,
  };
  if (!isFormData) {
    options.headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    options.body = JSON.stringify(data);
  }
  const response = await fetch(API + path, options);
  return response;
};

export const _delete = async (path) => {
  const response = await fetch(API + path, {
    method: "DELETE",
    credentials: "include",
  });
  return response;
};
