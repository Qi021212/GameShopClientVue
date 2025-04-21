import request from '@/utils/request';

// 查看购物车
export const getGameList = async (id) => {
    try {
        const response = await request.get(`/games/${id}`);
        return response.data;
    } catch (error) {
        throw new Error('获取游戏库列表失败');
    }
};
