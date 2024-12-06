
let min=1;
let max=100;
let answer=Math.floor(Math.random() * (max-min +1))+min;
let attempts=0;
let running=true;

while(running){

    let input=window.prompt(`Guess a number between ${min} - ${max}`);

    if(input > max || input < min)
    {
        window.alert(`Number should be in the range`);
    }
    else if(isNaN(input))
    {
        window.alert(`Enter a valid Number`);
    }
    else if(input == "")
    {

    }
    else{
        attempts++;
        if(input < answer)
        {
            window.alert("Your number is lower!! Try again");
        }
        else if(input > answer)
        {
            window.alert("Your number is higher!! Try again");
        }
        else{
            running= false;
            window.alert(`CORRECT!! The answer was ${answer} and It took you ${attempts} attempts`);
        }
    }
}