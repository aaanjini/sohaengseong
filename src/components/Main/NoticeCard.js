import React from "react";
import styled from "styled-components";
import { history } from "../../redux/configureStore";

import Mark from "../../image/icon/ic_notice_mark@2x.png";

//날짜 라이브러리
import moment from "moment";
import "moment/locale/ko";


const NoticeCard = (props) => {
    moment.locale("ko"); // 모멘트 한글로 바꾸기

    return(             
        <Card className={props.read? "" : "new"} 
            onClick={()=>{
                props.status === "INITIAL" ? history.push(`/member/${props.challengeId}`) 
                : props.status === "RECOMMEND" ? history.push("/category/all")
                : props.status === "MORNING_CALL" ? history.push("/daily")
                : props.status === "WRITE" || props.status === "SUCCESS" || props.status === "LEVEL" ||  props.status === "SIGNIN" || props.status === "FIRST" ? history.push("/mypage")
                : history.push(`/mypage`)
            }}
        >
            <img src={Mark} alt="알림캐릭터 이미지"/>
            <div className="text_box">
                {
                    props.status === "INITIAL" ? <p>입주하신 소행성이 곧 시작하니 지금 바로 확인하세요!</p>
                    : props.status === "RECOMMEND" ? <p><span>{props.userInfo.nickname}</span>님, 이웃 입주민들이 참여하고 있는 다른 소행성도 둘러보세요.</p>
                    : props.status === "MORNING_CALL" ? (
                        props.challengeCnt === 1 ? (                            
                            <p>현재 진행중인 "<span className="ellipsis">{props.title}</span>" 소행성 인증이 아직 안되었네요! 지금 바로 인증해주세요.</p>
                        ):(
                            <p>현재 진행중인 "<span className="ellipsis">{props.title}</span>" 외 {props.challengeCnt-1}개 소행성 인증이 아직 안되었네요! 지금 바로 인증해주세요.</p>
                        )
                    ) : props.status === "WRITE" ? <p>"<span className="ellipsis">{props.title}</span>" 소행성 인증 완료! 경험치 +{props.levelPoint}이 누적되었어요. 지금 바로 확인해보세요.</p>
                    : props.status === "SUCCESS" ? <p>"<span className="ellipsis">{props.title}</span>" 소행성 탐사 성공! 경험치 +{props.levelPoint} 누적되었어요. 지금 바로 확인해보세요.</p>
                    : props.status === "LEVEL" ? <p>레벨 업이 얼마 남지 않았어요. 조금만 힘내세요!</p>
                    : props.status === "SIGNIN" ? <p>소행성 가입을 축하드립니다! 가입 선물로 경험치 +10이 누적되었어요. 지금 바로 확인해보세요.</p> 
                    : props.status === "FIRST" ? <p>처음으로 소행성 입주를 하셨네요! 입주 선물로 경험치 +{props.levelPoint}가 누적되었어요. 지금 바로 확인해보세요.</p>
                    :null
                }
                
                <p className="date small caption_color">
                    {/* 알림이 오늘로부터 얼마나 지났는지 보여줌 */}
                    {moment(
                    props.date,
                    "YYYY.MM.DD kk:mm:ss"
                    ).fromNow()}
                </p>
            </div>
        </Card>        
    );
};

const Card = styled.div`
    display: flex;
    align-items: center;
    background-color: #fff;
    border-bottom: 1px solid #eff0f2;
    padding:10px 20px 9px;
    cursor: pointer;
    &.new {
        background-color: rgba(65,73,211,0.1);
    }
    &:last-child {
        border-bottom: none;
    }    
    img {
        width: 48px;
        margin-right: 12px;
    }
    .text_box {
        width: calc(100% - 60px);
        p {
            span.ellipsis {
                display: inline-block;
                max-width: 130px;
                vertical-align: sub;                
            }
        }
        .date {
            margin-top: 9px;
        }
    }
`;


export default NoticeCard;