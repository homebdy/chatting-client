import React, { useRef, useState, useEffect } from 'react';
import * as StompJs from '@stomp/stompjs';
import { useParams } from "react-router-dom";
import axios from 'axios';

const getMessage = (arr) => {   
  const result = [];   
  for (let i = 0; i < arr.length; i++) {  
    if (arr[i].type === "TEXT") {
      result.push(      
        <div>
          <li>{arr[i].senderEmail} : {arr[i].message}</li>
        </div>
      );
    } else {
      result.push(  
        <div>
          <li>
            {arr[i].senderEmail} : 
            <img src={arr[i].message} width="140"/>
          </li>
        </div>
      );
    }
  }     
  return result;
}

function CreateReadChat() {
  const [chatList, setChatList] = useState([]);
  const [chat, setChat] = useState('');
  const [sender, setSender] = useState('');
  const client = useRef({});
  const params = useParams();
  const fileInput = React.useRef(null);

  const handleButtonClick = (e) => {
    fileInput.current.click();
  };

  const ImageUpload = () => {
    return (
      <React.Fragment>
        <button onClick={e => handleButtonClick(e)}>파일 업로드</button>
        <input type="file"
              ref={fileInput} />
        <button onClick={e => handleFileSubmit(e, chat, sender)}>제출입니당</button>
      </React.Fragment>
    );
  }

  const connect = () => {
    client.current = new StompJs.Client({
      brokerURL: 'ws://localhost:8080/ws',
      onConnect: () => {
        console.log('success');
        subscribe();
      },
    });
    client.current.activate();
  };

  const publish = (chat, sender, type) => {
    if (!client.current.connected) return;
    var data = {};
    data = {
      senderEmail: sender,
      message: chat,
      type: type,
    };
    client.current.publish({
      destination: `/pub/${params.room}`,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    setChat('');
  };

  const subscribe = () => {
    client.current.subscribe(`/sub/${params.room}`, (body) => {
      
      setChatList((_chatMessages) => [..._chatMessages, JSON.parse(body.body)]);
    });
  };

  const disconnect = () => {
    client.current.deactivate();
  };

  const handleChange = (event) => {
    setChat(event.target.value);
  };

  const handleSender = (event) => {
    setSender(event.target.value);
  }
  
  const handleSubmit = (event, chat, sender) => {
    event.preventDefault();
    publish(chat, sender, "TEXT");
  };

  const handleFileSubmit = async (event, chat, sender) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', fileInput.current.files[0]);
    const response = await axios.post(`http://localhost:8080/room/${params.room}`, 
      formData, {
          'Content-Type' : "multipart/form-data"
      })
    .then((response) => {
      if (response.status === 200) {
        publish(response.data, sender, "IMAGE");
      }
    });
  };

  const readPrevData = async () => {
    const response = await axios.get(`http://localhost:8080/room/${params.room}`)
    .then((response) => {
      if (response.status === 200) {
        setChatList(response.data);
      }
    });
  };
  
  useEffect(() => {
    readPrevData();
    connect();
    return () => disconnect();
  }, []);

  return (
    <div>
      <div>
        {getMessage(chatList)}
      </div>
      
      <form onSubmit={(event) => handleSubmit(event, chat, sender)}>
        <div>
          <input type={'text'} name={'nameInput'} onChange={handleSender} value={sender} />
          <input type={'text'} name={'chatInput'} onChange={handleChange} value={chat} />
        </div>
        <input type={'submit'} value={'의견 보내기'} />
        <div>
          <ImageUpload />
        </div>
      </form>
    </div>
  );
}

export default CreateReadChat;