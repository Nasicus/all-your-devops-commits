import { FC } from "react";
import styled from "styled-components";

export const GithubFork: FC = () => {
  return (
    <Host>
      <span>
        <a
          href="https://github.com/Nasicus/all-your-devops-commits"
          target="_blank"
        >
          Fork me on GitHub
        </a>
      </span>
    </Host>
  );
};

const Host = styled.div`
  text-align: center;
  margin-top: 15px;

  a {
    background: #000;
    color: #fff;
    text-decoration: none;
    font-family: arial, sans-serif;
    text-align: center;
    font-weight: bold;
    padding: 5px 40px;
    font-size: 1rem;
    line-height: 2rem;
    position: relative;
    transition: 0.5s;
  }

  a:hover {
    background: #c11;
    color: #fff;
  }

  a::before,
  a::after {
    content: "";
    width: 100%;
    display: block;
    position: absolute;
    top: 1px;
    left: 0;
    height: 1px;
    background: #fff;
  }

  a::after {
    bottom: 1px;
    top: auto;
  }

  @media screen and (min-width: 700px) {
    *,
    *::before,
    *::after {
      box-sizing: initial;
    }

    text-align: initial;

    span {
      position: absolute;
      display: block;
      top: 0;
      right: 0;
      width: 200px;
      overflow: hidden;
      height: 200px;
      z-index: 9999;
    }

    a {
      width: 200px;
      position: absolute;
      top: 60px;
      right: -60px;
      transform: rotate(45deg);
      box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.8);
    }
  }
`;
