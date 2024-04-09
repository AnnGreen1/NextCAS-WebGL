import request from "../utils/request";

// 随机土味情话
export const getBundlesList = (data) => {
  data = data || {};
  return request({
    headers: {
      accessToken:
        "next6602d484f39da553d0977600@eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoicm9sZS5tYXN0ZXIiLCJ0aW1lc3RhbXAiOjE3MTI1NDM0NzIzNDMsImV4cCI6MTcxMjU0NTI3Mn0.NBNpRcD41GpLTozQFjHZ4Mnm9YO_XTHQpHSpIWW6X8k",
      "Content-Type": "application/json",
    },
    url: `https://nexthuman.cn/open/srv/bundle/getBundles`,
    method: "post",
    data,
  });
};

// 随机土味情话
export const getToken = (data) => {
  data = data || {};
  return request({
    url: `http://localhost:3000/token`,
    method: "get",
    data,
  });
};
