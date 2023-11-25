import { DataProvider, fetchUtils } from "react-admin";
import { stringify } from "query-string";
import {authProvider} from "./authProvider";

const httpClient = fetchUtils.fetchJson;

export const dataProvider: DataProvider = {
    getList: async (resource, params) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        const { id } = JSON.parse(localStorage.getItem('token') ?? '')
        const query = {
            id: JSON.stringify(id),
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
            filter: JSON.stringify(params.filter),
        };
        const url = `http://localhost:3000/${resource}/all?${stringify(query)}`;
        const { json } = await httpClient(url);
        return {
            data: json.data,
            total: json.total,
        };
    },
    getOne: async (resource, params) => {
        const url = `http://localhost:3000/${resource}/${params.id}`
        const { json } = await httpClient(url);
        return { data: json };
    },
    update: async (resource, params) => {
        const { id, data } = params
        const request = new Request(`http://localhost:3000/${resource}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
            headers: new Headers({ 'Content-Type': 'application/json' }),
        });
        return fetch(request)
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then(authInfo => {
                authProvider.getIdentity
                return Promise.resolve({
                    data: authInfo,
                });
            })
    },
    delete: async (resource, params) => {
        const url = `http://localhost:3000/${resource}/${params.id}`;
        const { json } = await httpClient(url, {
            method: 'DELETE',
        });
        return { data: json };
    },
};
