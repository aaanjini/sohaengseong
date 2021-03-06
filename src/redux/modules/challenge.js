import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";

import { challengeApis } from "../../shared/apis";
import { mainApis } from "../../shared/apis";

import { actionCreators as chatAction } from "./chat";

const GET_CHALLENGE = "GET_CHALLENGE";
const TARGET_CHALLENGE = "TARGET_CHALLENGE";
const GET_CATEGORY = "GET_CATEGORY";
const GET_CATEGORY_LIST = "GET_CATEGORY_LIST";
const ADD_CHALLENGE = "ADD_CHALLENGE";
const EDIT_CHALLENGE = "EDIT_CHALLENGE";
const GET_RECOMMEND_LIST = "GET_RECOMMEND_LIST"

//DB에서 챌린지 전체 리스트 가져오는 액션
const getChallenge = createAction(GET_CHALLENGE, (challenge_data) => ({
  challenge_data,
}));
//DB에서 특정 챌린지 가져오는 액션
export const targetChallenge = createAction(TARGET_CHALLENGE, (target) => ({
  target,
}));
//챌린지 등록 액션
const addChallenge = createAction(ADD_CHALLENGE, (challenge) => ({
  challenge,
}));
//챌린지 수정 액션
const editChallenge = createAction(
  EDIT_CHALLENGE,
  (challengeId, challenge) => ({ challengeId, challenge })
);
//카테고리를 가져오는 액션
const getCategory = createAction(GET_CATEGORY, (category) => ({ category }));
//카테고리에 맞는 챌린지 리스트를 가져오는 액션
const getCategoryList = createAction(
  GET_CATEGORY_LIST,
  (categoryId, category_data) => ({ categoryId, category_data })
);

const getRecommendList = createAction(GET_RECOMMEND_LIST, (recommendList) => ({
  recommendList,
}));


const initialState = {
  list: [],
  target: null,
  page: 0,
  next: false,
  is_loading: false,
  totalCnt: 0,
  categoryList: [],
  recommendList: [],
};

const getChallengeDB = (page, size) => {
  return function (dispatch, getState, { history }) {
    challengeApis
      .getChallenge(page, size)
      .then((res) => {
        const challenge_data = {
          challenge_list: res.data.challengeList,
          page: page + 1,
          next: res.data.next,
          totalCnt: res.data.totalCnt,
        };

        dispatch(getChallenge(challenge_data));
      })
      .catch((err) => {
        console.log("전체 챌린지 조회 오류", err);
      });
  };
};

const getOneChallengeDB = (challengeId) => {
  return function (dispatch, getState, { history }) {
    challengeApis
      .getOneChallenge(challengeId)
      .then((res) => {
        const target = res.data;
        dispatch(targetChallenge(target));
      })
      .catch((err) => {
        console.log("특정 챌린지 조회 오류", err);
      });
  };
};

const joinChallengeDB = (challengeId) => {
  return function (dispatch, getState, { history }) {
    challengeApis
      .joinChallenge(challengeId)
      .then((res) => {
        history.push(`/member/${challengeId}`);
      })
      .catch((err) => {
        console.log("챌린지 참여하기 오류", err);
        window.alert(err.response.data.message);
        history.replace("/");
      });
  };
};

const addChallengeDB = (challenge) => {
  return function (dispatch, getState, { history }) {
    challengeApis
      .addChallenge(challenge)
      .then((res) => {
        dispatch(
          chatAction.createRoomDB({ challengeId: res.data.challengeId })
        );
        history.replace("/today");
      })
      .catch((err) => {
        console.log("챌린지 등록 오류", err);
        window.alert("챌린지 등록 오류");
      });
  };
};

const editChallengeDB = (challengeId, challenge) => {
  return function (dispatch, getState, { history }) {
    challengeApis
      .editChallenge(challengeId, challenge)
      .then((res) => {
        history.replace(`/member/detail/${challengeId}`);
      })
      .catch((err) => {
        console.log("챌린지 수정 오류", err);
        window.alert("챌린지 수정 오류");
      });
  };
};

const deleteChallengeDB = (challengeId) => {
  return function (dispatch, getState, { history }) {
    challengeApis
      .deleteChallenge(challengeId)
      .then((res) => {
        history.replace("/");
      })
      .catch((err) => {
        window.alert("챌린지 삭제 오류");
        console.log("챌린지 삭제 오류", err);
      });
  };
};

const categoryChallengeDB = (categoryId, page, size) => {
  return function (dispatch, getState, { history }) {
    challengeApis
      .categoryChallenge(categoryId, page, size)
      .then((res) => {
        const category_data = {
          category_list: res.data.challengeList,
          page: page + 1,
          next: res.data.next,
          totalCnt: res.data.totalCnt,
        };

        dispatch(getCategoryList(categoryId, category_data));
      })
      .catch((err) => {
        console.log("카테고리 챌린지 오류", err);
      });
  };
};

const getCategoryDB = () => {
  mainApis
    .category()
    .then((res) => {
      console.log("카테고리", res);
    })
    .catch((err) => {
      console.log("카테고리", err);
    });
};

const getRecommendDB = (challengeId) => {
  return function (dispatch, getState, { history }) {
    challengeApis
      .recommendChallenge(challengeId)
      .then((res) => {
        dispatch(getRecommendList(res.data));
      })
      .catch((err) => console.log(err));
  };
};

export default handleActions(
  {
    [GET_CHALLENGE]: (state, action) =>
      produce(state, (draft) => {
        if (action.payload.challenge_data.page > 1) {
          draft.list.push(...action.payload.challenge_data.challenge_list);
        } else {
          // 처음 요청할 때는 list 초기화 시키기
          draft.list = action.payload.challenge_data.challenge_list;
        }

        draft.page = action.payload.challenge_data.page;
        draft.next = action.payload.challenge_data.next;
        draft.totalCnt = action.payload.challenge_data.totalCnt;
        draft.is_loading = false;
      }),

    [ADD_CHALLENGE]: (state, action) =>
      produce(state, (draft) => {
        draft.list.unshift(action.payload.challenge);
      }),

    [EDIT_CHALLENGE]: (state, action) =>
      produce(state, (draft) => {
        let idx = draft.list.findIndex(
          (p) => p.challengeId === action.payload.challengeId
        );
        draft.list[idx] = { ...draft.list[idx], ...action.payload.challenge };
      }),

    [TARGET_CHALLENGE]: (state, action) =>
      produce(state, (draft) => {
        draft.target = action.payload.target;
      }),
    [GET_CATEGORY]: (state, action) =>
      produce(state, (draft) => {
        draft.category = action.payload.category;
      }),
    [GET_CATEGORY_LIST]: (state, action) =>
      produce(state, (draft) => {
        if (action.payload.category_data.page > 1) {
          draft.categoryList.push(
            ...action.payload.category_data.category_list
          );
        } else {
          draft.categoryList = action.payload.category_data.category_list;
        }

        draft.page = action.payload.category_data.page;
        draft.next = action.payload.category_data.next;
        draft.totalCnt = action.payload.category_data.totalCnt;
        draft.is_loading = false;
      }),
    [GET_RECOMMEND_LIST]: (state, action) =>
      produce(state, (draft) => {
        draft.recommendList = action.payload.recommendList;
      }),
  },
  initialState
);

const actionCreators = {
  //액션 생성자 내보내기
  getChallengeDB,
  getCategory,
  getOneChallengeDB,
  joinChallengeDB,
  addChallenge, //실험용 -> 서버랑 연결 후 지울 것
  addChallengeDB,
  editChallengeDB,
  editChallenge,
  deleteChallengeDB,
  categoryChallengeDB,
  getCategoryDB,
  getRecommendDB,
};

export { actionCreators };
