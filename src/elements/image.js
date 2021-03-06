import React from "react";
import styled from "styled-components";
import  defaultProfile from "../image/img_profile_defalt @2x.png";

const Image = (props) => {
  const { shape, src, size, profile, radius, align, inline_block, padding , ranking, level} = props;
  const styles = {
    src: src,
    size: size,
    profile: profile,
    radius: radius,
    inline_block: inline_block,
    align: align,
    padding: padding,
    ranking:ranking,
  };


  if(shape === "border" ){
    //랭킹 프로필 이미지
    return <CircleWrap {...styles} style={{
      backgroundImage:level === "Level1" ? "linear-gradient(#fff, #fff), linear-gradient(to bottom, #a0a515 0%,  #636610 100%)"
      : level === "Level2" ? "linear-gradient(#fff, #fff), linear-gradient(to bottom, #e6cb35, #b09d35)"
      : level === "Level3" ? "linear-gradient(#fff, #fff), linear-gradient(to bottom, #f7d382, #f5b92f)"
      : level === "Level4" ? "linear-gradient(#fff, #fff), linear-gradient(to bottom, #fdc884, #f58524)"
      : level === "Level5" ? "linear-gradient(#fff, #fff), linear-gradient(to bottom, #fd8a8a, #b12f21)" :null
    }}><div></div></CircleWrap>
  }

  if (shape === "circle") {
    //프로필 이미지
    return <ImageCircle {...styles}></ImageCircle>
  }
  if (shape === "rectangle") {
    //게시글 이미지
    return (
      <AspectOutter>
        <AspectInner {...styles}></AspectInner>
      </AspectOutter>
    );
  }
  return <React.Fragment></React.Fragment>;
};

Image.defaultProps = {
  shape: "circle",
  src: "",
  size: 40,
  profile: defaultProfile,
  radius: "0",
  inline_block: false,
  is_preview: false,
  align: false,
  children: null,
  ranking:false,
  padding: "100%",
};

const AspectOutter = styled.div`
  max-width: 100%;
  max-height: 100%;
`;

const AspectInner = styled.div`
  position: relative;
  padding-top: ${(props) => (props.padding ? props.padding : "100%")};
  overflow: hidden;
  background-image: url("${(props) => props.src}");
  background-size: cover;
  background-position: center;
  border-radius: ${(props) => props.radius};
  background-color: #f2f2f2;
  overflow: ${(props) => props.className === "edit"? "hidden" : "initial"};
  
`;

const ImageCircle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
   --size: ${(props) => props.size}px;
  width: var(--size);
  height: var(--size);
  border-radius: 11px;
  background-image: url("${(props) => props.profile}");
  background-position: center;
  background-size: cover;
`;

const CircleWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
   --size: ${(props) => props.size}px;
  width: var(--size);
  height: var(--size);
  border: 2px solid transparent;
  border-radius: 13px;
  background-image: linear-gradient(#fff, #fff), 
  linear-gradient(to right, #a0a515 0%,  #636610 100%);
  background-origin: border-box;
  background-clip: content-box, border-box;
  > div{
    display: block;
    width: 100%;
    height: 100%;
    border: 1px solid #fff;
    background-image: url("${(props) => props.profile}");
    background-size: cover;
    background-position: center;
    border-radius: 11px;
  }
`;



export default Image;
