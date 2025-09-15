import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContextObject';

const ProfilePage = () => {

  const {authUser, updateProfile} = useContext(AuthContext);

  const[selectedImg, setSelectedImg] =useState(null)
  const navigate = useNavigate();
  const [name, setName] = useState(authUser.fullname)
  const[bio, setBio] =useState(authUser.bio)


const handleSubmit = async(e)=>{
  e.preventDefault();
  if(!selectedImg){
    await updateProfile({fullName: name, bio})
  navigate('/');
  return;
  }

  const reader = new FileReader();
  reader.readAsDataURL(selectedImg);
  reader.onload = async () => {
    const base64Image = reader.result;
    await updateProfile({profilePic: base64Image, fullname : name, bio})
      navigate('/')
  }

}


  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
      <div className='w-5/6 max-w-2x1 backdrop-blur-2xl text-grey-300 border-2 border-grey-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
        <form  onSubmit={handleSubmit} className='flex flex-col gap-5 p-10 flex-1'>
          <h3 className="text-lg bg-amber-50">Profile details</h3>
          <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer bg-red-400'>
            <input onChange={(e)=>setSelectedImg(e.target.files[0])} type="file" id='avatar' accept='.png, .jpg, .jpeg' hidden />
            <img src={selectedImg ? URL.createObjectURL(selectedImg) : assets.avatar_icon} alt="" className={`w-12 h-12 ${selectedImg && 'rounded-full'}`} />
            'upload profile image'
          </label>
          <input onhange={(e)=>setName(e.target.value)} type="text" required placeholder='Your Name' className='p-2 border border-grey-500 rounded-md focus:outline-none focus:ring-violet-500 bg-green-300' onChange={(e)=>setName(e.target.value)} value={name} />
          <textarea onChange={(e)=>setBio(e.target.value)} value={bio} placeholder='Write profile bio' required  className='p-2 border border-grey-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 bg-amber-400' rows={4}> </textarea>
          <button type="submit" className="bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer">save</button>
        </form>
        <img className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 $ {selectedImg && 'rounded-full'}`} src={ authUser?.profilePic||assets.logo_icon} alt="" />
        
      </div>
       
    </div>
  )
}

export default ProfilePage