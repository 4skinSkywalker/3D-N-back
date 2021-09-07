let sceneWrapper = document.querySelector(".scene-wrapper");
let scene = document.querySelector(".scene");

let cube = document.querySelector(".cube");
let faceEls = document.querySelectorAll(".face");

let checkFaceBtn = document.querySelector(".check-face");
let checkSoundBtn = document.querySelector(".check-sound");
let checkPositionBtn = document.querySelector(".check-position");
let checkColorBtn = document.querySelector(".check-color");

let nBackInput = document.querySelector("#n-back");
let targetStimuliInput = document.querySelector("#targetStimuli");
let gameStartDelayInput = document.querySelector("#gameStartDelay");
let baseDelayInput = document.querySelector("#baseDelay");
let cumulativeDelayInput = document.querySelector("#cumulativeDelay");
let tileFlashTimeInput = document.querySelector("#tileFlashTime");
let previousLevelThresholdInput = document.querySelector("#previousLevelThreshold");
let nextLevelThresholdInput = document.querySelector("#nextLevelThreshold");

// Game settings
let numbers = "123456"
let letters = "abflqy";
let initialPosition = "-.5,-3,.5";
let moves = [
  "-3.5,0,-2.5", "-.5,0,-2.5", "2.5,0,-2.5",
  "-3.5,0,.5", "-.5,0,.5", "2.5,0,.5",
  "-3.5,0,3.5", "-.5,0,3.5", "2.5,0,3.5",
  
  "-3.5,-3,-2.5", "-.5,-3,-2", "2.5,-3,-2.5",
  "-3.5,-3,.5", ".5,-3,.5",
  "-3.5,-3,3.5", "-.5,-3,3.5", "2.5,-3,3.5",
  
  "-3.5,-6,-2.5", "-.5,-6,-2", "2.5,-6,-2.5",
  "-3.5,-6,.5", "-.5,-6,.5", "2.5,-6,.5",
  "-3.5,-6,3.5", "-.5,-6,3.5", "2.5,-6,3.5"
];
let colorClasses = [
  "col-a", "col-b", "col-c", "col-d", "col-e", "col-f"
];

// Editable settings
let targetNumOfStimuli = 5;
targetStimuliInput.value = targetNumOfStimuli;
targetStimuliInput.addEventListener("input", () =>
  targetNumOfStimuli = +targetStimuliInput.value
);

let gameStartDelay = 2000;
gameStartDelayInput.value = gameStartDelay;
gameStartDelayInput.addEventListener("input", () =>
  gameStartDelay = +gameStartDelayInput.value
);

let baseDelay = 2500;
baseDelayInput.value = baseDelay;
baseDelayInput.addEventListener("input", () =>
  baseDelay = +baseDelayInput.value
);

let cumulativeDelay = 500;
cumulativeDelayInput.value = cumulativeDelay;
cumulativeDelayInput.addEventListener("input", () =>
  cumulativeDelay = +cumulativeDelayInput.value
);

let tileFlashTime = 1500;
tileFlashTimeInput.value = tileFlashTime;
tileFlashTimeInput.addEventListener("input", () =>
  tileFlashTime = +tileFlashTimeInput.value
);

let prevLevelThreshold = 0.5;
previousLevelThresholdInput.value = prevLevelThreshold * 100;
previousLevelThresholdInput.addEventListener("input", () =>
  prevLevelThreshold = +previousLevelThresholdInput.value / 100
);

let nextLevelThreshold = 0.8;
nextLevelThresholdInput.value = nextLevelThreshold * 100;
nextLevelThresholdInput.addEventListener("input", () =>
  nextLevelThreshold = +nextLevelThresholdInput.value / 100
);

// Game states
let matchingStimuli = 0;
let stimuliCount = 0;
let intervals = [];

let isRunning = false;

let enableFaceCheck = true;
let enableSoundCheck = true;
let enablePositionCheck = true;
let enableColorCheck = true;

let currFace;
let currSound;
let currPosition;
let currColor;

let rightFace = 0;
let rightSound = 0;
let rightPosition = 0;
let rightColor = 0;

let wrongFace = 0;
let wrongSound = 0;
let wrongPosition = 0;
let wrongColor = 0;

function random(iterable) {
  return iterable[
    Math.floor(
      Math.random() * iterable.length
    )
  ];
}

// Create the blocks
function createBlocks(symbols, n) {
  
  // I don't know how many matching stimuli will be generated in the end
  // But I'm sure they are more than stimuli
  let blocks = Array(
    targetNumOfStimuli * (n + 2) + targetNumOfStimuli
  ).fill(null);
  // Place stimuli
  for (let i = 0; i < targetNumOfStimuli; i++) {
    // Pick a letter
    let symbol = random(symbols);
    // Pick a spot
    let rnd = Math.floor(Math.random() * (blocks.length - n));
    while (blocks[rnd] || blocks[rnd - n] || blocks[rnd + n]) {
      rnd = Math.floor(Math.random() * (blocks.length - n - 1));
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
    matchingStimuli++;
  }
  // Place noise
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i]) {
      continue;
    }
    let prev = blocks[i - n];
    let next = blocks[i + n];
    // Pick noise
    let noise = random(symbols);
    // Place noise
    if (prev && prev.symbol === noise) {
      blocks[i] = {
        isMatching: true,
        symbol: noise
      };
      matchingStimuli++;
    } else {
      blocks[i] = {
        isMatching: false,
        symbol: noise
      };
    }
    if (next && next.symbol === noise) {
      next.isMatching = true;
      matchingStimuli++;
    }
  }
  console.log("Matching stimuli", matchingStimuli);
  return blocks;
}

function resetPoints() {
  matchingStimuli = 0;
  
  rightFace = 0;
  rightSound = 0;
  rightPosition = 0;
  rightColor = 0;
  
  wrongFace = 0;
  wrongSound = 0;
  wrongPosition = 0;
  wrongColor = 0;
  
  // Also resets the camera
  rx = -30;
  ry = -45;
}

function resetBlock() {
  enableFaceCheck = true;
  enableSoundCheck = true;
  enablePositionCheck = true;
  enableColorCheck = true;
  
  currFace = null;
  currSound = null;
  currPosition = null;
  currColor = null;
  
  move(cube, null, initialPosition);
  
  checkSoundBtn.classList.remove("right", "wrong");
  checkFaceBtn.classList.remove("right", "wrong");
  checkPositionBtn.classList.remove("right", "wrong");
  checkColorBtn.classList.remove("right", "wrong");
}

function resetIntervals() {
  intervals.forEach(interval => 
    clearInterval(interval)
  );
}

let prevCubeZRot = 0;
let prevCubeYRot = 0;
let prevCubeXRot = 0;
function move(el, prevPosString, currPosString) {
  prevPosString = prevPosString || initialPosition;
  let [px, py, pz] = prevPosString.split(",");
  let [cx, cy, cz] = currPosString.split(",");
  
  // Calc direction to set cube rotation
  let dz = cx - px;
  let crz = (Math.abs(dz) === 1) ? 90 : 180;
  crz = Math.sign(dz) * crz;
  
  let dy = py - cy;
  let cry = (Math.abs(dy) === 1) ? 90 : 180;
  cry = Math.sign(dy) * cry;
  
  let dx = pz - cz;
  let crx = (Math.abs(dx) === 1) ? 90 : 180;
  crx = Math.sign(dx) * crx;
  
  if (dz !== 0 && dx === 0) {
    prevCubeZRot += crz;
  }
  
  if (dy !== 0 && dx === 0 && dz === 0) {
    prevCubeYRot += cry;
  }
  
  if (dx !== 0 && dz === 0) {
    prevCubeXRot += crx;
  }
  
  el.style.transform = `translate3d(${cx}em, ${cy}em, ${cz}em) rotateZ(${prevCubeZRot}deg) rotateY(${prevCubeYRot}deg) rotateX(${prevCubeXRot}deg)`;
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

function getGameCycle(n) {
  
  let faces = createBlocks(numbers, n);
  let sounds = createBlocks(letters, n);
  let positions = createBlocks(moves, n);
  let colors = createBlocks(colorClasses, n);
  
  let i = 0;
  return function() {
    
    resetBlock();
    
    if (!isRunning) {
      return;
    }
    
    // End game
    if (i > faces.length - 1) {
      
      // Save scores before stopping
      console.log("Correct stimuli", rightFace, rightSound, rightPosition, rightColor);
      let percentage = (rightFace + rightSound + rightPosition + rightColor) / matchingStimuli;
      let mistakes = wrongFace + wrongSound + wrongPosition + wrongColor;
      console.log("Mistakes", mistakes);
      let errorThreshold = matchingStimuli / 4;
      
      stop();
      
      speak(`You've got ${Math.floor(percentage * 100)} percent of correct stimuli. With ${mistakes} mistake${(mistakes > 1) ? "s" : ""}.`)
        .onend = function () {
          if (
            percentage >= nextLevelThreshold
            && mistakes <= errorThreshold
            && +nBackInput.value < 9
          ) {
            speak("Congratulations! Advancing to the next level.");
            nBackInput.value = +nBackInput.value + 1;
          } else if (
            (percentage <= prevLevelThreshold || mistakes > errorThreshold)
            && +nBackInput.value > 1
          ) {
            speak("Going back to the previous level. Keep training, you'll get better.");
            nBackInput.value = +nBackInput.value - 1;
          } else {
            speak("Level remains the same. Over time you'll get better.");
          }
      };
      
      return;
    }
    
    // Operations
    
    currFace = faces[i];
    currSound = sounds[i];
    currPosition = positions[i];
    currColor = colors[i];
    
    // Count stimulus
    stimuliCount++;
    
    wow(faceEls[currFace.symbol - 1], currColor.symbol, tileFlashTime);
    speak(currSound.symbol);
    
    let prevPosition = (positions[i-1] || {});
    move(cube, prevPosition.symbol, currPosition.symbol);
    
    // Increase block index
    i++;
    
  }
}

function play() {
  if (isRunning) {
    return;
  }
  
  isRunning = true;
  
  speak("Start.");
  document.querySelector(".stop").classList.remove("active");
  document.querySelector(".play").classList.add("active");
  
  let n = +nBackInput.value;
  let gameCycle = getGameCycle(n);
  setTimeout(gameCycle, gameStartDelay);
  intervals.push(
    setInterval(
      gameCycle,
      gameStartDelay + baseDelay + n * cumulativeDelay
    )
  );
}

function stop() {
  if (!isRunning) {
    return;
  }
  
  resetPoints();
  resetBlock();
  resetIntervals();
  
  isRunning = false;
  
  speak("Stop.");
  document.querySelector(".stop").classList.add("active");
  document.querySelector(".play").classList.remove("active");
}

function checkHandler(sense) {
  let curr;
  let button;
  let enable;
  
  // This part is garbage but hey I've used single vars xD
  if (sense === "face") {
    curr = currFace;
    button = checkFaceBtn;
    enable = enableFaceCheck;
  } else if (sense === "sound") {
    curr = currSound;
    button = checkSoundBtn;
    enable = enableSoundCheck;
  } else if (sense === "position") {
    curr = currPosition;
    button = checkPositionBtn;
    enable = enablePositionCheck;
  } else if (sense === "color") {
    curr = currColor;
    button = checkColorBtn;
    enable = enableColorCheck;
  }
  
  if (!curr || !enable) {
    return;
  }
  
  if (sense === "face") {
    enableFaceCheck = false;
  } else if (sense === "sound") {
    enableSoundCheck = false;
  } else if (sense === "position") {
    enablePositionCheck = false;
  } else if (sense === "color") {
    enableColorCheck = false;
  }
  
  if (curr.isMatching) {
    
    if (sense === "face") {
      rightFace++;
    } else if (sense === "sound") {
      rightSound++;
    } else if (sense === "position") {
      rightPosition++;
    } else if (sense === "color") {
      rightColor++;
    }
    
    button.classList.add("right");
  } else {
    
    if (sense === "face") {
      wrongFace++;
    } else if (sense === "sound") {
      wrongSound++;
    } else if (sense === "position") {
      wrongPosition++;
    } else if (sense === "color") {
      wrongColor++;
    }
    
    button.classList.add("wrong");
  }
}

["face", "sound", "position", "color"]
  .forEach(sense => {
    document.querySelector(".check-" + sense)
      .addEventListener(
        "click",
        () => checkHandler(sense)
      );
    document.querySelector(".check-" + sense)
      .addEventListener(
        "touchstart",
        () => checkHandler(sense)
      );
  });

document.addEventListener(
  "keypress",
  evt => {
    if (evt.code === "KeyF") {
      checkHandler("face");
    } else if (evt.code === "KeyJ") {
      checkHandler("sound");
    } else if (evt.code === "KeyD") {
      checkHandler("position");
    } else if (evt.code === "KeyK") {
      checkHandler("color");
    } else if (evt.code === "KeyQ") {
      play();
    } else if (evt.code === "KeyP") {
      stop();
    }
  }
);

let zoom = 1;

// Position
let rx = -30;
let ry = -45;

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

sceneWrapper.addEventListener("wheel", evt =>
  zoom -= evt.deltaY * 0.001
);

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

      ax += dy * 0.01;
      ay += dx * 0.01;

      prevX = x;
      prevY = y;
    }

    if (type === "mouse") {
      document.addEventListener("mousemove", moveHandler);
      document.addEventListener("mouseup", () =>
        document.removeEventListener("mousemove", moveHandler)
      );
    } else if (type === "touch") {
      document.addEventListener("touchmove", moveHandler);
      document.addEventListener("touchend", () =>
        document.removeEventListener("touchmove", moveHandler)
      );
    }

  }
}

sceneWrapper.addEventListener("mousedown", interactionHandler("mouse"));
sceneWrapper.addEventListener("touchstart", interactionHandler("touch"));

function update() {
  
  vx += ax - vx * 0.1;
  vy += ay - vy * 0.1;
  
  rx += vx;
  ry += vy;
  
  ax = 0;
  ay = 0;
  
  if (rx < -100) {
    rx = -100;
  }
  
  if (rx > 0) {
    rx = 0;
  }
  
  if (ry < -100) {
    ry = -100;
  }
  
  if (ry > 10) {
    ry = 10;
  }
  
  if (zoom < 0.5) {
    zoom = 0.5;
  }
  
  if (zoom > 3) {
    zoom = 3;
  }
  
  scene.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  sceneWrapper.style.transform = `scale(${zoom})`;
  window.requestAnimationFrame(update);
}

update();
