import { DataProvider, fetchUtils } from "react-admin";
import { stringify } from "query-string";

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
        const { json, headers } = await httpClient(url);
        console.log(json)
        return {
            data: json,
            total: parseInt(headers.get('content-range').split('/').pop(), 10),
        };
    },
    getOne: async (resource, params) => {
        const url = `http://localhost:3000/${resource}/${params.id}`
        const { json } = await httpClient(url);
        return { data: json };
    },
    update: async (resource, params) => {
        const previousData = JSON.parse(localStorage.getItem('token') ?? '');
        const request = new Request(`http://localhost:3000/${resource}/${params.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ params }),
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
                localStorage.setItem('token', JSON.stringify(authInfo));
                return Promise.resolve({
                    id: params.id,
                    data: authInfo,
                    previousData
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
