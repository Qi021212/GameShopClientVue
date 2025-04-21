import request from '@/utils/request';

// 查看购物车
export const getCartList = async (id) => {
    try {
        const response = await request.get(`/cart/${id}`);
        return response.data;
    } catch (error) {
        throw new Error('获取购物车列表失败');
    }
};

// 删除商品
export const deleteCartItem = async (id) => {
    try {
        const response = await request.delete(`/cart/delete/${id}`);
        return response.data;
    } catch (error) {
        throw new Error('删除购物车商品失败');
    }
}

// 选中状态
export const updateCartItemStatus = async (ids) => {
    try {
        // 直接发送数组而不是对象
        const response = await request.post('/cart/select', ids);
        return response.data;
    } catch (error) {
        throw new Error('更新购物车商品状态失败');
    }
}