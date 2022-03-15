import React from "react";
import styled from "styled-components";
import { history } from "../redux/configureStore";
import { useSelector, useDispatch } from "react-redux";
import { challengeApis } from "../shared/apis";
import { targetChallenge } from "../redux/modules/challenge";
import { apis } from "../shared/apis";
import moment from "moment";

//비밀방 비밀번호 커스텀
import ReactCodeInput from "react-code-input";

//이미지 슬라이더(Swiper) import 
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper';
import 'swiper/css/bundle';
import 'swiper/css/pagination';

//모달팝업
import Modal from '../components/Modal';

//사용자 import
import {Grid, Image, Button, Tag} from "../elements/index";
import { actionCreators as challengeAction } from "../redux/modules/challenge";
import * as baseAction from '../redux/modules/base';
import empty from "../image/ic_empty_s@2x.png";
import defaultImg from "../image/img_profile_defalt @2x.png";
import crown from "../image/icons/ic_crown@2x.png";
import share from "../image/icons/ic_share@2x.png"




const ChallengeDetail = (props) => {
    moment.locale("en"); //모멘트 영어로 바꾸기

    const dispatch = useDispatch();
    const userInfo = parseInt(localStorage.getItem("userId"));
    const challengeId = props.match.params.challengeId;
    const target = useSelector(state => state.challenge.target);
    const tagList = target&&target.tagName;
    const members = target&&target.members;
    const member_idx = members&&members.findIndex((m) => m.userId === parseInt(target.userId));
    const member = members&&members.find((m) => m.userId === parseInt(userInfo));
    const admin = members&&members[member_idx];      
    const imageList = target&&target.challengeImage;

    //날짜 포맷 변경 뒤 날짜 간격 계산하기
    const startDate = target&&`${target.startDate.split(" ")[0].split("-")[0]}`;
    const endDate = target&&`${target.endDate.split(" ")[0].split("-")[0]}`;
    const today = moment().format('YYYY.MM.DD'); //오늘 날짜
    const dateA = moment(startDate, 'YYYY.MM.DD');
    const dateB = moment(endDate, 'YYYY.MM.DD');
    const days = dateA.from(dateB).split(" ")[0] === 'a' ? "30" : parseInt(dateA.from(dateB).split(" ")[0])+1; //16 days ago 이런 식으로 나와서 자름
    const after = moment(today).isAfter(dateA); //오늘 날짜 이후라면 true 아니면 false
    const join_day = dateB.from(today).split(" ")[0] === 'in' ? dateB.from(today).split(" ")[1] : null;
    //const join_day = dateB.from(today).split(" ");
    const remaining_day = Math.ceil(days*0.8); //입장 가능한 기간

    const joinChallenge = () => {
        dispatch(challengeAction.joinChallengeDB(challengeId));
    };

    const deleteChallenge = () => {
        dispatch(challengeAction.deleteChallengeDB(challengeId));
    };

    //모달 팝업 -----------------------------------------
    const [modalType, setModalType] = React.useState("");
    const [modalOpen, setModalOpen] = React.useState(false);
    const [checkPrivate, setCheckPrivate] = React.useState(false);//비밀방 비밀번호 맞는지 확인
    const [error,setError] = React.useState("");
    const [isNum,setIsNum] = React.useState(false);//비밀방 비밀번호 숫자체크
    const [join, setJoin] = React.useState(false); //입장하기 클릭여부
    const [privatePwd, setPrivatePwd] = React.useState(""); //비밀방 비밀번호 value
   
    const deleteModal = () => {        
        setModalType("deleteModal");
        console.log("챌린지 삭제");
        setModalOpen(true);
    };
    const joinModal = () => {
        if(!target.isPrivate){
            setModalType("joinModal");
        }else {
            setModalType("privateModal");
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        console.log("눌림");
        setModalOpen(false);
        setPrivatePwd("");
    };

    const privateCheck = (e) => {   
        setIsNum(false);        
        const pwdRegex = /^[0-9]+$/;   
        const pwdcurrent = e; 
        let PwdRegex = pwdRegex.test(e);

        setPrivatePwd(e);

        if (!PwdRegex) {
            setIsNum(false);            
        } else {
            setIsNum(true);
        }
    };

    const pwdCheck = () => {
        setJoin(true);

        apis.post(`/challenge/${challengeId}/private`, {password:privatePwd})
        .then((res)=>{
            console.log("비번 맞?",res, checkPrivate);
            if(res.data.result === 'true'){
                setCheckPrivate(true);
                history.push(`/member/${challengeId}`);
                //dispatch(challengeAction.joinChallengeDB(challengeId));
            }else{
                setCheckPrivate(false);
            }
        }).catch((err)=>{
            console.log("비밀번호 확인오류",err);
            setError(err.response.data.message);
            setCheckPrivate(false);
        });
    };

    
    React.useEffect(() => {
        challengeApis.getOneChallenge(challengeId)
        .then((res)=>{
            console.log("한개", res);
            const target = res.data;
            dispatch(targetChallenge(target));
            //헤더&푸터 state        
            dispatch(baseAction.setHeader(target.title,true));
        }).catch((err)=>{
            console.log("특정 챌린지 조회 오류",err);
        });
        dispatch(baseAction.setGnb(false));
        return()=>{
            dispatch(baseAction.setHeader(false,""));
            dispatch(baseAction.setGnb(true));
        }
    },[]);

    return(
        <>  
        {target&&
            <Grid padding="0" margin="48px 0 0" >
                <Grid padding="0" style={{position:"relative"}}>
                    <ShareBtn></ShareBtn>
                    {imageList.length > 0?
                        <Swiper
                            spaceBetween={0}
                            slidesPerView={1}
                            pagination={{
                                type : 'fraction', //페이지네이션 타입                 
                            }}
                            modules={[Pagination]}
                            className="mySwiper"
                            >
                            {imageList.map((el,i)=>{
                                return(
                                    <SwiperSlide key={i}><Image shape="rectangle" padding="250px" src={el?el:defaultImg}></Image></SwiperSlide>
                                );
                            })}
                        </Swiper>
                        //이미지 리스트에 이미지가 없다면 디폴트 이미지 노출 (디폴트 이미지 변경예정)
                        : <Image shape="rectangle" padding="250px" src={empty}></Image>
                    }
                </Grid>
                <Grid bg="#fff" margin="0 0 10px" padding="20px">
                    <TitleBox>
                        <h1>{target.title}</h1>
                    </TitleBox>
                    <p className="sub_color">{target.category}</p>
                    <Grid padding="0" margin="8px 0 12px" style={{display:"flex", alignContent:"space-between"}}>
                        {tagList.map((el, i) => {
                            return <Tag key={i} tag={el} className="detailPage"></Tag>;
                        })}
                    </Grid>
                    <StatusContainer>
                        <div>
                            <Grid center>
                            <p className="caption caption_color mb4">기간</p>
                            <p className="poppins">{days}일</p>
                            </Grid>
                        </div>
                        <div>
                            <Grid center>
                            <p className="caption caption_color mb4">멤버</p>
                            <p className="poppins">{target.members.length !== 0 ? target.members.length: "0"}<span className="sub_color">/{target.maxMember}</span></p>
                            </Grid>
                        </div>
                        <div>
                            <Grid center>
                                <p className="caption caption_color mb4">공개여부</p>
                                <h3 className="">{target.isPrivate ? "비공개" : "공개"}</h3>
                            </Grid>
                        </div>
                    </StatusContainer>               
                </Grid>

                <Grid bg="#fff" padding="20px 20px 0">
                    <Title>소행성 설명</Title>
                    <ContentBox style={{marginBottom:"20px"}}>
                        <div className="admin_profile">
                            <Image shape="border" 
                                size="40"
                                level={admin.levelName}
                                profile={admin.profileImage !== null ? admin.profileImage : defaultImg}
                            >
                            </Image>                            
                            <h3>{admin.nickname}</h3>
                        </div>
                        <pre style={{fontSize:"14px",whiteSpace: "pre-wrap"}}>{target.content}</pre>
                    </ContentBox>
                    {/* 현재인원 - 디자인 확정 후 작업예정 */}
                    <Title>현재 입주민</Title>
                    <Grid padding="0" style={{display: "flex", alignItems: "center", paddingBottom: "3px"}}>
                        {members&&members.map((el, i) => {
                            return (
                                //만약에 방을 만든 userId와 멤버의 userId가 같은 경우(방장인 경우) className을 붙여준다.
                                <Member key={el.userId} className={admin.userId === el.userId? "admin" : ""}>                                    
                                    <Image shape="border" 
                                        size="40"
                                        level={el.levelName}
                                        profile={el.profileImage !== null? el.profileImage : defaultImg}
                                    >
                                    </Image>
                                </Member>
                            );
                        })}
                        <p style={{marginLeft:"3px"}}>외 {members.length > 4? members.length:0}명</p>
                    </Grid>
                    <Notice>
                        <p className="bold sub_color">유의사항</p>
                        <ul>
                            <li className="sub_color">시작 이후에는 퇴장 시 패널티가 있으므로, 신중히 선택하시기 바랍니다.</li>
                            <li className="sub_color mt4">인증 규정 등 기타 문의 사항은 채팅방을 통해 개설자에게 직접 문의 부탁드립니다.</li>
                        </ul>
                    </Notice>
                </Grid>                
                <Fixed>
                    {target.status === "완료" || remaining_day > join_day ? ( //상태값이 완료거나 입장 가능한 기간이 지난 경우
                        //기간 끝남
                        <Button _disabled
                        >기간이 만료되었습니다.</Button>
                    ): (                        
                        <>
                        {target.maxMember !== members.length ?  member !== undefined ?(                       
                           //내가 참여중인 챌린지
                           <Button _disabled
                           >이미 입주한 행성입니다.</Button>
                       ):(
                           //참여가능한 챌린지
                           <Button
                               _onClick={()=>{
                                   joinModal()
                               }}
                           >시작하기</Button>
                       ):(
                           //참가자 꽉참
                           <Button bg="#bbb" color="#fff" style={{cursor:"auto"}} _disabled
                           >마감된 행성입니다.</Button>
                       )}
                       </>
                    )}
                    
                </Fixed>   
                {/* 입장하기 버튼 클릭 시 뜨는 모달팝업 - 공개방 */}
                <Modal open={modalType === "joinModal"? modalOpen : ""} close={closeModal} double_btn btn_text="입장" _onClick={()=>{
                    joinChallenge()
                }}>
                    <p>입장하시겠습니까?<br/>챌린지 시작 이후에 패널티가 있을 수 있습니다.</p>
                </Modal>   
                {/* 입장하기 버튼 클릭 시 뜨는 모달팝업 - 비밀방 */}
                <Modal open={modalType === "privateModal"? modalOpen : ""} close={closeModal} header isPrivate>
                    <div className="private_box">
                        <h3>비밀번호를 입력해 주세요.</h3>
                        <div>                       
                            <ReactCodeInput className={isNum === true && checkPrivate === false  && join === true ? "ReactCodeInput fail" : "ReactCodeInput"} type='password' fields={4} {...props} value={privatePwd} onChange={privateCheck}
                                inputStyle={{
                                }}
                            />
                            <p className="fail_color small">
                            {isNum === null && checkPrivate === null ? "" 
                            : isNum === false && checkPrivate === false && join === false ? "숫자 4자리를 입력해주세요." //숫자 체크 안하고 비밀번호가 틀린경우 or 입장하기 안누른경우
                            : isNum === true && checkPrivate === false  && join === false ? "" //숫자는 맞는데 입장하기를 안누른 경우
                            : isNum === true && checkPrivate === false  && join === true ? "잘못된 비밀번호 입니다. 다시 시도해 주세요." //숫자는 맞는데 비밀번호가 틀린경우
                            : isNum === true && checkPrivate === true  && join === true ? "":"" //전부 맞음 (어차피 입장이지만...)
                            }
                            </p>
                        </div>
                        <Button type="button" _onClick={pwdCheck}>입장하기</Button>
                    </div>
                </Modal>
            </Grid> 
        }


        </>
    );
};
const ShareBtn = styled.button` //공유버튼
    position: absolute;
    width: 28px;
    height: 28px;
    right: 20px;
    top: 20px;
    background-color: transparent;
    border: none;
    background-image: url(${share});
    background-repeat: no-repeat;
    background-size:cover;
    background-position: center;
    z-index: 2;
`;

const TitleBox = styled.div`
    margin-bottom:5px;
    h1 {
        font-size:20px;
        line-height:25px;
        font-weight: 500;
    }
`;

const StatusContainer = styled.div`
  display: flex;
  width: 100%;
  padding: 20px 0;
  border-radius: 8px;
  background-color: rgba(162, 170, 179, 0.1);
  >div {
    width: 33%;
    border-right: 1px solid #e4e5e6;
    &:last-child {
      border:none;
    }
  }
`;

const Title = styled.h2`
    font-size:18px;
    margin-bottom:9px;
    line-height:1.5;
`;

const ContentBox = styled.div`
    .admin_profile{
        display: flex;
        align-items: center;
        margin-bottom:12px;
        div {
            &::after {
                content: '';
                width:20px;
                height: 20px;
                background-image: url(${crown});
                background-repeat: no-repeat;
                background-position: center;
                background-size: cover;
                position: absolute;
                bottom:-5px;
                right: -5px;
            }
        }
        h3 {
            margin-left: 10px;
        }
    }
    p {
        font-size: 14px;
        color:#333;    
    }

`;
const Member = styled.div`  
    display: inline-block;
    margin-right: 5px;
    &:nth-child(n+5) {//4번째 멤버 이후로는 미노출
        display: none;
    }
    &.admin { //방장일 경우
        position: relative;
        margin-right: 9px;
        &::after {
            content: '';
            width:20px;
            height: 20px;
            background-image: url(${crown});
            background-repeat: no-repeat;
            background-position: center;
            background-size: cover;
            position: absolute;
            bottom:-5px;
            right: -5px;
        }
    }
`;

const Notice = styled.div`
    margin: 26px 0 24px;
    padding: 16px;
    background-color: rgba(162, 170, 179, 0.1);
    border-radius: 8px;
    ul {
        margin-top: 8px;
        li {
            font-size: 13px;
            margin-left: 13px;
            list-style: disc;
        }
    }
`;

const Fixed = styled.div`
    width: 100%;
    position: fixed;
    background-color: #fff;
    bottom:0;
    left:0;
    padding:12px 20px;
    box-shadow: 0 -4px 8px 0 rgba(3, 1, 2, 0.04);
`;


export default ChallengeDetail;