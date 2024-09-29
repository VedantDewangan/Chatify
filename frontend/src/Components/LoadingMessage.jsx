import React from 'react'

export const LoadingMessage = () => {
  return (
    <div style={{height:"70vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"10px"}} >
        <div className='loader3'></div>
        <p style={{fontSize:"1.3em"}} >Loading...</p>
    </div>
  )
}
