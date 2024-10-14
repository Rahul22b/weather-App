import React from 'react';

export default function Citydata({data}) {
    const now = new Date();
   console.log(data);
  return (
    <>
      {(data) ? (
         <>
         <div className='font-bold text-xl'>{data.name}</div>
         <div className='text-red-500 mb-10 font-bold'>{now.toLocaleString()}</div>
         <div className='mb-1 font-bold text-2xl'>{data.main.temp} C</div>
         <div className=' mb-1 text-lg text-gray-600 font-semibold'>{data.weather[0].description}</div>
         <div className='text-red-600 font-bold'>Wind Speed: {data.wind.speed} m/s</div>
       </>
      ) :
      <div></div>}
    </>
  );
}
