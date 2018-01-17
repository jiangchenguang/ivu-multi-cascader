import * as TYPES from "../mutation-types";
import { configs } from '@/configs';
import { http } from '@/utils';

const app = {
  state: {
    // 目录数据
    menuData: [],
    // 常用目录
    frequentMenu: [],
    // 导航栏模块
    topNav: {
      // 当前激活
      activeIndex: -1,
    },
    // 侧边栏模块
    sideBar: {
      // 是否展开
      isExtend: true,
      // 当前激活
      activeId: '',
      // 搜索相关
      search: {
        // 用户需要搜索
        userNeedSearch: false,
        // 搜啥
        txt: '',
      }
    },
  },
  getters: {
    // 导航目录列表
    navMenu: state => state.menuData,
    // 当前激活的导航index
    navActiveIndex: state => state.topNav.activeIndex,
    // 常用目录
    frequentMenu: state => state.frequentMenu,
    // 侧边目录列表
    sideMenu: state => {
      if (state.topNav.activeIndex === -1) {
        return state.frequentMenu;
      }
      let nav = state.topNav;
      return (state.menuData[ nav.activeIndex ] && state.menuData[ nav.activeIndex ].children)
        ? state.menuData[ nav.activeIndex ].children
        : []
    },
    // 侧边栏当前激活的btnID
    sideActiveId: state => state.sideBar.activeId,
    // 侧边栏是否展开
    sideIsExtend: state => state.sideBar.isExtend,
    // 侧边栏搜索内容
    sideSearchTxt: state => state.sideBar.search.txt,
    // 用户是否需要搜索
    sideUserNeedSearch: state => state.sideBar.search.userNeedSearch,
  },
  mutations: {
    [ TYPES.APP_SET_NAV_LIST ](state, list) {
      state.menuData.splice(0, state.menuData.length, ...list);
    },

    [ TYPES.APP_NAV_FREQUENT_MENU ](state, list) {
      state.frequentMenu.splice(0, state.frequentMenu.length, ...list);
    },

    [ TYPES.APP_SET_NAV_ACTIVE_BTN ](state, index) {
      // todo optimization：暂时使用-1表示常用菜单，后期优化
      if (index < -1 || index > state.menuData.length - 1)
        return;

      state.topNav.activeIndex = index;
    },

    [ TYPES.APP_SIDE_EXTEND ](state) {
      state.sideBar.isExtend = !state.sideBar.isExtend;
    },

    [ TYPES.APP_SET_ACTIVE_BTN_ID ](state, btnId) {
      state.sideBar.activeId = btnId;
    },

    [ TYPES.APP_SET_SIDE_SEARCH_TEXT ](state, txt) {
      state.sideBar.search.txt = txt;
    },

    [ TYPES.APP_SIDE_USER_SEARCH ](state, ifNeed) {
      state.sideBar.search.userNeedSearch = ifNeed;
    }
  },
  actions: {
    // store初始化
    async appInit({ commit }) {
      let {data, success, errMsg} = await http.get(configs.path.menuFile);
      if (success) {
        let {menus, frequents} = data;
        let formatted = format(menus);
        commit(TYPES.APP_SET_NAV_LIST, formatted);


        let menu = frequents.map(i => ({
          name: i.id,
          title: i.title,
          path: i.url,
          icon: 'ios-circle-outline',
        }))
        commit(TYPES.APP_NAV_FREQUENT_MENU, menu);
      }


      // 目录数据格式化
      function format(menuData) {
        let root = [];
        menuData.map(first => {
          root.push(handleFirstClass(first));
        })
        return root;

        // 一级目录（导航栏）
        function handleFirstClass(first) {
          return {
            name: first.id,
            title: first.title,
            children: first.children ? first.children.map(i => handleSecondClass(i)) : []
          }

          // 二级目录（侧边栏一级）
          function handleSecondClass(second) {
            return {
              name: second.id,
              title: second.title,
              icon: second.icon ? second.icon : 'crop',
              path: second.url,
              children: second.children ? second.children.map(i => handleThirdClass(i)) : []
            }

            // 三级目录（侧边栏二级）
            function handleThirdClass(third) {
              return {
                name: third.id,
                title: third.title,
                path: third.url,
                icon: 'ios-circle-outline',
              }
            }
          }
        }
      }
    },

    // 设置当前激活的nav btn
    setNavCurrIndex({ commit }, index) {
      commit(TYPES.APP_SET_NAV_ACTIVE_BTN, index);
    },

    // 设置侧边栏 展开收起状态
    setSideExtend({ commit }) {
      commit(TYPES.APP_SIDE_EXTEND);
    },

    // 设置激活的侧边栏btn id
    setActiveBtnId({ commit }, btnId) {
      commit(TYPES.APP_SET_ACTIVE_BTN_ID, btnId);
    },

    // 设置侧边栏搜索内容
    setSideSearchTxt({ commit }, txt) {
      commit(TYPES.APP_SET_SIDE_SEARCH_TEXT, txt);
    },

    // 设置用户是否正在搜索
    setSideUserSearch({ commit }, ifNeed) {
      commit(TYPES.APP_SIDE_USER_SEARCH, ifNeed);
    },
  },
};

export default app;