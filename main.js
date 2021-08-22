let scene = document.querySelector(".scene-cube");

let faces = [...document.querySelectorAll(".face")];
let faceShadows = [...document.querySelectorAll(".face-shadow")];

let progressContainer = document.querySelector(".progress-container");
let progressBar = document.querySelector(".progress-bar");
let progressBarShadow = document.querySelector(".progress-bar-shadow");

let checkPositionBtn = document.querySelector(".check-position");
let checkSoundBtn = document.querySelector(".check-sound");

let nBackInput = document.querySelector("#n-back");

// Position
let rx = -30;
let ry = 45;

// Velocity
let vx = 0;
let vy = 0;

// Acceleration
let ax = 0;
let ay = 0;

let keyRot = {
  "ArrowUp": () => ax += 1,
  "ArrowDown": () => ax -= 1,
  "ArrowLeft": () => ay -= 1,
  "ArrowRight": () => ay += 1
};

document.addEventListener("keydown", evt => {
  if (evt.code in keyRot) {
    keyRot[evt.code]();
  }
});

function interactionHandler(type) {
  return function(evt) {
    
    let prevX;
    let prevY;
    if (type === "mouse") {
      prevX = evt.pageX;
      prevY = evt.pageY;
    } else if (type === "touch") {
      prevX = evt.changedTouches[0].pageX;
      prevY = evt.changedTouches[0].pageY;
    }

    function moveHandler(evt) {
      
      let x;
      let y;
      if (type === "mouse") {
        x = evt.pageX;
        y = evt.pageY;
      } else if (type === "touch") {
        x = evt.changedTouches[0].pageX;
        y = evt.changedTouches[0].pageY;
      }

      let dx = x - prevX;
      let dy = prevY - y;

      ax += dy * 0.05;
      ay += dx * 0.05;

      prevX = x;
      prevY = y;
    }

    if (type === "mouse") {
      document.addEventListener("mousemove", moveHandler);
      document.addEventListener("mouseup", () => {
        document.removeEventListener("mousemove", moveHandler);
      });
    } else if (type === "touch") {
      document.addEventListener("touchmove", moveHandler);
      document.addEventListener("touchend", () => {
        document.removeEventListener("touchmove", moveHandler);
      });
    }

  }
}

document.addEventListener("mousedown", interactionHandler("mouse"));
document.addEventListener("touchstart", interactionHandler("touch"));

function update() {
  vx += ax - vx / 10;
  vy += ay - vy / 10;
  
  rx += vx;
  ry += vy;
  
  ax = 0;
  ay = 0;
  
  if (rx < -165) {
    rx = -165;
  }
  
  if (rx > -15) {
    rx = -15;
  }
  
  scene.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  window.requestAnimationFrame(update);
}

update();

// Game settings
let numbers = "012345"
let letters = "abefhl";
let stimuli = 6;
let baseDelay = 1750;
let cumulativeDelay = 250;
let tileFlashTime = 800;
let stimuliPerSession = 600;
let prevLevelThreshold = 0.5;
let nextLevelThreshold = 0.8;

// Game states
let stimuliCount = 0;
let intervals = [];

let isRunning = false;

let enablePosCheck = true;
let enableSndCheck = true;
let currPos;
let currSnd;

let rightPos = 0;
let rightSnd = 0;
let wrongPos = 0;
let wrongSnd = 0;

function random(iterable) {
  return iterable[
    Math.floor(
      Math.random() * iterable.length
    )
  ];
}

// Create the blocks
function createBlocks(symbols, n) {
  let buffer = 2 * n + stimuli * 2;
  let blocks = Array(
    (n * 1) * stimuli + buffer
  ).fill(null);
  // Place stimuli
  for (let i = 0; i < stimuli; i++) {
    // Pick a letter
    let symbol = random(symbols);
    // Pick a spot
    let rnd = Math.floor(
      n + Math.random() * (blocks.length - n * 2)
    );
    while (blocks[rnd] || blocks[rnd + n]) {
      rnd = Math.floor(
        n + Math.random() * (blocks.length - n * 2)
      );
    }
    // Put the signal
    blocks[rnd] = {
      isMatching: false,
      symbol: symbol
    };
    blocks[rnd + n] = {
      isMatching: true,
      symbol: symbol
    };
  }
  // Place noise
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i]) {
      continue;
    }
    let _symbols = [...symbols];
    // Look behind of N
    let prev = blocks[i - n] || {};
    let isPrevFound = _symbols.indexOf(prev.symbol);
    if (prev && isPrevFound > -1) {
      _symbols.splice(isPrevFound, 1);
    }
    // Look ahead of N
    let next = blocks[i + n] || {};
    let isNextFound = _symbols.indexOf(next.symbol);
    if (next && isNextFound > -1) {
      _symbols.splice(isNextFound, 1);
    }
    // Pick noise
    let noise = random(_symbols);
    // Place noise
    blocks[i] = {
      isMatching: false,
      symbol: noise
    };
  }
  return blocks;
}

function resetPreGame() {
  isRunning = false;
  
  rightPos = 0;
  rightSnd = 0;
  wrongPos = 0;
  wrongSnd = 0;
}

function resetInGame() {
  isRunning = true;
  
  enablePosCheck = true;
  enableSndCheck = true;
  currPos = null;
  currSnd = null;
  
  checkPositionBtn.classList.remove("right", "wrong");
  checkSoundBtn.classList.remove("right", "wrong");
  
  document.querySelector(".stop").classList.remove("active");
  document.querySelector(".play").classList.add("active");
}

function resetPostGame() {
  isRunning = false;
  
  enablePosCheck = true;
  enableSndCheck = true;
  currPos = null;
  currSnd = null;
  
  checkPositionBtn.classList.remove("right", "wrong");
  checkSoundBtn.classList.remove("right", "wrong");
  
  document.querySelector(".play").classList.remove("active");
  document.querySelector(".stop").classList.add("active");
  
  intervals.forEach(interval => clearInterval(interval));
}

function wow(htmlElement, cssClass, delay) {
  htmlElement.classList.add(cssClass);
  setTimeout(() => 
    htmlElement.classList.remove(cssClass)
  , delay);
}

function speak(text) {
  let utter = new SpeechSynthesisUtterance();
  utter.lang = 'en-US';
  utter.text = text;
  speechSynthesis.speak(utter);
  return utter;
}

function advanceProgressBar(percentage) {
  let maxWidth = progressContainer.clientWidth;
  progressBar.style.width = percentage * maxWidth + "px";
  progressBarShadow.style.width = percentage * maxWidth + "px";
}

function getGameCycle(n) {
  
  let positions = createBlocks(numbers, n);
  let sounds = createBlocks(letters, n);
  
  let i = 0;
  return function() {
    
    resetInGame();
    
    if (!isRunning) {
      return;
    }
    
    // End game
    if (i > positions.length - 1) {
      resetPostGame();
      
      let percentage = (rightPos + rightSnd) / (stimuli * 2);
      
      speak(`You've got ${Math.floor(percentage * 100)} percent of correct stimuli.`)
        .onend = function () {
          if (percentage >= nextLevelThreshold) {
            speak("Congratulations! Advancing to the next level.");
            nBackInput.value = +nBackInput.value + 1;
          } else if (percentage <= prevLevelThreshold) {
            speak("Going back to the previous level. Keep training.");
            nBackInput.value = +nBackInput.value - 1;
          } else {
            speak("Level remains the same. Keep training.");
          }
      };
      
      return;
    }
    
    // Operations
    
    currPos = positions[i];
    currSnd = sounds[i];
    
    // Count stimulus and advance progress bar
    stimuliCount++;
    advanceProgressBar(
      Math.min(stimuliCount / stimuliPerSession, 1)
    );
    
    // Light up the face and cast the shadow
    wow(faces[currPos.symbol], "active", tileFlashTime);
    if (faceShadows[currPos.symbol - 2]) {
      wow(faceShadows[currPos.symbol - 2], "active", tileFlashTime);
    }
    
    speak(sounds[i].symbol);
    
    // Increase block index
    i++;
    
  }
}

function play() {
  if (isRunning) {
    return;
  }
  
  speak("Start.");
  
  resetPreGame();
  
  let n = +nBackInput.value;
  intervals.push(
    setInterval(
      getGameCycle(n),
      baseDelay + n * cumulativeDelay
    )
  );
}

function stop() {
  if (!isRunning) {
    return;
  }
  
  speak("Stop.");
  
  resetPostGame();
}

function positionCheckHandler() {
  if (!currPos || !enablePosCheck) {
    return;
  }
  
  enablePosCheck = false;
  
  if (currPos.isMatching) {
    rightPos++;
    checkPositionBtn.classList.add("right");
  } else {
    wrongPos++;
    checkPositionBtn.classList.add("wrong");
  }
}

checkPositionBtn.addEventListener(
  "click",
  positionCheckHandler
);
checkPositionBtn.addEventListener(
  "touchstart",
  positionCheckHandler
);

function soundCheckHandler() {
  if (!currSnd || !enableSndCheck) {
    return;
  }
  
  enableSndCheck = false;
  
  if (currSnd.isMatching) {
    rightSnd++;
    checkSoundBtn.classList.add("right");
  } else {
    wrongSnd++;
    checkSoundBtn.classList.add("wrong");
  }
}

checkSoundBtn.addEventListener(
  "click",
  soundCheckHandler
);
checkSoundBtn.addEventListener(
  "touchstart",
  soundCheckHandler
);

document.addEventListener(
  "keypress",
  evt => {
    if (evt.code === "KeyA") {
      positionCheckHandler();
    } else if (evt.code === "KeyL") {
      soundCheckHandler();
    } else if (evt.code === "KeyS") {
      play();
    } else if (evt.code === "KeyK") {
      stop();
    }
  }
);