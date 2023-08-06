'use strict'
//to win you have to open all cells which are not bombs and mark all bombs with flag by right click
//לעשות אולי שזה יסמן את כל הפצצות לבד אם ניצחתי - לולאה שעוברת על כל הלוח ובודקת את מספר התאים שפתוחים ושהם לא פצצות
//make a game over modal - win or lose with a play again button take from pacman
//להוסיף רעש של פיצוץ שלוחצים על פצצה

const MINE = '💣'
const EMPTY = ''
const FLAG = '🚩'
const EXTERMINATOR = '🦝'


var gBoard
var gMines
// var gClickCount = 0
var gClickedBombs
var gSaveClicks = 0
var gMegaHintClicks = 0
var megaHintCells = []
var allMinesPositions = []
var historyCells = []
var gPlacedMines = 0
let seconds = 0;
let timerId;
let bestScoreLevel1 = Infinity;
let bestScoreLevel2 = Infinity;
let bestScoreLevel3 = Infinity;

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    hintMode: false,
    manuallyCreate: false,
    manuallyDone: false,
    megaHint: false,
    megaHintDone: false,
    mineExterminator: false,
    mineExterminatorDone: false
}


function onInit(SIZE, MINES) {
    console.log('NEW GAME')
    gGameReset()
    gBoard = buildBoard(SIZE)
    renderBoard(gBoard)
    gMines = MINES
    gClickedBombs = 0
    gSaveClicks = 0
    gMegaHintClicks = 0
    megaHintCells = []
    allMinesPositions = []
    historyCells = []
    resetManuallyMode()
    resetSmileyAndHearts()
    resetHints()
    resetTimer()
    changeLevelTitleName()
    getCurrentLvlBestScoreVal()
    updateDomWithScores()
    changeMinesTextValue()
}

function changeMinesTextValue() {
    var elMineValue = document.querySelector('.mines-value')
    elMineValue.innerText = gMines
}

function buildBoard(size) {
    var board = []
    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }

    }

    return board
}

function renderBoard(board) {

    var strHTML = '<tbody>'

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            cell = EMPTY
            const className = `cell cell-${i}-${j}`
            strHTML += `<td onclick="onCellClicked(this,${i},${j})" oncontextmenu="onCellMarked(this,${i},${j})" class="${className}">${cell}</td>`


        }
        strHTML += '</tr>'
    }

    strHTML += '</tbody>'

    const elTable = document.querySelector('table')
    elTable.innerHTML = strHTML


}
function giveEmptyCells(board, firstClickedCellPos) {
    var emptyCells = []
    // console.log('firstClickedCellPos', firstClickedCellPos)
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j] !== board[firstClickedCellPos.i][firstClickedCellPos.j]) {
                var emptyCellPos = { i: i, j: j }
                emptyCells.push(emptyCellPos)
            }
        }
    }
    return emptyCells
}

function setMines(board, mines, firstClickedCellPos) {
    var emptyCells = giveEmptyCells(board, firstClickedCellPos)
    for (var i = 0; i < mines; i++) {
        var randomNum = getRandomInt(0, emptyCells.length)
        var randomCellPos = emptyCells.splice(randomNum, 1)
        var posForMine = randomCellPos[0]
        board[posForMine.i][posForMine.j].isMine = true
        allMinesPositions.push(posForMine)
    }
}


function setMinesNegsCount(rowIdx, colIdx, board) {
    var negsCount = 0

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (board[i][j].isMine === true) negsCount++
        }
    }
    return negsCount
}

function updateModelWithNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var minesAroundCell = setMinesNegsCount(i, j, board)
            board[i][j].minesAroundCount = minesAroundCell

        }
    }
}

function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

function onCellClicked(elCell, i, j) {
    var clickedCell = gBoard[i][j]

    // gClickCount++
    // console.log(gClickCount)
    if (gGame.isOn === true && !clickedCell.isShown && !clickedCell.isMarked && !gGame.hintMode && !gGame.manuallyCreate && !gGame.megaHint) {
        if (gBoard.every(row => row.every(cell => !cell.isShown)) && !gGame.manuallyDone) {
            //we can detect the first click by using a clickCount as well.
            //if gClickCount === 1 then...
            startTimer()
            var firstClickedCellPos = { i: i, j: j }
            setMines(gBoard, gMines, firstClickedCellPos)
            updateModelWithNegsCount(gBoard)
            console.log('gBoard', gBoard)
        }
        else if (gGame.manuallyDone) {
            updateModelWithNegsCount(gBoard)
            startTimer()
            gGame.manuallyDone = false
            console.log('gBoard', gBoard)

        }

        if (clickedCell.isMine === true) {
            elCell.innerText = MINE
            clickedCell.isShown = true
            elCell.classList.add('mine')
            gClickedBombs++
            historyCells.push(elCell)
            var elHearts = document.querySelector('.hearts')
            if (gClickedBombs === 1) {
                elHearts.innerText = '❤️❤️🤍'
            }
            else if (gClickedBombs === 2) {
                elHearts.innerText = '❤️🤍🤍'
            }
            else if (gClickedBombs === 3) {
                elHearts.innerText = '🤍🤍🤍'
                checkLose()
                openBombs()
            }

        } else if (clickedCell.minesAroundCount !== 0 && !clickedCell.isMine) {
            elCell.innerText = clickedCell.minesAroundCount
            clickedCell.isShown = true
            gGame.shownCount++
            elCell.classList.remove('safe')
            elCell.classList.add('opened')
            historyCells.push(elCell)

            checkVictory()


        } else {
            elCell.innerText = EMPTY
            clickedCell.isShown = true
            gGame.shownCount++
            expandShown(gBoard, i, j)
            elCell.classList.remove('safe')
            elCell.classList.add('opened')
            historyCells.push(elCell)

            checkVictory()


        }
    }
    else if (gGame.hintMode && gGame.isOn) {
        elCell.classList.add('hinted')
        if (clickedCell.isMine === true) {
            elCell.innerText = MINE
        } else if (clickedCell.minesAroundCount !== 0 && !clickedCell.isMine) {
            elCell.innerText = clickedCell.minesAroundCount
        } else {
            elCell.innerText = EMPTY
        }
        openCellsWithHint(gBoard, i, j)
        setTimeout(() => {
            elCell.innerText = EMPTY
            elCell.classList.remove('hinted')
        }, 1000)
    }
    else if (gGame.manuallyCreate) {
        gBoard[i][j].isMine = true
        gPlacedMines++
        elCell.innerText = MINE

    }
    else if (gGame.megaHint && !gGame.megaHintDone && gGame.isOn) {
        if (gMegaHintClicks <= 2) {
            gMegaHintClicks++
            elCell.classList.add('hinted')
            if (clickedCell.isMine === true) {
                elCell.innerText = MINE
            } else if (clickedCell.minesAroundCount !== 0 && !clickedCell.isMine) {
                elCell.innerText = clickedCell.minesAroundCount
            } else {
                elCell.innerText = EMPTY
            }
            var cellPos = { i: i, j: j }
            megaHintCells.push(cellPos)
            console.log('gMegaHintClicks', gMegaHintClicks)
            console.log('cellPos', cellPos)

        }
        if (gMegaHintClicks === 2) {
            openMegaHintCells(gBoard, megaHintCells)
        }
    }

    console.log('gGame.shownCount', gGame.shownCount)
}



function expandShown(board, rowIdx, colIdx) {
    // var allExpandCells = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (board[i][j].isMine) continue
            if (board[i][j].isShown) continue
            var negPos = {
                i: i,
                j: j
            }
            var classOfNeg = getClassName(negPos)
            var elNeg = document.querySelector("." + classOfNeg)
            if (board[negPos.i][negPos.j].isMarked) {
                board[negPos.i][negPos.j].isMarked = false
                gGame.markedCount--
                console.log('gGame.markedCount', gGame.markedCount)
                // allExpandCells.push(elNeg)
            }
            if (board[negPos.i][negPos.j].minesAroundCount === 0) {
                elNeg.innerText = EMPTY
                board[negPos.i][negPos.j].isShown = true
                gGame.shownCount++
                elNeg.classList.add('opened')
                // allExpandCells.push(elNeg)

                //RECURSION OPEN
                expandShown(board, negPos.i, negPos.j)
                // var nestedCells = expandShown(board, negPos.i, negPos.j);
                // allExpandCells = allExpandCells.concat(nestedCells);

            } else {
                elNeg.innerText = board[negPos.i][negPos.j].minesAroundCount
                board[negPos.i][negPos.j].isShown = true
                gGame.shownCount++
                elNeg.classList.add('opened')
                // allExpandCells.push(elNeg)
            }
        }
    }

    // console.log('allExpandCells', allExpandCells)
    // historyCells.push(allExpandCells)
    // console.log('historyCells', historyCells)
}

function onCellMarked(elCell, i, j) {
    event.preventDefault();
    if (!gBoard[i][j].isShown && gGame.isOn || gBoard[i][j].isMine && gGame.isOn) {
        if (elCell.innerText === FLAG) {
            elCell.innerText = EMPTY
            if (gBoard[i][j].isMine && gBoard[i][j].isShown) {
                elCell.innerText = MINE

            }
            gBoard[i][j].isMarked = false
            gGame.markedCount--

        } else {
            elCell.innerText = FLAG
            gBoard[i][j].isMarked = true
            gGame.markedCount++
            checkVictory()


        }
    }

    console.log('gGame.markedCount', gGame.markedCount)
}


function openBombs() {
    // var allOpenedBombs = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var bombPos = { i: i, j: j }
            if (gBoard[i][j].isMine === true) {
                if (gBoard[i][j].isMarked) {
                    gBoard[i][j].isMarked = false
                    gGame.markedCount--
                }
                var elBomb = document.querySelector('.' + getClassName(bombPos))
                elBomb.innerText = MINE
                gBoard[i][j].isShown = true
                elBomb.classList.add('mine')
                // allOpenedBombs.push(elBomb)
            }
        }
    }
    // historyCells.push(allOpenedBombs)

}


function onSmiley() {
    if (gGame.mineExterminatorDone) {
        gMines = gMines + 3
    }
    onInit(gBoard.length, gMines)
}
function checkVictory() {
    if (gGame.shownCount + gGame.markedCount === gBoard.length ** 2 && gGame.markedCount === gMines ||
        gGame.shownCount + gGame.markedCount === gBoard.length ** 2 && gGame.markedCount === gPlacedMines) {
        var elSmiley = document.querySelector('.smiley')
        elSmiley.innerText = '😎'
        gGame.isOn = false
        stopTimer()
        updateBestScore(gMines, gBoard, seconds)
        updateDomWithScores()

    }
}

function checkLose() {
    var elSmiley = document.querySelector('.smiley')
    elSmiley.innerText = '😭'
    gGame.isOn = false
    stopTimer()

}

function gGameReset() {
    gGame.isOn = true
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.hintMode = false
    gGame.manuallyCreate = false
    gGame.manuallyDone = false
    gGame.megaHintDone = false
    gGame.megaHint = false
    gGame.mineExterminator = false
    gGame.mineExterminatorDone = false
}

function resetSmileyAndHearts() {
    var elHearts = document.querySelector('.hearts')
    elHearts.innerText = '❤️❤️❤️'
    var elSmiley = document.querySelector('.smiley')
    elSmiley.innerText = '😃'
}

function changeLevelTitleName() {
    var elLevelTitle = document.querySelector('.current-level')
    if (gBoard.length === 4 && gMines === 2) {
        elLevelTitle.innerText = 'LEVEL : Easy'
    }
    else if (gBoard.length === 8 && gMines === 14) {
        elLevelTitle.innerText = 'LEVEL : Medium'
    }
    else if (gBoard.length === 12 && gMines === 32) {
        elLevelTitle.innerText = 'LEVEL : Hard'
    }
}

//TIMER

function startTimer() {
    const secondsElement = document.querySelector('.seconds');
    timerId = setInterval(function () {
        seconds++;
        secondsElement.innerText = seconds;
    }, 1000); // executes every 1000 milliseconds (1 second)
}

function stopTimer() {
    clearInterval(timerId);
}

function resetTimer() {
    clearInterval(timerId);
    seconds = 0;
    const secondsElement = document.querySelector('.seconds');
    secondsElement.innerText = seconds;
}

// LOCAL STORAGE - BEST TIME

function getCurrentLvlBestScoreVal() {

    // Check if the best scores exist in local storage
    if (localStorage.getItem('bestScoreLevel1')) {
        // Retrieve the best score for level 1 from local storage
        bestScoreLevel1 = parseFloat(localStorage.getItem('bestScoreLevel1'));
    }

    if (localStorage.getItem('bestScoreLevel2')) {
        // Retrieve the best score for level 2 from local storage
        bestScoreLevel2 = parseFloat(localStorage.getItem('bestScoreLevel2'));
    }

    if (localStorage.getItem('bestScoreLevel3')) {
        // Retrieve the best score for level 3 from local storage
        bestScoreLevel3 = parseFloat(localStorage.getItem('bestScoreLevel3'));
    }
}

function updateBestScore(gMines, gBoard, time) {
    let bestScore;

    // Determine which level the score is for
    if (gBoard.length === 4 && gMines === 2) {
        bestScore = bestScoreLevel1;
    } else if (gBoard.length === 8 && gMines === 14) {
        bestScore = bestScoreLevel2;
    } else if (gBoard.length === 12 && gMines === 32) {
        bestScore = bestScoreLevel3;
    } else {
        return; // Exit the function if the level is invalid
    }

    if (time < bestScore) {
        // Update the best score for the corresponding level
        if (gBoard.length === 4 && gMines === 2) {
            bestScoreLevel1 = time;
            var elBestEasyText = document.querySelector('.easy-text')
            elBestEasyText.innerText = parseFloat(localStorage.getItem('bestScoreLevel1'))
            localStorage.setItem('bestScoreLevel1', bestScoreLevel1);
        } else if (gBoard.length === 8 && gMines === 14) {
            bestScoreLevel2 = time;
            var elBestMediumText = document.querySelector('.medium-text')
            elBestMediumText.innerText = parseFloat(localStorage.getItem('bestScoreLevel2'))
            localStorage.setItem('bestScoreLevel2', bestScoreLevel2);
        } else if (gBoard.length === 12 && gMines === 32) {
            bestScoreLevel3 = time;
            var elBestHardText = document.querySelector('.hard-text')
            elBestHardText.innerText = parseFloat(localStorage.getItem('bestScoreLevel3'))
            localStorage.setItem('bestScoreLevel3', bestScoreLevel3);
        }
    }
}

function updateDomWithScores() {
    var elBestEasyText = document.querySelector('.easy-text')
    elBestEasyText.innerText = parseFloat(localStorage.getItem('bestScoreLevel1'))
    var elBestMediumText = document.querySelector('.medium-text')
    elBestMediumText.innerText = parseFloat(localStorage.getItem('bestScoreLevel2'))
    var elBestHardText = document.querySelector('.hard-text')
    elBestHardText.innerText = parseFloat(localStorage.getItem('bestScoreLevel3'))
}
//HINTS

function handleHint(elHint) {
    if (!elHint.classList.contains('glow') && gGame.isOn) {
        console.log('HINT CLICKED')
        elHint.classList.add('glow')
        gGame.hintMode = true
    }
}

function openCellsWithHint(board, rowIdx, colIdx) {
    console.log('TRY HINT')
    var elOpenHintedCells = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue
            var negPos = {
                i: i,
                j: j
            }
            var classOfNeg = getClassName(negPos)
            var elNeg = document.querySelector("." + classOfNeg)
            elNeg.classList.add('hinted')
            elOpenHintedCells.push(elNeg)
            if (board[negPos.i][negPos.j].minesAroundCount === 0 && !board[negPos.i][negPos.j].isMine && !board[negPos.i][negPos.j].isShown) {
                elNeg.innerText = EMPTY

            }
            if (board[negPos.i][negPos.j].minesAroundCount !== 0 && !board[negPos.i][negPos.j].isMine && !board[negPos.i][negPos.j].isShown) {
                elNeg.innerText = board[negPos.i][negPos.j].minesAroundCount

            }
            if (board[negPos.i][negPos.j].isMine && !board[negPos.i][negPos.j].isShown) {
                elNeg.innerText = MINE


            }
        }
    }
    closeHintCells(elOpenHintedCells)
    gGame.hintMode = false

}

function closeHintCells(allOpenedCells) {
    setTimeout(() => {
        allOpenedCells.forEach(cell => {
            if (!cell.classList.contains('opened')) {
                cell.innerText = EMPTY
                if (cell.classList.contains('mine')) {
                    cell.innerText = MINE

                }
            }
            cell.classList.remove('hinted')
        })

    }, 1000)


}

function resetHints() {
    var hint1 = document.querySelector('.hint-one')
    hint1.classList.remove('glow')
    var hint2 = document.querySelector('.hint-two')
    hint2.classList.remove('glow')
    var hint3 = document.querySelector('.hint-three')
    hint3.classList.remove('glow')

}

// SAFE CLICK

function onSafeClick() {
    gSaveClicks++
    if (gSaveClicks <= 3) {
        var safeCells = []
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard.length; j++) {
                var notMinePos = { i: i, j: j }
                if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                    safeCells.push(notMinePos)
                }
            }
        }
        var randonNumForPos = getRandomIntInclusive(0, safeCells.length - 1)
        var safeCell = safeCells[randonNumForPos]
        var elNotMine = document.querySelector('.' + getClassName(safeCell))
        elNotMine.classList.add('safe')
        setTimeout(() => {
            elNotMine.classList.remove('safe')
        }, 3000);
    }

}

//DARK-MODE
function onDarkMode() {
    var elBody = document.querySelector('body')
    var elH1 = document.querySelector('h1')
    var elH2 = document.querySelector('h2')
    var elCurrentLevelTxt = document.querySelector('.level-container')
    var elScoresContainer = document.querySelector('.best-scores-container')
    var elCheatContainer = document.querySelector('.cheats-container')
    var elSeconds = document.querySelector('.seconds')
    if (elBody.style.backgroundColor === "black") {
        elBody.style.backgroundColor = "rgb(196, 196, 196)"
        elH1.style.color = 'black'
        elH2.style.color = 'black'
        elCurrentLevelTxt.style.color = 'black'
        elScoresContainer.style.borderColor = 'black'
        elCheatContainer.style.borderColor = 'black'
        elSeconds.style.color = 'black'
    } else {
        elBody.style.backgroundColor = "black"
        elH1.style.color = 'rgb(196, 196, 196)'
        elH2.style.color = 'rgb(196, 196, 196)'
        elCurrentLevelTxt.style.color = 'rgb(196, 196, 196)'
        elScoresContainer.style.borderColor = 'white'
        elCheatContainer.style.borderColor = 'white'
        elSeconds.style.color = 'rgb(196, 196, 196)'
    }

}

//Manually Place mines 
//fix that if I dont place any mine the game will run normal - something with the ggame.manuallydone that it only will be done if i place a mine
function onManuallyPlaceMines() {
    var elManuallyCreateBTN = document.querySelector('.place-mines-btn')
    if (!gGame.manuallyCreate) {
        gGame.manuallyCreate = true
        console.log('MANUALLY ON')
        elManuallyCreateBTN.innerText = 'Press To Start'

    } else if (gGame.manuallyCreate) {
        gGame.manuallyCreate = false
        gGame.manuallyDone = true
        elManuallyCreateBTN.innerText = 'Manually Place Mines'
        renderEmptyBoard()
        console.log('MANUALLY OFF')

    }
}

function resetManuallyMode() {
    gGame.manuallyCreate = false
    gGame.manuallyDone = false
    var elManuallyCreateBTN = document.querySelector('.place-mines-btn')
    elManuallyCreateBTN.innerText = 'Manually Place Mines'
    gPlacedMines = 0

}

function renderEmptyBoard() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cellPos = { i: i, j: j }
            var cellClassName = getClassName(cellPos)
            var elCell = document.querySelector("." + cellClassName)
            elCell.innerText = EMPTY
        }
    }
}

//MEGA - HINT

function onMegaHint() {
    if (!gGame.megaHintDone) {
        gGame.megaHint = true
        console.log('MEGA HINT ON')
    }

}

function openMegaHintCells(board, cellsPos) {
    var elOpenHintedCells = []
    console.log('cellsPos', cellsPos)
    var firstCellPos = cellsPos[0]
    var secondCellPos = cellsPos[1]
    for (var i = firstCellPos.i; i <= secondCellPos.i; i++) {
        for (var j = firstCellPos.j; j <= secondCellPos.j; j++) {
            console.log('i', i)
            console.log('j', j)
            var negPos = {
                i: i,
                j: j
            }
            var classOfNeg = getClassName(negPos)
            var elNeg = document.querySelector("." + classOfNeg)
            elNeg.classList.add('hinted')
            elOpenHintedCells.push(elNeg)
            if (board[negPos.i][negPos.j].minesAroundCount === 0 && !board[negPos.i][negPos.j].isMine && !board[negPos.i][negPos.j].isShown) {
                elNeg.innerText = EMPTY

            }
            if (board[negPos.i][negPos.j].minesAroundCount !== 0 && !board[negPos.i][negPos.j].isMine && !board[negPos.i][negPos.j].isShown) {
                elNeg.innerText = board[negPos.i][negPos.j].minesAroundCount

            }
            if (board[negPos.i][negPos.j].isMine && !board[negPos.i][negPos.j].isShown) {
                elNeg.innerText = MINE


            }
        }
    }
    closeHintCells(elOpenHintedCells)
    gGame.megaHint = false
    gGame.megaHintDone = true
}

//MINE EXTERMINATOR
//אפשר לעדכן את הטקסט של התאים הפתוחים בהתאם לחישוב מחדש של השכנים
function onMineExterminator() {
    if (!gGame.mineExterminatorDone) {
        gGame.mineExterminator = true
        console.log('MineExterminator')
        mineExterminator(allMinesPositions)
    }
}

function mineExterminator(minesPos) {
    var allMinesPos = minesPos
    console.log('allMinesPos', allMinesPos)

    if (gGame.mineExterminator) {
        for (var i = 0; i < 3; i++) {
            var randomNum = getRandomInt(0, minesPos.length)
            var randomMinePos = allMinesPos.splice(randomNum, 1)[0]
            gBoard[randomMinePos.i][randomMinePos.j].isMine = false
            var cellClassName = getClassName(randomMinePos)
            var elCell = document.querySelector("." + cellClassName)
            elCell.innerText = EXTERMINATOR
            // console.log('gBoard[randomMinePos.i][randomMinePos.j]', gBoard[randomMinePos.i][randomMinePos.j])
            // console.log('randomMinePos', randomMinePos)

        }

        updateModelWithNegsCount(gBoard)
        gMines = gMines - 3
        changeMinesTextValue()
        alert('Mines exterminated!!!')
    }
    gGame.mineExterminator = false
    gGame.mineExterminatorDone = true

}



//UNDO
// מערך של כל התאים הפתוחים לUNDO ?? לחשוב על רעיונות
// כל תא יהיה מערך עם התאים הפתוחים בעצם יהיה מערך של מערכים ואז כל פעם אפשר לתפוס מערך לרוץ על התאים שלו ולשים בהן תוכן ריק
//כל פעם שלוחץ על undo הוא לוקח מהמערך של ההיסטוריה את המערך האחרון שבתוכו והופך את כל האינר טקסט של התאים שלו לריקים
//כל פתיחת תאים עושה פוש להיסטורי של התאים שנפתחו
//STATER

// לסדר את הפונקציה שתעבוד גם לחזרה אחורה של פתיחה לא רק של תאים בודדים
function onUndo() {
    if (gGame.isOn) {
        console.log('historyCells', historyCells)

        var prevOpenedCells = historyCells.pop()

        if (prevOpenedCells[0] === undefined) {
            console.log('prevOpenedCells', prevOpenedCells)
            console.log('number')
            prevOpenedCells.innerText = EMPTY
            var cellPos = getCellPos(prevOpenedCells)
            gBoard[cellPos[0]][cellPos[1]].isShown = false
            console.log('cellPos', cellPos)
            if (prevOpenedCells.classList.contains('opened')) {
                prevOpenedCells.classList.remove('opened')
                gGame.shownCount--
            } else if (prevOpenedCells.classList.contains('mine')) {
                prevOpenedCells.classList.remove('mine')
                gClickedBombs--
                var elHearts = document.querySelector('.hearts')
                if (gClickedBombs === 0) {
                    elHearts.innerText = '❤️❤️❤️'
                }
                else if (gClickedBombs === 1) {
                    elHearts.innerText = '❤️❤️🤍'
                }
                else if (gClickedBombs === 2) {
                    elHearts.innerText = '❤️🤍🤍'
                }
            }
        } else if (prevOpenedCells[0]) {
            console.log('prevOpenedCells', prevOpenedCells)
            console.log('array')
            //תאים של פתיחה גדולה ולא תא בודד
            for (var i = 0; i < prevOpenedCells.length; i++) {
                prevOpenedCells[i].innerText = EMPTY
                if (prevOpenedCells[i].classList.contains('opened')) {
                    prevOpenedCells[i].classList.remove('opened')
                    // gGame.shownCount--
                }
                //סיום משחק כל המוקשים פתוחים
                // else if (prevOpenedCells[i].classList.contains('mine')) {
                //     prevOpenedCells[i].classList.remove('mine')
                //     //להוסיף חיים ולסדר כל מה שקשור
                //     //openBoms doesnt add gClickedBombs++
                // }
            }
        }
    }
}

function getCellPos(element) {
    // Extract the numbers- position -i and j from the class names
    const classList = element.classList
    let numbers = []

    for (let i = 0; i < classList.length; i++) {
        const classNames = classList[i].split('-')
        for (let j = 0; j < classNames.length; j++) {
            const num = parseInt(classNames[j])
            if (!isNaN(num)) {
                numbers.push(num)
            }
        }
    }
    return numbers
}