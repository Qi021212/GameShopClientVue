import request from '@/utils/request';
import axios from 'axios';

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
// 获取特定分类商品列表
export const getProductCategory = async (category) => {
  try {
    const response = await request.get(`/product/${category}`);
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

// 更新商品
export const updateProduct = async (id, productData) => {
  try {
    const response = await request.put(`/product/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error('更新商品失败:', error);
    throw new Error('更新商品失败');
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
//将商品加进购物车

// 添加商品
export const addProduct = async (productData) => {
  try {
    const response = await request.post('/product/add', productData);
    return response.data;
  } catch (error) {
    console.error('添加商品失败:', error);
    throw new Error('添加商品失败');
  }
};

// 删除商品
export const deleteProduct = async (id) => {
  try {
    const response = await request.delete(`/product/${id}`);
    return response.data; // 返回删除成功的信息
  } catch (error) {
    console.error('删除商品失败:', error);
    throw new Error('删除商品失败');
  }
};

// 批量删除商品
export const deleteBatchProducts = async (ids) => {
  try {
    const response = await request.post('/product/batch-delete', ids);
    return response.data;
  } catch (error) {
    console.error('批量删除商品失败:', error);
    throw new Error('批量删除商品失败');
  }
};