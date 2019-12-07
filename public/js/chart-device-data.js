/* eslint-disable max-classes-per-file */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */

$(document).ready(() => {
  // if deployed to a site supporting SSL, use wss://
  const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
  const webSocket = new WebSocket(protocol + location.host);

  /*
    paino implements
  */
  const keys = document.querySelectorAll(".key"),
  note = document.querySelector(".nowplaying"),
  hints = document.querySelectorAll(".hints");

  function playNote(e) {
    const audio = document.querySelector(`audio[data-key="${e.keyCode}"]`),
    key = document.querySelector(`.key[data-key="${e.keyCode}"]`);

    if (!key) return;

    const keyNote = key.getAttribute("data-note");

    key.classList.add("playing");
    note.innerHTML = keyNote;
    audio.currentTime = 0;
    audio.play();
  }

  manualPlay = (keyCode) => {
    const audio = document.querySelector(`audio[data-key="${keyCode}"]`),
    key = document.querySelector(`.key[data-key="${keyCode}"]`);

    if (!key) return;

    const keyNote = key.getAttribute("data-note");

    key.classList.add("playing");
    note.innerHTML = keyNote;
    audio.currentTime = 0;
    audio.play();
  }

  function removeTransition(e) {
  if (e.propertyName !== "transform") return;
      this.classList.remove("playing");
  }

  function hintsOn(e, index) {
  e.setAttribute("style", "transition-delay:" + index * 50 + "ms");
  }

  hints.forEach(hintsOn);

  keys.forEach(key => key.addEventListener("transitionend", removeTransition));

  window.addEventListener("keydown", playNote);

  sessionStorage.setItem('scheduledTime', Date.now());

  webSocket.onmessage = function onMessage(message) {
    const map = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
    try {
      const messageData = JSON.parse(message.data);
      console.log(messageData);

      // time and either temperature or humidity are required
      // if (!messageData.MessageDate || (!messageData.IotData.temperature && !messageData.IotData.humidity)) {
      //   return;
      // }

      let scheduledTime = sessionStorage.getItem('scheduledTime');
      console.log('start!!!!!!!!!' + scheduledTime)

      let notes;
      notes = messageData.IotData.notes;
      // notes = '0,1#1,2#2,2#';
      notes = notes.slice(0, -1);
      const noteArr = notes.split("#");
  
      noteArr.forEach(el => {
        const tmp = el.split(",");
        console.log('el : ' + tmp);
        const note = parseInt(tmp[0]) - 1;
        const time = parseInt(tmp[1]) * 10;
        const cur = Date.now();

        console.log('prev :' + scheduledTime);
        console.log('cur : ' + cur);
        console.log('duration : ' + time);
        scheduledTime = Math.max(scheduledTime, cur) + time;
        if (note >= 0) {
          setTimeout(manualPlay, scheduledTime - cur, map[note].charCodeAt(0));
        }
        
      });
      console.log('schedulted time : ', scheduledTime);
      sessionStorage.setItem('scheduledTime', scheduledTime);
    } catch (err) {
      console.error(err);
    }
  };
});