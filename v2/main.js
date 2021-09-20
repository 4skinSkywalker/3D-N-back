let sceneWrapper = document.querySelector(".scene-wrapper");
let scene = document.querySelector(".scene");

let floors = [...document.querySelectorAll(".floor")];

let cube = document.querySelector(".cube");
let faceEls = [...document.querySelectorAll(".cube > .face")];

let innerCube = document.querySelector(".inner-cube");
let innerFaceEls = [...document.querySelectorAll(".inner-cube > .face")];

let checkCornerBtn = document.querySelector(".check-corner");
let checkCameraBtn = document.querySelector(".check-camera");
let checkFaceBtn = document.querySelector(".check-face");
let checkSoundBtn = document.querySelector(".check-sound");
let checkPositionBtn = document.querySelector(".check-position");
let checkColorBtn = document.querySelector(".check-color");

let nBackInput = document.querySelector("#n-back");
let sceneDimmerInput = document.querySelector("#scene-dimmer");
let zoomInput = document.querySelector("#zoom");
let perspectiveInput = document.querySelector("#perspective");
let targetStimuliInput = document.querySelector("#targetStimuli");
let gameStartDelayInput = document.querySelector("#gameStartDelay");
let baseDelayInput = document.querySelector("#baseDelay");
let cumulativeDelayInput = document.querySelector("#cumulativeDelay");
let tileFlashTimeInput = document.querySelector("#tileFlashTime");
let previousLevelThresholdInput = document.querySelector("#previousLevelThreshold");
let nextLevelThresholdInput = document.querySelector("#nextLevelThreshold");

let [
  cornerEnableTrig,
  cameraEnableTrig,
  faceEnableTrig,
  positionEnableTrig,
  soundEnableTrig,
  colorEnableTrig,
  rotationEnableTrig
] = [...document.querySelectorAll(".toggle-trigger")];

// Game settings
let points = [
  "-60&0", "-60&-45", "-60&-90",
  "-20&0", "-20&-45", "-20&-90"
]; // I know this is ugly AF...
let numbers = "123456";
let letters = "abflqy";
let initialCubePosition = "-.5,-3,.5";
let moves = [
  "-3.5,0,-2.5", "-.5,0,-2.5", "2.5,0,-2.5",
  "-3.5,0,.5",       "-.5,0,.5", "2.5,0,.5",
  "-3.5,0,3.5", "-.5,0,3.5", "2.5,0,3.5",
  
  "-3.5,-3,-2.5", "-.5,-3,-2", "2.5,-3,-2.5",
  "-3.5,-3,.5", "2.5,-3,.5",
  "-3.5,-3,3.5", "-.5,-3,3.5", "2.5,-3,3.5",
  
  "-3.5,-6,-2.5", "-.5,-6,-2", "2.5,-6,-2.5",
  "-3.5,-6,.5", "-.5,-6,.5", "2.5,-6,.5",
  "-3.5,-6,3.5", "-.5,-6,3.5", "2.5,-6,3.5"
];
let initialInnerCubePosition = ".5,.5,0";
let cornersList = [
  "0,0,.5",
  "0,0,-.5",
  "1,0,-.5",
  "1,0,.5",
  
  "0,1,.5",
  "0,1,-.5",
  "1,1,-.5",
  "1,1,.5"
];
let colorClasses = [
  "col-a", "col-b", "col-c", "col-d", "col-e", "col-f"
];

// Editable settings
// This piece of code is a bit confusing I know...
let cornerEnabled = true;
cornerEnableTrig.checked = cornerEnabled;
cornerEnableTrig.addEventListener("input", () =>
  (
    cornerEnabled = !cornerEnabled,
    !cornerEnabled ?
      (
        innerCube.style.display = "none",
        checkCornerBtn.style.display = "none"
      ) :
      (
        innerCube.style.display = "block",
        checkCornerBtn.style.display = "inline-block"
      ),
    innerFaceEls.forEach(face => face.style.animationDelay = "0s"),
    checkCornerBtn.style.animationDelay = "0s"
  )
);

let cameraEnabled = true;
cameraEnableTrig.checked = cameraEnabled;
cameraEnableTrig.addEventListener("input", () =>
  (
    cameraEnabled = !faceEnabled,
    !cameraEnabled ?
      checkCameraBtn.style.display = "none" :
      checkCameraBtn.style.display = "inline-block",
    checkCameraBtn.style.animationDelay = "0s"
  )
);

let faceEnabled = true;
faceEnableTrig.checked = faceEnabled;
faceEnableTrig.addEventListener("input", () =>
  (
    faceEnabled = !faceEnabled,
    !faceEnabled ?
      checkFaceBtn.style.display = "none" :
      checkFaceBtn.style.display = "inline-block",
    checkFaceBtn.style.animationDelay = "0s"
  )
);

let soundEnabled = true;
soundEnableTrig.checked = faceEnabled;
soundEnableTrig.addEventListener("input", () =>
  (
    soundEnabled = !soundEnabled,
    !soundEnabled ?
      checkSoundBtn.style.display = "none" :
      checkSoundBtn.style.display = "inline-block",
    checkSoundBtn.style.animationDelay = "0s"
  )
);

let positionEnabled = true;
positionEnableTrig.checked = faceEnabled;
positionEnableTrig.addEventListener("input", () =>
  (
    positionEnabled = !positionEnabled,
    !positionEnabled ?
      checkPositionBtn.style.display = "none" :
      checkPositionBtn.style.display = "inline-block",
    checkPositionBtn.style.animationDelay = "0s"
  )
);

let colorEnabled = true;
colorEnableTrig.checked = faceEnabled;
colorEnableTrig.addEventListener("input", () =>
  (
    colorEnabled = !colorEnabled,
    !colorEnabled ?
      checkColorBtn.style.display = "none" :
      checkColorBtn.style.display = "inline-block",
    checkColorBtn.style.animationDelay = "0s"
  )
);

let rotationEnabled = false;
rotationEnableTrig.checked = rotationEnabled;
rotationEnableTrig.addEventListener("input", () =>
  rotationEnabled = !rotationEnabled
);

function setFloorBackground(floor, dimPercent, tileAHexColor, tileBHexColor) {
  if (dimPercent > 1) {
    dimPercent = 1;
  }
  let hexSymbols = "0123456789abcdef";
  let hexBrightness = hexSymbols[
    Math.floor(dimPercent * (hexSymbols.length - 1))
  ];
  if (floor.classList.contains("floor-bottom")) {
    floor.style.backgroundImage = `linear-gradient(
  #000${hexBrightness},
  #000${hexBrightness}
),
radial-gradient(
  at 0 0,
  #0000,
  20%,
  #000
),
repeating-conic-gradient(
  ${tileAHexColor} 0deg,
  ${tileAHexColor} 90deg,
  ${tileBHexColor} 90deg,
  ${tileBHexColor} 180deg
)`;
  } else if (floor.classList.contains("floor-left")) {
    floor.style.backgroundImage = `linear-gradient(
  #000${hexBrightness},
  #000${hexBrightness}
),
radial-gradient(
  at 53.5em 53.5em,
  #0000,
  20%,
  #000
),
repeating-conic-gradient(
  ${tileAHexColor} 0deg,
  ${tileAHexColor} 90deg,
  ${tileBHexColor} 90deg,
  ${tileBHexColor} 180deg
)`;
  } else {
    floor.style.backgroundImage = `linear-gradient(
  #000${hexBrightness},
  #000${hexBrightness}
),
radial-gradient(
  at 0 53.5em,
  #0000,
  20%,
  #000
),
repeating-conic-gradient(
  ${tileBHexColor} 0deg,
  ${tileBHexColor} 90deg,
  ${tileAHexColor} 90deg,
  ${tileAHexColor} 180deg
)`;
  }
}

let tileAHexColor = "#111";
let tileBHexColor = "#888";
let sceneDimmer = 0.5;
sceneDimmerInput.value = sceneDimmer;
floors.forEach(floor =>
    setFloorBackground(
      floor,
      sceneDimmer,
      tileAHexColor,
      tileBHexColor
    )
  );
sceneDimmerInput.addEventListener("input", () => {
  sceneDimmer = +sceneDimmerInput.value;
  floors.forEach(floor =>
    setFloorBackground(
      floor,
      sceneDimmer,
      tileAHexColor,
      tileBHexColor
    )
  );
});

let zoom = 0.7;
zoomInput.value = zoom;
zoomInput.addEventListener("input", () => {
  zoom = +zoomInput.value;
  sceneWrapper.style.transform = `scale(${zoom})`;
});

let perspective = 15;
perspectiveInput.value = perspective;
perspectiveInput.addEventListener("input", () => {
  perspective = +perspectiveInput.value;
  sceneWrapper.style.perspective = `${perspective}em`;
});

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

let enableCornerCheck = true;
let enableCameraCheck = true;
let enableFaceCheck = true;
let enableSoundCheck = true;
let enablePositionCheck = true;
let enableColorCheck = true;

let currCorner;
let currCamera;
let currFace;
let currSound;
let currPosition;
let currColor;

let rightCorner = 0;
let rightCamera = 0;
let rightFace = 0;
let rightSound = 0;
let rightPosition = 0;
let rightColor = 0;

let wrongCorner = 0;
let wrongCamera = 0;
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
      isMatching: undefined, // I'll have to figure out if it's matching
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
    if (blocks[i] && blocks[i].isMatching) {
      continue;
    }
    let prev = blocks[i - n];
    let next = blocks[i + n];
    if (blocks[i] && blocks[i].isMatching === undefined) {
      if (prev && prev.symbol === blocks[i].symbol) {
        blocks[i].isMatching = true;
        matchingStimuli++;
      } else {
        blocks[i].isMatching = false;
      }
      continue;
    }
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
  
  rightCorner = 0;
  rightCamera = 0;
  rightFace = 0;
  rightSound = 0;
  rightPosition = 0;
  rightColor = 0;
  
  wrongCorner = 0;
  wrongCamera = 0;
  wrongFace = 0;
  wrongSound = 0;
  wrongPosition = 0;
  wrongColor = 0;
  
  move(cube, initialCubePosition, initialCubePosition);
  move(innerCube, initialInnerCubePosition, initialInnerCubePosition);
  scene.style.transform = "rotateX(-40deg) rotateY(-45deg)";
}

function resetBlock() {
  enableCornerCheck = true;
  enableCameraCheck = true;
  enableFaceCheck = true;
  enableSoundCheck = true;
  enablePositionCheck = true;
  enableColorCheck = true;
  
  currCorner = null;
  currCamera = null;
  currFace = null;
  currSound = null;
  currPosition = null;
  currColor = null;
  
  checkCornerBtn.classList.remove("right", "wrong");
  checkCameraBtn.classList.remove("right", "wrong");
  checkFaceBtn.classList.remove("right", "wrong");
  checkSoundBtn.classList.remove("right", "wrong");
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
  
  console.log(el, prevPosString, currPosString);
  
  let [px, py, pz] = prevPosString.split(",");
  let [cx, cy, cz] = currPosString.split(",");
  
  // Calc direction to set cube rotation
  if (rotationEnabled) {
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
  
  let corners;
  if (cornerEnabled) {
    corners = createBlocks(cornersList, n);
  }
  
  let cameras;
  if (cameraEnabled) {
    cameras = createBlocks(points, n);
  }
  
  let faces;
  if (faceEnabled) {
    faces = createBlocks(numbers, n);
  }
  
  let sounds;
  if (soundEnabled) {
    sounds = createBlocks(letters, n);
  }
  
  let positions;
  if (positionEnabled) {
    positions = createBlocks(moves, n);
  }
  
  let colors;
  if (colorEnabled) {
    colors = createBlocks(colorClasses, n);
  }
  
  let i = 0;
  return function() {
    
    resetBlock();
    
    if (!isRunning) {
      return;
    }
    
    let length = targetNumOfStimuli * (n + 2) + targetNumOfStimuli;
    
    // End game
    if (i > length - 1) {
      
      let percentage = 0;
      if (cornerEnabled) {
        percentage += rightCorner;
      }
      if (cameraEnabled) {
        percentage += rightCamera;
      }
      if (faceEnabled) {
        percentage += rightFace;
      }
      if (soundEnabled) {
        percentage += rightSound;
      }
      if (positionEnabled) {
        percentage += rightPosition;
      }
      if (colorEnabled) {
        percentage += rightColor;
      }
      percentage /= matchingStimuli;
      
      let mistakes = 0;
      if (cornerEnabled) {
        mistakes += wrongCorner;
      }
      if (cameraEnabled) {
        mistakes += wrongCamera;
      }
      if (faceEnabled) {
        mistakes += wrongFace;
      }
      if (soundEnabled) {
        mistakes += wrongSound;
      }
      if (positionEnabled) {
        mistakes += wrongPosition;
      }
      if (colorEnabled) {
        mistakes += wrongColor;
      };
      let errorThreshold = matchingStimuli * 0.4;
      
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
    
    // Count stimulus
    stimuliCount++;
    
    if (cornerEnabled) {
      currCorner = corners[i];
      let prevCorner = (corners[i-1] || { symbol: initialInnerCubePosition });
      move(
        innerCube,
        prevCorner.symbol,
        currCorner.symbol
      );
    }
    if (cameraEnabled) {
      currCamera = cameras[i];
      let [cx, cy] = currCamera.symbol.split("&");
      scene.style.transform = `rotateX(${cx}deg) rotateY(${cy}deg)`;
    }
    if (faceEnabled) {
      currFace = faces[i];
      if (colorEnabled) {
        currColor = colors[i];
        wow(faceEls[currFace.symbol - 1], currColor.symbol, tileFlashTime);
      } else {
        wow(faceEls[currFace.symbol - 1], "col-a", tileFlashTime);
      }
    } else if (colorEnabled) {
      currColor = colors[i];
      wow(faceEls[0], currColor.symbol, tileFlashTime);
    }
    if (soundEnabled) {
      currSound = sounds[i];
      speak(currSound.symbol);
    }
    if (positionEnabled) {
      currPosition = positions[i];
      let prevPosition = (positions[i-1] || { symbol: initialCubePosition });
      move(
        cube,
        prevPosition.symbol,
        currPosition.symbol
      );
    }
    
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
  if (sense === "corner") {
    curr = currCorner;
    button = checkCornerBtn;
    enable = enableCornerCheck;
  } else if (sense === "camera") {
    curr = currCamera;
    button = checkCameraBtn;
    enable = enableCameraCheck;
  } else if (sense === "face") {
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
  
  if (sense === "corner") {
    enableCornerCheck = false;
  } else if (sense === "camera") {
    enableCameraCheck = false;
  } else if (sense === "face") {
    enableFaceCheck = false;
  } else if (sense === "sound") {
    enableSoundCheck = false;
  } else if (sense === "position") {
    enablePositionCheck = false;
  } else if (sense === "color") {
    enableColorCheck = false;
  }
  
  console.log(sense, curr, button, enable);
  
  if (curr.isMatching) {
    
    if (sense === "corner") {
      rightCorner++;
    } else if (sense === "camera") {
      rightCamera++;
    } else if (sense === "face") {
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
    
    if (sense === "corner") {
      wrongCorner++;
    } else if (sense === "camera") {
      wrongCamera++;
    } else if (sense === "face") {
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

["corner", "camera", "face", "sound", "position", "color"]
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
    if (evt.code === "KeyJ") {
      checkHandler("corner");
    } else if (evt.code === "KeyS") {
      checkHandler("camera");
    } else if (evt.code === "KeyD") {
      checkHandler("face");
    } else if (evt.code === "KeyK") {
      checkHandler("sound");
    } else if (evt.code === "KeyF") {
      checkHandler("position");
    } else if (evt.code === "KeyL") {
      checkHandler("color");
    } else if (evt.code === "KeyQ") {
      play();
    } else if (evt.code === "KeyP") {
      stop();
    }
  }
);
