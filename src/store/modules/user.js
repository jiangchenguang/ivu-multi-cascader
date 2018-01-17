import * as TYPES from '../mutation-types'
import { configs } from '@/configs'
import { http } from '@/utils'

const user = {
  state: {
    info: {},
  },
  getters: {
    userInfo: state => state.info,
  },
  mutations: {
    [TYPES.USER_SET_USER_INFO](state, userInfo) {
      state.info = {...userInfo};
    }
  },
  actions: {
    // 用户初始化
    async userInit({commit}) {
      let {data, success, errMsg} = await http.get(configs.path.userFile);
      if (success && data) {
        commit(TYPES.USER_SET_USER_INFO, data);
      }
      else {
        console.error('user init failed! err:', errMsg);
      }
    }
  }
}

export default user;