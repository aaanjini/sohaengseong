import React, { useEffect } from "react";
import styled from "styled-components";
import { history } from "../../redux/configureStore";
import { useDispatch, useSelector } from "react-redux";

import { Button, Grid, Image } from "../../elements";

import { actionCreators as mypageAction } from "../../redux/modules/mypage";

import defaultImg from "../../image/img_profile_defalt @2x.png";
import bg from "../../image/img_bg@2x.png";
import ground from "../../image/img_ground@2x.png";

const MyLevel = (props) => {
  const dispatch = useDispatch();
  const my_level = useSelector((state) => state.mypage.myInfo);
  const levelNum = my_level && my_level.levelName.split("_")[0];
  const userInfo = useSelector((state)=> state.user.user)

  useEffect(()=>{
    if(userInfo){
      dispatch(mypageAction.getMyInfoDB(userInfo.userId));
      }
  }, [userInfo])


  return (
    <>
      {my_level && (
        <Wrap>
          <img className="ground" src={ground} alt="마이페이지 배경이미지"/>
          <MyContainer>
            <Grid is_flex padding="0px">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "calc(100% - 70px)",
                }}
              >
                <Image
                  shape="border"
                  size="42"
                  level={my_level.levelName}
                  profile={
                    my_level.profileUrl !== null
                      ? my_level.profileUrl
                      : defaultImg
                  }
                />
                <Grid padding="0px 0px 0px 9px" width="calc(100% - 54px)">
                  <p>{my_level.nickname}</p>
                  <p className="sub_color caption caption_color">
                    {levelNum}
                  </p>
                </Grid>
              </div>
              <Button
                small_btn
                onClick={() => {
                  if (my_level.kakao) {
                    history.push("/mypage/profile/edit");
                  } else {
                    history.push("/mypage/profile");
                  }
                }}
              >
                편집
              </Button>
            </Grid>
            <Progress my_level={my_level} />
          </MyContainer>
          <MyPlanet>
            <img src={my_level.levelIcon} alt="캐릭터 이미지"/>
          </MyPlanet>
        </Wrap>
      )}
    </>
  );
};

const Wrap = styled.div`
  height: 417px;
  padding: 20px;
  background-image: url(${bg});
  background-position: center;
  background-size: cover;
  position: relative;
  .ground {
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
  }
`;

const MyContainer = styled.div`
  background-color: #ffffff;
  width: 100%;
  border-radius: 8px;
  padding: 16px 20px;
`;

const MyPlanet = styled.div`
  width: 100%;
  position: absolute;
  bottom: 52px;
  left: 0;
  > img {
    display: block;
    width: 160px;
    margin: auto;
  }
`;

export default MyLevel;

const Progress = (props) => {
  const my_level = props.my_level;

  return (
    <>
      <ProgressBar>
        <HighLight
          width={(my_level.rankingPoint / my_level.experiencePoint) * 100 + "%"}
        ></HighLight>
      </ProgressBar>
      <p className="poppins sub_color caption t_right">
        {my_level.rankingPoint}/{my_level.experiencePoint}
      </p>
    </>
  );
};

const ProgressBar = styled.div`
  background: #f4f6fa;
  width: calc(100% - 54px);
  height: 8px;
  border-radius: 10px;
  display: flex; // HighLight와 Circle이 한 줄에 붙어있게 하도록.
  align-items: center; //세로로 중앙 정렬
  margin: 16px 20px 4px 54px;
`;

const HighLight = styled.div`
  max-width: 100%;
  background: #17abd6;
  transition: 1s;
  width: ${(props) => props.width};
  height: 100%;
  border-radius: 10px;
`;
