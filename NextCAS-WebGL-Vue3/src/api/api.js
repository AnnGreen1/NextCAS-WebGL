import request from "../utils/request";

// 剧本
export const drama = (data) => {
  data = data || {};
  return request({
    headers: {
      "Content-Type": "application/json",
      accessToken:
        "next6602d484f39da553d0977600@eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoicm9sZS5tYXN0ZXIiLCJ0aW1lc3RhbXAiOjE3MTIxMjgwMTQ5MzYsImV4cCI6MTcxMjEyODYxNH0.hrGAuYO-W7Y6aEKcR4VaEdv93MJTWXbuU170qFig2dc",
    },
    url: `https://nexthuman.cn/open/srv/drama/create3D`,
    method: "post",
    data,
  });
};

// 道具
export const daoju = (data) => {
    data = data || {};
    return request({
      headers: {
        "Content-Type": "application/json",
        accessToken:
          "next6602d484f39da553d0977600@eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoicm9sZS5tYXN0ZXIiLCJ0aW1lc3RhbXAiOjE3MTIxMjgwMTQ5MzYsImV4cCI6MTcxMjEyODYxNH0.hrGAuYO-W7Y6aEKcR4VaEdv93MJTWXbuU170qFig2dc",
      },
      url: `https://nexthuman.cn/open/srv/bundle/getBundles`,
      method: "post",
      data,
    });
  };

/**
 * ...
 * ...
 */
