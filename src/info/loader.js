import React from "react" ;
import { GridLoader } from "react-spinners";

const Loader = ({ isOpen }) => {
    
    if (!isOpen) return null;
  
    return (
      <div style={infoModalStyle}>
        <div style={infoModalContentStyle}>
               <GridLoader margin={1} width={5} height={20} color="#36d7b7" />
               <p style={loaderTextStyle}> Updating Layers Please wait . . . . . </p>
         </div>
    </div>
    );
  };
  
  export default Loader;

const infoModalStyle = {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '1000',
};

const infoModalContentStyle = {
    width: '300px',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'left',
    display : 'flex',
    flexDirection : 'column',
    alignItems : 'center',
    background: 'rgba( 255, 255, 255, 0.1 )',
    boxShadow: '0 8px 32px 0 rgba( 31, 38, 135, 0.37 )',
    backdropFilter: 'blur( 5px )',
    //-webkit-backdrop-filter:' blur( 5px )',
    borderRadius: '10px',
    border: '1px solid rgba( 255, 255, 255, 0.18 )',
};

const loaderTextStyle = {
    color : '#fff',
    fontWeight : '600',
    fontSize : '1.6em'
}