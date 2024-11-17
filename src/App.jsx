import React, { useEffect, useState } from 'react'
import Citydata from './Citydata';

export default function App() {

  const url =
	'https://api.openweathermap.org/data/2.5/weather';
const apiKey =
	'f00c38e0279b7bc85480c3fe775d518c';
  
  const [d,setd]=useState(null);
  const [city,setcity]=useState(null);
  const [input,setinput]=useState(null)
  const [dummyState, setDummyState] = useState(false);

  function forceUpdate(){
    setDummyState(!dummyState); // Toggle state to force re-render
  };

  useEffect(() => {
    fetch(`${url}?q=${city}&appid=${apiKey}&units=metric`)
      .then((response) => response.json())
      .then((res) =>{
        if (res.cod===200){
          return  setd(res);
        }
        
        else setd(null);
      })
  }, [city]);
 




  return (
    <div className='w-fit shadow-lg p-12 rounded-lg  m-auto border-2 flex flex-col items-center'>
    <h1 className='text-3xl mb-4 font-bold text-nowrap text-green-600 '> Getweather</h1>
    <div className='mb-2 font-bold'>weather</div>
    <input type="text" placeholder='enter the city name...' className='mb-2 border-2 p-1' value={input}  onChange={(e)=>{
      // console.log(e.target.value);
      setinput(e.target.value)}}/>

    <button type="button" className="mb-10 w-32 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm  py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={()=>{setcity(input);
      setinput(' ');
    }} 
      >Get weather</button>

      {input ? <>
      <button type="button" className="mb-2 w-32 text-white bg-green-700 hover:green-800 focus:outline-none focus:ring-4 focus:rigreen-300 font-medium rounded-full text-sm  py-2.5 text-center me-2  dark:green-600 dark:hover:green-700 dark:focus:rigreen-800" onClick={()=>forceUpdate()}>refresh</button>
      </>:<>
      </>}

      <Citydata data={d}/>

   
    
   
   <div className='flex flex-col items-center font-bold'><div className='mt-20'>Made with ❤️</div>
   
    </div>
  )
}
