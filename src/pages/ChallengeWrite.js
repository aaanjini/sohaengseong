import React from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
// 기간 선택 라이브러리
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/esm/locale";

import { actionCreators as memberActions } from "../redux/modules/member";
import { actionCreators as baseAction } from "../redux/modules/base";
import { Grid, Input, Button } from "../elements";
import plus from "../image/icons/btn_number_plus_l@2x.png";

const ChallengeWrite = (props) => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(baseAction.setHeader(true, "개설하기"));
    return () => {
      dispatch(baseAction.setHeader(false, ""));
    };
  }, []);

  //  인증 게시글 수정은 어디서 할건지에 따라 is_edit 변수 활용하기
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [image, setImage] = React.useState([]);
  const [preview, setPreview] = React.useState([]);
  //해시태그 부분
  //onChange로 관리할 문자열
  const [hashtag, setHashtag] = React.useState("");
  // 해시태그 담을 배열
  const [hashArr, setHashArr] = React.useState([]);
  // 날짜 선택 부분
  const [startDate, setStartDate] = React.useState(new Date()); // 기본값 null로?
  const [endDate, setEndDate] = React.useState(null);
  // 방 공개 여부
  const [checkedInputs, setCheckedInputs] = React.useState(null);
  const [password, setPassword] = React.useState("");

  const changeHandler = (checked, id) => {
    if (checked) {
      setCheckedInputs(id); // checked가 true이면 해당 id값이 state에 저장된다.
    } else {
      setCheckedInputs(null);
    }
  };

  // 날짜 선택 input 커스텀
  const CustomInput = ({ value, onClick }) => (
    <div>
      <Input
        label="기간을 선택해주세요. *"
        placeholder={value}
        height="46px"
        margin="0px 0px 20px"
        onClick={onClick}
      />
    </div>
  );

  // 태그 관련 함수
  const onKeyUp = React.useCallback(
    (e) => {
      //   if (process.browser) {
      /* 요소 불러오기, 만들기*/
      const $HashWrapOuter = document.querySelector(".HashWrapOuter");
      const $HashWrapInner = document.createElement("span");
      $HashWrapInner.className = "HashWrapInner";

      /* 태그를 클릭 이벤트 관련 로직 */
      $HashWrapInner.addEventListener("click", () => {
        $HashWrapOuter?.removeChild($HashWrapInner);
        console.log($HashWrapInner.innerHTML);
        setHashArr(hashArr.filter((hashtag) => hashtag));
      });

      /* enter 키 코드 :13 */
      if (e.keyCode === 13 && e.target.value.trim() !== "") {
        console.log("Enter Key 입력됨!", e.target.value);
        $HashWrapInner.innerHTML = "#" + e.target.value;
        $HashWrapOuter?.appendChild($HashWrapInner);
        setHashArr((hashArr) => [...hashArr, hashtag]);
        setHashtag("");
      }
    },
    [hashtag, hashArr]
  );

  // 이미지 업로드 부분
  const fileInput = React.useRef();

  const selectFile = (e) => {
    const reader = new FileReader();
    const file = fileInput.current.files[0];
    // 파일 내용을 읽어온다.
    reader.readAsDataURL(file);
    // 읽기가 끝나면 발생하는 이벤트 핸들러.
    reader.onloadend = () => {
      console.log(reader.result); // 파일 컨텐츠(내용물)
      setPreview([...preview, reader.result]);
    };
    if (file) {
      setImage([...image, file]);
    }
  };

  const deleteImage = (index) => {
    const imageArr = image.filter((el, idx) => idx !== index);
    const previewArr = preview.filter((el, idx) => idx !== index);

    setImage([...imageArr]);
    setPreview([...previewArr]);
  };

  // 인증 게시글 추가하기
  const addPost = () => {
    // 서버에 보내기 위한 작업
    console.log(image);
    let formData = new FormData();
    if (content === "") {
      window.alert("내용을 입력해주세요!");
      return;
    }

    formData.append("content", content);
    formData.append("postImage", image);

    // formData api랑 통신하는 부분으로 dispatch 하기

    // 유저 정보랑 날짜 등 합치고 initialstate 형식에 맞추어서 딕셔너리 만들기
    // state 관리를 위한 작업 필요 : user 정보까지 포함해서 reducer에 전달해야 한다.
    const post = {
      nickname: "닉네임",
      profileImage: "",
      content: content,
      postImage: preview, // 임시로 지정해둠
      comments: [], // 첫 게시글에는 댓글이 없으니까 일단 이렇게 설정했습니다.
    };

    dispatch(memberActions.addPost(post));
  };

  return (
    <Grid>
      <label
        htmlFor="select"
        style={{ fontSize: "14px", color: "#000", margin: 0 }}
      >
        어떤 주제로 진행하나요? *
      </label>
      <div>
        <Select
          name="evaluation"
          //   onChange={(e) => {
          //     setEvaluation(e.target.value);
          //   }}
          //   value={evaluation}
        >
          <option value="">유형 선택</option>
          <option value="아주좋음">아주좋음</option>
          <option value="좋음">좋음</option>
          <option value="보통">보통</option>
          <option value="별로">별로</option>
          <option value="최악">최악</option>
        </Select>

        <Input
          label="함께 실천할 습관을 적어주세요. *"
          subLabel="상대방에게 불쾌감을 줄 수 있는 단어는 사용하지 않습니다."
          placeholder="예) 하루에 한번 물마시기"
          maxLength="20"
          value={title}
          _onChange={(e) => setTitle(e.target.value)}
          height="46px"
        />

        <CountBox>({title.length}/20)</CountBox>
      </div>
      <div>
        <Input
          label="습관에 관한 내용을 입력해주세요. *"
          placeholder="설명, 인증 방법, 규칙 등을 자유롭게 적습니다."
          textarea
          maxLength="1000"
          value={content}
          _onChange={(e) => setContent(e.target.value)}
          padding="14px 35px 13px 20px"
        />
        <CountBox>({content.length}/1000)</CountBox>
      </div>
      {/* 태그 부분 */}
      <div>
        <p style={{ fontSize: "14px", margin: "0px 0px 10px" }}>
          태그를 작성해주세요
        </p>
        <HashWrap className="HashWrap">
          {/* 동적으로 생성되는 태그를 담을 div */}
          <span className="HashWrapOuter"></span>
          <input
            className="HashInput"
            placeholder={
              hashArr.length ? "" : "챌린지를 설명할 수 있는 단어를 적습니다."
            }
            value={hashtag}
            onChange={(e) => setHashtag(e.target.value)}
            onKeyUp={onKeyUp}
          />
        </HashWrap>
      </div>
      {/* 기간 선택 부분 */}

      <DatePicker
        locale={ko} // 달력 한글화
        showPopperArrow={false} // popover 화살표 없애기
        fixedHeight // 고정된 height에서 남은 공간은 다음 달로 채워지기
        selected={startDate} // 날짜 state
        startDate={startDate}
        endDate={endDate}
        selectsRange
        minDate={new Date()} // 과거 날짜 disable
        // inline
        onChange={(dates: any) => {
          const [start, end] = dates;
          setStartDate(start);
          setEndDate(end);
        }}
        customInput={<CustomInput />}
      />

      {/* 인원수 선택 부분 */}
      <Input
        label="인원수를 선택해주세요. *"
        placeholder="최대 30명"
        height="46px"
        margin="0px 0px 20px"
      />
      {/* 이미지 업로드 부분 */}
      <div>
        <p style={{ fontSize: "14px", margin: "0px" }}>
          사진을 첨부해주세요.{" "}
          <span style={{ color: "#797979" }}>(최대 3건)</span>
        </p>
        <p style={{ fontSize: "12px", margin: "0px", color: "#808080" }}>
          첫번째 이미지가 대표 이미지로 등록됩니다.
        </p>
        <div
          sytle={{ display: "flex", whiteSpace: "nowrap", overflowX: "scroll" }}
        >
          {preview.map((el, idx) => {
            return (
              <div
                style={{
                  padding: "0px",
                  width: "auto",
                  display: "inline-block",
                  position: "relative",
                }}
              >
                <img
                  key={idx}
                  src={
                    preview[idx]
                      ? preview[idx]
                      : "https://png.pngtree.com/element_our/20190601/ourlarge/pngtree-plus-icon-image_1338383.jpg"
                  }
                  style={{
                    width: "74px",
                    height: "74px",
                    margin: "17px 8px 28px 20px",
                  }}
                />
                <span
                  onClick={() => deleteImage(idx)}
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    cursor: "pointer",
                  }} // absolute로 하기
                >
                  x
                </span>
              </div>
            );
          })}
          {preview.length < 3 && (
            <ImageLabel className="input-file-button" htmlFor="input-file">
              <div
                style={{
                  width: "74px",
                  height: "74px",
                  display: "inline-block",
                  position: "relative",
                }}
              >
                <img
                  src={plus}
                  style={{
                    width: "74px",
                    height: "74px",
                    margin: "17px 8px 28px 20px",
                    display: "inline-block",
                    position: "relative",
                    border: "solid 1px #808080",
                  }}
                />
              </div>
            </ImageLabel>
          )}
        </div>

        <input
          id="input-file"
          type="file"
          onChange={selectFile}
          ref={fileInput}
          // disabled={is_uploading}
          multiple // 다중 업로드 가능
          accept="image/*, video/*" // 이미지에 해당하는 모든 파일 허용
          style={{ display: "none" }}
        />
      </div>
      {/* 비밀방 여부 */}
      <>
        <Grid is_flex padding="0px">
          <p>방 공개 여부</p>
          <Grid is_flex width="auto">
            <Grid width="auto">
              <input
                type="checkbox"
                id="public"
                onChange={(e) => {
                  changeHandler(e.currentTarget.checked, "public");
                  console.log(e.currentTarget.checked);
                }}
                checked={checkedInputs === "public" ? true : false}
              />
              <label htmlFor="public">공개</label>
            </Grid>
            <Grid width="auto">
              <input
                type="checkbox"
                id="private"
                onChange={(e) => {
                  changeHandler(e.currentTarget.checked, "private");
                  console.log(e.currentTarget.checked);
                }}
                checked={checkedInputs === "private" ? true : false}
              />
              <label htmlFor="private">비밀</label>
            </Grid>
          </Grid>
        </Grid>
        {checkedInputs === "private" && (
          <Input
            type="password"
            label="비밀번호 설정"
            placeholder="비밀번호를 입력해주세요."
            value={password}
            _onChange={(e) => setPassword(e.target.value)}
            height="46px"
            margin="0px 0px 20px"
          />
        )}
      </>
      <Button>등록하기</Button>
    </Grid>
  );
};

const Select = styled.select`
  width: 335px;
  height: 46px;
  margin: 10px 20px 28px 0px;
  padding: 14px 22.3px 13px 20px;
  border: solid 1px #999;
  font-family: inherit;
  &:focus {
    outline: none;
    border: 1px solid #000;
  }

  /* 방향 화살표 없애기 */
  /* -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none; */
`;

const CountBox = styled.p`
  width: 100%;
  height: 19px;
  margin-top: 4px;
  font-size: 13px;
  text-align: right;
  color: #808080;
`;

const ImageLabel = styled.label`
  /* border: 1px solid #c0c0c0;
  border-radius: 5px;
  font-weight: 900; */
  cursor: pointer;
`;

/* emotion css 태그 */
const HashWrap = styled.div`
  height: 46px;
  margin: 0 0 12px;
  color: rgb(52, 58, 64);
  font-size: 1.125rem;
  display: flex;
  flex-wrap: nowrap;
  letter-spacing: -0.6px;
  color: #444241;
  border: solid 1px #999;
  padding: 2px 2px 8px 2px;

  .HashWrapOuter {
    display: flex;
    flex-wrap: nowrap;
  }

  .HashWrapInner {
    width: 76px;
    height: 22px;
    margin: 0 5px 0 0;
    background: #ededed;
    opacity: 0.5;
    border-radius: 5px;
    padding: 2px 4px;

    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    font-size: 12px;
    text-align: left;
    color: #7b7b7b;
    line-height: 1.83;
    cursor: pointer;
  }

  .HashInput {
    width: auto;
    margin: 10px;
    display: inline-flex;
    outline: none;
    cursor: text;
    line-height: 2rem;
    margin-bottom: 0.75rem;
    min-width: 8rem;
    border: none;
  }
`;

export default ChallengeWrite;
