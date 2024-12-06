
const button = document.getElementById("myButton");
const textBox = document.getElementById("inputNumber");

const diceValues = document.getElementById("diceValues");
const diceImages = document.getElementById("diceImages");

let randomNumber;



button.addEventListener("click",() => {
    const value= Number(textBox.value);
    let values = [];
    let images = [];

    for(let i=0; i<value ; i++){
        
        randomNumber = Math.floor(Math.random() * (6)) + 1;
        //console.log(randomNumber);
        values.push(randomNumber);
        images.push(`<img src="images/${randomNumber}.png" alt="Dice ${randomNumber}">`);
    }
    diceValues.textContent = values.join(" ");
    diceImages.innerHTML = images.join(" ");
})