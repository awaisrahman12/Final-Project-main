import { useEffect, useState } from 'react';
import { BsSend } from 'react-icons/bs';
import { json, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Cookies from 'js-cookie';
export default function Contact({ listing }) {
  const { currentUser } = useSelector(state => state.user)
  const [landlord, setLandlord] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false)
  const [responseMsg, setResponseMsg] = useState("")
  const [sending, setSending] = useState(false)
  const [messageSendSuccess, setMessageSendSuccess] = useState(false)
  const onChange = (e) => {
    setMessage(e.target.value);
  };
  const token = Cookies.get('token');
  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const res = await fetch(`https://real-estate-web-swart.vercel.app/api/user/${listing.userRef}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`, // Include token
          },
          credentials: 'include',
        });
        const data = await res.json();
        setLandlord(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchLandlord();
  }, [listing.userRef]);
  const handleChange = (e) => {
    setMessage(e.target.value)
  }


  const handleSendMsg = async () => {
    const conversationApiData = {
      creatorId: currentUser._id,
      participantId: listing.userRef,
      chatPartner: landlord,
      chatCreator: currentUser
    }

    try {
      setSending(true)
      const res = await fetch("https://real-estate-web-swart.vercel.app/api/conversation/create", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Make sure the token is valid and correctly included
        },
        credentials: 'include',
        body: JSON.stringify(conversationApiData)
      });
      const json = await res.json();
      //===checking reqest success or not ===//
      if (json.success === false) {
        setResponseMsg("Message sending failed. Try again!")
        setSending(false)
      }
      else {
        // IF Conversation created successfully
        const resMsg = await fetch("https://real-estate-web-swart.vercel.app/api/message/create", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Make sure the token is valid and correctly included
          },
          credentials: 'include',
          body: JSON.stringify(
            {
              sender: currentUser._id,
              receiver: listing.userRef,
              message: message,
            }
          )
        });
        const msgJson = await resMsg.json();
        //===checking Message request success or not ===//
        if (msgJson.success === false) {
          setResponseMsg("Message sending failed. Try again!")
          setSending(false)
        }
        else {
          setResponseMsg(msgJson)
          setMessageSendSuccess(true)
          setSending(false)
        }
      }
    } catch (error) {
      console.log(error);
      setSending(false)
    }
  }
  return (
    <>
      {
        sending ?
          <div >
            <p className=' text-amber-600 font-heading text-left
                                        flex items-center justify-start mt-5'>
              <BsSend className='mr-2' />Sending...
            </p>

          </div>
          :
          <div className="contact_form mt-5">
            {
              messageSendSuccess
                ?
                <div>
                  <p className=' text-green-600 font-heading text-left
                                        '>{responseMsg}</p>
                  <Link to={"/message"}>
                    <button className='text-sm font-heading mt-2 px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 duration-300'>
                      Goto Messanger</button>
                  </Link>
                </div>
                :
                <>
                  <textarea
                    id='message'
                    type="text"
                    placeholder='Write your message...'
                    name='message'
                    className='form_input border-[1px] border-gray-400  focus:border-brand-blue h-44 rounded-md placeholder:text-sm mt-3'
                    onChange={handleChange}
                  />
                  <button
                    disabled={!message}
                    onClick={handleSendMsg}
                    className='bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-95'>
                    Send Messages
                  </button>
                  <p className=' text-red-600 font-heading text-left
                                        '>{responseMsg}</p>
                </>
            }
          </div>

      }
    </>
  );
}
