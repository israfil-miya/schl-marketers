import React from 'react';
import Topbar from './Topbar';
import Nav from './Nav';

interface PropsType {
  msg?: string | undefined;
}

const Header: React.FC<PropsType> = (props) => {
  return (
    <>
      <Topbar />
      <Nav className="max-lg:hidden" msg={props.msg} />
    </>
  );
};

export default Header;
