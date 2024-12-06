
const inputValue = document.getElementById("inputBar");
const displayValue = document.getElementById("display");

const toCel = document.getElementById("toCelcius");
const toFah = document.getElementById("toFahrenheit");

const button = document.getElementById("myButton");

let temp;

button.addEventListener("click",convert);

function convert(){

    if(toCel.checked){
        temp=Number(inputValue.value);
        temp = (temp - 32) * (5/9);
        displayValue.textContent = temp.toFixed(2) + "°C";
    }
    else if(toFah.checked){
        temp=Number(inputValue.value);
        temp = temp * 9 / 5 + 32;
        displayValue.textContent = `${temp.toFixed(2)}°F`;
    }
}