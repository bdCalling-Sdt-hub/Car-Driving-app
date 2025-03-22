import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://api.simplydispatch.ca/driverslog",
  prepareHeaders: async (headers) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
      headers.set("Accept", "*/*");
      headers.set("Access-Control-Allow-Origin", "*/*");
    }
    return headers;
  },
});

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["user", "blog", "faq", "about", "notification"],
  endpoints: () => ({}),
});

export const imageUrl = "http://210.4.77.100:8001/";

export default api;
