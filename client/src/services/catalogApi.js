/**
 * services/catalogApi.js — categories/authors/publishers.
 */
import api from "./axios";

export const catalogApi = {
  categories: {
    list: (params) => api.get("/categories", { params }).then((r) => r.data),
    get: (id) => api.get(`/categories/${id}`).then((r) => r.data),
    create: (data) => api.post("/categories", data).then((r) => r.data),
    update: (id, data) => api.put(`/categories/${id}`, data).then((r) => r.data),
    remove: (id) => api.delete(`/categories/${id}`).then((r) => r.data),
  },
  authors: {
    list: (params) => api.get("/authors", { params }).then((r) => r.data),
    get: (id) => api.get(`/authors/${id}`).then((r) => r.data),
    create: (data) => api.post("/authors", data).then((r) => r.data),
    update: (id, data) => api.put(`/authors/${id}`, data).then((r) => r.data),
    remove: (id) => api.delete(`/authors/${id}`).then((r) => r.data),
  },
  publishers: {
    list: (params) => api.get("/publishers", { params }).then((r) => r.data),
    get: (id) => api.get(`/publishers/${id}`).then((r) => r.data),
    create: (data) => api.post("/publishers", data).then((r) => r.data),
    update: (id, data) => api.put(`/publishers/${id}`, data).then((r) => r.data),
    remove: (id) => api.delete(`/publishers/${id}`).then((r) => r.data),
  },
};

export default catalogApi;