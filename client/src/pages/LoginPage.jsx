import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [bio, setBio] = useState("")
  const [isDataSubmitted, setIsDataSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useContext(AuthContext)

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (currState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true)
      return;
    }

    setIsLoading(true)
    await login(currState === "Sign up" ? 'signup' : 'login', { fullName, email, password, bio })
    setIsLoading(false)
  }

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-6 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      {/* -------left------ */}
      <img src={assets.logo_big} className='w-64 sm:w-[min(30vw, 250px)]' alt="" />

      {/* ------right------- */}
      <form onSubmit={onSubmitHandler} className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg">
        <h2 className='font-medium text-2xl flex justify-between items-center'>
          {currState}
          {isDataSubmitted && <img onClick={() => setIsDataSubmitted(false)} src={assets.arrow_icon} alt="" className='w-5 cursor-pointer' />}
        </h2>

        {currState === "Sign up" && !isDataSubmitted && (
          <input onChange={(e) => setFullName(e.target.value)} value={fullName}
            type="text" className='p-2 border border-gray-500 rounded-md focus:outline-none' placeholder='Full Name' required />
        )}

        {!isDataSubmitted && (
          <>
            <input onChange={(e) => setEmail(e.target.value)} value={email}
              type="email" placeholder='Email Address' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' />

            <input onChange={(e) => setPassword(e.target.value)} value={password}
              type="password" placeholder='Password' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' />
          </>
        )}

        {currState === "Sign up" && isDataSubmitted && (
          <textarea onChange={(e) => setBio(e.target.value)} value={bio}
            rows={4} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' placeholder='provide a short bio...' required />
        )}

        <button
          type='submit'
          disabled={isLoading}
          className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed'
        >
          {isLoading ? (
            <>
              <svg className='animate-spin h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
              </svg>
              {currState === "Sign up" ? "Creating Account..." : "Logging in..."}
            </>
          ) : (
            currState === "Sign up" ? "Create Account" : "Login Now"
          )}
        </button>

        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy and policy.</p>
        </div>

        <div className='flex flex-col gap-2'>
          {currState === "Sign up" ? (
            <p className='text-sm text-gray-600'>Already have an account? <span onClick={() => { setCurrState("Login"); setIsDataSubmitted(false) }} className='font-medium text-violet-500 cursor-pointer'>Login here</span></p>
          ) : (
            <p className='text-sm text-gray-600'>Create an account <span onClick={() => setCurrState("Sign up")} className='font-medium text-violet-500 cursor-pointer'>Click here</span></p>
          )}
        </div>

      </form>
    </div>
  )
}

export default LoginPage