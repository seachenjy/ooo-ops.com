import request from '@/utils/request'

// treemap
export const treemap = (params)=>{
    return request({
        url: '/api/treemap',
        method: 'get',
        params
    })
}

// stocks
export const stocks = (params)=>{
    return request({
        url: '/api/stocks',
        method: 'get',
        params
    })
}