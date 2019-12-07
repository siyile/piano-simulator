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



  let scheduledTime = Date.now() + 3000;
  const timeInterval = 500;

  const map = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];

  // test = () => {
  //   // notes = `0,0#1,2#0,1#2,2#0,1`;
  //   notes = '0,1#1,2#2,2#';

  //   const noteArr = notes.split("#");

  //   noteArr.forEach(el => {
  //     const tmp = el.split(",");
  //     const note = parseInt(tmp[0]);
  //     const count = parseInt(tmp[1]);
  //     for (let i = 0; i < count; i++) {
  //       const cur = Date.now();
  //       scheduledTime = Math.max(scheduledTime, cur) + timeInterval;
  //       setTimeout(manualPlay, scheduledTime - cur, map[note].charCodeAt(0));
  //       console.log('delay: ' + (scheduledTime - cur));
  //       console.log(map[note].charCodeAt(0));
  //     }
  //   });
  // }

  // setTimeout(test, 3000);

  webSocket.onmessage = function onMessage(message) {
    try {
      const messageData = JSON.parse(message.data);
      console.log(messageData);

      // time and either temperature or humidity are required
      // if (!messageData.MessageDate || (!messageData.IotData.temperature && !messageData.IotData.humidity)) {
      //   return;
      // }

      let notes;
      notes = messageData.IotData.notes;
      // notes = '0,1#1,2#2,2#';

      const noteArr = notes.split("#");
  
      noteArr.forEach(el => {
        const tmp = el.split(",");
        const note = parseInt(tmp[0]) - 1;
        if (note < 0) {
          continue;
        }
        const time = parseInt(tmp[1]) * 10;

        const cur = Date.now();
        scheduledTime = Math.max(scheduledTime, cur) + time;
        setTimeout(manualPlay, scheduledTime - cur, map[note].charCodeAt(0));
        console.log('delay: ' + (scheduledTime - cur));
        console.log(map[note].charCodeAt(0));
      });

    } catch (err) {
      console.error(err);
    }
  };
});