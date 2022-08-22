// Всё игровое поле
const area = document.getElementById('area');

// Отдельная клетка поля
const areaChildrens = area.children;

// Общая обёртка модального окна для включенния выключения
const modalSwitch = document.getElementById('modal__game-over');
// Сюда вставляется текст с результатом игры 
const modalMessage = document.getElementById('modal__message');
// Для опроса кнопки рестарта игры
const restBtn = document.getElementById('restart__btn');
// Для опроса кнопки сброса истории
const clrBtn = document.getElementById('clear__btn');

// Сюда будем писать таблицу истории игры
const gameStory = document.getElementById('game__story');

// создаём объект класса выигрыватель аудио
const audio = new Audio();
// источник звука по умолчанию
audio.src = 'assets/audio/switcher.mp3';

//Уникальный ключ для LocalStorage
const LOCAL_KEY = 'Snegopad_37';

// Здесь хранится шаг, на котором игра находится
let gameStep = 1;

// Здесь хранятся значения для каждой клетки
const gameStatus = [
    undefined, undefined, undefined, 
    undefined, undefined, undefined, 
    undefined, undefined, undefined, 
];

const winCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6],

];

// Сюда записываются все предыдущие игры
let storedGames = [];


const gameResult = {
    gameCount: 1,
    step: gameStep-1,
    winner: undefined,
}

const message = 'Прошу проверять работу в режиме ИНКОГНИТО из-за локалстора';
console.log(message);
//Почистить локал
// localStorage.clear();


showGameHistory ();


// Обработчик клика по игровому полю
area.addEventListener('click', e => {
    // Если ткнули в клетку
    if(e.target.className == 'cell') {
        
        if((gameStatus[getNum(e.target)]) === undefined) { // Занята ли уже ячейка?
        
            if (gameStep % 2 == 0) {    //Если чётный ход
                // Обновляем текущее состояние поля
                gameStatus[getNum(e.target)] = "zero";
            }

            if(gameStep % 2 !== 0) {   //Если чётный ход
                // Обновляем текущее состояние поля
                gameStatus[getNum(e.target)] = "cross";
            }

            // В соответствии с позицией рисуем фигуру в нужной клетке
            fillCell(gameStatus[getNum(e.target)], getNum(e.target));
            audio.play();
            
            // Увеличиваем шаг игры, если нарисовали фигуру
            gameStep++;       
            
            // Запускаем проверку на окончание игры и определения победителя
            whoWins();
        }
    }
})

// Считаем какой по счёту это дочерний элемент
function getNum(element) {
    let i = 0;
    while(element = element.previousSibling) {
        element.nodeType == 1 && i++;
    }
    return i;
}

// Функция рисует указанную figure в нужной figurePosition
function fillCell (figure, figurePosition) {
    if ((figurePosition < 0) || (figurePosition > 8)) {
        return;
    }

    const newDiv = document.createElement('div');

    if (figure == 'cross') {
        newDiv.className = figure;
        areaChildrens[figurePosition].appendChild(newDiv);
    }

    if (figure == 'zero') {
        newDiv.className = figure;
        areaChildrens[figurePosition].appendChild(newDiv);
    }
}

// Перекрывает окно, показывает кто выиграл
function whoWins() {
    for (i = 0; i < (winCombinations.length); i++) {    
        const a = winCombinations[i];
        if ( (gameStatus[a[0]] == gameStatus[a[1]]) && (gameStatus[a[1]] == gameStatus[a[2]]) && (gameStatus[a[2]] == 'cross')) {
            modalMessage.innerHTML = `Winner: cross <br> <br> Step: ${gameStep-1}`;
            modalSwitch.style.display = 'block';
            
            gameResult.step = gameStep-1;
            gameResult.winner = 'cross';
            storeGameResult();
        }
        
        if ( (gameStatus[a[0]] == gameStatus[a[1]]) && (gameStatus[a[1]] == gameStatus[a[2]]) && (gameStatus[a[2]] == 'zero')) {
            gameResult.step = gameStep-1;
            gameResult.winner = 'zero';
            storeGameResult();

            modalMessage.innerHTML = `Winner: zero <br> <br> Step: ${gameStep-1}`;
            modalSwitch.style.display = 'block';
        }
    }

    if ((gameStep == 10) && (!(gameResult.winner == 'zero')) && (!(gameResult.winner == 'cross'))) {
        console.log('ничья');

        gameResult.step = gameStep-1;
        gameResult.winner = 'nobody';
        storeGameResult();

        modalMessage.innerHTML = `Winner: nobody <br> <br> Step: ${gameStep-1}`;
        modalSwitch.style.display = 'block';
    }

}

// Обработка кнопки рестарт
restBtn.addEventListener('click', restBtnIsPressed);
function restBtnIsPressed() {
    modalSwitch.style.display = 'none';
    location.reload();
}

// Обработка кнопки рестарт
clrBtn.addEventListener('click', clrBtnIsPressed);
function clrBtnIsPressed() {
    localStorage.clear();
    modalSwitch.style.display = 'none';
    location.reload();
}


function storeGameResult () {
    
    let a = readGameResult();
    let counterAllGames = String(a);
    
    gameResult.gameCount = counterAllGames;

    // Получили весь массив из стоража
    let inputFromLocal = JSON.parse(localStorage.getItem(LOCAL_KEY));

    //Результат текущей игры
    let ThisGame = {gameCount: gameResult.gameCount, step: gameResult.step, winner: gameResult.winner};

    if (inputFromLocal === null) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify([ThisGame]));
    }
    else {
        inputFromLocal.push(ThisGame);

        localStorage.setItem(LOCAL_KEY, JSON.stringify(inputFromLocal));
    }

}

//Читает из локала все предыдущие игры в storedGames, и количество всех игр
function readGameResult () {
    let realValues = 0;
    
    storedGames = JSON.parse(localStorage.getItem(LOCAL_KEY));

    if (storedGames === null) {
        realValues = 0;
    }
    else {
        realValues = storedGames.length;
    }

    return realValues;
}


function showGameHistory () {
    let gamesCount = readGameResult ();
    
  

    if (gamesCount == 0) {
        return;
    }
    

   let a = [];
   let e = [];
   let k = [];

   for (locPos = 0 ; locPos < gamesCount; locPos++) {
       a = a + storedGames[locPos].gameCount;
       e = e + storedGames[locPos].gameCount + ',';
   }
   
   let b = (a.split(''));

   k = e.split(',');
   k.pop();

   b = k;

   let c = [];
   for (i = 0; i < b.length; i++) {
       c[i] = +(b[i]);
   }

    let d = undefined; // положение максимального значения

    for (j = 0; j < c.length-1; j++) {
      d = getMaxIndexFromArray(c);
      c[d] = 0; // Убираем предыдущий максимум
      
      writeNewStringWinner(d);
    }
   
    const newP = document.createElement("p");

    newP.innerHTML = `Game№:${addOneStep(0)} Winner:${storedGames[0].winner} Step:${storedGames[0].step}`;
    gameStory.prepend(newP);

    // Удаляем лишние параграфы из списка
    if (gamesCount > 10) {
        for (i = gameStory.childNodes.length; i > 11; i--)
        gameStory.removeChild(gameStory.firstElementChild)
    }
}


function addOneStep(d) {
    const f = storedGames[d].gameCount;
    const g = (+f)+1;
    const h = String(g);
    return h;
}

function writeNewStringWinner (d) {
    const newP = document.createElement("p");
    
    newP.innerHTML = `Game№:${addOneStep(d)} Winner:${storedGames[d].winner} Step:${storedGames[d].step}`;
    gameStory.prepend(newP);
}

function getMaxIndexFromArray(c) {
    let max = c[0]; // берем первый элемент массива
    let maxIndex = undefined;
    for (i = 0; i < c.length; i++) {
    // переберем весь массив
    
    // если элемент больше, чем в переменной, то присваиваем его значение переменной
    if (max < c[i]) {
      max = c[i];
      maxIndex = i;
    }
  }
  return maxIndex;
}
