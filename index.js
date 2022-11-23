const boxColor = 150;
const strokeColor = 50;
const colorPool = ["#d6297f", "#dfdf20", "#37c83c", "#3382cc", "#24b9db", "#b828d7"]
let unitLength = 10;
let columns; /* To be determined by window width */
let rows;    /* To be determined by window height */
let currentBoard;
let nextBoard;
let slider;
let initialState = [0, 1]
let canvasElem = document.querySelector("#canvas")
let isPaused = true
let randomColorModeBtn = document.querySelector("#random-color-mode-btn")
let keyboardModeBtn = document.querySelector("#draw-life-btn")
let darkModeBtn = document.querySelector("#dark-mode-btn")

let fpsDisplay = document.querySelector(".fps-criteria")
let zoomDisplay = document.querySelector(".zoom-criteria")

let addGliderBtn = document.querySelector("#add-glider-btn")
let addGosperBtn = document.querySelector("#add-gosper-btn")
let addSpaceshipBtn = document.querySelector("#add-spaceship-btn")
let lonelinessCriteriaElem = document.querySelector(".loneliness-criteria")
let overpopulationCriteriaElem = document.querySelector(".overpopulation-criteria")
let reproductionCriteriaElem = document.querySelector(".reproduction-criteria")
let lonelinessCriteriaPlusBtn = document.querySelector(".loneliness-criteria-plus-btn")
let lonelinessCriteriaMinusBtn = document.querySelector(".loneliness-criteria-minus-btn")
let overpopulationCriteriaPlusBtn = document.querySelector(".overpopulation-criteria-plus-btn")
let overpopulationCriteriaMinusBtn = document.querySelector(".overpopulation-criteria-minus-btn")
let reproductionCriteriaPlusBtn = document.querySelector(".reproduction-criteria-plus-btn")
let reproductionCriteriaMinusBtn = document.querySelector(".reproduction-criteria-minus-btn")

// Well-known patterns
let gosperGliderGun = `
........................O
......................O.O
............OO......OO............OO
...........O...O....OO............OO
OO........O.....O...OO
OO........O...O.OO....O.O
..........O.....O.......O
...........O...O
............OO
`

let glider = `
.O
..O
OOO
`

let lightweightSpaceship = `
.O..O
O
O...O
OOOO
`


function setup() {
    slider = createSlider(1, 30, 5);
    slider.style('width', '220px');
    slider.position(100, 69)

    sliderZoom = createSlider(1, 100, 10);
    sliderZoom.style('width', '220px');
    sliderZoom.position(440, 69)



    /* Set the canvas to be under the element #canvas*/
    const canvas = createCanvas(windowWidth, windowHeight - 160);
    canvas.parent(document.querySelector('#canvas'));

    /*Calculate the number of columns and rows */
    columns = floor(width / unitLength);
    rows = floor(height / unitLength);
    /*Making both currentBoard and nextBoard 2-dimensional matrix that has (columns * rows) boxes. */
    currentBoard = [];
    nextBoard = [];
    for (let i = 0; i < columns; i++) {
        currentBoard[i] = [];
        nextBoard[i] = []
    }
    // Now both currentBoard and nextBoard are array of array of undefined values.
    init();  // Set the initial values of the currentBoard and nextBoard
}

function setupResized() {
    const canvas = createCanvas(windowWidth, windowHeight - 133);
    canvas.parent(document.querySelector('#canvas'));

    columns = floor(width / unitLength);
    rows = floor(height / unitLength);


}

/**
* Initialize/reset the board state
*/
function init() {
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            currentBoard[i][j] = 0;
            nextBoard[i][j] = 0;
        }
    }
}

// Random initial states
function initRandom() {
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            currentBoard[i][j] = random(initialState);
            nextBoard[i][j] = random(initialState);
        }
    }
}

function draw() {

    let val = slider.value();
    fpsDisplay.innerHTML = val
    frameRate(val)


    let valZoom = sliderZoom.value();
    zoomDisplay.innerHTML = valZoom
    unitLength = parseInt(valZoom)

    background(255);
    generate();
    drawOnCanvas()
}


function drawOnCanvas() {
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {

            if (currentBoard[i][j] == 1) {
                if (nextBoard[i][j] == 1) {
                    if (darkModeBtn.classList.contains("dark-mode")) {
                        fill(255);

                    } else {
                        fill(0);
                    }
                } else {
                    if (randomColorModeBtn.classList.contains("random-color-mode")) {
                        fill(random(colorPool));
                    } else {
                        fill(boxColor)
                    }
                }
            }

            else {
                if (darkModeBtn.classList.contains("dark-mode")) {
                    fill(0)
                } else {
                    fill(255);

                }
            }

            stroke(strokeColor);
            rect(i * unitLength, j * unitLength, unitLength, unitLength);
        }
    }
}


function generate() {
    console.log("testing: the game is running")
    //Loop over every single box on the board
    for (let x = 0; x < columns; x++) {
        for (let y = 0; y < rows; y++) {
            // Count all living members in the Moore neighborhood(8 boxes surrounding)
            let neighbors = 0;
            for (let i of [-1, 0, 1]) {
                for (let j of [-1, 0, 1]) {
                    if (i == 0 && j == 0) {
                        // the cell itself is not its own neighbor
                        continue;
                    }
                    // The modulo operator is crucial for wrapping on the edge
                    neighbors += currentBoard[(x + i + columns) % columns][(y + j + rows) % rows];
                }
            }


            // Rules of Life
            if (currentBoard[x][y] == 1 && neighbors < parseInt(lonelinessCriteriaElem.innerHTML)) {
                // Die of Loneliness
                nextBoard[x][y] = 0;
            } else if (currentBoard[x][y] == 1 && neighbors > parseInt(overpopulationCriteriaElem.innerHTML)) {
                // Die of Overpopulation
                nextBoard[x][y] = 0;
            } else if (currentBoard[x][y] == 0 && neighbors == parseInt(reproductionCriteriaElem.innerHTML)) {
                // New life due to Reproduction
                nextBoard[x][y] = 1;
            } else {
                // Stasis
                nextBoard[x][y] = currentBoard[x][y];


            }
        }
    }

    // Swap the nextBoard to be the current Board
    [currentBoard, nextBoard] = [nextBoard, currentBoard];
}



/**
 * When mouse is dragged
 */
function mouseDragged() {
    /**
     * If the mouse coordinate is outside the board
     */
    if (mouseX > unitLength * columns || mouseY > unitLength * rows) {
        return;
    }
    const x = Math.floor(mouseX / unitLength);
    const y = Math.floor(mouseY / unitLength);
    currentBoard[x][y] = 1;
    fill(boxColor);
    stroke(strokeColor);
    rect(x * unitLength, y * unitLength, unitLength, unitLength);
}

/**
 * When mouse is pressed
 */
function mousePressed() {
    mouseDragged();
}

/**
 * When mouse is released
 */
function mouseReleased() {
    if (mouseX > unitLength * columns || mouseY > unitLength * rows) {
        return;
    }
    loop();
}

// Pause/Continue the game:
document.querySelector("#continue-pause-btn")
    .addEventListener("click", function () {
        if (isPaused) {
            frameRate(0)
            isPaused = false
        }
        else {
            let val = slider.value();
            frameRate(val)
            isPaused = true
        }
    });

// Reset the game:
document.querySelector('#reset-game-btn')
    .addEventListener('click', function () {
        init();
        draw();
    });

// Set random initial state:
document.querySelector("#random-initial-state-btn").addEventListener("click", function () {
    initRandom();
    draw()
})

// Set random color mode:
document.querySelector("#random-color-mode-btn").addEventListener("click", function (e) {

    e.currentTarget.classList.toggle("random-color-mode")
    draw()
    if (isPaused) {
        frameRate(0)
        isPaused = false
    }
    else {
        let val = slider.value();
        frameRate(val)
        isPaused = true
    }

})

// Change Rule 1:
lonelinessCriteriaPlusBtn.addEventListener("click", function () {
    let num = parseInt(document.querySelector(".loneliness-criteria").innerHTML)
    num += 1
    document.querySelector(".loneliness-criteria").innerHTML = num
    return
})
lonelinessCriteriaMinusBtn.addEventListener("click", function () {
    let num = parseInt(document.querySelector(".loneliness-criteria").innerHTML)
    num -= 1
    document.querySelector(".loneliness-criteria").innerHTML = num
    return
})

// Change Rule 2:
overpopulationCriteriaPlusBtn.addEventListener("click", function () {
    let num = parseInt(document.querySelector(".overpopulation-criteria").innerHTML)
    num += 1
    document.querySelector(".overpopulation-criteria").innerHTML = num
    return
})
overpopulationCriteriaMinusBtn.addEventListener("click", function () {
    let num = parseInt(document.querySelector(".overpopulation-criteria").innerHTML)
    num -= 1
    document.querySelector(".overpopulation-criteria").innerHTML = num
    return
})

// Change Rule 4:
reproductionCriteriaPlusBtn.addEventListener("click", function () {
    let num = parseInt(document.querySelector(".reproduction-criteria").innerHTML)
    num += 1
    document.querySelector(".reproduction-criteria").innerHTML = num
    return
})
reproductionCriteriaMinusBtn.addEventListener("click", function () {
    let num = parseInt(document.querySelector(".reproduction-criteria").innerHTML)
    num -= 1
    document.querySelector(".reproduction-criteria").innerHTML = num
    return
})

// Convert well-known patterns into array:
function patternDecoder(input) {
    let sequence = []
    let output = []
    let inputArr = input.split("\n")
    for (let item of inputArr) {
        if (item != "") {
            sequence.push(item)
        } else {
            continue
        }
    }
    for (let subSequence of sequence) {
        let subSequenceArr = subSequence.replaceAll(".", 0).replaceAll("O", 1).split("")
        output.push(subSequenceArr)
    }
    return output
}



// Draw "Glider" pattern:
function gliderDrawer() {
    let output = patternDecoder(glider)
    for (let i = 0; i < output.length; i++) {
        for (let j = 0; j < output[i].length; j++) {
            if (output[i][j] == 1) {
                currentBoard[j][i] = 1
            } else {
                currentBoard[j][i] = 0
            }
        }
    }
}
addGliderBtn.addEventListener("click", function () {
    gliderDrawer()
})

// Draw "Gosper Glider Gun" pattern
function gosperDrawer() {
    let output = patternDecoder(gosperGliderGun)
    for (let i = 0; i < output.length; i++) {
        for (let j = 0; j < output[i].length; j++) {
            if (output[i][j] == 1) {
                currentBoard[j][i] = 1
            } else {
                currentBoard[j][i] = 0
            }
        }
    }
}
addGosperBtn.addEventListener("click", function () {
    gosperDrawer()
})

// Draw "Lightweight Spaceship"
function spaceshipDrawer() {
    let output = patternDecoder(lightweightSpaceship)
    for (let i = 0; i < output.length; i++) {
        for (let j = 0; j < output[i].length; j++) {
            if (output[i][j] == 1) {
                currentBoard[j][i] = 1
            } else {
                currentBoard[j][i] = 0
            }
        }
    }
}
addSpaceshipBtn.addEventListener("click", function () {
    spaceshipDrawer()
})

let cursorX = 0
let cursorY = 0

let redCursorFcn = function (e) {
    if (isPaused) {
        frameRate(0)
        isPaused = false
    }
    else {
        let val = slider.value();
        frameRate(val)
        isPaused = true
    }

    e.currentTarget.classList.toggle("keyboard-mode")
    if (e.currentTarget.classList.contains("keyboard-mode")) {
        for (let i = 0; i < columns; i++) {
            for (let j = 0; j < rows; j++) {
                if (i == cursorX && j == cursorY) {
                    fill("red")
                    rect(i * unitLength, j * unitLength, unitLength, unitLength);
                }
            }
        }
    } else {
        for (let i = 0; i < columns; i++) {
            for (let j = 0; j < rows; j++) {
                fill(255)
                rect(i * unitLength, j * unitLength, unitLength, unitLength);
            }
        }
    }
}
keyboardModeBtn.addEventListener("click", redCursorFcn)




let redCursorMoveFcn = function (event) {
    // console.log(event.keyCode)
    if (keyboardModeBtn.classList.contains("keyboard-mode")) {
        if (event.keyCode == 76) {
            console.log("L pressed")
            currentBoard[cursorX][cursorY] = 1
            return
        } else if (event.keyCode == 75) {
            console.log("K pressed")
            currentBoard[cursorX][cursorY] = 0
        }
        fill('white')
        rect(cursorX * unitLength, cursorY * unitLength, unitLength, unitLength);
        drawOnCanvas()
        if (event.keyCode == 38 || event.keyCode == 87) {
            console.log("UP pressed")
            cursorY -= 1
        } else if (event.keyCode == 40 || event.keyCode == 83) {
            console.log("DOWN pressed")
            cursorY += 1
        } else if (event.keyCode == 37 || event.keyCode == 65) {
            console.log("LEFT pressed")
            cursorX -= 1
        } else if (event.keyCode == 39 || event.keyCode == 68) {
            console.log("RIGHT pressed")
            cursorX += 1
        }
        fill('red')
        rect(cursorX * unitLength, cursorY * unitLength, unitLength, unitLength);


    }
}
document.body.addEventListener("keydown", redCursorMoveFcn)







// Resize canvas according to windows size:
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    setupResized()
}


// Switching between different styles:
darkModeBtn.addEventListener("click", function (e) {
    e.currentTarget.classList.toggle("dark-mode")

})



