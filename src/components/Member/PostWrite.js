import React from "react";
import styled from "styled-components";

import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { history } from "../../redux/configureStore";
import { actionCreators as memberAction } from "../../redux/modules/member";
import { actionCreators as baseAction } from "../../redux/modules/base";
import { memberApis } from "../../shared/apis";

import { Grid, Input, Button } from "../../elements";
import Modal from "../shared/Modal";

import plus from "../../image/icons/ic_plus_xl@2x.png";
import deleteIcon from "../../image/icon/ic_delete_m.png";
import confirmIcon from "../../image/img_good@2x.png";

//heic 이미지 파일을 jpeg로 변환하는 라이브러리
import heic2any from "heic2any";

// 이미지 압축 라이브러리
import imageCompression from "browser-image-compression";

const PostWrite = (props) => {
  const dispatch = useDispatch();
  const challengeId = useParams().challengeId;
  const postId = +useParams().postId;
  const roomId = useParams().roomId;

  const userInfo = useSelector((state) => state.user.user);
  const isEdit = postId ? true : false; // 인증 게시글 수정 여부
  const [content, setContent] = React.useState(""); // 인증 게시글 내용
  const [image, setImage] = React.useState(null); // 이미지 file 객체 담는 곳
  const [preview, setPreview] = React.useState(""); // filereader 후 미리보기 데이터 담는 곳
  const [isWarning, setIsWarning] = React.useState(false);

  const [isLevelUp, setIsLevelup] = React.useState(false); // 레벨업 여부
  const [nextLevel, setNextLevel] = React.useState("");

  // 이미지 업로드 부분
  const fileInput = React.useRef();
  const selectFile = async (e) => {
    const reader = new FileReader();
    let file;
    // 이미지 resize 옵션 설정
    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 800,
    };
    if (
      fileInput.current.files[0].name.split(".")[1] === "gif" ||
      fileInput.current.files[0].name.split(".")[1] === "GIF" ||
      fileInput.current.files[0].name.split(".")[1] === "heic" ||
      fileInput.current.files[0].name.split(".")[1] === "HEIC"
    ) {
      file = fileInput.current.files[0];
    } else {
      file = await imageCompression(fileInput.current.files[0], options);
    }

    const maxSize = 20 * 1024 * 1024; // 파일 용량 제한 (20MB)
    if (file.size > maxSize) {
      setIsWarning(true);
    } else {
      setIsWarning(false);
      if (file.name.split(".")[1] === "heic" || file.name.split(".")[1] === "HEIC") {
        let blob = fileInput.current.files[0];
        // blob에다가 변환 시키고 싶은 file값을 value로 놓는다.
        // toType에다가는 heic를 변환시키고싶은 이미지 타입을 넣는다.
        heic2any({ blob: blob, toType: "image/jpeg" })
          .then(function (resultBlob) {
            //file에 새로운 파일 데이터를 씌웁니다.
            file = new File([resultBlob], file.name.split(".")[0] + ".jpg", {
              type: "image/jpeg",
              lastModified: new Date().getTime(),
            });
            console.log("변환확인", file);
            reader.readAsDataURL(file);
            reader.onloadend = () => {
              setPreview(reader.result);
            };
            if (file) {
              setImage(file);
              console.log("이미지확인2", file);
            }
          })
          .catch(function (err) {
            console.log("이미지 변환 오류", err);
          });
      }
      // 파일 내용을 읽어온다.
      reader.readAsDataURL(file);
      // 읽기가 끝나면 발생하는 이벤트 핸들러.
      reader.onloadend = () => {
        // 파일 컨텐츠(내용물)
        setPreview(reader.result);
      };
      if (file) {
        setImage(file);
      }
    }
    e.target.value = ""; // 같은 파일 upload를 위한 처리
  };
  // 이미지 삭제 함수
  const deleteImage = () => {
    setPreview("");
    setImage(null);
  };

  // 인증 게시글 추가하기
  const addPost = () => {
    // 서버에 보내기 위한 작업
    let formData = new FormData();
    const contentJson = { content: content };
    formData.append("post", new Blob([JSON.stringify(contentJson)], { type: "application/json" }));
    formData.append("postImage", image);

    // 인증 게시글 추가 api 호출
    memberApis
      .addPost(challengeId, formData)
      .then((res) => {
        // 리덕스로 관리되고 있는 페이지 state를 0으로 다시 초기화하여 새롭게 페이징 처리된 데이터 불러오기
        dispatch(memberAction.addPost());
        // 인증 완료 모달 띄우기
        setModalType("okModal");
        setModalOpen(true);
        // 레벨업 여부 확인하기
        if (res.data.levelUp) {
          setNextLevel(res.data.levelName);
          setIsLevelup(true); // true일 경우 레벨업 모달 띄워줌
        }
      })
      .catch((err) => {
        console.log("인증 게시글 작성 오류", err);
        window.alert(err.response.data.message);
      });
    setPreview(""); // 작성 후 미리보기,이미지 state는 빈값으로 바꿔주기
  };

  // 인증 게시글 수정하기
  const editPost = () => {
    // 서버에 보내기 위한 작업
    let formData = new FormData();
    const contentJson = { content: content };
    formData.append("post", new Blob([JSON.stringify(contentJson)], { type: "application/json" }));
    formData.append("postImage", image);

    // 인증 게시글 수정 api 호출
    memberApis
      .editPost(postId, formData)
      .then((res) => {
        history.replace(`/post/${challengeId}/${roomId}`); // 인증 게시글 리스트 페이지 이동
      })
      .catch((err) => {
        console.log("인증 게시글 수정 오류", err);
        window.alert("인증 게시글 수정 오류");
      });
    setPreview("");
  };

  // header, footer 부분
  React.useEffect(() => {
    dispatch(baseAction.setHeader(isEdit ? "수정하기" : "인증하기", false));

    if (isEdit) {
      //수정이면 특정 포스트 1개 조회하기 (default value 위해)
      memberApis.getOnePost(challengeId, postId, 0, 1).then((res) => {
        setContent(res.data.content);
        setPreview(res.data.postImage);
      });
    }
    dispatch(baseAction.setGnb(false));
    return () => {
      dispatch(baseAction.setHeader(false, ""));
      dispatch(baseAction.setGnb(true));
    };
  }, []);

  // 모달 팝업 -------------------------------------
  const [modalType, setModalType] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const openModal = () => {
    setModalType("openModal");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      {userInfo && (
        <Grid className="bg_color" padding="0px" height="700px">
          <Grid bg="#ffffff" padding="24px 20px">
            <h3>{userInfo.nickname}님, 오늘의 인증을 남겨주세요!</h3>

            {/* 이미지 업로드 부분 */}
            <div style={{ position: "relative" }}>
              <ImageLabel className="input-file-button" htmlFor="input-file" src={preview ? preview : ""} default={plus}>
                <button onClick={() => deleteImage()}></button>
              </ImageLabel>
              <input id="input-file" type="file" onChange={selectFile} ref={fileInput} style={{ display: "none" }} />
              {isWarning && (
                <p className="fail_color caption" style={{ position: "absolute", bottom: "-1px" }}>
                  첨부 가능한 용량을 초과합니다. 20MB 이하의 파일을 올려주세요.
                </p>
              )}
            </div>

            {/* PostWrite의 작성 input */}
            <Input
              placeholder="오늘의 활동은 어떠셨나요? 소감을 남겨주세요."
              value={content}
              _onChange={(e) => {
                setContent(e.target.value);
              }}
            />
          </Grid>
          <Notice>
            <p className="bold sub_color">유의사항</p>
            <ul>
              <li className="sub_color">인증 사진은 필수입니다. (최대 20MB)</li>
              <li className="sub_color mt4">타인을 불쾌하게 하는 사진을 업로드 시 관리자의 권한에 따라 삭제될 수 있습니다. </li>
            </ul>
          </Notice>

          {/* PostWrite의 fixed 버튼*/}
          <Fixed>
            <Button _onClick={openModal} disabled={preview === "" || content === "" ? "disabled" : ""}>
              {isEdit ? "수정하기" : "저장하기"}
            </Button>
          </Fixed>

          {/* 저장/수정 버튼 누르면 나오는 모달 */}
          <Modal
            open={modalType === "openModal" ? modalOpen : ""}
            close={closeModal}
            double_btn
            btn_text={isEdit ? "수정" : "인증"}
            _onClick={() => {
              if (isEdit) {
                editPost();
              } else {
                addPost();
              }
            }}
          >
            <p>{isEdit ? "수정하시겠습니까?" : "인증하시겠습니까?"}</p>
          </Modal>

          {/* 인증 게시글 작성 성공하면 나오는 모달*/}
          <Modal open={modalType === "okModal" ? modalOpen : ""} close={closeModal} header isPrivate>
            <Grid>
              <CharacterImg></CharacterImg>
              <h2 style={{ marginBottom: "9px" }}>인증 완료</h2>
              <p style={{ marginBottom: "35px" }}>
                인증을 완료했습니다.
                <br />
                오늘도 즐거운 하루되세요!
              </p>
              <Button
                _onClick={() => {
                  if (isLevelUp) {
                    // 레벨업 했으면 레벨업 모달 나오도록 하기
                    setModalType("levelUpModal");
                    setModalOpen(true);
                  } else {
                    // 레벨업 안했으면 인증 게시글 리스트 페이지 이동
                    history.replace(`/post/${challengeId}/${roomId}`);
                  }
                }}
              >
                확인
              </Button>
            </Grid>
          </Modal>

          {/* 레벨업 모달 */}
          <Modal open={modalType === "levelUpModal" ? modalOpen : ""} close={closeModal} header isPrivate>
            <Grid>
              <CharacterImg></CharacterImg>
              <h2 style={{ marginBottom: "9px" }}>Level UP!</h2>
              <p style={{ marginBottom: "35px" }}>
                축하합니다! {nextLevel}이 되었습니다.
                <br />
                뭐가 달라졌는지 보러갈까요?
              </p>
              <Button
                _onClick={() => {
                  history.replace(`/mypage`);
                }}
              >
                보러가기
              </Button>
            </Grid>
          </Modal>
        </Grid>
      )}
    </>
  );
};

const ImageLabel = styled.label`
  width: 100%;
  height: 280px;
  margin: 12px auto 16px;
  display: inline-block;
  position: relative;
  ${(props) => (props.src ? "border: none;" : "border: solid 1px #a2aab3;")}
  border-radius: 12px;
  cursor: pointer;
  background-image: url("${(props) => props.default}");
  background-position: center;
  background-size: 48px;
  overflow: hidden;
  ::before {
    width: 100%;
    height: 280px;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    /* 빈 값으로 넣어야 가상의 요소 생성; */
    content: "";

    background-image: url("${(props) => props.src}");
    background-position: center;
    background-size: cover;
    border-radius: 12px;
  }
  &::after {
    position: absolute;
    content: "";
    width: 100%;
    height: 280px;
    ${(props) => (props.src ? "background-color: rgba(3, 1, 2, 0.5);" : "")}
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: 12px;
  }

  button {
    width: 20px;
    height: 20px;
    position: absolute;
    top: 16px;
    right: 16px;
    cursor: pointer;
    background-image: url(${deleteIcon});
    background-size: cover;
    background-color: transparent;
    border: none;
    z-index: 2;
  }
`;
const Notice = styled.div`
  padding: 24px 20px;
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
  bottom: 0;
  left: 0;
  padding: 12px 20px;
  box-shadow: 0 -4px 8px 0 rgba(3, 1, 2, 0.04);
`;

const CharacterImg = styled.div`
  width: 120px;
  height: 120px;
  margin: 20px auto 13px;
  background-image: url(${confirmIcon});
  background-size: cover;
`;

export default PostWrite;
