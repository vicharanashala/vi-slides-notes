import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000/api", //  backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

//  REGISTER
export const registerUser = (data: any) => {
  return API.post("/auth/register", data);
};

//  LOGIN
export const loginUser = (data: any) => {
  return API.post("/auth/login", data);
};

export default API;