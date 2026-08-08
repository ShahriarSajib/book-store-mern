/**
 * services/catalogApi.js — categories/authors/publishers.
 */
import api from "./axios";

export const catalogApi = {
  categories: {
    list: () => api.get("/categories").then((r) => r.data),
    get: (id) => api.get(`/categories/${id}`).then((r) => r.data),
    create: (data) => api.post("/categories", data).then((r) => r.data),
    update: (id, data) => api.put(`/categories/${id}`, data).then((r) => r.data),
    remove: (id) => api.delete(`/categories/${id}`).then((r) => r.data),
  },
  authors: {
    list: () => api.get("/authors").then((r) => r.data),
    get: (id) => api.get(`/authors/${id}`).then((r) => r.data),
    create: (data) => api.post("/authors", data).then((r) => r.data),
    update: (id, data) => api.put(`/authors/${id}`, data).then((r) => r.data),
    remove: (id) => api.delete(`/authors/${id}`).then((r) => r.data),
  },
  publishers: {
    list: () => api.get("/publishers").then((r) => r.data),
    get: (id) => api.get(`/publishers/${id}`).then((r) => r.data),
    create: (data) => api.post("/publishers", data).then((r) => r.data),
    update: (id, data) => api.put(`/publishers/${id}`, data).then((r) => r.data),
    remove: (id) => api.delete(`/publishers/${id}`).then((r) => r.data),
  },
};

export default catalogApi;