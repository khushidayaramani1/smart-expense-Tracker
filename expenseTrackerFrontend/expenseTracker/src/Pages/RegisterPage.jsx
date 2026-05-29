import React, { useState,useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
    
    const RegisterPage = () => {
        let [obj,setObj]=useState({
        userName:"",
        name:"",
        userPassword:"",
        email:"",
        phone:""
    })

    let [cPwd,setCPwd]=useState("")

    let [buttonClicked,setButtonClicked]=useState(0);

    function handleChange(e){
        setObj({...obj,[e.target.name]:e.target.value})
    }

    function checkPasswordMatch() {
        if (obj.userPassword !== cPwd) {
            alert('passwords do not match');
        } else {
            setButtonClicked(prev => prev + 1);
        }
    }
     
    useEffect(() => {
        if (buttonClicked > 0) {
            fetch('http://localhost:8083/register', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(obj)
            })
            .then(res => console.log("Success"))
            .catch(err => console.error("Error", err));
        }
    }, [buttonClicked]);  
     


    const { openLoginModal } = useAuth()

    const navigate = useNavigate()

    return (
    <>
        <div className='h-screen'>
            <div className='h-full flex flex-col justify-center items-center gap-6  '>
                <h1 className='text-3xl font-bold underline'>Register Page</h1> 
                <div className='flex flex-col gap-4 justify-center items-start border p-4'> 
                    <div className='flex gap-4'>
                        <label htmlFor="">Enter your name</label>
                        <input onChange={handleChange} type="text" name="name" className='border border-gray-600 rounded-md' />
                    </div>
                    <div className='flex gap-4'>
                        <label htmlFor="">Enter Username</label>
                        <input onChange={handleChange} type="text" name="userName" className='border border-gray-600 rounded-md' />
                    </div>
                    <div className='flex gap-4'>
                        <label htmlFor="">Enter email</label>
                        <input onChange={handleChange} type="text" name="email" className='border border-gray-600 rounded-md' />
                    </div>
                    <div className='flex gap-4'>
                        <label htmlFor="">Enter Phone Number</label>
                        <input onChange={handleChange} type="text" name="phone" className='border border-gray-600 rounded-md' />
                    </div>
                    <div className='flex gap-4'>
                        <label htmlFor="">Enter Password</label>
                        <input onChange={handleChange} type="text" name="userPassword" className='border border-gray-600 rounded-md' />
                    </div>
                    <div className='flex gap-4'>
                        <label htmlFor="">Enter confirm Password</label>
                        <input onChange={(e)=>setCPwd(e.target.value)} type="text"  className='border border-gray-600 rounded-md' />
                    </div> 
                    <button className='bg-blue-600 text-white p-1! rounded-md hover:bg-blue-800 cursor-pointer' onClick={checkPasswordMatch}>Register</button>
                </div>
                <button onClick={() => { openLoginModal && openLoginModal(); navigate('/') }} className='text-blue-600 underline cursor-pointer'>Already have an Account? Login</button>
            </div>
        </div>
    </>
  )
}

export default RegisterPage
