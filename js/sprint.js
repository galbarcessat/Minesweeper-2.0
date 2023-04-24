'use strict'
//to win you have to open all cells which are not bombs and mark all bombs with flag by right click
//לעשות אולי שזה יסמן את כל הפצצות לבד אם ניצחתי
//make a game over modal - win or lose with a play again button take from pacman
// hint bonus
// לבדוק באג שלפעמים מביא לי פצצה על אותו מיקום
//עיצוב?
//להוסיף רעש של פיצוץ שלוחצים על פצצה
//


const MINE = '💣'
const EMPTY = ''
const FLAG = '🚩'


var gBoard
var gMines
var gClickedBombs
let seconds = 0;
let timerId;
var gSaveClicks = 0

// var bestTime = 0
// localStorage.setItem("bestTime", bestTime)




var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    hintMode: false,
}


function onInit(SIZE, MINES) {
    console.log('NEW GAME')
    gGame.isOn = true
    gGame.shownCount = 0
    gGame.markedCount = 0
    gClickedBombs = 0
    var elHearts = document.querySelector('.hearts')
    elHearts.innerText = '❤️❤️❤️'
    var elSmiley = document.querySelector('.smiley')
    elSmiley.innerText = '😃'
    gBoard = buildBoard(SIZE)
    gMines = MINES
    gSaveClicks = 0
    resetTimer()
    changeLevelTitleName()
    renderBoard(gBoard)
    
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
function giveRandomEmptyPos(board, firstClickedCellPos) {
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
    var randomNum = getRandomInt(0, emptyCells.length)
    var randomCellPos = emptyCells.splice(randomNum, 1)
    // console.log('randomCellPos', randomCellPos[0])
    return randomCellPos[0]
}

function setMines(board, mines, firstClickedCellPos) {
    for (var i = 0; i < mines; i++) {
        var posForMine = giveRandomEmptyPos(board, firstClickedCellPos)
        board[posForMine.i][posForMine.j].isMine = true
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
    if (gGame.isOn === true && !clickedCell.isShown && !clickedCell.isMarked) {
        if (gBoard.every(row => row.every(cell => !cell.isShown))) {
            //we can detect the first click by using a clickCount as well.
            //if clickCount === 1 then...
            startTimer()
            var firstClickedCellPos = { i: i, j: j }
            setMines(gBoard, gMines, firstClickedCellPos)
            updateModelWithNegsCount(gBoard)
            console.log('gBoard', gBoard)
        }

        if (clickedCell.isMine === true) {
            elCell.innerText = MINE
            clickedCell.isShown = true
            elCell.classList.add('mine')
            gClickedBombs++
            var elHearts = document.querySelector('.hearts')
            if (gClickedBombs === 1) {
                elHearts.innerText = '❤️❤️🤍'
            }
            if (gClickedBombs === 2) {
                elHearts.innerText = '❤️🤍🤍'
            }
            if (gClickedBombs === 3) {
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
            checkVictory()


        } else {
            elCell.innerText = EMPTY
            clickedCell.isShown = true
            gGame.shownCount++
            expandShown(gBoard, i, j)
            elCell.classList.remove('safe')
            elCell.classList.add('opened')
            checkVictory()


        }
    }
    // if (gGame.hintMode) {
    //     elCell.classList.add('hinted')
    //     openCellsWithHint(gBoard, i, j)
    //     setTimeout(() => {
    //         elCell.innerText = EMPTY
    //         elCell.classList.remove('hinted')
    //     }, 2000)
    // }
    console.log('minesShownCount', gGame.shownCount)
}

function expandShown(board, rowIdx, colIdx) {
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
            }
            if (board[negPos.i][negPos.j].minesAroundCount === 0) {
                elNeg.innerText = EMPTY
                board[negPos.i][negPos.j].isShown = true
                gGame.shownCount++
                elNeg.classList.add('opened')
                //RECURSION OPEN
                expandShown(board, negPos.i, negPos.j)

            } else {
                elNeg.innerText = board[negPos.i][negPos.j].minesAroundCount
                board[negPos.i][negPos.j].isShown = true
                gGame.shownCount++
                elNeg.classList.add('opened')


            }

        }
    }
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
            }
        }
    }

}


function onSmiley() {
    onInit(gBoard.length, gMines)
}

function checkVictory() {
    if (gGame.shownCount + gGame.markedCount === gBoard.length ** 2 && gGame.markedCount === gMines) {
        var elSmiley = document.querySelector('.smiley')
        elSmiley.innerText = '😎'
        gGame.isOn = false
        stopTimer()

    }
}

function checkLose() {
    var elSmiley = document.querySelector('.smiley')
    elSmiley.innerText = '😭'
    gGame.isOn = false
    stopTimer()

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
    // let bestTime = localStorage.getItem("bestTime")
    // bestTime = parseInt(bestTime)
    // if (seconds < bestTime || bestTime === 0) {
    //     bestTime = seconds;
    //     localStorage.setItem("bestTime", bestTime);
    //     var bestScoreText = document.querySelector('.best-text')
    //     bestScoreText.innerText = bestTime
    // }
    // console.log('bestTime', bestTime)
    //להשתמש פה לתפוס את הזמן ללוקאל סטוראג
}

function resetTimer() {
    clearInterval(timerId);
    seconds = 0;
    const secondsElement = document.querySelector('.seconds');
    secondsElement.innerText = seconds;
}




//HINTS
//💡💡💡
//פונקציית שכנים שפותחת את כל השכנים לשנייה ואז סוגרת
//כל hint השורה שלהם משתנה
//לסדר שיעבוד 
function handleHint(elHint) {
    if (elHint.innerText === '💡') {
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

            if (board[negPos.i][negPos.j].minesAroundCount === 0 && !board[negPos.i][negPos.j].isMine) {
                elNeg.innerText = EMPTY
            }
            if (board[negPos.i][negPos.j].minesAroundCount !== 0 && !board[negPos.i][negPos.j].isMine) {
                elNeg.innerText = board[negPos.i][negPos.j].minesAroundCount
            }
            if (board[negPos.i][negPos.j].isMine) {
                elNeg.innerText = MINE
            }
        }


    }

}


function closeHintCells(allOpenedCells) {
    setTimeout(() => {
        allOpenedCells.forEach(cell => {
            cell.innerText = EMPTY
            cell.classList.remove('hinted')
        })
        gGame.hintMode = false

    }, 1000)

    // allOpenedCells.forEach(cell => cell.innerText = EMPTY)

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

// מערך של כל התאים הפתוחים לUNDO ?? לחשוב על רעיונות