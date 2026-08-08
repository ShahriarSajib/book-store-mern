/**
 * services/uploadApi.js
 */
import api from "./axios";

export const uploadApi = {
  image: (formData) =>
    api.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),
};

export default uploadApi;