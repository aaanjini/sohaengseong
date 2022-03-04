import React, { useEffect } from "react";
import styled from "styled-components";
import { history } from "../redux/configureStore";
import { useSelector } from "react-redux";
import { Grid } from "../elements";
import Card from "./Card";
import MypageCard from "./MypageCard";
import { challengeApis } from "../shared/apis";

const MyChallenge = (props) => {
  const my_list = useSelector((state) => state.mypage.list);
  const before_list = my_list.filter((l) => l.status === "before"); //모집 중인 챌린지
  const ing_list = my_list.filter((l) => l.status === "ing"); // 진행 중인 챌린지(오늘의 챌린지)
  const completed_list = my_list.filter(
    (l) => l.status === "success" || l.status === "fail"
  ); // 지난 챌린지(success+fail)
  console.log(completed_list);

  useEffect(() => {
    challengeApis
      .getChallenge()
      .then((res) => {
        console.log("챌린지 전체 조회", res);
      })
      .catch((err) => {
        console.log("챌린지 전체 조회 오류", err);
      });
  });

  return (
    <>
      <Wrap>
        <StatusContainer>
          <Grid padding="14px">
            <Grid center>
              <p>진행중</p>
              <p>{ing_list.length}</p>
            </Grid>
          </Grid>
          <Grid padding="14px">
            <Grid center>
              <p>완료</p>
              <p>{completed_list.length}</p>
            </Grid>
          </Grid>
        </StatusContainer>
        <Grid padding="24px 0px 0px">
          <Title>오늘의 챌린지</Title>
          <SubTitle>현재 진행중인 습관 챌린지</SubTitle>
          <MypageCard></MypageCard>
          {ing_list.map((el, i) => {
            return (
              <Card
                key={el.challengeId}
                {...el}
                _onClick={() => {
                  history.push(`/member/${el.challengeId}`); //멤버 전용 페이지로 이동
                }}
              ></Card>
            );
          })}
        </Grid>

        <Grid padding="24px 0px 0px">
          <Title>입주민 모집중</Title>
          <SubTitle>내가 개설한 챌린지</SubTitle>
          {before_list.map((el, i) => {
            return (
              <Card
                key={el.challengeId}
                {...el}
                _onClick={() => {
                  history.push(`/challenge/${el.challengeId}`); //소개 페이지로 이동
                }}
              ></Card>
            );
          })}
        </Grid>

        <Grid padding="24px 0px 0px">
          <Title>지나온 행성들</Title>
          <SubTitle>내가 진행했던 챌린지</SubTitle>
          {completed_list.map((el, i) => {
            // 지난 챌린지 중 성공일 경우
            if (el.status === "success") {
              return (
                <Card
                  key={el.challengeId}
                  {...el}
                  _onClick={() => {
                    history.push(`/challenge/${el.challengeId}`); //소개 페이지로 이동
                  }}
                  bg="orange"
                ></Card>
              );
            }
            // 지난 챌린지 중 실패일 경우
            return (
              <Card
                key={el.challengeId}
                {...el}
                _onClick={() => {
                  history.push(`/challenge/${el.challengeId}`); //소개 페이지로 이동
                }}
                bg="red"
              ></Card>
            );
          })}
        </Grid>
      </Wrap>
    </>
  );
};

const Wrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const StatusContainer = styled.div`
  display: flex;
  width: 335px;
  height: 69px;
  border-radius: 8px;
  background-color: #f7f7f7;
  p:first-child {
    font-size: 12px;
    color: #808080;
  }
  p:last-child {
    font-size: 16px;
    font-weight: bold;
    color: #000;
  }
`;

const Title = styled.h3`
  font-size: 18px;
`;

const SubTitle = styled.p`
  opacity: 0.5;
  font-size: 13px;
  font-weight: bold;
  line-height: 1.69;
  font-size: 13px;
  color: #5f5f5f;
  margin-bottom: 12px;
`;

export default MyChallenge;
