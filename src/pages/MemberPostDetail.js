import React from "react";
import styled from "styled-components";

import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { history } from "../redux/configureStore";
import { actionCreators as baseAction } from "../redux/modules/base";
import { actionCreators as memberAction } from "../redux/modules/member";
import { actionCreators as chatAction } from "../redux/modules/chat";

import PostCard from "../components/Member/PostCard";
import { Grid, Button } from "../elements";

const MemberPostDetail = (props) => {
  const dispatch = useDispatch();
  const challengeId = useParams().challengeId;
  const postId = +useParams().postId;
  const roomId = useParams().roomId;

  const targetPost = useSelector((state) => state.member.target);

  React.useEffect(() => {
    dispatch(memberAction.getOnePostDB(challengeId, postId, 0, 7));
    // header, footer 부분
    dispatch(baseAction.setHeader("", false));
    dispatch(baseAction.setGnb(false));
    return () => {
      dispatch(baseAction.setHeader(""));
      dispatch(baseAction.setGnb(true));
    };
  }, []);

  return (
    <>
      {targetPost && (
        <Grid margin="48px 0" padding="0">
          <div>
            <PostCard {...targetPost} />
          </div>
          <Fixed>
            <Grid padding="0" is_flex>
              <Button
                line_btn
                width="calc(30% - 4px)"
                _onClick={() => {
                  history.push(`/chatting/${roomId}`);
                }}
              >
                실시간 톡
              </Button>
              <Button
                width="calc(70% - 4px)"
                _onClick={() => {
                  history.push(`/postwrite/${challengeId}/${roomId}`);
                }}
              >
                인증하기
              </Button>
            </Grid>
          </Fixed>
        </Grid>
      )}
    </>
  );
};

const Fixed = styled.div`
  width: 100%;
  position: fixed;
  background-color: #fff;
  bottom: 0;
  left: 0;
  padding: 12px 20px;
  box-shadow: 0 -5px 6px 0 rgba(0, 0, 0, 0.04);
`;

export default MemberPostDetail;
