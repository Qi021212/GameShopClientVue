import request from '@/utils/request'

export const addToCart = (data) => {
    return request({
        url: '/cart/add',
        method: 'post',
        data
    })
}