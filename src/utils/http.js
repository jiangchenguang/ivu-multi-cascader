/**
 * 网络请求
 */
import axios from 'axios';
import { configs } from '@/configs';

axios.defaults.timeout = configs.axios.timeOut;

let ins = axios.create({
  // baseURL: 'http://127.0.0.1:7001',
});

const http = {
  /**
   * get请求接口
   * @param url
   * @param params
   * @returns {Promise<{success: boolean, errMsg: *}>}
   */
  async get(url, params) {
    try {
      let { data } = await ins.get(url);
      return data;
    } catch (err) {
      return {
        success: false,
        errMsg: err,
      }
    }
  }
};

export default http;