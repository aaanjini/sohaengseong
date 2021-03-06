import React from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import {ActionCreators as userActions} from "../redux/modules/user";
import { userApis } from "../shared/apis";
import * as baseAction from '../redux/modules/base';

import '../styles/css/custom.scss';
import {Grid,Button} from "../elements/index";

import drop from "../image/icons/ic_dropdown@2x.png";
import deleteIcon from "../image/icon/ic_text_delete@2x.png";
import PopModal from "../components/shared/PopModal";


const Find = (props) => {
    const dispatch = useDispatch();
    const [active,setActive] = React.useState(false);    
    const [email,setEmail] = React.useState("");
    const [option,setOption] = React.useState("");
    const [domain, setDomain] = React.useState("");


    //모달--------------------------------------
    const [modalOpen, setModalOpen] = React.useState(false);

    const closeModal = () => {
        setModalOpen(false);
    };
    
    const deleteValue = () => {
        setDomain("");
    };

    const send = () => {
        const mail = `${email}@${domain?domain:option}`;
        dispatch(userActions.emailCheckResend(mail));
    };

    // 드롭박스 - 라벨을 클릭시 옵션 목록이 열림/닫힘
    const selectClick = () => {
        setActive(!active);
        setOption("");
    };

    const optionClick = (e) => {
        setDomain("");
        setOption(e.target.innerText);
        setActive(false);    
    };

    //이메일 한글막기
    const onChangeMail = (e) => {
        //좌우 방향키, 백스페이스, 딜리트, 탭키에 대한 예외
        if(e.keyCode === 8 || e.keyCode === 9 || e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 46 ) return;
        e.target.value = e.target.value.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, '');    
    };

    //비밀번호 찾기
    const findPwd = () => {
        const mail = `${email}@${domain?domain:option}`;

        const send_email = {
         email: mail
        };

        userApis
        .tempPasswordSend(send_email)
        .then((res) => {
            console.log("비밀번호발급", res);
            if(res.data.result === "true"){ //비밀번호 발급 잘 됐을 때 팝업띄움
                setModalOpen(true);
            };
        })
        .catch((err) => {
            console.log("비밀번호 재발급오류", err);
            window.alert(err.response.data.message);
        });
    };


    React.useEffect(() => {
        //헤더 & 푸터 분기
        dispatch(baseAction.setHeader("비밀번호 찾기"));
        dispatch(baseAction.setGnb(false));
        return()=>{
            dispatch(baseAction.setHeader(""));
            dispatch(baseAction.setGnb(true));
        }
    }, []);

    
    return(
        <>
        <Grid padding="48px 20px" margin="48px 0 0" bg="#fff" style={{overflow: "revert"}}>
            <Content>
                <h1>가입 시 등록한<br/>이메일을 입력해주세요.</h1>
                <p className="sub_color mt12">입력하신 <span className="sub_point_color">이메일로 임시 비밀번호</span>가 발송됩니다.</p>
            </Content>
            <Grid padding="0" style={{ overflow: "revert" }}>
                <label className="small">아이디(이메일)</label>
                <Grid
                padding="0"
                is_flex
                style={{ overflow: "revert" }}
                >
                    <input
                        className="email_input"
                        onChange={(e) => {
                            setEmail(e.target.value);
                        }}
                        onKeyUp={onChangeMail}
                        style={{opacity: option ? "1" : "0.5", imeMode:"disabled"}}
                        placeholder="이메일 주소"
                    ></input>
                    <p>@</p>
                    <div className={active ? "active custom_select" : option ? "ok custom_select" : "custom_select"}>
                        <img src={drop}></img>
                        <button
                        className="label"
                        onClick={() => {
                            selectClick();
                        }}
                        >
                        {option ? option : "선택하세요"}
                        </button>
                        <ul className="optionList" id={active ? "active" : ""}>
                            <li
                                className="optionItem"
                                onClick={(e) => {
                                optionClick(e);
                                }}
                            >
                                naver.com
                            </li>
                            <li
                                className="optionItem"
                                onClick={(e) => {
                                optionClick(e);
                                }}
                            >
                                nate.com
                            </li>
                            <li
                                className="optionItem"
                                onClick={(e) => {
                                optionClick(e);
                                }}
                            >
                                daum.net
                            </li>
                            <li
                                className="optionItem"
                                onClick={(e) => {
                                optionClick(e);
                                }}
                            >
                                hanmail.net
                            </li>
                            <li
                                className="optionItem"
                                onClick={(e) => {
                                optionClick(e);
                                }}
                            >
                                gmail.com
                            </li>
                            <li
                                className="optionItem"
                                onClick={(e) => {
                                optionClick(e);
                                }}
                            >
                                직접 입력
                            </li>
                        </ul>
                    </div>
                </Grid>
                <SelfInput style={{display: option === "직접 입력" ? "block" : "none"}}>
                    <input
                        className="email_input width"
                        onChange={(e) => {
                            setDomain(e.target.value);
                        }}
                        value={domain}
                        placeholder="메일을 입력해주세요."            
                    ></input>
                    {domain?<button onClick={deleteValue}></button>:null}
                </SelfInput>        
            </Grid>
        </Grid>
        <Fixed>                
            <Button _onClick={()=>{
                findPwd()                
            }} disabled={email==="" || (option==="" && domain ==="") ||  (option==="직접 입력" && domain ==="")? "disabled":""}>계속하기</Button>
        </Fixed>               
        {/* 이메일 전송 팝업 */}
        <PopModal open={modalOpen} close={closeModal} h2="메일함을 확인해주세요!" p={`메일로 임시 비밀번호를 보냈어요.
로그인 후 비밀번호를 변경하시길 바랍니다.`} mail={`${email}@${domain}`} btn_click={send}>
        </PopModal>
    </>
    );
};

const Content = styled.div`
    margin-bottom:64px;    
`;

const SelfInput = styled.div`
  position: relative;
  >button {
    position: absolute;
    width: 20px;
    height: 20px;
    background-image: url(${deleteIcon});
    background-size: contain;
    right: 0;
    top: 10px;
    border: none;
    background-color: transparent;
  }
`;

const Fixed = styled.div`
    width: 100%;
    position: fixed;
    background-color: #fff;
    bottom:0;
    left:0;
    padding:11px 20px;
    box-shadow: 0 -4px 8px 0 rgba(3, 1, 2, 0.04);
`;


export default Find;