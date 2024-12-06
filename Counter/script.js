
const dcrBtn=document.getElementById("decreaseBtn");
const resetBtn=document.getElementById("resetBtn");
const incrBtn=document.getElementById("increaseBtn");
const countLabel=document.getElementById("countLabel");
let count=0;

function decrease() {
    count--;
    countLabel.innerHTML=count;

}

function increase() {
    count++;
    countLabel.innerHTML=count;

}

function reset() {
    count=0;
    countLabel.innerHTML=count;

}