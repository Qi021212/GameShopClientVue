import request from '@/utils/request';

// 获取商品列表
export const getProductsList = async () => {
  try {
    const response = await request.get('/product/main');
    // 返回后端返回的 JSON 数据
    return response.data;
  } catch (error) {
    console.error('获取商品数据失败:', error);
    throw new Error('获取商品数据失败');
  }
};

//使用id获取商品详情
export const getProductDetail = async (id) => {
  try {
    const response = await request.get(`/product/${id}`);
    return response.data; // 返回后端的 JSON 数据
  } catch (error) {
    console.error('获取商品详情失败:', error);
    throw new Error('获取商品详情失败');
  }
};


// 添加评论
export function addProductComment(productId, content, userId) {
  const formData = new FormData()
  formData.append('content', content)

  return request({
    url: `/product/${productId}/comments`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-User-Id': userId // 添加自定义请求头
    }
  })
}
