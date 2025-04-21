import request from '@/utils/request';

// 创建订单
export const createOrder = async (data) => {
    try {
        const response = await request.post('/order/create', data);
        return response.data;
    } catch (error) {
        throw new Error('创建订单失败');
    }
}

// 查询订单列表
export const getOrderList = async (id) => {
    try {
        const response = await request.get(`/order/user/${id}`);
        return response.data;
    } catch (error) {
        throw new Error('查询订单列表失败');
    }
}

// 修改支付状态
export const updateOrderStatus = async (id) => {
    try {
        const response = await request.post(`/order/${id}/confirm-payment`);
        return response.data;
    } catch (error) {
        throw new Error('修改支付状态失败');
    }
}
