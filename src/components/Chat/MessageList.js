import { useEffect, useRef, useState } from "react";

// 리덕스 접근
import { useDispatch, useSelector } from "react-redux";
import { actionCreators as chatAction } from "../../redux/modules/chat";

import MessageItem from "./MessageItem";
import styled from "styled-components";
import moment from "moment";
import InfinityScroll from "../../shared/InfiniteScroll";

const MessageList = ({ roomId, setIsTalk, isTalk, setIsMsg, isMsg }) => {
  const dispatch = useDispatch();
  // redux에 저장한 이전 메세지 가져오기
  const currentChat = useSelector((state) => state.chat.currentChat);
  const messages = useSelector((state) => state.chat.messages);
  const loading = useSelector((state) => state.chat.loading);

  const [scrollId, setScrollId] = useState();

  // 날짜별로 분류하기
  //1) 받아온 데이터 중 존재하는 날짜값만 가져오기
  const _dateArr = messages.map((el) => el.createdAt?.split(" ")[0]);
  const dateArr = [...new Set(_dateArr)];

  //2) 분류된 날짜에 해당하는 요소들끼리 묶어서 구분하기
  let messageSortArr = [];
  for (let i = 0; i < dateArr.length; i++) {
    messageSortArr.push({
      date: dateArr[i],
      messageArr: messages.filter((el) => (el.createdAt?.split(" ")[0] || undefined) === dateArr[i]),
    });
  }

  // 스크롤할 div useRef로 접근
  const scrollRef = useRef();
  const infinityRef = useRef();

  const getMessageList = () => {
    // 로딩 false인 경우에만 무한스크롤 콜백 함수 실행
    if (!loading) {
      dispatch(chatAction.getChatMessagesDB(roomId, currentChat.page, 10));
      dispatch(chatAction.isLoading(true));
      // 메세지 타입의 스크롤 이동 없도록 false로 변경
      setIsTalk(false);
      setIsMsg(false);
    }
  };

  // 페이지 입장 후 스크롤 이동
  useEffect(() => {
    if (currentChat.page > 1 && !isTalk && !isMsg) {
      // 1) 무한스크롤 작동 시, 스크롤 이동 (스크롤 닿은 메세지 아이템 위치 그대로 유지)
      setScrollId(currentChat.lastMessageId);
      infinityRef.current?.scrollIntoView();
    } else {
      // 2) 상대방 입장/퇴장 메세지는 스크롤 이동 없음
      if (!isMsg) {
        // 3) 내가 입장 및 TALK 타입 메세지일 경우, 스크롤 아래로 이동
        scrollRef.current.scrollIntoView();
      }
    }
  }, [getMessageList]);

  return (
    <>
      {messageSortArr && (
        <>
          <InfinityScroll callNext={getMessageList} paging={{ next: currentChat.next }} isChat>
            {messageSortArr.map((el, idx) => {
              return (
                <div key={idx}>
                  {el.date && <p className="caption sub_color t_center">{moment(el.date, "YYYY.MM.DD").format("YYYY년 MM월 DD일")}</p>}

                  <MessageBox className="chat-window card">
                    {el.messageArr.map((message, index) => {
                      if (scrollId && scrollId === message.id) {
                        return (
                          <div key={index} ref={infinityRef}>
                            <MessageItem {...message} />
                          </div>
                        );
                      } else {
                        return <MessageItem key={index} {...message} />;
                      }
                    })}
                  </MessageBox>
                </div>
              );
            })}
          </InfinityScroll>
        </>
      )}

      <div ref={scrollRef}> </div>
    </>
  );
};

const MessageBox = styled.div`
  margin-top: 20px;
`;

export default MessageList;
